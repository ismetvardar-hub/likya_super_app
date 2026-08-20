// ============================================================================
// 🏛️ LİKYA A-B-C-D HİBRİT MODEL MATRİSİ & OTOMATİK ŞELALE
// Kodlama ve sohbet/araştırma için çoklu yedekli model havuzu.
//
// KODLAMA (CODE_EDIT):        A: DeepSeek → B: Groq → C: Mistral → D: Ollama
// SOHBET/ARAŞTIRMA (RESEARCH): A: Gemini  → B: Groq → C: OpenRouter → D: Ollama
//
// Kural: 429 (kota), 401 (kredi), timeout veya hata → kullanıcıya hissettirmeden
// bir sonraki plana (A→B→C→D) geç. Başarılı model yanıta rozet olarak iliştirilir.
// Eksik API anahtarı olan planlar otomatik atlanır (sessiz şelale).
// ============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { routeViaOpenRouter, modelFromPrompt, freeModelFromPrompt } from './openRouterAdapter';
import { nvidiaNimChat, nvidiaEnvReady } from './nvidiaNimAdapter';

// ----------------------------------------------------------------------------
// ☁️ BULUT ÇALIŞMA ZAMANI TESPİTİ — Vercel serverless'te yerel Ollama yasak
// ----------------------------------------------------------------------------
export function isCloudRuntime(): boolean {
  return typeof window === 'undefined' && !!process.env.VERCEL;
}

