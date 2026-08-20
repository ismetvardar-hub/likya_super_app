// ============================================================================
// 🌐 OPENROUTER BİRLEŞİK ÇOK-MODELLİ AI GATEWAY & AKILLI FALLBACK YÖNLENDİRİCİ
// Tek OpenRouter anahtarı üzerinden dayanıklı çok modelli yönlendirme:
//   • Tier preset'leri: FAST_TACTICAL / DEEP_REASONING / VISION_MULTIMODAL
//   • Otomatik failover zinciri: hata/rate-limit/5xx → sıralı fallback + üstel backoff
//   • Offline/headless-CI mock sandbox: deterministik spor içgörüsü (anahtar yoksa)
// Token/cost kaydı aiCostTracker ile; semantik cache entegrasyonu çağıran tarafta.
// ============================================================================
import { AiCostTracker, costForModel, estimateTokens, type TokenUsage } from './aiCostTracker.ts';

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
export const MOCK_COMPLETION_TOKENS = 180;

export type GatewayTier = 'FAST_TACTICAL' | 'DEEP_REASONING' | 'VISION_MULTIMODAL';

export interface TierPreset {
  tier: GatewayTier;
  label: string;
  description: string;
  models: string[]; // [birincil, fallback1, fallback2]
}

export const GATEWAY_TIERS: Record<GatewayTier, TierPreset> = {
  FAST_TACTICAL: {
    tier: 'FAST_TACTICAL',
    label: 'Hızlı Taktiksel',
    description: 'Gerçek zamanlı set arası & drill önerisi',
    models: ['google/gemini-2.0-flash-001', 'anthropic/claude-3.5-haiku', 'meta-llama/llama-3.3-70b-instruct:free'],
  },
  DEEP_REASONING: {
    tier: 'DEEP_REASONING',
    label: 'Derin Akıl Yürütme',
    description: 'Kapsamlı scout & TID raporları',
    models: ['anthropic/claude-3.7-sonnet', 'deepseek/deepseek-r1', 'deepseek/deepseek-chat'],
  },
  VISION_MULTIMODAL: {
    tier: 'VISION_MULTIMODAL',
    label: 'Görüntü / Multimodal',
    description: 'Video karesi & biyomekanik açı incelemesi',
    models: ['openai/gpt-4o', 'google/gemini-pro-vision', 'google/gemini-2.0-flash-exp:free'],
  },
};

export const GATEWAY_TIER_ORDER: GatewayTier[] = ['FAST_TACTICAL', 'DEEP_REASONING', 'VISION_MULTIMODAL'];

export function tierPreset(tier: GatewayTier): TierPreset {
  const found = GATEWAY_TIERS[tier];
  if (!found) throw new Error(`Bilinmeyen gateway tier: ${tier}`);
  return found;
}

export function primaryModel(tier: GatewayTier): string {
  return tierPreset(tier).models[0];
}

export function fallbackModels(tier: GatewayTier): string[] {
  return tierPreset(tier).models.slice(1);
}

// ── Model zinciri: birincil + (custom fallback ?? tier fallback'leri) ─────────
export function resolveModelChain(tier: GatewayTier, customFallback?: string[]): string[] {
  const primary = primaryModel(tier);
  const fallbacks = customFallback && customFallback.length > 0 ? customFallback : fallbackModels(tier);
  return [primary, ...fallbacks];
}

export interface CompletionRequest {
  prompt: string;
  systemPrompt?: string;
  tier: GatewayTier;
  maxTokens?: number;
  temperature?: number;
  customFallback?: string[];
  timeoutMs?: number;
  scopeId?: string; // kulüp/akademi maliyet izleme kapsamı
}

export interface CompletionResult {
  ok: boolean;
  content: string;
  model: string;
  tier: GatewayTier;
  latencyMs: number;
  simulated: boolean;
  attempts: number;
  fallbackLog: string[];
  usage: TokenUsage;
  costUsd: number;
}

export interface GatewayDeps {
  apiKey?: string;
  fetchFn?: (url: string, init: RequestInit) => Promise<Response>;
  sleepFn?: (ms: number) => Promise<void>;
  forceMock?: boolean;
  backoffBaseMs?: number;
  maxBackoffMs?: number;
}

// ── Deterministik mock spor içgörüsü (offline / CI / anahtar yok) ─────────────
export function mockSportsCompletion(prompt: string, tier: GatewayTier): string {
  const context = prompt.slice(0, 80);
  if (tier === 'FAST_TACTICAL') {
    return `[Sandbox Mock · FAST_TACTICAL] Kort taktik önerisi: "${context}…" — GCT drift ve deselerasyon yükünü izle; molada tempo kontrolüne geç. (deterministik — API anahtarı olmadan çalışır)`;
  }
  if (tier === 'DEEP_REASONING') {
    return `[Sandbox Mock · DEEP_REASONING] Scout değerlendirmesi: "${context}…" — PHV normalizasyonuyla TID bileşenlerini gözden geçir; reaktif güç ve fren verimi öncelikli. (deterministik — API anahtarı olmadan çalışır)`;
  }
  return `[Sandbox Mock · VISION_MULTIMODAL] Kare incelemesi: "${context}…" — ayak vuruş açısı ve diz fleksiyon yörüngesi biyomekanik açıdan kontrol edildi. (deterministik — API anahtarı olmadan çalışır)`;
}

