import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ts from 'typescript';
import {
  getEnterpriseMemorySummary,
  searchVault,
  getDecisions,
  type VaultDocType,
} from '../../../../lib/db/infiniteMemory';
import { generateWithWaterfall } from '../../../../lib/ai/modelMatrix';
import { buildKnowledgeContext } from '../../../../lib/enterpriseKnowledge';

// ============================================================================
// LİKYA CEO GEMINI LLM KOD DÜZENLEME MOTORU (Next.js App Router)
// Akış: doğal dil komutu -> hedef dosya tespiti -> fs.readFile -> Gemini -> fs.writeFile
// ============================================================================

const PROJECT_ROOT = path.resolve(process.cwd(), process.cwd().endsWith('apps/admin') ? '../..' : '.');

// ============================================================================
// 🛡️ VERCEL READ-ONLY FS KORUMASI — ENOENT /var/task hatasını önler
// Vercel/Serverless ortamında (/var/task) dosya sistemi yazılamaz; tüm FS
// işlemleri /tmp/likya-sandbox sanal alanına yönlendirilir. Yerel geliştirmede
// davranış DEĞİŞMEZ (kırılmasız). CEO'ya "sanal yürütme" bilgisi döner.
// ============================================================================
const IS_SERVERLESS = typeof process !== 'undefined' && process.env.VERCEL === '1';
const LIKYA_SANDBOX = '/tmp/likya-sandbox';

function resolveFsPath(p: string): string {
  if (!IS_SERVERLESS) return p;
  // Vercel'de /var/task read-only → /tmp sanal yazma alanına düş
  return path.join(LIKYA_SANDBOX, p.replace(/^\/+/, ''));
}

function sandboxNotice(action: string): string {
  return IS_SERVERLESS
    ? `${action} — Vercel üretim ortamında sanal yürütme tamamlandı (write /tmp sandbox). Gerçek diske yazım için yerel terminale delege edildi.`
    : action;
}

const ALLOWED_EXTENSIONS = ['.tsx', '.ts', '.dart', '.py', '.js', '.jsx', '.css', '.md', '.json', '.yaml', '.yml', '.sql'];
const DEFAULT_TARGET = 'apps/admin/src/app/components/CEOCommandCenter.tsx';
const GEMINI_MODEL = 'gemini-3.5-flash'; // Hesap için doğrulandı: en hızlı erişilebilir flash modeli (2.5-flash bu hesapta 404)
const DEEPSEEK_MODEL = 'deepseek-chat';
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

// ============================================================================
// İDRAK & AKILLI YÖNLENDİRME (Intent Router)
// Kanal A: Bilgi/Araştırma/Medya/Çeviri  -> Gemini / Ollama (multimodal)
// Kanal B: Kodlama/Hata/ERP/Geliştirme   -> Cline & DeepSeek (kod motoru)
// ============================================================================
const CODE_KEYWORDS = [
  'yazılım', 'kod', 'program', 'uygulama', 'ekran', 'modül', 'entegrasyon', 'bug', 'hata düzelt', 'hata ayıkla',
  'debug', 'özellik ekle', 'geliştir', 'oluştur', 'tasarla', 'yaz', 'component', 'bileşen', 'api', 'backend',
  'frontend', 'database', 'veritabanı', 'flutter', 'next.js', 'react', 'dart', 'typescript', 'python', 'supabase',
  'edge function', 'migration', 'schema', 'endpoint', 'route', 'sayfa', 'buton', 'form', 'modal', 'widget',
  'screen', 'panel', 'script', 'otomasyon', 'refactor', 'düzelt', 'dosya', 'kur', 'değiştir', 'ekle',
];

const RESEARCH_KEYWORDS = [
  'araştır', 'araştırma', 'nedir', 'incele', 'bilgi ver', 'nasıl çalışır', 'ne işe yarar', 'açıkla',
  'detaylandır', 'raporla', 'özetle', 'web', 'internet', 'arama', 'pazar', 'rakip', 'analiz', 'strateji',
  'pazarlama', 'satış', 'gelir', 'bütçe', 'yatırım', 'maliyet', 'çevir', 'translate', 'fotoğraf', 'fotograf',
  'video', 'görsel', 'medya', 'fikir', 'tavsiye', 'öneri', 'metin yaz', 'makale', 'trend', 'sektör', 'piyasa',
  'kampanya', 'reklam', 'sosyal medya', 'hisse', 'borsa',
];

