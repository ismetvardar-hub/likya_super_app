// ============================================================================
// 🌐 OMNIROUTE AKILLI API KÖPRÜSÜ (omniRouter)
// Çoklu LLM sağlayıcıları arasında yük dengeleme + fallback (yedek model)
// yönlendirmesi. modelMatrix'in A-B-C-D şelalesini tamamlar: bu modül
// seçim/kırılma/sağlık yönetimini deterministik yapar.
// ============================================================================

export type ProviderId = 'gemini' | 'deepseek' | 'groq' | 'mistral' | 'openrouter' | 'openai' | 'anthropic' | 'ollama';
export type RouterMode = 'code' | 'research';

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  weight: number;          // yük dengeleme ağırlığı (0-100)
  priority: number;        // düşük sayı = öncelik (fallback sırası)
  enabled: boolean;
  model: string;
  badge: string;
  health: number;          // 0-100 (son başarılardan)
}

export const DEFAULT_PROVIDERS: ProviderConfig[] = [
  { id: 'gemini', name: 'Google Gemini', weight: 25, priority: 1, enabled: true, model: 'gemini-1.5-pro', badge: '🟢', health: 100 },
  { id: 'deepseek', name: 'DeepSeek', weight: 22, priority: 2, enabled: true, model: 'deepseek-chat', badge: '🔵', health: 100 },
  { id: 'groq', name: 'Groq', weight: 18, priority: 3, enabled: true, model: 'llama-3.3-70b-versatile', badge: '🟣', health: 100 },
  { id: 'openrouter', name: 'OpenRouter', weight: 12, priority: 4, enabled: true, model: 'free', badge: '🟠', health: 100 },
  { id: 'mistral', name: 'Mistral', weight: 10, priority: 5, enabled: true, model: 'mistral-large', badge: '🟤', health: 100 },
  { id: 'openai', name: 'OpenAI', weight: 8, priority: 6, enabled: true, model: 'gpt-4o-mini', badge: '⚪', health: 100 },
  { id: 'anthropic', name: 'Anthropic Claude', weight: 5, priority: 7, enabled: true, model: 'claude-3-5-haiku', badge: '🟡', health: 100 },
  { id: 'ollama', name: 'Ollama (yerel)', weight: 0, priority: 8, enabled: true, model: 'qwen2.5-coder', badge: '⚙️', health: 100 },
];

// ----------------------------------------------------------------------------
// SAĞLIK SKORU — deterministik: ağırlık × sağlık × (öncelik katsayısı)
// ----------------------------------------------------------------------------
export function healthScore(p: ProviderConfig): number {
  if (!p.enabled) return 0;
  const priorityFactor = 1 / Math.max(1, p.priority);
  return Math.max(0, Math.min(100, p.weight * 0.6 + p.health * 0.3 + priorityFactor * 100 * 0.1));
}

// Ağırlıklı seçim (toplam ağırlık üzerinden kura — deterministik seed destekli)
export function weightedSelect(providers: ProviderConfig[], seed?: number): ProviderConfig {
  const pool = providers.filter((p) => p.enabled && p.weight > 0);
  if (pool.length === 0) return providers.find((p) => p.enabled) ?? providers[0];
  const total = pool.reduce((sum, p) => sum + p.weight, 0);
  const r = seed !== undefined ? (seed % 1000) / 1000 : Math.random();
  let acc = 0;
  for (const p of pool) {
    acc += p.weight / total;
    if (r <= acc) return p;
  }
  return pool[pool.length - 1];
}

// ----------------------------------------------------------------------------
// YUVARLAK ROBİN — sıralı dengeleme (deterministik)
// ----------------------------------------------------------------------------
export interface RouterState {
  index: number;
  failures: Record<string, number>;
  successes: Record<string, number>;
}

export function createRouterState(): RouterState {
  return { index: 0, failures: {}, successes: {} };
}

export function nextRoundRobin(state: RouterState, providers: ProviderConfig[]): ProviderConfig {
  const pool = providers.filter((p) => p.enabled);
  if (pool.length === 0) throw new Error('Etkin sağlayıcı yok');
  const pick = pool[state.index % pool.length];
  state.index += 1;
  return pick;
}

export function recordFailure(state: RouterState, id: ProviderId): void {
  state.failures[id] = (state.failures[id] ?? 0) + 1;
}
export function recordSuccess(state: RouterState, id: ProviderId): void {
  state.successes[id] = (state.successes[id] ?? 0) + 1;
}

// Kırılma/atlatma skoru: başarı oranına göre provider'ları öncelikle
export function rankByReliability(state: RouterState, providers: ProviderConfig[]): ProviderConfig[] {
  return [...providers].sort((a, b) => {
    const rel = (p: ProviderConfig) => {
      const s = state.successes[p.id] ?? 0;
      const f = state.failures[p.id] ?? 0;
      const total = s + f;
      if (total === 0) return p.priority;
      return p.priority + (f / total) * 10;
    };
    return rel(a) - rel(b);
  });
}

// ----------------------------------------------------------------------------
// FALLBACK ŞELALESİ — sırayla dene; başarılı olana kadar devam et
// ----------------------------------------------------------------------------
export interface FallbackResult {
  content: string;
  provider: ProviderConfig;
  attempts: string[];
  fallbackLog: string[];
}

export async function routeWithFallback(
  request: (provider: ProviderConfig) => Promise<string>,
  providers: ProviderConfig[],
  state?: RouterState
): Promise<FallbackResult> {
  const ordered = rankByReliability(state ?? createRouterState(), providers).filter((p) => p.enabled);
  const attempts: string[] = [];
  const fallbackLog: string[] = [];
  let lastError = '';
  for (const provider of ordered) {
    try {
      const content = await request(provider);
      if (state) recordSuccess(state, provider.id);
      fallbackLog.push(`✅ Plan başarılı: ${provider.name} (${provider.badge})`);
      return { content, provider, attempts: [...attempts, provider.name], fallbackLog };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (state) recordFailure(state, provider.id);
      attempts.push(provider.name);
      fallbackLog.push(`⚠️ ${provider.name} başarısız: ${lastError.slice(0, 100)} → sonraki plana geçildi`);
    }
  }
  throw new Error(`Tüm sağlayıcılar başarısız. Son hata: ${lastError}`);
}

// Mod bazlı öneri (hangi sağlayıcı öne çıkmalı)
export function recommendForMode(mode: RouterMode, providers: ProviderConfig[] = DEFAULT_PROVIDERS): ProviderConfig[] {
  const ranked = [...providers].sort((a, b) => healthScore(b) - healthScore(a) || a.priority - b.priority);
  if (mode === 'code') {
    return [...ranked].sort((a, b) => (b.id === 'deepseek' ? 1 : 0) - (a.id === 'deepseek' ? 1 : 0));
  }
  return ranked;
}