interface ProviderResponse {
  ok: boolean;
  content: string;
  promptTokens: number;
  completionTokens: number;
  statusLabel: string;
}

export class OpenRouterGateway {
  private readonly deps: Required<Pick<GatewayDeps, 'forceMock' | 'backoffBaseMs' | 'maxBackoffMs'>> & GatewayDeps;
  private readonly tracker: AiCostTracker;
  private calls = 0;

  constructor(deps: GatewayDeps = {}, tracker = new AiCostTracker()) {
    this.deps = {
      ...deps,
      forceMock: deps.forceMock ?? false,
      backoffBaseMs: deps.backoffBaseMs ?? 50,
      maxBackoffMs: deps.maxBackoffMs ?? 800,
    };
    this.tracker = tracker;
  }

  costTracker(): AiCostTracker {
    return this.tracker;
  }

  callCount(): number {
    return this.calls;
  }

  private apiKey(): string {
    if (this.deps.apiKey) return this.deps.apiKey;
    return (typeof process !== 'undefined' && (process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY)) || '';
  }

  private async sleep(ms: number): Promise<void> {
    if (ms <= 0) return;
    if (this.deps.sleepFn) await this.deps.sleepFn(ms);
    else await new Promise((r) => setTimeout(r, ms));
  }

  private mockResult(req: CompletionRequest, attempts = 1, fallbackLog: string[] = []): CompletionResult {
    const usage: TokenUsage = {
      promptTokens: estimateTokens(req.prompt),
      completionTokens: MOCK_COMPLETION_TOKENS,
      totalTokens: estimateTokens(req.prompt) + MOCK_COMPLETION_TOKENS,
    };
    const model = primaryModel(req.tier);
    if (req.scopeId) this.tracker.recordUsage(req.scopeId, model, usage, 0);
    return {
      ok: true,
      content: mockSportsCompletion(req.prompt, req.tier),
      model,
      tier: req.tier,
      latencyMs: 0,
      simulated: true,
      attempts,
      fallbackLog,
      usage,
      costUsd: costForModel(model, usage).totalCostUsd,
    };
  }

  // ── Birincil → fallback zinciri (üstel backoff ile) ─────────────────────────
  async complete(req: CompletionRequest): Promise<CompletionResult> {
    const key = this.apiKey();
    if (this.deps.forceMock || !key) {
      return this.mockResult(req, 1, ['mock sandbox (API anahtarı yok / forceMock)']);
    }
    const chain = resolveModelChain(req.tier, req.customFallback);
    const fallbackLog: string[] = [];
    const startedAt = Date.now();
    const timeoutMs = req.timeoutMs ?? 45000;

    for (let i = 0; i < chain.length; i++) {
      const model = chain[i];
      this.calls++;
      const attemptStartedAt = Date.now();
      let response: ProviderResponse;
      try {
        response = await this.performCompletion(model, req, timeoutMs);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        response = { ok: false, content: '', promptTokens: 0, completionTokens: 0, statusLabel: `hata: ${message}` };
      }

      if (response.ok) {
        const usage: TokenUsage = {
          promptTokens: Math.max(1, response.promptTokens),
          completionTokens: Math.max(0, response.completionTokens),
          totalTokens: Math.max(1, response.promptTokens) + Math.max(0, response.completionTokens),
        };
        const latencyMs = Date.now() - attemptStartedAt;
        if (req.scopeId) this.tracker.recordUsage(req.scopeId, model, usage, latencyMs);
        return {
          ok: true,
          content: response.content,
          model,
          tier: req.tier,
          latencyMs: Date.now() - startedAt,
          simulated: false,
          attempts: i + 1,
          fallbackLog,
          usage,
          costUsd: costForModel(model, usage).totalCostUsd,
        };
      }

      fallbackLog.push(`${model} → ${response.statusLabel}`);
      if (i < chain.length - 1) {
        await this.sleep(Math.min(this.deps.maxBackoffMs, this.deps.backoffBaseMs * 2 ** i));
      }
    }

    // Tüm sağlayıcılar başarısız → deterministik mock sandbox (asla boş dönmez)
    return this.mockResult(req, chain.length, fallbackLog);
  }

  private async performCompletion(model: string, req: CompletionRequest, timeoutMs: number): Promise<ProviderResponse> {
    const body = {
      model,
      messages: [
        ...(req.systemPrompt ? [{ role: 'system' as const, content: req.systemPrompt }] : []),
        { role: 'user' as const, content: req.prompt },
      ],
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 1024,
    };
    const fetchFn = this.deps.fetchFn ?? ((url: string, init: RequestInit) => fetch(url, init));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchFn(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey()}` },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        return { ok: false, content: '', promptTokens: 0, completionTokens: 0, statusLabel: `http_${res.status}` };
      }
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };
      return {
        ok: true,
        content: json.choices?.[0]?.message?.content ?? '',
        promptTokens: json.usage?.prompt_tokens ?? estimateTokens(req.prompt),
        completionTokens: json.usage?.completion_tokens ?? MOCK_COMPLETION_TOKENS,
        statusLabel: 'ok',
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

export function openRouterGatewayStatus(): string {
  return `OpenRouter Gateway: ${GATEWAY_TIER_ORDER.length} tier • ${GATEWAY_TIER_ORDER.length * 3} model • failover + üstel backoff • mock sandbox`;
}

