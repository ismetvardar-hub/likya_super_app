// ============================================================================
// 🧬 SEZON UZUN-HAFIZA AVATAR TAMPONU (Season Memory Buffer)
// Her sporcu için yuvarlanan, sıkıştırılmış sezon hafıza vektörü:
//  • Kilometre taşları (milestones), tekrarlayan biyomekanik kusurlar, toparlanma trendleri
//  • Bağlamsal uzun-hafıza metni → Ghost Avatar tavsiye motoruna enjeksiyon
// Deterministik; sıfır bağımlılık; node-runnable.
// OpenRouter Gateway entegrasyonu: sezon bağlamı DEEP_REASONING tier ile
// derinlemesine içgörüye dönüştürülür (semantik cache önce — hit → $0).
// ============================================================================
import { OpenRouterGateway, type CompletionRequest } from '../../ai/openRouterGateway.ts';
import { SemanticQueryCache, type TelemetryProfile } from '../../ai/cache/semanticQueryCache.ts';

export interface Milestone {
  label: string;
  date: string;   // ISO
  value: number;  // e.g. yeni PB
}

export interface RecurringFlaw {
  label: string;      // e.g. 'Yüksek GCT', 'L/R asimetri'
  count: number;
  lastSeen: string;
}

export interface RecoveryTrend {
  label: string;      // e.g. 'GCT toparlanması', 'HRV'
  trend: 'faster' | 'normal' | 'slower';
  count: number;
}

export interface SeasonMemory {
  athleteId: string;
  milestones: Milestone[];
  flaws: RecurringFlaw[];
  recoveryTrends: RecoveryTrend[];
  sessionCount: number;
  updatedAt: string;
}

export interface AthleteSeasonContext {
  athleteId: string;
  summary: string;
  recurringFlaws: string[];
  recoveryNote: string;
  sessionCount: number;
}

export const SEASON_MEMORY_DEFAULT_MAX = 20; // sıkıştırma sınırı (sporcu başına olay)

export class SeasonMemoryBuffer {
  private memories = new Map<string, SeasonMemory>();
  private readonly maxFlaws: number;
  private readonly maxMilestones: number;

  constructor(maxFlaws = 12, maxMilestones = 24) {
    this.maxFlaws = maxFlaws;
    this.maxMilestones = maxMilestones;
  }

  private ensure(athleteId: string): SeasonMemory {
    let m = this.memories.get(athleteId);
    if (!m) {
      m = { athleteId, milestones: [], flaws: [], recoveryTrends: [], sessionCount: 0, updatedAt: new Date().toISOString() };
      this.memories.set(athleteId, m);
    }
    return m;
  }

  /** Yeni seans kaydeder (toplam sayaç). */
  recordSession(athleteId: string): void {
    const m = this.ensure(athleteId);
    m.sessionCount++;
    m.updatedAt = new Date().toISOString();
  }

  /** Kilometre taşı ekler (PB, rozet, turnuva…). */
  recordMilestone(athleteId: string, label: string, value = 1): void {
    const m = this.ensure(athleteId);
    m.milestones.push({ label, date: new Date().toISOString(), value });
    if (m.milestones.length > this.maxMilestones) m.milestones.splice(0, m.milestones.length - this.maxMilestones);
  }

  /** Tekrarlayan biyomekanik kusur kaydeder (tekrar sayar). */
  recordFlaw(athleteId: string, label: string): void {
    const m = this.ensure(athleteId);
    const existing = m.flaws.find((f) => f.label === label);
    if (existing) {
      existing.count++;
      existing.lastSeen = new Date().toISOString();
    } else {
      m.flaws.push({ label, count: 1, lastSeen: new Date().toISOString() });
      if (m.flaws.length > this.maxFlaws) m.flaws.shift();
    }
  }

  /** Toparlanma trendi kaydeder. */
  recordRecovery(athleteId: string, label: string, trend: RecoveryTrend['trend']): void {
    const m = this.ensure(athleteId);
    const existing = m.recoveryTrends.find((r) => r.label === label);
    if (existing) {
      existing.trend = trend;
      existing.count++;
    } else {
      m.recoveryTrends.push({ label, trend, count: 1 });
    }
  }

  getMemory(athleteId: string): SeasonMemory | null {
    return this.memories.get(athleteId) ?? null;
  }

