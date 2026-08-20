// ============================================================================
// 🧠 SEMANTİK QUERY CACHE & OPENROUTER SIFIR-MALİYET INTERCEPTOR (Adım 123)
// FNV-1a semantik cache'i OpenRouter hattına yerleştirir: sporcu metrik yorum
// istekleri dış ağ çağrısından ÖNCE yakalanır; aynı telemetri profili anında
// cache'ten döner → $0 token + 0ms ağ gecikmesi. Saf/deterministik.
// ============================================================================
import { SemanticQueryCache, type TelemetryProfile, type CachedInterpretation } from './cache/semanticQueryCache.ts';
import { OpenRouterGateway, type CompletionRequest, type CompletionResult } from './openRouterGateway.ts';

export interface InterceptResult {
  hit: boolean;
  key: string;
  interpretation: string;
  insight: string;
  tokensSpent: number;
  costUsd: number;
  model: string;
  cachedEntry: CachedInterpretation | null;
  gatewayResult: CompletionResult | null;
}

export interface CacheInterceptorStats {
  hits: number;
  misses: number;
  bypassedExternalCalls: number; // hit ile önlenen dış çağrı sayısı
  tokensSaved: number;
  costSavedUsd: number;
}

export class OpenRouterCacheInterceptor {
  private readonly gateway: OpenRouterGateway;
  private readonly cache: SemanticQueryCache;
  private hits = 0;
  private misses = 0;
  private tokensSaved = 0;
  private costSavedUsd = 0;

  constructor(gateway = new OpenRouterGateway(), cache = new SemanticQueryCache()) {
    this.gateway = gateway;
    this.cache = cache;
  }

  gatewayInstance(): OpenRouterGateway {
    return this.gateway;
  }

  cacheInstance(): SemanticQueryCache {
    return this.cache;
  }

  /**
   * Sporcu metrik profili için yorum üretir:
   *  • Hit  → cache anında döner ($0, 0ms ağ).
   *  • Miss → OpenRouter'a gider, sonucu cache'ler.
   */
  async interpret(profile: TelemetryProfile, request: Omit<CompletionRequest, 'prompt'> & { prompt?: string }, prompt: string, scopeId?: string): Promise<InterceptResult> {
    const key = this.cache.fingerprint(profile);
    const cached = await this.cache.get(key);
    if (cached) {
      this.hits++;
      this.tokensSaved += cached.tokensSaved;
      this.costSavedUsd = Math.round((this.costSavedUsd + this.estimatedSavedUsd(cached.tokensSaved)) * 1000000) / 1000000;
      return {
        hit: true,
        key,
        interpretation: cached.interpretation,
        insight: cached.insight,
        tokensSpent: 0,
        costUsd: 0,
        model: 'semantic-cache',
        cachedEntry: cached,
        gatewayResult: null,
      };
    }

    this.misses++;
    const gatewayResult = await this.gateway.complete({
      ...request,
      prompt: request.prompt ?? prompt,
      scopeId,
    });
    const entry: CachedInterpretation = {
      key,
      interpretation: gatewayResult.content,
      insight: gatewayResult.content,
      generatedAt: new Date().toISOString(),
      tokensSaved: gatewayResult.usage.totalTokens,
    };
    await this.cache.set(key, entry);
    return {
      hit: false,
      key,
      interpretation: gatewayResult.content,
      insight: gatewayResult.content,
      tokensSpent: gatewayResult.usage.totalTokens,
      costUsd: gatewayResult.costUsd,
      model: gatewayResult.model,
      cachedEntry: null,
      gatewayResult,
    };
  }

  stats(): CacheInterceptorStats {
    return {
      hits: this.hits,
      misses: this.misses,
      bypassedExternalCalls: this.hits,
      tokensSaved: this.tokensSaved,
      costSavedUsd: this.costSavedUsd,
    };
  }

  private estimatedSavedUsd(tokens: number): number {
    // Ortalama karışık maliyet varsayımı: milyon token ~$2 (güvenli tahmin)
    return (tokens / 1_000_000) * 2;
  }
}

export function cacheInterceptorStatus(): string {
  return 'Sıfır-Maliyet Interceptor: semantik hash → hit anında $0/0ms • miss → OpenRouter + cache yaz';
}
