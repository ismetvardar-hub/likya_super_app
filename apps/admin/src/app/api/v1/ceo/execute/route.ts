import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// LİKYA CEO GEMINI LLM KOD DÜZENLEME MOTORU (Next.js App Router)
// Akış: doğal dil komutu -> hedef dosya tespiti -> fs.readFile -> Gemini -> fs.writeFile
// ============================================================================

const PROJECT_ROOT = path.resolve(process.cwd(), process.cwd().endsWith('apps/admin') ? '../..' : '.');

const ALLOWED_EXTENSIONS = ['.tsx', '.ts', '.dart', '.py', '.js', '.jsx', '.css', '.md', '.json', '.yaml', '.yml', '.sql'];
const DEFAULT_TARGET = 'apps/admin/src/app/components/CEOCommandCenter.tsx';
const GEMINI_MODEL = 'gemini-3.5-flash';
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
  const codeHits = CODE_KEYWORDS.filter((k) => lower.includes(k)).length;
  const researchHits = RESEARCH_KEYWORDS.filter((k) => lower.includes(k)).length;
  // Puanlama: kod ağır basıyorsa Kanal B, değilse Kanal A
  return codeHits >= researchHits && codeHits > 0 ? 'code' : 'research';
}

// DeepSeek Coder/V3 — saf kod motoru (düşük maliyet, token verimli)
async function generateWithDeepSeek(prompt: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';
  if (!apiKey) throw new Error('DeepSeek API anahtarı bulunamadı');
  const response = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: "Sen Likya Kampüsü'nün baş yazılım mühendisisin. Sadece ve sadece tam güncellenmiş dosya içeriğini döndür; açıklama, markdown veya kod bloğu işareti kullanma." },
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
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  if (!apiKey) throw new Error('Gemini API anahtarı bulunamadı');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
  });
  const prompt = `Sen Likya CEO'sun; centilmen, naif, sıcak ve hafif esprili bir kurucu ortak gibi konuşursun. Kullanıcının talebini değerlendir ve zengin, düzenli, okunaklı bir yanıt üret.\n\nKULLANICI TALEBİ: ${command}\n\nYanıt markdown formatında olsun (başlıklar, listeler). 'Efendim' hitabıyla başla. Asla soğuk veya robotik olma; araştırma bulgularını net ama sıcak bir dille sun.`;
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
  return `Bu React bileşenini kullanıcının şu talimatına göre güncelle: "${command}"

HEDEF DOSYA: ${targetFile}

MEVCUT DOSYA İÇERİĞİ:
${existingContent || '(Dosya mevcut değil, sıfırdan oluşturulacak.)'}

KURALLAR:
1. Sadece ve sadece tam güncellenmiş dosya içeriğini döndür. Markdown kod bloğu işareti kullanma, açıklama veya yorum YAZMA.
2. React/TypeScript bileşeni ise dosya 'use client'; direktifi ile başlasın.
3. Mevcut import/export yapısını, state ve mevcut fonksiyonaliteyi KORU; yalnızca istenen değişikliği uygula.
4. Tasarımda koyu mod + glassmorphism + neon vurgular kullan (#00f2fe, #10B981, #F27A1A, #8B5CF6).
5. Eksiksiz, derlenebilir TypeScript/TSX kodu üret. TODO veya placeholder bırakma.
6. Üslup: Kod yorumlarında ve üretilen metinlerde centilmen, naif, sıcak ve insani bir dil kullan; asla soğuk, robotik veya mekanik olma.`;
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

export async function POST(request: NextRequest) {
  try {
    // Güvenli JSON parse
    let body: { command?: string; file?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Geçersiz JSON gövdesi' }, { status: 400 });
    }

    const command = (body.command || '').trim();
    if (!command) {
      return NextResponse.json({ success: false, error: 'Komut boş olamaz' }, { status: 400 });
    }

    // --- İDRAK ANALİZİ (Intent Router) ---
    const hasExplicitFile = /[\w/.-]+\.(?:tsx|ts|dart|py|js|jsx|css|md|json|yaml|yml|sql)/i.test(command);
    const intent: 'code' | 'research' = hasExplicitFile || !!body.file ? 'code' : classifyIntent(command);

    // Kanal A: Araştırma/Medya/Çeviri — dosya hedefi yoksa Gemini/Ollama analiz yanıtı döndür
    if (intent === 'research') {
      try {
        const answer = await generateResearchWithGemini(command);
        return NextResponse.json({
          success: true,
          motor: 'gemini',
          intent: 'research',
          action: 'Gemini/Ollama analizi tamamlandı',
          answer,
          message: 'Multimodal araştırma hattı yanıtladı',
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('[CEO/Gemini] Araştırma hatası:', message);
        return NextResponse.json({ success: false, motor: 'gemini', error: message }, { status: 500 });
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

    const fullPath = path.resolve(PROJECT_ROOT, targetFile);
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

    // --- b) KOD ÜRETİMİ: DeepSeek (Kanal B) → Gemini fallback ---
    const deepseekKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    let finalContent = '';
    let motor: 'deepseek' | 'gemini' = 'deepseek';

    if (deepseekKey) {
      try {
        finalContent = await generateWithDeepSeek(buildGeminiPrompt(command, targetFile, existingContent));
        console.log(`[CEO/DeepSeek] ${targetFile} güncellendi (${finalContent.length} karakter)`);
      } catch (e) {
        console.error('[CEO/DeepSeek] LLM hatası, Gemini ye düşülüyor:', e instanceof Error ? e.message : String(e));
        motor = 'gemini';
      }
    } else {
      console.warn('[CEO/DeepSeek] API anahtarı bulunamadı, Gemini kullanılacak');
      motor = 'gemini';
    }

    if (!finalContent.trim() && geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: GEMINI_MODEL,
          generationConfig: { maxOutputTokens: 65536, temperature: 0.7 },
        });
        const result = await model.generateContent(buildGeminiPrompt(command, targetFile, existingContent));
        finalContent = extractCodeFromResponse(result.response.text());
        console.log(`[CEO/Gemini] ${targetFile} güncellendi (${finalContent.length} karakter)`);
      } catch (e) {
        console.error('[CEO/Gemini] LLM hatası:', e instanceof Error ? e.message : String(e));
        finalContent = existingContent || fallbackTemplate(command, targetFile);
      }
    } else if (!finalContent.trim()) {
      console.warn('[CEO] API anahtarı bulunamadı; şablon kullanıldı');
      finalContent = existingContent || fallbackTemplate(command, targetFile);
    }

    if (!finalContent.trim()) {
      return NextResponse.json({ success: false, error: 'LLM boş içerik döndürdü' }, { status: 500 });
    }

    // --- c) DOSYAYA YAZ ---
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, finalContent, 'utf-8');

    // --- d) BAŞARI YANITI ---
    return NextResponse.json({
      success: true,
      file: targetFile,
      motor,
      intent: 'code',
      action: 'LLM tarafından güncellendi',
      bytes_written: Buffer.byteLength(finalContent, 'utf-8'),
      message: motor === 'deepseek' ? 'DeepSeek Coder ile güncellendi' : 'Gemini LLM ile güncellendi',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