// ----------------------------------------------------------------------------
// ⚙️ DETERMİNİSTİK YEREL KURAL MOTORU (Plan Z)
// Bulutta API anahtarları boşsa "fetch failed" yerine kurallı sistem yanıtı
// döndürülür — kullanıcıya asla çıplak ağ hatası gösterilmez.
// ----------------------------------------------------------------------------
function deterministicFallbackResponse(prompt: string, mode: MatrixMode): string {
  if (mode === 'code') {
    return (
      '// ⚠️ LİKYA KURAL MOTORU (Plan Z): Bulut ortamında kod üretimi için API anahtarı tanımlı değil.\n' +
      '// Vercel ortamına GEMINI_API_KEY / DEEPSEEK_API_KEY ekleyin veya yerel geliştirmede çalıştırın.\n' +
      '// Güvenlik kalkanı devrede: bu yanıt doğrulanamadığı için diske yazılmayacaktır.'
    );
  }

  const lower = prompt.toLowerCase();
  if (/(kvkk|rıza|muvafakat|veli onay|gizlilik)/.test(lower)) {
    return 'Efendim, KVKK (6698) md.5/1-a açık rıza ve md.10 aydınlatma şablonlarımız hazırdır. 18 yaş altı sporcular için veli muvafakatnamesi zorunludur; satın alınmayan medya 48 saat içinde otonom imha edilir, rızası olmayan üçüncü kişilerin yüzleri otomatik bulanıklaştırılır. (Sistem yanıtı — bulut kural motoru)';
  }
  if (/(stok|reçete|erp|bordro|prim)/.test(lower)) {
    return 'Efendim, ERP omurgamız reçete hammadde tüketimini atomik stok kontrolüyle yapar; alt sınırın altında DÜŞÜK/KRİTİK/TÜKENDİ uyarıları üretir. Daze Crew bordrosu mesai (%150), haftasonu (%200) ve vardiya primini (%22 kesinti sonrası) hesaplar. (Sistem yanıtı — bulut kural motoru)';
  }
  if (/(vardiya|işe davet|personel|müsaitlik|availability)/.test(lower)) {
    return 'Efendim, Otonom Vardiya Motoru yoğunluk analiziyle personel ihtiyacını tespit eder; performans %50 + güvenilirlik %30 + bütçe %20 skorlamasıyla en uygun adayı WhatsApp davetiyle bulur. KABUL → QR kart, RET → müsaitlik havuzuna kayıt. (Sistem yanıtı — bulut kural motoru)';
  }
  if (/(donanım|şartname|tedarik|satın alma|veo|pixellot)/.test(lower)) {
    return 'Efendim, Donanım Motoru endüstriyel bileşenleri (4K 180° kamera, Jetson Orin, Polar H10) doğrudan tedarik eder; kapalı kutu sistemlere (Veo/Spiideo/Pixellot) kıyasla 5 yıllık TCO hesabında ortalama %65 maliyet avantajı sunar. (Sistem yanıtı — bulut kural motoru)';
  }
  if (/(hız|radar|sprint|vuruş|km)/.test(lower)) {
    return 'Efendim, Radar motorumuz kamera kalibrasyonuyla (kale 7.32m referans) piksel hareketini km/s hıza çevirir; 250 km/s üzeri ölçümler fiziksel olarak geçersiz işaretlenir. (Sistem yanıtı — bulut kural motoru)';
  }
  if (/(güvenlik|rate.?limit|enjeksiyon|cors|kalkan)/.test(lower)) {
    return 'Efendim, STRIX güvenlik denetçimiz API rotalarında kayan pencere rate-limit, SQL/NoSQL/XSS enjeksiyon kalkanı ve CORS denetimi yapar; /memory 20 istek/dk, /notify 10 istek/dk ile korunur. (Sistem yanıtı — bulut kural motoru)';
  }
  if (/(üslup|klişe|centilmen|stop.?slop)/.test(lower)) {
    return 'Efendim, Stop-Slop filtremiz 30+ yapay zeka klişesini temizler ve kaba ifadeleri gizler; yanıtlar sade ve centilmen bir dille üretilir. (Sistem yanıtı — bulut kural motoru)';
  }
  if (/(uptime|turnike|meteoroloji|hava|yedekleme|sentinel)/.test(lower)) {
    return 'Efendim, Daze Sentinel turnike/IoT cihazlarını izler (uptime yüzdesi), meteorolojiye göre saha riski ve DJ tempo BPM önerir, yedekleme zamanlama + saklama politikasını yönetir. (Sistem yanıtı — bulut kural motoru)';
  }
  return 'Efendim, bulut ortamında canlı AI sağlayıcılarına ulaşamadım (API anahtarları tanımlı değil). Deterministik kural motoru devrede — bu yanıt Likya modüllerinden (KVKK, ERP, vardiya, donanım, radar, güvenlik, sentinel) üretilmiştir. Canlı yapay zeka için Vercel ortamına GEMINI_API_KEY / GROQ_API_KEY eklenmesi yeterlidir.';
}

function callDeterministicFallback(prompt: string, mode: MatrixMode): Promise<string> {
  return Promise.resolve(deterministicFallbackResponse(prompt, mode));
}

export type MatrixMode = 'code' | 'research';

export interface MatrixPlan {
  letter: string; // 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | ...
  name: string;
  badge: string;
  run: (prompt: string) => Promise<string>;
}

export interface MatrixResult {
  ok: boolean;
  content: string;
  plan: string; // 'A' | 'B' | 'C' | 'D'
  badge: string;
  provider: string;
  error?: string;
  fallbackLog: string[];
}

