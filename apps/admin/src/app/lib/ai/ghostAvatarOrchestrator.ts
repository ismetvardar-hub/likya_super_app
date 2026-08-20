// ============================================================================
// 👻 GHOST AVATAR & TAKTİK YORGUNLUK DANIŞMANI ÇOK-MODELLİ ORKESTRATÖR (Adım 124)
// OpenRouter'u çekirdek spor motorlarıyla derinlemesine bağlar:
//   • inMatchFatigueAdvisor → FAST_TACTICAL (anında mola önerisi)
//   • seasonMemoryBuffer    → DEEP_REASONING (uzun vadeli gelişim özeti)
//   • scoutReportGenerator  → DEEP_REASONING (derin scout analizi)
// Tüm çağrılar OpenRouterCacheInterceptor üzerinden geçer (hit → $0/0ms) ve
// AiCostTracker akademi bütçesini ($2/gün) uygular — aşımda yerel kural motoru.
// ============================================================================
import { OpenRouterGateway, type GatewayTier } from './openRouterGateway.ts';
import { SemanticQueryCache, type TelemetryProfile } from './cache/semanticQueryCache.ts';
import { OpenRouterCacheInterceptor, type InterceptResult, type CacheInterceptorStats } from './openRouterCacheInterceptor.ts';
import { AiCostTracker, ACADEMY_DAILY_BUDGET_USD, type DailyBudgetResult } from './aiCostTracker.ts';
import { forecastFatigue, buildFatigueInsightPrompt, type FatigueModelInput } from './inMatchFatigueAdvisor.ts';
import { SeasonMemoryBuffer } from '../sports/avatar/seasonMemoryBuffer.ts';
import { buildScoutReport, reportMarkdown, type ScoutMetrics } from '../scouting/scoutReportGenerator.ts';

export interface GhostAvatarOrchestratorOptions {
  gateway?: OpenRouterGateway;
  cache?: SemanticQueryCache;
  seasonMemory?: SeasonMemoryBuffer;
  academyScopeId?: string;
  academyDailyBudgetUsd?: number;
}

export interface GhostInsightResult {
  text: string;
  tier: GatewayTier;
  fromCache: boolean;
  tokensSpent: number;
  costUsd: number;
  model: string;
  budgetEnforced: boolean;
}

export class GhostAvatarOrchestrator {
  private readonly gateway: OpenRouterGateway;
  private readonly interceptor: OpenRouterCacheInterceptor;
  private readonly costTracker: AiCostTracker;
  private readonly seasonMemory: SeasonMemoryBuffer;
  private readonly scopeId: string;

  constructor(opts: GhostAvatarOrchestratorOptions = {}) {
    this.scopeId = opts.academyScopeId ?? 'default-academy';
    const budget = opts.academyDailyBudgetUsd ?? ACADEMY_DAILY_BUDGET_USD;
    if (opts.gateway) {
      // Dışarıdan gateway verildiyse onun tracker'ı bütçe zorlaması için ortak kullanılır
      this.gateway = opts.gateway;
      this.costTracker = this.gateway.costTracker();
    } else {
      this.costTracker = new AiCostTracker();
      this.gateway = new OpenRouterGateway({}, this.costTracker);
    }
    this.costTracker.setDailyBudget(this.scopeId, budget);
    this.interceptor = new OpenRouterCacheInterceptor(this.gateway, opts.cache ?? new SemanticQueryCache());
    this.seasonMemory = opts.seasonMemory ?? new SeasonMemoryBuffer();
  }

  // ── FAST_TACTICAL: maç içi yorgunluk → anında mola önerisi ────────────────
  async matchTacticalInsight(input: FatigueModelInput): Promise<GhostInsightResult> {
    const forecast = forecastFatigue(input);
    const prompt = buildFatigueInsightPrompt(input, forecast);
    const profile: TelemetryProfile = {
      athleteId: 'match',
      version: 1,
      metrics: { fatigueScore: forecast.fatigueScore, tFatigueMinutes: forecast.tFatigueMinutes },
    };
    const res = await this.interceptor.interpret(
      profile,
      { tier: 'FAST_TACTICAL', systemPrompt: 'Sen kort tenisi koçusun; özlü, uygulanabilir taktik önerisi üret.' },
      prompt,
      this.scopeId,
    );
    return this.toGhostResult(res, 'FAST_TACTICAL');
  }

  // ── DEEP_REASONING: sezon hafıza → uzun vadeli gelişim özeti ───────────────
  async seasonDevelopmentSummary(athleteId: string): Promise<GhostInsightResult> {
    const ctx = this.seasonMemory.injectContext(athleteId);
    const prompt = `Sporcu sezon bağlamı:\n${this.seasonMemory.seasonContextBlock(athleteId)}\n\nGelecek sezon için kanıta dayalı 3 cümlelik gelişim özeti üret.`;
    const profile: TelemetryProfile = { athleteId, version: 1, metrics: { sessionCount: ctx.sessionCount, flawCount: ctx.recurringFlaws.length } };
    const res = await this.interceptor.interpret(
      profile,
      { tier: 'DEEP_REASONING', systemPrompt: 'Sen spor bilimcisi + gelişim antrenörüsün.' },
      prompt,
      this.scopeId,
    );
    return this.toGhostResult(res, 'DEEP_REASONING');
  }

  // ── DEEP_REASONING: scout raporu → derin analiz ───────────────────────────
  async scoutingSummary(athleteId: string, metrics: ScoutMetrics): Promise<GhostInsightResult> {
    const markdown = reportMarkdown(buildScoutReport({ athleteName: athleteId, metrics }));
    const prompt = `Scout raporu:\n${markdown}\n\nDerinlemesine, yapıcı analiz üret (3 cümle).`;
    const profile: TelemetryProfile = {
      athleteId,
      version: 1,
      metrics: { speedKmh: metrics.speedKmh, reactivePower: metrics.reactivePower, strikeMechanics: metrics.strikeMechanics },
    };
    const res = await this.interceptor.interpret(
      profile,
      { tier: 'DEEP_REASONING', systemPrompt: "Sen profesyonel tenis scout'u + spor bilimcisisin." },
      prompt,
      this.scopeId,
    );
    return this.toGhostResult(res, 'DEEP_REASONING');
  }

  budgetStatus(): DailyBudgetResult {
    return this.costTracker.dailyBudget(this.scopeId);
  }

  interceptorStats(): CacheInterceptorStats {
    return this.interceptor.stats();
  }

  costTrackerInstance(): AiCostTracker {
    return this.costTracker;
  }

  private toGhostResult(res: InterceptResult, tier: GatewayTier): GhostInsightResult {
    return {
      text: res.interpretation,
      tier,
      fromCache: res.hit,
      tokensSpent: res.tokensSpent,
      costUsd: res.costUsd,
      model: res.model,
      budgetEnforced: res.hit ? false : (res.gatewayResult?.simulated ?? false),
    };
  }
}

export function ghostAvatarOrchestratorStatus(): string {
  return `Ghost Avatar: FAST_TACTICAL (yorgunluk) + DEEP_REASONING (sezon/scout) • cache-first $0 • ${ACADEMY_DAILY_BUDGET_USD}$/gün bütçe`;
}
