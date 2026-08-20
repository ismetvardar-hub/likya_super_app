// ============================================================================
// 🧠 OTOMATİK TID HAVUZ SIRALAYICI (Adım 114)
// Akademiler arası tüm genç sporcu profillerini toplar, Peak Height Velocity
// (PHV) ofsetine göre normalleştirir (erken olgunlaşma fiziksel avantajını
// kaldırır) ve otomatik yetenek tier sıralaması üretir:
// "Top 5% Elite National Prospect" · "Developmental Tier 1" ·
// "High Upside Raw Athlete" · "Developmental Tier 2".
// Temel TID skoru için talentIdIndexEngine motoru kullanılır (sıfır bağımlılık).
// ============================================================================
import { computeTidScore, type TidFactors } from './talentIdIndexEngine.ts';

export interface JuniorProfile {
  athleteId: string;
  academy: string;
  age: number;
  heightCm: number;
  weightKg: number;
  phvOffsetMonths: number;         // + = PHV sonrası (erken olgun), - = öncesi (geç olgun)
  reactivePowerVelocity: number;
  cognitiveReactionMs: number;
  brakeEfficiencyPct: number;
  injuryResiliencePct: number;
  rawUpside?: number;              // 0-100 ham atletiklik (opsiyonel)
}

export type TalentTierLabel =
  | 'Top 5% Elite National Prospect'
  | 'Developmental Tier 1'
  | 'High Upside Raw Athlete'
  | 'Developmental Tier 2';

export interface RankedTalent {
  athleteId: string;
  academy: string;
  age: number;
  phvOffsetMonths: number;
  normalizedHeightCm: number;
  tidScore: number;
  percentile: number;
  rank: number;
  total: number;
  tier: TalentTierLabel;
  note: string;
}

export const TOP5_PCT = 0.05;
export const TIER1_PCT = 0.2;
export const UPSIDE_RAW_THRESHOLD = 80;
export const PHV_GROWTH_CM_PER_MONTH = 0.6;

// ── PHV normalizasyon: geç olgunlaşanın fiziksel potansiyeli avanta çevrilir ─
export function phvNormalizedReactivePower(velocity: number, phvOffsetMonths: number): number {
  // Erken olgun (+ofset) cezalandırılır, geç olgun (-ofset) ödüllendirilir.
  const factor = 1 + (-phvOffsetMonths) * 0.02;
  return Math.max(0.1, Math.min(2, velocity * factor));
}

export function projectedHeightCm(heightCm: number, phvOffsetMonths: number): number {
  // Geç olgunlaşan (henüz büyümesi tamamlanmamış) sporcunun projeksiyon boyu.
  return Math.round((heightCm + Math.max(0, -phvOffsetMonths) * PHV_GROWTH_CM_PER_MONTH) * 10) / 10;
}

export function normalizedTidFactors(profile: JuniorProfile): TidFactors {
  return {
    maturationOffsetMonths: profile.phvOffsetMonths,
    reactivePowerVelocity: phvNormalizedReactivePower(profile.reactivePowerVelocity, profile.phvOffsetMonths),
    cognitiveReactionMs: profile.cognitiveReactionMs,
    brakeEfficiencyPct: profile.brakeEfficiencyPct,
    injuryResiliencePct: profile.injuryResiliencePct,
  };
}

export function tierFor(rankIndex: number, total: number, tidScore: number, rawUpside: number | undefined): TalentTierLabel {
  const top5 = Math.max(1, Math.ceil(total * TOP5_PCT));
  const tier1 = Math.max(top5 + 1, Math.ceil(total * TIER1_PCT));
  if (rankIndex < top5) return 'Top 5% Elite National Prospect';
  if (rankIndex < tier1) return 'Developmental Tier 1';
  if ((rawUpside ?? 0) >= UPSIDE_RAW_THRESHOLD) return 'High Upside Raw Athlete';
  return 'Developmental Tier 2';
}

export function percentileOf(rankIndex: number, total: number): number {
  return Math.max(1, Math.min(100, Math.round(((total - rankIndex) / total) * 100)));
}

// ── Havuz sıralaması (TID skoru desc, PHV normalize) ─────────────────────────
export function rankTalentPool(profiles: JuniorProfile[]): RankedTalent[] {
  const scored = profiles.map((p) => {
    const factors = normalizedTidFactors(p);
    const tidScore = computeTidScore(factors);
    return { profile: p, tidScore };
  });
  scored.sort((a, b) => b.tidScore - a.tidScore || a.profile.age - b.profile.age);
  const total = scored.length;
  return scored.map((entry, i) => {
    const p = entry.profile;
    const tier = tierFor(i, total, entry.tidScore, p.rawUpside);
    return {
      athleteId: p.athleteId,
      academy: p.academy,
      age: p.age,
      phvOffsetMonths: p.phvOffsetMonths,
      normalizedHeightCm: projectedHeightCm(p.heightCm, p.phvOffsetMonths),
      tidScore: entry.tidScore,
      percentile: percentileOf(i, total),
      rank: i + 1,
      total,
      tier,
      note:
        tier === 'Top 5% Elite National Prospect'
          ? `TID ${entry.tidScore} — ulusal elit aday; yüksek öncelikli gelişim`
          : tier === 'High Upside Raw Athlete'
            ? `Ham atletiklik ${p.rawUpside} — teknik/taktik işleme ile tier atlayabilir`
            : tier === 'Developmental Tier 1'
              ? `TID ${entry.tidScore} — Tier 1; düzenli izleme programı`
              : 'Temel gelişim programı — PHV sonrası yeniden değerlendir',
    };
  });
}

export function tidPoolRankingStatus(): string {
  return `TID Havuz: PHV normalize • top %5 / Tier 1 / Upside • ${TOP5_PCT * 100}% elit eşiği`;
}