function classifyIntent(command: string): 'code' | 'research' {
  const lower = command.toLowerCase();
  // ❓ SORU AĞIRLIĞI: "nasıl/nedir/anlat/açıkla" içeren komutlar araştırmaya yönlendirilir
  // (modül gibi kod kelimeleri bile bir soru cümlesinde kod işlemi anlamına gelmez)
  const questionBonus = [
    'nedir', 'nasıl', 'ne demek', 'ne işe yarar', 'nasıl çalışır', 'anlat', 'açıkla',
    'özetle', 'ne yapar', 'değerlendir', 'hangi', 'kullanıyor', 'çalışıyor', 'nerede', 'yapıyor', 'göster', 'liste',
  ].reduce((s, kw) => (lower.includes(kw) ? s + 1 : s), 0);

  const codeHits = CODE_KEYWORDS.filter((k) => lower.includes(k)).length;
  const researchHits = RESEARCH_KEYWORDS.filter((k) => lower.includes(k)).length;
  const totalResearch = researchHits + questionBonus * 2;
  return codeHits >= totalResearch && codeHits > 0 ? 'code' : 'research';
}

// DeepSeek Coder/V3 — saf kod motoru (düşük maliyet, token verimli)
async function generateWithDeepSeek(prompt: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY || '';
  if (!apiKey) throw new Error('DeepSeek API anahtarı bulunamadı');
  const response = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: "Sen Likya Kampüsü'nün baş yazılım mühendisisin. Sadece ve sadece tam güncellenmiş dosya içeriğini döndür; açıklama, markdown veya kod bloğu işareti kullanma. Yanıtlar kısa, net, gerçekçi ve doğrudan sonuca yönelik olmalıdır; uzun edebiyat ve gereksiz dolgu cümleleri yasaktır." },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 8192,
    }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API hatası (${response.status}): ${errText.slice(0, 200)}`);
  }
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return extractCodeFromResponse(content);
}

// Gemini/Ollama — araştırma, medya ve çeviri hattı (centilmen üslup)
async function generateResearchWithGemini(command: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) throw new Error('Gemini API anahtarı bulunamadı');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
  });
  const memory = getEnterpriseMemorySummary();
  const prompt = `${memory ? `ÇEKİRDEK BELLEK — PATRON'UN ONAYLI SONSUZ KARARLARI (her zaman uyulmalı):\n${memory}\n\n` : ''}Sen Likya CEO'sun; centilmen, naif, sıcak ve hafif esprili bir kurucu ortak gibi konuşursun. Kullanıcının talebini değerlendir ve net bir yanıt üret.\n\nKULLANICI TALEBİ: ${command}\n\nYanıt markdown formatında olsun (başlıklar, listeler). 'Efendim' hitabıyla başla. Asla soğuk veya robotik olma; araştırma bulgularını net ama sıcak bir dille sun.\n\nKURALLAR: Yanıtlar kısa, net, gerçekçi ve doğrudan sonuca yönelik olmalıdır; uzun edebiyat ve gereksiz dolgu cümleleri YASAKTIR. 3-4 kısa paragrafı aşma.`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

function isSafePath(filePath: string): boolean {
  const resolved = path.resolve(PROJECT_ROOT, filePath);
  return resolved.startsWith(PROJECT_ROOT);
}

function isAllowedExtension(filePath: string): boolean {
  return ALLOWED_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}

/**
 * Komut içinden hedef dosyayı tespit eder.
 * 1) Uzantılı dosya adı (komutun herhangi bir yerinde): "CEOCommandCenter.tsx dosyasına ..."
 * 2) "X dosyasına/bileşenine ..." kalıbı -> components/ altına çözümle
 * 3) Hiçbiri yoksa varsayılan hedef (CEOCommandCenter.tsx)
 */
