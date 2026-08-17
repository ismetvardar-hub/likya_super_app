// ============================================================================
// 🚀 GROQ & AWESOME FREE LLM ADAPTÖRÜ — OmniRoute şelalesine free katmanlar
// Groq (Llama-3 70B ultra hızlı) • Cohere free • OpenRouter free.
// Bulut kotaları dolduğunda kesintisiz Groq/Ollama geçişi (Plan Z güvenli).
// ============================================================================

export type FreeProviderId = 'groq' | 'cohere' | 'openrouter-free';

export interface FreeLlmResult {
  ok: boolean;
  provider: FreeProviderId;
  model: string;
  content: string;
  latencyMs: number;
  simulated: boolean;
  fallback?: string;
}

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const COHERE_URL = 'https://api.cohere.com/v2/chat';
const OR_FREE_URL = 'https://openrouter.ai/api/v1/chat/completions';

function providerKey(id: FreeProviderId): string {
  if (typeof process === 'undefined') return '';
  switch (id) {
    case 'groq': return process.env.GROQ_API_KEY || '';
    case 'cohere': return process.env.COHERE_API_KEY || '';
    case 'openrouter-free': return process.env.OPENROUTER_API_KEY || '';
  }
}

// Zaman aşımlı fetch
async function fetchJson(url: string, init: RequestInit, timeoutMs = 40000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Groq — en hızlı free katman (Llama-3 70B)
export async function callGroq(prompt: string): Promise<FreeLlmResult> {
  const startedAt = Date.now();
  const key = providerKey('groq');
  if (!key) {
    return { ok: true, provider: 'groq', model: 'llama-3.3-70b-versatile', content: `[🚀 Groq simülasyon] GROQ_API_KEY eklenince gerçek yanıt.`, latencyMs: Date.now() - startedAt, simulated: true, fallback: 'Plan Z' };
  }
  try {
    const res = await fetchJson(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], max_tokens: 600 }),
    });
    if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { ok: true, provider: 'groq', model: 'llama-3.3-70b-versatile', content: data.choices?.[0]?.message?.content ?? '', latencyMs: Date.now() - startedAt, simulated: false };
  } catch (e) {
    return { ok: false, provider: 'groq', model: 'llama-3.3-70b-versatile', content: '', latencyMs: Date.now() - startedAt, simulated: true, fallback: 'cohere' };
  }
}

// Cohere free katman
export async function callCohere(prompt: string): Promise<FreeLlmResult> {
  const startedAt = Date.now();
  const key = providerKey('cohere');
  if (!key) {
    return { ok: true, provider: 'cohere', model: 'command-r', content: `[🚀 Cohere simülasyon] COHERE_API_KEY eklenince gerçek yanıt.`, latencyMs: Date.now() - startedAt, simulated: true, fallback: 'openrouter-free' };
  }
  try {
    const res = await fetchJson(COHERE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: 'command-r', messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) throw new Error(`Cohere HTTP ${res.status}`);
    const data = (await res.json()) as { message?: { content?: { text?: string }[] } };
    return { ok: true, provider: 'cohere', model: 'command-r', content: data.message?.content?.[0]?.text ?? '', latencyMs: Date.now() - startedAt, simulated: false };
  } catch (e) {
    return { ok: false, provider: 'cohere', model: 'command-r', content: '', latencyMs: Date.now() - startedAt, simulated: true, fallback: 'openrouter-free' };
  }
}

// OpenRouter free katman
export async function callOpenRouterFree(prompt: string): Promise<FreeLlmResult> {
  const startedAt = Date.now();
  const key = providerKey('openrouter-free');
  if (!key) {
    return { ok: true, provider: 'openrouter-free', model: 'meta-llama/llama-3.3-70b-instruct:free', content: `[🚀 OpenRouter-free simülasyon] OPENROUTER_API_KEY eklenince gerçek yanıt.`, latencyMs: Date.now() - startedAt, simulated: true, fallback: 'Plan Z' };
  }
  try {
    const res = await fetchJson(OR_FREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: 'meta-llama/llama-3.3-70b-instruct:free', messages: [{ role: 'user', content: prompt }], max_tokens: 600 }),
    });
    if (!res.ok) throw new Error(`OpenRouter-free HTTP ${res.status}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { ok: true, provider: 'openrouter-free', model: 'meta-llama/llama-3.3-70b-instruct:free', content: data.choices?.[0]?.message?.content ?? '', latencyMs: Date.now() - startedAt, simulated: false };
  } catch (e) {
    return { ok: false, provider: 'openrouter-free', model: 'meta-llama/llama-3.3-70b-instruct:free', content: '', latencyMs: Date.now() - startedAt, simulated: true, fallback: 'Plan Z' };
  }
}

// Free şelale — kotalar dolduğunda kesintisiz geçiş
export async function freeLlmWaterfall(prompt: string): Promise<FreeLlmResult> {
  const attempts: FreeProviderId[] = ['groq', 'cohere', 'openrouter-free'];
  for (const id of attempts) {
    const fn = id === 'groq' ? callGroq : id === 'cohere' ? callCohere : callOpenRouterFree;
    const res = await fn(prompt);
    if (res.ok && res.content && !res.simulated) return res;
    // simülasyon/hatada bir sonraki katmana geç; son katman simülasyonu döner
  }
  return callGroq(prompt);
}

export function freeLlmStatus(): string {
  return `Free LLM Şelalesi [Groq→Cohere→OpenRouter-free • kotada Otomatik geçiş]`;
}
