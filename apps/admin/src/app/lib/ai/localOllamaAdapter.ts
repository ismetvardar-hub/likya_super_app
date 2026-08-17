// ============================================================================
// 💻 YEREL OLLAMA ENTEGRASYONU (Local Offline LLM)
// http://127.0.0.1:11434 durum denetimi + hafif/ücretsiz modeller.
// İnternet/cloud kotaları dolduğunda otomatik fallback motoru. Plan Z güvenli.
// ============================================================================

export const OLLAMA_HOST = 'http://127.0.0.1:11434';
export const OLLAMA_MODELS = ['qwen2.5-coder:7b', 'deepseek-r1:8b', 'llama3.2:3b'] as const;
export type OllamaModel = (typeof OLLAMA_MODELS)[number];

export interface OllamaHealth {
  online: boolean;
  host: string;
  models: string[];
  latencyMs: number;
}

export interface OllamaResult {
  ok: boolean;
  model: string;
  content: string;
  latencyMs: number;
  simulated: boolean;
}

// Ollama servis durumu (graceful — hata fırlatmaz, offline raporlar)
export async function checkOllamaHealth(): Promise<OllamaHealth> {
  const startedAt = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = (await res.json()) as { models?: { name?: string }[] };
    const models = (data.models ?? []).map((m) => m.name ?? '').filter(Boolean);
    return { online: true, host: OLLAMA_HOST, models, latencyMs: Date.now() - startedAt };
  } catch {
    return { online: false, host: OLLAMA_HOST, models: [], latencyMs: Date.now() - startedAt };
  }
}

// Yerel Ollama çağrısı (kapalıysa Plan Z simülasyonu — asla çökme)
export async function callLocalOllama(prompt: string, model: OllamaModel = 'qwen2.5-coder:7b'): Promise<OllamaResult> {
  const startedAt = Date.now();
  const health = await checkOllamaHealth();
  if (!health.online) {
    return {
      ok: true,
      model,
      content: `[💻 Ollama kapalı (${OLLAMA_HOST})] Plan Z: model ${model} offline — bulut şelalesine veya kural motoruna düşüldü.`,
      latencyMs: Date.now() - startedAt,
      simulated: true,
    };
  }
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], stream: false }),
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = (await res.json()) as { message?: { content?: string } };
    return { ok: true, model, content: data.message?.content ?? '', latencyMs: Date.now() - startedAt, simulated: false };
  } catch {
    return { ok: false, model, content: '', latencyMs: Date.now() - startedAt, simulated: true };
  }
}

// Fallback kararı: cloud kotası/internet yoksa Ollama'ya düş (deterministik)
export async function routeWithOllamaFallback(prompt: string, cloudTry: () => Promise<string>): Promise<OllamaResult> {
  const startedAt = Date.now();
  try {
    const cloud = await cloudTry();
    if (cloud && !cloud.startsWith('[') && cloud.trim().length > 0) {
      return { ok: true, model: 'cloud', content: cloud, latencyMs: Date.now() - startedAt, simulated: false };
    }
    throw new Error('Bulut yanıtı boş — Ollama fallback');
  } catch {
    return callLocalOllama(prompt);
  }
}

export function localOllamaStatusLabel(online: boolean): string {
  return online ? 'Ollama: yerel model hazır (127.0.0.1:11434)' : 'Ollama: kapalı — bulut şelalesi/Plan Z devrede';
}