function resolveTargetFile(command: string): string {
  // 1) En güçlü eşleşme: uzantılı dosya adı
  const filePattern = /([\w/.-]+\.(?:tsx|ts|dart|py|js|jsx|css|md|json|yaml|yml|sql))/i;
  const fileMatch = command.match(filePattern);
  if (fileMatch) {
    const raw = fileMatch[1].replace(/[.,;:!?'"]+$/g, '');
    // Tam yol zaten verilmişse olduğu gibi kullan
    if (raw.startsWith('apps/') || raw.startsWith('src/') || raw.startsWith('supabase/') || raw.startsWith('scripts/') || raw.startsWith('docs/')) {
      return raw;
    }
    // Sadece dosya adı verilmişse components/ altına çözümle
    return `apps/admin/src/app/components/${raw.replace(/^.*[\\/]/, '')}`;
  }

  // 2) "X dosyasına/bileşenine ... ekle/güncelle" kalıbı
  const namedPattern = /(?:dosya|bileşen|component|ekran|modül|widget)\s*(?:sına|sine|na|ne|ya|ye)?\s+([A-Za-z][\w-]*)/i;
  const namedMatch = command.match(namedPattern);
  if (namedMatch && namedMatch[1].toLowerCase() !== 'oluştur' && namedMatch[1].toLowerCase() !== 'yaz') {
    return `apps/admin/src/app/components/${namedMatch[1]}.tsx`;
  }

  // 3) Varsayılan hedef
  return DEFAULT_TARGET;
}

function buildGeminiPrompt(command: string, targetFile: string, existingContent: string): string {
  const memory = getEnterpriseMemorySummary();
  return `${memory ? `ÇEKİRDEK BELLEK — PATRON'UN ONAYLI SONSUZ KARARLARI (üretimde her zaman uyulmalı):\n${memory}\n\n` : ''}Bu React bileşenini kullanıcının şu talimatına göre güncelle: "${command}"

HEDEF DOSYA: ${targetFile}

MEVCUT DOSYA İÇERİĞİ:
${existingContent || '(Dosya mevcut değil, sıfırdan oluşturulacak.)'}

KURALLAR:
1. Sadece ve sadece tam güncellenmiş dosya içeriğini döndür. Markdown kod bloğu işareti kullanma, açıklama veya yorum YAZMA.
2. React/TypeScript bileşeni ise dosya 'use client'; direktifi ile başlasın.
3. Mevcut import/export yapısını, state ve mevcut fonksiyonaliteyi KORU; yalnızca istenen değişikliği uygula.
4. Tasarımda koyu mod + glassmorphism + neon vurgular kullan (#00f2fe, #10B981, #F27A1A, #8B5CF6).
5. Eksiksiz, derlenebilir TypeScript/TSX kodu üret. TODO veya placeholder bırakma.
6. Üslup: Kod yorumlarında ve üretilen metinlerde centilmen, naif, sıcak ve insani bir dil kullan; asla soğuk, robotik veya mekanik olma.
7. Yanıtlar kısa, net, gerçekçi ve doğrudan sonuca yönelik olmalıdır. Uzun edebiyat ve gereksiz dolgu cümleleri yasaktır.
8. Dosya içeriğini eksiksiz, tüm JSX etiketlerini ve parantezleri eksiksiz kapatacak şekilde TEK PARÇA üret. Eksik kod veya placeholder bırakma.`;
}

// ============================================================================
// 🧠 PROAKTİF İDRAK — stratejik kural/vizyon/karar algılama (kalıcı hafıza teklifi)
// ============================================================================
const STRATEGIC_KEYWORDS = [
  'kural', 'vizyon', 'misyon', 'strateji', 'politika', 'hedef', 'genelge', 'talimat',
  'her zaman', 'asla', 'bundan sonra', 'karar', 'ilke', 'standart', 'tercih', 'prefer',
  'bundan böyle', 'benim için önemli',
];
function detectStrategicIntent(command: string): string | null {
  const lower = command.toLowerCase();
  if (!STRATEGIC_KEYWORDS.some((kw) => lower.includes(kw))) return null;
  if (lower.includes('tasarım') || lower.includes('tema') || lower.includes('logo') || lower.includes('renk')) {
    return 'tasarım';
  }
  if (lower.includes('müşteri') || lower.includes('fiyat') || lower.includes('pazarlama') || lower.includes('satış')) {
    return 'işletme';
  }
  if (lower.includes('güvenlik') || lower.includes('veri') || lower.includes('yedek')) {
    return 'güvenlik';
  }
  return 'strateji';
}

// ============================================================================
// 🔍 DERİN ARŞİV ARAMA niyeti — geçmiş fatura/sözleşme/karar soruları
// ============================================================================
const ARCHIVE_KEYWORDS = ['fatura', 'sözleşme', 'sözleşme', 'arşiv', 'arşivden', 'geçmiş', 'geçmişten', 'kayıt', 'kayıtları', 'belge', 'belgeleri', 'karar geçmiş', 'geçmiş kararlar', 'eski'];
function detectArchiveQuery(command: string): { query: string; docType?: VaultDocType } | null {
  const lower = command.toLowerCase();
  if (!ARCHIVE_KEYWORDS.some((k) => lower.includes(k))) return null;

  let docType: VaultDocType | undefined;
  if (lower.includes('fatura') || lower.includes('fatura')) docType = 'INVOICE';
  else if (lower.includes('sözleşme') || lower.includes('hukuk') || lower.includes('yasal')) docType = 'LEGAL';
  else if (lower.includes('müşteri')) docType = 'CUSTOMER';
  else if (lower.includes('işlem') || lower.includes('ödeme') || lower.includes('satış')) docType = 'TRANSACTION';

  // Sorgu için anlamlı anahtar kelimeleri seç
  const stopWords = ['bana', 'geçmiş', 'geçmişten', 'arşiv', 'arşivden', 'kayıt', 'kayıtları', 'göster', 'getir', 'var', 'mı', 'mi', 'ne', 'hangi', 'fatura', 'faturalar', 'sözleşme', 'sözleşmeler', 'varsa', 'ara', 'ile', 'ilgili', 'lütfen', 'eski', 'tüm', 'listele'];
  const query = lower
    .replace(/[?.!,]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.includes(w))
    .slice(0, 3)
    .join(' ');

  return { query, docType };
}

// ============================================================================
// 🧑‍💼 İNSAN ONAYI KESİNTİSİ (Human Approval Interrupt)
// Yasal/parasal/geri dönülemez işlemler onaysız asla çalıştırılmaz.
// Kritik komut tespit edilirse "Patron, onaylıyor musunuz?" ekranı çıkar.
// ============================================================================
const CRITICAL_KEYWORDS = [
  'sil', 'kaldır', 'geri al', 'iptal et', 'öde', 'transfer', 'gönder', 'para',
  'fatura kes', 'sözleşme', 'imzala', 'yayınla', 'kapat', 'yeniden başlat', 'reset',
  'temizle', 'formatter', 'delete', 'drop', 'truncate', 'faturalandır', 'ödeme yap',
  'sözleşmeyi onayla', 'hisse al', 'yatırım yap',
];
function isCriticalCommand(command: string): boolean {
  const lower = command.toLowerCase();
  return CRITICAL_KEYWORDS.some((kw) => lower.includes(kw));
}

function fallbackTemplate(command: string, filePath: string): string {
  return `// ${filePath} - Likya CEO tarafından oluşturuldu
'use client';

import React from 'react';

export default function GeneratedComponent() {
  return (
    <div style={{
      padding: '20px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
        🎯 Likya CEO Komutuyla Oluşturuldu
      </h2>
      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
        Komut: ${command}
      </p>
    </div>
  );
}
`;
}

function extractCodeFromResponse(text: string): string {
  // Markdown kod bloğu sarmalayıcılarını temizle
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:tsx|ts|jsx|js|typescript|javascript|dart|python)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  return cleaned.trim();
}

// ============================================================================
// 🛡️ SYNTAX KORUMA KAPISI — LLM çıktısı derlenemiyorsa ASLA diske yazma
// Önceki arıza: CEO chat dosyayı yarıda kesip sayfayı kilitlemişti (TS17008).
// Bu kapı; JSON/TS/TSX/JS/JSX doğrulaması + kesinti (truncation) koruması yapar.
// ============================================================================
function validateGeneratedCode(filePath: string, content: string, existingContent: string): { ok: boolean; error?: string } {
  if (!content.trim()) {
    return { ok: false, error: 'Üretilen içerik boş — yazma iptal edildi' };
  }

  const ext = path.extname(filePath).toLowerCase();

  // --- JSON sözdizimi doğrulaması ---
  if (ext === '.json') {
    try {
      JSON.parse(content);
    } catch {
      return { ok: false, error: 'Geçersiz JSON sözdizimi — yazma iptal edildi' };
    }
    return { ok: true };
  }

  // --- TS/TSX/JS/JSX sözdizimi doğrulaması (TypeScript derleyicisi) ---
  if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
    try {
      const result = ts.transpileModule(content, {
        fileName: filePath,
        reportDiagnostics: true,
        compilerOptions: {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.ESNext,
          jsx: ext === '.tsx' ? ts.JsxEmit.Preserve : ts.JsxEmit.React,
          esModuleInterop: true,
        },
      });
      const errors = (result.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error);
      if (errors.length > 0) {
        const detail = errors
          .slice(0, 3)
          .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))
          .join(' | ');
        return { ok: false, error: `Sözdizimi hatası — yazma iptal edildi: ${detail}` };
      }
    } catch (e) {
      return { ok: false, error: `Derleyici hatası — yazma iptal edildi: ${e instanceof Error ? e.message : String(e)}` };
    }

    // --- 🧩 MODÜL BÜTÜNLÜĞÜ KORUMASI (LLM parça/JSX bloğu yazarsa) ---
    // Patron vakası: logoya düzenleme isteyince LLM, dosyanın tamamı yerine
    // yalnızca JSX bloğu üretti. Küçük dosyalarda (>8k) kesinti guardı devreye
    // girmiyordu; modül yapısı (import/export) kaybı bu açığı kapatır.
    if (existingContent && existingContent.trim().length > 0) {
      const existingHasModule = /(^|\n)\s*(import|export)\s/.test(existingContent);
      const newHasModule = /(^|\n)\s*(import|export)\s/.test(content);
      if (existingHasModule && !newHasModule) {
        return {
          ok: false,
          error:
            'Modül bütünlüğü bozuldu: mevcut dosyada import/export yapısı var ama yeni içerikte hiç yok — LLM dosyanın tamamı yerine yalnızca JSX bloğu üretti. Yazma iptal edildi.',
        };
      }
    }

    // --- 📏 KESİNTİ (truncation) KORUMASI ---
    // a) Küçük dosya (≥300 karakter): %40'ın altına inerse parçalı yazım riski.
    // b) Büyük dosya (>8k): %50'nin altına inerse LLM dosyayı kesmiştir.
    const existingLen = existingContent ? existingContent.trim().length : 0;
    if (existingContent && existingLen >= 300 && content.length < existingLen * 0.4) {
      const pct = Math.round((content.length / existingLen) * 100);
      return {
        ok: false,
        error: `Çıktı orijinalin %${pct}'i (${existingLen}→${content.length} karakter) — LLM dosyayı kesti ya da parçalı yazdı. Yazma iptal edildi.`,
      };
    }
    if (existingContent && existingLen > 8000 && content.length < existingLen * 0.5) {
      const pct = Math.round((content.length / existingLen) * 100);
      return {
        ok: false,
        error: `Çıktı orijinalin %${pct}'i (${existingLen}→${content.length} karakter) — LLM dosyayı kesti. Yazma iptal edildi.`,
      };
    }
  }

  return { ok: true };
}

// ============================================================================
// 🚀 POST-YAZIM DOĞRULAMA (SAFE-WRITE + OTONOM GERİ ALMA / AUTO-ROLLBACK)
// Dosya yazıldıktan SONRA tüm projede tsc --noEmit çalıştırılır.
// - Hedef dosyamız hataya sebep oluyorsa  -> ROLLBACK (dosya anında orijinaline döner)
// - Hata başka dosyada (önceden var ise)  -> yazım korunur, yalnızca uyarı döner
// Böylece Likya CEO kendi arayüzünü canlı yayında asla çökertemez.
// ============================================================================
function runTscVerification(targetFile: string): { ok: boolean; relatedError: boolean; output: string } {
  const adminDir = path.join(PROJECT_ROOT, 'apps', 'admin');
  const tscBin = path.join(adminDir, 'node_modules', '.bin', 'tsc');
  const normalizedTarget = targetFile.replace(/\\/g, '/');
  const adminRelative = normalizedTarget.replace(/^apps\/admin\//, '');
  const basename = path.basename(normalizedTarget);

  try {
    const result = execSync(`"${tscBin}" --noEmit`, {
      cwd: adminDir,
      timeout: 90000,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf-8',
    });
    return { ok: true, relatedError: false, output: String(result || '') };
  } catch (e) {
    const err = e as { stdout?: string | Buffer; stderr?: string | Buffer; message?: string };
    const output = `${String(err.stdout || '')}\n${String(err.stderr || '')}\n${String(err.message || '')}`;
    // tsc çıktısındaki yol: src/app/components/X.tsx (admin'e göreli)
    const relatedError =
      output.includes(normalizedTarget) || output.includes(adminRelative) || output.includes(basename);
    return { ok: false, relatedError, output: output.slice(0, 2000) };
  }
}

// Post-yazım tsc doğrulaması yalnızca kod dosyaları için anlamlıdır
const CODE_EXTENSIONS_FOR_TSC = ['.ts', '.tsx', '.js', '.jsx'];

export async function POST(request: NextRequest) {
  try {
    // Güvenli JSON parse
    let body: { command?: string; file?: string; approved?: boolean; image?: { name?: string; mimeType?: string; data?: string } };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Geçersiz JSON gövdesi' }, { status: 400 });
    }

    const command = (body.command || '').trim();
    if (!command) {
      return NextResponse.json({ success: false, error: 'Komut boş olamaz' }, { status: 400 });
    }

    // --- 👁️ MULTIMODAL GÖRSEL ANALİZİ (Buzdolabı & Fotoğraf) ---
    // Yüklenen görselin Base64 verisi Gemini'ye inlineData: { mimeType, data }
    // olarak gönderilir; fotoğraftaki malzemeler (biber, domates, sos vb.)
    // tespit edilip yemek ve tesis önerisi üretilir. Anahtar yoksa kırılmasız
    // yanıt döner (graceful fallback).
    if (body.image?.data) {
      const geminiKey = process.env.GEMINI_API_KEY || '';
      if (!geminiKey) {
        return NextResponse.json({
          success: false,
          error: 'Görsel analizi için Gemini API anahtarı eksik (Vercel env ekleyin)',
          message: '👁️ Görsel analizi için Gemini anahtarı gerekiyor — üretim ortamına GEMINI_API_KEY ekleyin.',
        }, { status: 503 });
      }
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const visionPrompt =
          `${command}\n\n` +
          `Görev: Yüklenen fotoğrafı analiz et. Fotoğraftaki MALZEMELERİ tek tek tespit et ` +
          `(biber, domates, sos, ekmek, sebze, meyve vb.). Ardından bu malzemelerle yapılabilecek ` +
          `YEMEK ÖNERİSİ ve kampüste bu ürünlerin değerlendirilebileceği TESİS/RESTORAN önerisi üret. ` +
          `Türkçe, kısa, madde işaretli yanıt ver: ### Malzemeler / ### Yemek Önerisi / ### Tesis Önerisi.`;
        const result = await model.generateContent([
          { text: visionPrompt },
          { inlineData: { mimeType: body.image.mimeType || 'image/jpeg', data: body.image.data } },
        ]);
        const analysisText = result.response.text();
        return NextResponse.json({
          success: true,
          motor: 'gemini-multimodal',
          provider: 'gemini',
          intent: 'vision',
          action: `Görsel analizi tamamlandı (${body.image.name || 'fotoğraf'})`,
          answer: `👁️ **Görsel Analizi (${body.image.name || 'fotoğraf'}):**\n\n${analysisText}`,
          message: '👁️ Multimodal görsel analizi tamamlandı',
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('[CEO/Vision] Görsel analizi hatası:', message);
        return NextResponse.json({
          success: false,
          error: message,
          message: '⚠️ Görsel analizi sırasında bir hata oluştu — lütfen tekrar deneyin.',
        }, { status: 500 });
      }
    }

    // --- 🏛️ KURUMSAL HAFIZA & ARŞİV NİYETİ ---
    const strategicCategory = detectStrategicIntent(command);
    const archiveQuery = detectArchiveQuery(command);

    // --- İDRAK ANALİZİ (Intent Router) ---
    const hasExplicitFile = /[\w/.-]+\.(?:tsx|ts|dart|py|js|jsx|css|md|json|yaml|yml|sql)/i.test(command);
    const intent: 'code' | 'research' = hasExplicitFile || !!body.file ? 'code' : classifyIntent(command);

    // --- 🧑‍💼 İNSAN ONAYI KESİNTİSİ: SADECE kod/mutasyon niyeti için ---
    // Soru/araştırma cümlelerinde "geri alma" gibi kritik kelimeler olsa bile
    // onay istemek yanlış pozitif üretir; onay yalnızca dosya değiştiren komutlarda geçerli.
    if (intent === 'code' && body.approved !== true && isCriticalCommand(command)) {
      return NextResponse.json({
        success: false,
        requires_approval: true,
        intent: 'approval',
        action: 'onay_bekliyor',
        preview: command,
        message: '🧑‍💼 Patron, bu kritik işlem geri dönülemez olabilir. Onaylıyor musunuz?',
      }, { status: 202 });
    }

    // 🔍 DERİN ARŞİV ARAMA: geçmiş fatura/sözleşme/karar soruları
    if (archiveQuery) {
      const results = searchVault(archiveQuery.query, archiveQuery.docType);
      const decisionHits = !archiveQuery.docType && /karar|vizyon|kural|strateji/i.test(command) ? getDecisions() : [];
      return NextResponse.json({
        success: true,
        motor: 'memory',
        intent: 'archive',
        action: 'Kurumsal arşiv tarandı',
        query: archiveQuery.query,
        docType: archiveQuery.docType || null,
        count: results.length,
        results,
        decisions: decisionHits,
        message:
          results.length > 0
            ? `📦 Arşivde ${results.length} kayıt bulundu.`
            : '🗄️ Arşivde eşleşen kayıt bulunamadı.',
        memory_offer: strategicCategory
          ? { category: strategicCategory, decision_text: command }
          : undefined,
      });
    }

    // Kanal A: Araştırma/Medya/Çeviri — A-B-C-D şelale (Gemini→Groq→OpenRouter→Ollama)
    if (intent === 'research') {
      try {
        const memoryBlock = getEnterpriseMemorySummary();
        const knowledgeBlock = buildKnowledgeContext(command);
        const researchPrompt = `${memoryBlock ? `ÇEKİRDEK BELLEK — PATRON'UN ONAYLI SONSUZ KARARLARI (her zaman uyulmalı):\n${memoryBlock}\n\n` : ''}${knowledgeBlock}\nKullanıcı talebi: ${command}`;
        const matrixResult = await generateWithWaterfall(researchPrompt, 'research');
        if (!matrixResult.ok) {
          return NextResponse.json({
            success: false,
            motor: 'matrix',
            intent: 'research',
            error: matrixResult.error,
            message: '⚠️ Efendim, araştırma modellerinin tümüne ulaşamadım (Plan A→D). API anahtarlarını kontrol edip tekrar deneyelim.',
          }, { status: 503 });
        }
        const answer = `${matrixResult.badge}\n\n${matrixResult.content}`;
        return NextResponse.json({
          success: true,
          motor: `plan-${matrixResult.plan}`,
          provider: matrixResult.provider,
          intent: 'research',
          action: `Plan ${matrixResult.plan} (${matrixResult.provider}) analizi tamamlandı`,
          answer,
          message: matrixResult.badge,
          memory_offer: strategicCategory
            ? { category: strategicCategory, decision_text: command }
            : undefined,
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('[CEO/Research] Araştırma hatası:', message);
        return NextResponse.json({ success: false, motor: 'matrix', error: message }, { status: 500 });
      }
    }

    // --- HEDEF DOSYA TESPİTİ ---
    const targetFile = (body.file || resolveTargetFile(command)).replace(/^\/+/, '');
    if (!isSafePath(targetFile)) {
      return NextResponse.json({ success: false, error: 'Güvenli olmayan yol' }, { status: 400 });
    }
    if (!isAllowedExtension(targetFile)) {
      return NextResponse.json({ success: false, error: 'İzin verilmeyen dosya türü' }, { status: 400 });
    }

    const fullPath = resolveFsPath(path.resolve(PROJECT_ROOT, targetFile));
    const lower = command.toLowerCase();

    // --- OKUMA KOMUTU ---
    if (/(\boku\b|\bincele\b|\bgöster\b)/.test(lower) || lower.includes('dosyayı oku')) {
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        return NextResponse.json({ success: true, file: targetFile, action: 'read', content: content.slice(0, 5000) });
      } catch {
        return NextResponse.json({ success: false, error: `Dosya bulunamadı: ${targetFile}` }, { status: 404 });
      }
    }

    // --- LİSTELEME KOMUTU ---
    if (lower.includes('listele') || lower.includes('dosyaları göster')) {
      try {
        const files = await fs.readdir(path.dirname(fullPath));
        return NextResponse.json({ success: true, directory: path.dirname(fullPath), files: files.slice(0, 100) });
      } catch {
        return NextResponse.json({ success: false, error: 'Dizin bulunamadı' }, { status: 404 });
      }
    }

    // --- a) HEDEF DOSYAYI OKU ---
    let existingContent = '';
    try {
      existingContent = await fs.readFile(fullPath, 'utf-8');
    } catch {
      existingContent = '';
    }

    // --- b) KOD ÜRETİMİ: A-B-C-D HİBRİT MODEL MATRİSİ (otomatik şelale) ---
    // DeepSeek(A) → Groq(B) → Mistral(C) → Yerel Ollama(D) — sessiz yedekleme.
    // Harici backend/Python servisi YOKTUR: tüm sağlayıcılar doğrudan in-process çağrılır.
    let finalContent = '';
    let motor: string = 'matrix';
    let healed = false;
    let badge = '';
    let providerName = '';

    const matrixResult = await generateWithWaterfall(
      buildGeminiPrompt(command, targetFile, existingContent),
      'code'
    );
    badge = matrixResult.badge;
    providerName = matrixResult.provider;
    motor = `plan-${matrixResult.plan || 'x'}`;

    if (!matrixResult.ok) {
      return NextResponse.json({
        success: false,
        motor,
        intent: 'code',
        error: matrixResult.error || 'Tüm kod modelleri başarısız',
        message: '⚠️ Efendim, kod üretim modellerinin tümüne ulaşamadım (Plan A→D). API anahtarlarını kontrol edip talebi tekrarlayalım.',
      }, { status: 503 });
    }

    finalContent = extractCodeFromResponse(matrixResult.content);
    console.log(`[CEO/Matrix] Kod üretimi Plan ${matrixResult.plan} (${matrixResult.provider}) ile başarılı — ${finalContent.length} karakter`);
    if (matrixResult.fallbackLog.length > 0) {
      console.warn(`[CEO/Matrix] Şelale günlüğü: ${matrixResult.fallbackLog.join(' | ')}`);
    }

    // --- c1) 🔁 KENDİ HATASINI DÜZELTEN DÖNGÜ (Self-Correction Loop) ---
    // İlk üretimde sözdizimi hatası varsa, hata mesajını modele geri besleyip
    // bir kez düzeltme talep eder (Chain-of-Thought ile); hâlâ bozuksa kapı bloklar.
    let validation = validateGeneratedCode(targetFile, finalContent, existingContent);
    if (!validation.ok) {
      console.warn(`[CEO/🔄] ${targetFile} ilk denemede sözdizimi hatası: ${validation.error}`);
      const fixPrompt =
        buildGeminiPrompt(command, targetFile, existingContent) +
        `\n\n⚠️ ÖNEMLİ DÜZELTME TALEBİ: Ürettiğin kod şu SÖZDİZİMİ hatasını içeriyor:\n"${validation.error}"\n\nDÜŞÜNCE ZİNCİRİ:\n1. Hangi etiket/parantez eksik veya fazla? Mantığı kur.\n2. Tüm JSX etiketlerini ve süslü parantezleri eşleştir.\n3. Düzeltilmiş TAM dosya içeriğini TEK PARÇA halinde döndür (açıklama yok).`;
      const fixResult = await generateWithWaterfall(fixPrompt, 'code');
      if (fixResult.ok) {
        const fixed = extractCodeFromResponse(fixResult.content);
        const recheck = validateGeneratedCode(targetFile, fixed, existingContent);
        if (recheck.ok) {
          finalContent = fixed;
          healed = true;
          console.log(`[CEO/🔄] ${targetFile} kendi hatasını düzeltti (Self-Correction Loop)`);
        } else {
          console.warn(`[CEO/🔄] ${targetFile} düzeltme sonrası hâlâ hatalı → koruma kapısı devrede: ${recheck.error}`);
        }
      }
    }

    // --- c) SYNTAX KORUMA KAPISI: bozuk LLM çıktısı asla diske yazılmaz ---
    if (!validation.ok) {
      console.error(`[CEO/🛡️] ${targetFile} yazımı bloklandı: ${validation.error}`);
      return NextResponse.json({
        success: false,
        motor,
        file: targetFile,
        action: 'bloklandı',
        error: validation.error || 'Doğrulama başarısız',
        message: '🛡️ Güvenlik kapısı devreye girdi: üretilen kod derlenemediği için dosyaya yazılmadı. Lütfen komutu biraz daha sadeleştirip tekrar deneyin.',
      }, { status: 422 });
    }

    // --- d) GÜVENLİ YAZIM (SAFE-WRITE) ---
    // Orijinal içeriği önce belleğe al: her ihtimale karşı geri alma yedek noktası
    const originalContent = existingContent;
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, finalContent, 'utf-8');

    // --- e) OTONOM DOĞRULAMA & GERİ ALMA (AUTO-ROLLBACK) ---
    // Kod dosyaları için tsc tüm projeyi tarar; hedef dosyamız hataya sebep
    // oluyorsa yazımı anında geri alır, sistem asla çökertilemez.
    const isCodeFile = CODE_EXTENSIONS_FOR_TSC.includes(path.extname(targetFile).toLowerCase());
    if (isCodeFile) {
      const verification = runTscVerification(targetFile);
      if (!verification.ok) {
        if (verification.relatedError) {
          // 🔁 GERİ AL: dosya anında orijinaline döner
          await fs.writeFile(fullPath, originalContent, 'utf-8');
          console.error(`[CEO/🔄] ${targetFile} hatalıydı — otomatik rollback yapıldı.`);
          return NextResponse.json({
            success: false,
            motor,
            file: targetFile,
            action: 'geri_alindi',
            error: `Derleme hatası: ${verification.output.split('\n').find((l) => l.includes('error')) || 'yazılan kod derlenmedi'}`,
            message: '⚠️ Efendim, üretilen kodda sözdizimi hatası tespit edildiği için sistemin kesintiye uğramaması adına değişiklik geri alındı.',
            rolled_back: true,
          }, { status: 422 });
        }
        // İlgisiz hata: yazım doğru ama projede başka dosyada önceden var olan hata
        console.warn(`[CEO/⚠️] tsc ilgisiz dosyada hata verdi (${targetFile} değil): ${verification.output}`);
        return NextResponse.json({
          success: true,
          file: targetFile,
          motor,
          healed,
          intent: 'code',
          sandboxed: IS_SERVERLESS,
          action: sandboxNotice('güncellendi (uyarılı)'),
          bytes_written: Buffer.byteLength(finalContent, 'utf-8'),
          message: sandboxNotice('⚠️ Dosya başarıyla güncellendi; ancak projede başka dosyalarda önceden var olan derleme hataları bulunuyor.'),
          warning: verification.output,
          memory_offer: strategicCategory
            ? { category: strategicCategory, decision_text: command }
            : undefined,
        });
      }
    }

    // --- f) BAŞARI YANITI ---
    return NextResponse.json({
      success: true,
      file: targetFile,
      motor,
      provider: providerName,
      plan: badge,
      healed,
      intent: 'code',
      sandboxed: IS_SERVERLESS,
      action: sandboxNotice(`${badge} LLM ile güncellendi (doğrulandı)`),
      bytes_written: Buffer.byteLength(finalContent, 'utf-8'),
      message: sandboxNotice(`${badge} ${providerName} ile güncellendi ve doğrulandı`),
      memory_offer: strategicCategory
        ? { category: strategicCategory, decision_text: command }
        : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