// ----------------------------------------------------------------------------
// Zaman aşımlı güvenli fetch
// ----------------------------------------------------------------------------
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ----------------------------------------------------------------------------
// OpenAI-uyumlu chat/completions çağrısı (Groq / OpenRouter / Mistral)
// ----------------------------------------------------------------------------
async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  prompt: string,
  maxTokens = 8192
): Promise<string> {
  const response = await fetchWithTimeout(
    `${baseUrl}/chat/completions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: maxTokens,
      }),
    },
    45000
  );

  if (!response.ok) {
    const errText = await response.text();
    const status = response.status;
    if (status === 429 || status === 401 || status === 402) {
      throw new Error(`Kota/Kredi hatası (${status}): ${errText.slice(0, 120)}`);
    }
    throw new Error(`API hatası (${status}): ${errText.slice(0, 120)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || '';
  if (!content.trim()) throw new Error('Boş yanıt');
  return content.trim();
}

// ----------------------------------------------------------------------------
// Anthropic Claude çağrısı (kendi API şeması — OpenAI uyumlu değildir)
// ----------------------------------------------------------------------------
async function callAnthropic(model: string, systemPrompt: string, prompt: string, maxTokens = 8192): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  if (!apiKey) throw new Error('Anthropic anahtarı yok');
  const response = await fetchWithTimeout(
    'https://api.anthropic.com/v1/messages',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    },
    45000
  );

  if (!response.ok) {
    const errText = await response.text();
    const status = response.status;
    if (status === 429 || status === 401 || status === 402) {
      throw new Error(`Kota/Kredi hatası (${status}): ${errText.slice(0, 120)}`);
    }
    throw new Error(`Anthropic hatası (${status}): ${errText.slice(0, 120)}`);
  }

  const data = await response.json();
  const content = data?.content?.[0]?.text || '';
  if (!content.trim()) throw new Error('Anthropic boş yanıt döndürdü');
  return content.trim();
}

// ----------------------------------------------------------------------------
// OpenAI GPT çağrısı (OpenAI uyumlu şema)
// ----------------------------------------------------------------------------
async function callOpenAI(model: string, systemPrompt: string, prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || '';
  if (!apiKey) throw new Error('OpenAI anahtarı yok');
  return callOpenAICompatible('https://api.openai.com/v1', apiKey, model, systemPrompt, prompt, 8192);
}

// ----------------------------------------------------------------------------
// Yerel Ollama çağrısı (bağımsız, internet gerektirmez)
// ----------------------------------------------------------------------------
async function callOllama(model: string, prompt: string, timeoutMs = 90000): Promise<string> {
  // ☁️ Bulutta (Vercel serverless) localhost/Ollama yok — patlamak yerine atla
  if (isCloudRuntime()) {
    throw new Error('Bulut ortamında (Vercel) yerel Ollama kullanılamaz — Plan F atlandı');
  }
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const response = await fetchWithTimeout(
    `${ollamaUrl}/api/generate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0.4 } }),
    },
    timeoutMs
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama hatası (${response.status}): ${errText.slice(0, 120)}`);
  }

  const data = await response.json();
  const content = (data?.response || '').trim();
  if (!content) throw new Error('Ollama boş yanıt döndürdü');
  return content;
}

// ----------------------------------------------------------------------------
// DeepSeek (Kodlama Plan A)
// ----------------------------------------------------------------------------
async function callDeepSeek(systemPrompt: string, prompt: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY || '';
  if (!apiKey) throw new Error('DeepSeek anahtarı yok');
  return callOpenAICompatible(
    'https://api.deepseek.com',
    apiKey,
    'deepseek-chat', // DeepSeek V3
    systemPrompt,
    prompt,
    8192
  );
}

