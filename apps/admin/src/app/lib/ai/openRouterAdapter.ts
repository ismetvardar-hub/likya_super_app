// ============================================================================
// 🌐 OPENROUTER & MODEL GATEWAY EKLENTİSİ — tek anahtar, çoklu model
// Claude, DeepSeek, Llama, Gemini modellerini tek OpenRouter anahtarı üzerinden
// prompt içeriğine göre yönlendirir. Kırılmasız adaptör: anahtar yoksa
// deterministik fallback döner; mevcut modelMatrix Plan E korunur.
// ============================================================================

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Prompt içeriğine göre model seçimi (deterministik yönlendirme stub'ı)
export function modelFromPrompt(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (/(claude|anthropic|sonnet|opus)/.test(lower)) return 'anthropic/claude-3.5-sonnet';
  if (/(deepseek|kod yaz|hata düzelt|yazılım)/.test(lower)) return 'deepseek/deepseek-chat';
  if (/(gemini|google)/.test(lower)) return 'google/gemini-2.0-flash-exp:free';
  if (/(llama|meta)/.test(lower)) return 'meta-llama/llama-3.3-70b-instruct:free';
  return 'meta-llama/llama-3.3-70b-instruct:free'; // varsayılan
}


// 🌐 OMNIROUTE ÜCRETSİZ MODEL HAVUZU (`:free` katmanı — bütçe tüketmez)
export const FREE_MODELS: { id: string; label: string; detect: RegExp[] }[] = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B', detect: [/llama/, /meta/, /genel/] },
  { id: 'deepseek/deepseek-r1:free', label: 'DeepSeek R1', detect: [/deepseek/, /kod/, /r1/] },
  { id: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash', detect: [/gemini/, /google/] },
  { id: 'qwen/qwen-2.5-coder-32b-instruct:free', label: 'Qwen 2.5 Coder 32B', detect: [/qwen/, /coder/, /yazılım/, /yaz/, /oluştur/] },
];

// Prompt'a göre ücretsiz model seçimi (deterministik)
export function freeModelFromPrompt(prompt: string): string {
  const lower = prompt.toLowerCase();
  for (const m of FREE_MODELS) {
    if (m.detect.some((re) => re.test(lower))) return m.id;
  }
  return FREE_MODELS[0].id; // varsayılan Llama free
}

// Ücretsiz havuz durum rozeti
export function openRouterFreePoolStatus(): string {
  const hasKey = typeof process !== 'undefined' && !!(process.env.OPENROUTER_API_KEY || '');
  return `OmniRoute Free Pool [${FREE_MODELS.length} :free model • Llama/DeepSeek-R1/Gemini-Flash/Qwen-Coder • ${hasKey ? 'API bağlı' : 'anahtar bekliyor'}]`;
}

export interface OpenRouterOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface OpenRouterResult {
  ok: boolean;
  content: string;
  model: string;
  latencyMs: number;
  simulated: boolean;
}

// Zaman aşımlı güvenli fetch
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Tek anahtar üzerinden çoklu model yönlendirme rotası
export async function routeViaOpenRouter(prompt: string, opts: OpenRouterOptions = {}): Promise<OpenRouterResult> {
  const key = (typeof process !== 'undefined' && (process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY)) || '';
  const model = opts.model ?? modelFromPrompt(prompt);
  const startedAt = Date.now();

  if (!key) {
    // Deterministik graceful fallback — asla çıplak ağ hatası dönmez
    const simulated =
      `[🌐 OpenRouter Gateway • Simülasyon]\n` +
      `Model: ${model}\n` +
      `Talep özeti: "${prompt.slice(0, 80)}"\n` +
      `Açıklama: OPENROUTER_API_KEY env'ine anahtar eklenince Claude/DeepSeek/Llama/Gemini'ye gerçek yönlendirme başlar.`;
    return { ok: true, content: simulated, model, latencyMs: Date.now() - startedAt, simulated: true };
  }

  try {
    const response = await fetchWithTimeout(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: opts.temperature ?? 0.7,
          max_tokens: opts.maxTokens ?? 1024,
        }),
      },
      opts.timeoutMs ?? 45000,
    );
    if (!response.ok) throw new Error(`OpenRouter HTTP ${response.status}`);
    const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    return {
      ok: true,
      content: json.choices?.[0]?.message?.content ?? '',
      model,
      latencyMs: Date.now() - startedAt,
      simulated: false,
    };
  } catch {
    return {
      ok: false,
      content: `[🌐 OpenRouter Gateway] Şu an erişilemiyor — Plan Z kural motoru devrede.`,
      model,
      latencyMs: Date.now() - startedAt,
      simulated: true,
    };
  }
}

// Eklenti durum rozeti
export function openRouterStatus(): string {
  const hasKey =
    typeof process !== 'undefined' && !!(process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY);
  return `OpenRouter Gateway [${hasKey ? 'API BAĞLI' : 'Simülasyon'} • Claude/DeepSeek/Llama/Gemini]`;
}
