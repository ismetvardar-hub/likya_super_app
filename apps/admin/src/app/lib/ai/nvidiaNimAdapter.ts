// ============================================================================
// ⚡ NVIDIA NIM DGX CLOUD ADAPTÖRÜ — OpenAI uyumlu, 1. öncelikli OmniRoute hattı
// Base URL: https://integrate.api.nvidia.com/v1 (server-only)
// API Key : process.env.NVIDIA_API_KEY (asla tarayıcıya inmez)
// Model   : meta/llama-3.3-70b-instruct (fallback nvidia/nemotron-3-ultra)
// Anahtar yok / ulaşılamazsa → zarif simülasyon (mock-first). Plan Z güvenli.
// ============================================================================

export const NVIDIA_NIM_MODEL = 'meta/llama-3.3-70b-instruct';
export const NVIDIA_NIM_BACKUP = 'nvidia/nemotron-3-ultra';

export function nvidiaEnvReady(): boolean {
  return Boolean(process.env.NVIDIA_API_KEY) && Boolean(process.env.NVIDIA_NIM_BASE_URL);
}

/** OpenAI uyumlu chat tamamlama (fetch — SDK bağımlılığı yok). */
export async function nvidiaNimChat(prompt: string, system = 'Sen Likya Kampüsü CEO asistanısın. Türkçe, net ve centilmen yanıt ver.'): Promise<string> {
  if (!nvidiaEnvReady()) throw new Error('NVIDIA API anahtarı tanımlı değil — mock/simülasyon moduna düş');
  const base = (process.env.NVIDIA_NIM_BASE_URL ?? 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '');
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: NVIDIA_NIM_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1024,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`NVIDIA NIM HTTP ${res.status}: ${err.slice(0, 120)}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? '';
  if (!content.trim()) throw new Error('NVIDIA NIM boş yanıt');
  return content.trim();
}

/** Canlı bağlantı testi — tek token harcayan hafif sorgu. */
export async function testNvidiaNimConnection(): Promise<{ ok: boolean; latencyMs: number; model: string; note: string }> {
  const started = Date.now();
  try {
    const content = await nvidiaNimChat('Yanıt: OK');
    return { ok: true, latencyMs: Date.now() - started, model: NVIDIA_NIM_MODEL, note: content.slice(0, 40) };
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - started, model: NVIDIA_NIM_MODEL, note: (err as Error).message };
  }
}

/** Mock-first fallback (kota aşımı / bağlantı yoksa). */
export function nvidiaMockFallback(prompt: string): string {
  const prefix = prompt.length > 60 ? `${prompt.slice(0, 60)}…` : prompt;
  return `[NVIDIA NIM simülasyonu] Talep alındı: "${prefix}" — DGX Cloud anahtarı tanımlanınca canlı çıkarıma geçer.`;
}

export function nvidiaNimStatus(): string {
  return nvidiaEnvReady()
    ? `NVIDIA NIM (DGX Cloud • ${NVIDIA_NIM_MODEL} • Aktif)`
    : 'NVIDIA NIM (DGX Cloud • standby — anahtar tanımlı değil, Gemini/fallback devrede)';
}