// ----------------------------------------------------------------------------
// Gemini (Sohbet/Araştırma Plan A)
// ----------------------------------------------------------------------------
async function callGemini(systemPrompt: string, prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) throw new Error('Gemini anahtarı yok');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
  });
  const result = await model.generateContent(`${systemPrompt}\n\n${prompt}`);
  const text = result.response.text().trim();
  if (!text) throw new Error('Gemini boş yanıt döndürdü');
  return text;
}
// ----------------------------------------------------------------------------
// 🎙️ Groq Whisper v3 — ses transkripsiyon katmanı (aktif hat, GROQ_API_KEY ile)
// ----------------------------------------------------------------------------
export async function transcribeGroqWhisper(audioBase64: string, opts?: { model?: string }): Promise<{ text: string; model: string }> {
  const key = process.env.GROQ_API_KEY || '';
  if (!key) throw new Error('Groq anahtarı yok');
  const model = opts?.model || process.env.GROQ_WHISPER_MODEL || 'whisper-large-v3';
  const form = new FormData();
  form.append('model', model);
  form.append('file', new Blob([Buffer.from(audioBase64, 'base64')], { type: 'audio/wav' }), 'voice.wav');
  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  const data = (await res.json()) as { text?: string; error?: { message?: string } };
  if (!res.ok) throw new Error(data.error?.message || `Whisper ${res.status}`);
  if (!data.text) throw new Error('Whisper boş transkripsiyon');
  return { text: data.text.trim(), model };
}
// ----------------------------------------------------------------------------
// Plan matrisleri
// ----------------------------------------------------------------------------
const CODE_SYSTEM_PROMPT =
  "Sen Likya Kampüsü'nün baş yazılım mühendisisin. Sadece ve sadece tam güncellenmiş dosya içeriğini döndür; açıklama, markdown veya kod bloğu işareti kullanma. Yanıtlar kısa, net, gerçekçi ve doğrudan sonuca yönelik olmalıdır. Dosya içeriğini eksiksiz, tüm JSX etiketlerini ve parantezleri eksiksiz kapatacak şekilde TEK PARÇA üret. Eksik kod veya placeholder bırakma.\n\nDÜŞÜNCE ZİNCİRİ (Chain-of-Thought) — kod üretmeden ÖNCE şu 3 adımı içinden geç:\n1. MANTIK: Kullanıcı ne istiyor? Hangi bileşen/state/efekt gerekiyor? Mevcut import/export yapısını koru.\n2. ETİKET TARAMASI: Yazacağın her <div>/<svg>/<button> vs. kapanış etiketini say; her { ve ( için kapanışını eşleştir. Açıkta etiket/parantez KALMAYACAK.\n3. KOD: Tüm parantezler ve JSX etiketleri eksiksiz kapanmış, derlenebilir TAM dosyayı tek parça halinde döndür.";

const CHAT_SYSTEM_PROMPT =
  "Sen Likya CEO'susun; centilmen, naif, sıcak ve hafif esprili bir kurucu ortak gibi konuşursun. Yanıtlar kısa, net, gerçekçi ve doğrudan sonuca yönelik olmalıdır; uzun edebiyat ve gereksiz dolgu cümleleri yasaktır. 'Efendim' hitabıyla başla. Markdown ile kısa başlıklar/listeler kullan.";