  /**
   * Yuvarlanan sıkıştırma: en çok tekrarlanan kusurları öne çıkarır,
   * toplam girişi maksimum sınıra çeker. Sıfır bağımlılık, deterministik.
   */
  compressVector(athleteId: string, maxFlaws = this.maxFlaws): SeasonMemory | null {
    const m = this.memories.get(athleteId);
    if (!m) return null;
    m.flaws.sort((a, b) => b.count - a.count);
    if (m.flaws.length > maxFlaws) m.flaws = m.flaws.slice(0, maxFlaws);
    return m;
  }

  /** Ghost Avatar tavsiye motoruna enjekte edilecek bağlamsal hafıza metni. */
  injectContext(athleteId: string): AthleteSeasonContext {
    const m = this.compressVector(athleteId);
    const flawText = m ? m.flaws.map((f) => `${f.label} (×${f.count})`).join(', ') : 'yok';
    const recoveryNote =
      m && m.recoveryTrends.length > 0
        ? m.recoveryTrends.map((r) => `${r.label}: ${r.trend === 'faster' ? 'hızlandı' : r.trend === 'slower' ? 'yavaşladı' : 'normal'}`).join(' · ')
        : 'yeterli toparlanma verisi yok';
    const summary =
      m && m.milestones.length > 0
        ? `${m.milestones.length} kilometre taşı • ${m.sessionCount} seans`
        : `${m?.sessionCount ?? 0} seans — kilometre taşı kaydı yok`;
    return {
      athleteId,
      summary,
      recurringFlaws: m ? m.flaws.map((f) => f.label) : [],
      recoveryNote,
      sessionCount: m?.sessionCount ?? 0,
    };
  }

  /** Sezon özeti — Ghost Avatar bağlam bloğu. */
  seasonContextBlock(athleteId: string): string {
    const ctx = this.injectContext(athleteId);
    return `[Sezon Hafıza · ${ctx.athleteId}] ${ctx.summary} • Tekrarlayan kusurlar: ${ctx.recurringFlaws.join(', ') || 'yok'} • Toparlanma: ${ctx.recoveryNote}`;
  }

  /**
   * OpenRouter entegrasyonu: sezon hafıza bağlamını DEEP_REASONING tier ile
   * derin içgörüye dönüştürür. Semantik önbellek önce sorgulanır — aynı
   * bağlam tekrar sorgulanırsa $0 token harcanmaz.
   */
  async seasonInsightWithGateway(
    athleteId: string,
    opts: { gateway?: OpenRouterGateway; cache?: SemanticQueryCache; scopeId?: string } = {},
  ): Promise<SeasonInsightResult> {
    const gateway = opts.gateway ?? new OpenRouterGateway();
    const cache = opts.cache ?? new SemanticQueryCache();
    const context = this.seasonContextBlock(athleteId);
    const memory = this.getMemory(athleteId);
    const profile: TelemetryProfile = {
      athleteId,
      version: 1,
      metrics: {
        sessionCount: memory?.sessionCount ?? 0,
        flawCount: memory?.flaws.length ?? 0,
        milestoneCount: memory?.milestones.length ?? 0,
      },
    };

    const key = cache.fingerprint(profile);
    const cached = await cache.get(key);
    if (cached) {
      return { athleteId, text: cached.interpretation, fromCache: true, tokensSpent: 0, costUsd: 0, model: 'semantic-cache' };
    }

    const request: CompletionRequest = {
      prompt: `Sporcu sezon uzun-hafıza bağlamı:\n${context}\n\nBu bağlama dayanarak gelecek sezon için derinlemesine, yapıcı bir atletik gelişim içgörüsü üret (3 cümle).`,
      systemPrompt: 'Sen spor bilimcisi + gelişim antrenörüsün. Deterministik ve kanıta dayalı içgörü üret.',
      tier: 'DEEP_REASONING',
      scopeId: opts.scopeId,
    };
    const result = await gateway.complete(request);
    await cache.set(key, {
      key,
      interpretation: result.content,
      insight: result.content,
      generatedAt: new Date().toISOString(),
      tokensSaved: result.usage.totalTokens,
    });
    return {
      athleteId,
      text: result.content,
      fromCache: false,
      tokensSpent: result.usage.totalTokens,
      costUsd: result.costUsd,
      model: result.model,
    };
  }
}

export interface SeasonInsightResult {
  athleteId: string;
  text: string;
  fromCache: boolean;
  tokensSpent: number;
  costUsd: number;
  model: string;
}

export function seasonMemoryStatus(): string {
  return 'Sezon Hafıza: milestones + tekrarlayan kusurlar + toparlanma trendi • Ghost Avatar enjeksiyonu';
}
