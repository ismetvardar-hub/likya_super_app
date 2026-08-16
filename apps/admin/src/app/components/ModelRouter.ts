// ============================================================================
// LİKYA ÇOKLU MODEL YÖNLENDİRİCİ (Multi-Model Failover Router)
// 🔐 GÜVENLİK: Bu dosya ARTIK HİÇBİR API anahtarı içermez (server-side proxy).
// Tüm LLM çağrıları /api/v1/ai üzerinden sunucuda process.env.GEMINI_API_KEY /
// DEEPSEEK_API_KEY ile yürütülür — client bundle'a anahtar sızması imkânsız.
// Öncelik (server): Gemini -> DeepSeek -> Groq -> OpenRouter -> Plan Z kural motoru
// ============================================================================

export type ModelProvider = 'deepseek' | 'gemini' | 'ollama';

export type ModelResult = {
  provider: ModelProvider;
  content: string;
  latencyMs: number;
};

const AI_PROXY = '/api/v1/ai';

// ============================================================================
// GÜVENLİ SERVER-SIDE PROXY ÇAĞRISI — client'ta hiçbir anahtar yok
// ============================================================================
async function proxyCall(
  prompt: string,
  systemPrompt: string,
  reasoning: boolean,
): Promise<ModelResult> {
  const startedAt = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);
    const res = await fetch(AI_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemPrompt, reasoning }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message || `Proxy hata: ${res.status}`);
    }
    const data = (await res.json()) as { provider: string; content: string };
    const provider: ModelProvider =
      data.provider === 'deepseek' ? 'deepseek' : data.provider === 'gemini' ? 'gemini' : 'ollama';
    return {
      provider,
      content: data.content || '(boş yanıt)',
      latencyMs: Date.now() - startedAt,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Likya AI proxy: ${message}`);
  }
}

// Çoklu model yönlendirici — server-side proxy üzerinden
export async function routeToModel(prompt: string, systemPrompt: string): Promise<ModelResult> {
  return proxyCall(prompt, systemPrompt, false);
}

// Reasoning yönlendirici — DeepSeek-R1 öncelikli (karmaşık görevler)
export async function routeToReasoningModel(prompt: string, systemPrompt: string): Promise<ModelResult> {
  return proxyCall(prompt, systemPrompt, true);
}

// ============================================================================
// MODEL DURUM KONTROLÜ — server'dan plan/anahtar durumu sorgular
// ============================================================================
export async function checkModelHealth(): Promise<{ provider: ModelProvider; status: 'online' | 'offline'; latencyMs: number }[]> {
  try {
    const res = await fetch(`${AI_PROXY}/health`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      plans?: { plan: string; name: string; active: boolean }[];
    };
    return (data.plans ?? []).map((p) => ({
      provider: (p.plan === 'A' ? 'gemini' : p.plan === 'B' ? 'deepseek' : 'ollama') as ModelProvider,
      status: p.active ? ('online' as const) : ('offline' as const),
      latencyMs: 0,
    }));
  } catch {
    return [];
  }
}