function buildCodePlans(): MatrixPlan[] {
  const plans: MatrixPlan[] = [];
  // ⚡ NVIDIA NIM DGX Cloud — 1. ÖNCELİKLİ HAT (anahtar varsa)
  if (nvidiaEnvReady()) {
    plans.push({
      letter: 'N', name: 'NVIDIA NIM (DGX Cloud)', badge: '[⚡ Plan N: NVIDIA NIM]',
      run: (p) => nvidiaNimChat(p, CODE_SYSTEM_PROMPT),
    });
  }
  const deepseekKey = process.env.DEEPSEEK_API_KEY || '';
  const groqKey = process.env.GROQ_API_KEY || '';
  const openaiKey = process.env.OPENAI_API_KEY || '';
  const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
  const mistralKey = process.env.MISTRAL_API_KEY || '';

  if (deepseekKey) {
    plans.push({
      letter: 'A', name: 'DeepSeek V3', badge: '[🧠 Plan A: DeepSeek]',
      run: (p) => callDeepSeek(CODE_SYSTEM_PROMPT, p),
    });
  }
  if (groqKey) {
    plans.push({
      letter: 'B', name: 'GPT-OSS-120b / Groq', badge: '[🧠 Plan B: Groq GPT-OSS]',
      run: (p) => callOpenAICompatible('https://api.groq.com/openai/v1', groqKey, 'openai/gpt-oss-120b', CODE_SYSTEM_PROMPT, p),
    });
  }
  if (openaiKey) {
    plans.push({
      letter: 'C', name: 'OpenAI GPT-4o-mini', badge: '[🤖 Plan C: OpenAI]',
      run: (p) => callOpenAI('gpt-4o-mini', CODE_SYSTEM_PROMPT, p),
    });
  }
  if (anthropicKey) {
    plans.push({
      letter: 'D', name: 'Anthropic Claude Haiku', badge: '[🟠 Plan D: Claude]',
      run: (p) => callAnthropic('claude-3-5-haiku-latest', CODE_SYSTEM_PROMPT, p),
    });
  }
  if (mistralKey) {
    plans.push({
      letter: 'E', name: 'Mistral Codestral', badge: '[💻 Plan E: Mistral Codestral]',
      run: (p) => callOpenAICompatible('https://api.mistral.ai/v1', mistralKey, 'codestral-latest', CODE_SYSTEM_PROMPT, p),
    });
  }
  // Plan F: Yerel Ollama — YALNIZCA bulut OLMAYAN ortamda (Vercel'de localhost yok)
  if (!isCloudRuntime()) {
    plans.push({
      letter: 'F', name: 'Ollama qwen2.5-coder', badge: '[💻 Plan F: Yerel Ollama]',
      run: (p) => callOllama(process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b', p),
    });
  }
  // Plan Z: Deterministik kural motoru — bulutta anahtar yoksa "fetch failed" yerine sistem yanıtı
  plans.push({
    letter: 'Z', name: 'Likya Kural Motoru', badge: '[⚙️ Plan Z: Kural Motoru]',
    run: (p) => callDeterministicFallback(p, 'code'),
  });
  return plans;
}

export function buildResearchPlans(): MatrixPlan[] {
  const plans: MatrixPlan[] = [];
  // ⚡ NVIDIA NIM DGX Cloud — 1. ÖNCELİKLİ HAT (anahtar varsa)
  if (nvidiaEnvReady()) {
    plans.push({
      letter: 'N', name: 'NVIDIA NIM (DGX Cloud)', badge: '[⚡ Plan N: NVIDIA NIM]',
      run: (p) => nvidiaNimChat(p, CHAT_SYSTEM_PROMPT),
    });
  }
  const geminiKey = process.env.GEMINI_API_KEY || '';
  const groqKey = process.env.GROQ_API_KEY || '';
  const openaiKey = process.env.OPENAI_API_KEY || '';
  const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
  const openrouterKey = process.env.OPENROUTER_API_KEY || '';
  const cerebrasKey = process.env.CEREBRAS_API_KEY || '';

  // 🟢 Cerebras — sağlık testinden geçti (VALID), hızlı çıkarım (OpenAI uyumlu)
  if (cerebrasKey) {
    plans.push({
      letter: 'C', name: 'Cerebras Llama 3.3', badge: '[⚡ Plan C: Cerebras]',
      run: (p) => callOpenAICompatible('https://api.cerebras.ai/v1', cerebrasKey, 'llama-3.3-70b', CHAT_SYSTEM_PROMPT, p),
    });
  }

  if (geminiKey) {
    plans.push({
      letter: 'A', name: 'Gemini Flash', badge: '[⚡ Plan A: Gemini]',
      run: (p) => callGemini(CHAT_SYSTEM_PROMPT, p),
    });
  }
  if (groqKey) {
    plans.push({
      letter: 'B', name: 'GPT-OSS-120b / Groq', badge: '[🧠 Plan B: Groq GPT-OSS]',
      run: (p) => callOpenAICompatible('https://api.groq.com/openai/v1', groqKey, 'openai/gpt-oss-120b', CHAT_SYSTEM_PROMPT, p),
    });
  }
  if (openaiKey) {
    plans.push({
      letter: 'C', name: 'OpenAI GPT-4o-mini', badge: '[🤖 Plan C: OpenAI]',
      run: (p) => callOpenAI('gpt-4o-mini', CHAT_SYSTEM_PROMPT, p),
    });
  }
  if (anthropicKey) {
    plans.push({
      letter: 'D', name: 'Anthropic Claude Haiku', badge: '[🟠 Plan D: Claude]',
      run: (p) => callAnthropic('claude-3-5-haiku-latest', CHAT_SYSTEM_PROMPT, p),
    });
  }
  if (openrouterKey) {
    plans.push({
      letter: 'E', name: 'OmniRoute Free Pool', badge: '[🌐 Plan E: OmniRoute Free]',
      // 🌐 ÜCRETSİZ HAVUZ: prompt içeriğine göre :free model seçilir (bütçe tüketmez)
      run: (p) => callOpenAICompatible('https://openrouter.ai/api/v1', openrouterKey, freeModelFromPrompt(p), CHAT_SYSTEM_PROMPT, p),
    });
  }
  // Plan F: Yerel Ollama — YALNIZCA bulut OLMAYAN ortamda (Vercel'de localhost yok)
  if (!isCloudRuntime()) {
    plans.push({
      letter: 'F', name: 'Ollama qwen2.5-coder', badge: '[💻 Plan F: Yerel Ollama]',
      run: (p) => callOllama(process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b', p),
    });
  }
  // Plan Z: Deterministik kural motoru — asla "fetch failed" dönmez
  plans.push({
    letter: 'Z', name: 'Likya Kural Motoru', badge: '[⚙️ Plan Z: Kural Motoru]',
    run: (p) => callDeterministicFallback(p, 'research'),
  });
  return plans;
}

// ----------------------------------------------------------------------------
// OTOMATİK ŞELALE — A'dan D'ye sessizce dene, ilk başarılı sonucu döndür
// ----------------------------------------------------------------------------
export async function generateWithWaterfall(prompt: string, mode: MatrixMode): Promise<MatrixResult> {
  const plans = mode === 'code' ? buildCodePlans() : buildResearchPlans();
  const fallbackLog: string[] = [];

  for (const plan of plans) {
    try {
      const content = await plan.run(prompt);
      if (content.trim()) {
        return {
          ok: true,
          content: content.trim(),
          plan: plan.letter,
          badge: plan.badge,
          provider: plan.name,
          fallbackLog,
        };
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      fallbackLog.push(`Plan ${plan.letter} (${plan.name}) başarısız: ${msg.slice(0, 140)}`);
      console.warn(`[CEO/Matrix] Plan ${plan.letter} (${plan.name}) başarısız → sıradaki plana geçiliyor. ${msg.slice(0, 120)}`);
    }
  }

  return {
    ok: false,
    content: '',
    plan: '',
    badge: '',
    provider: '',
    fallbackLog,
    error: fallbackLog.join(' | ') || 'Tüm modeller başarısız oldu',
  };
}

// ----------------------------------------------------------------------------
// 🌐 KIRILMASIZ OPENROUTER GATEWAY ROTASI (eklenti bağlantısı)
// Mevcut Plan E (OpenRouter Free) korunur; bu rota openRouterAdapter üzerinden
// çoklu model (Claude/DeepSeek/Llama/Gemini) yönlendirme sunar. Anahtar yoksa
// veya hata olursa mevcut A→B→C→D şelalesine düşer (graceful fallback).
// ----------------------------------------------------------------------------
export async function generateWithOpenRouterGateway(prompt: string, mode: MatrixMode): Promise<MatrixResult> {
  const key = process.env.OPENROUTER_API_KEY || '';
  if (!key) {
    return generateWithWaterfall(prompt, mode);
  }
  try {
    const res = await routeViaOpenRouter(prompt, { model: modelFromPrompt(prompt) });
    return {
      ok: res.ok,
      content: res.content,
      plan: 'E',
      badge: '[🌐 Plan E: OpenRouter Gateway]',
      provider: 'openrouter',
      fallbackLog: [`openrouter-gateway: ${res.model} (${res.latencyMs}ms, sim=${res.simulated})`],
    };
  } catch {
    return generateWithWaterfall(prompt, mode);
  }
}


