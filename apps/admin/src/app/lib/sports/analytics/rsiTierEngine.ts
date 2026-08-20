// ============================================================================
// 🏆 NORMATİF RSI TIER MOTORU (Adım 36) — RSI-modified demografik karşılaştırma
// Yaş grubu (U12, U14, U16, Pro) × Biyolojik cinsiyet benchmark matrisi
// Tier'lar: Novice <1.2 • Developing 1.2-1.8 • Advanced 1.8-2.5 • Elite >2.5
// Çıktı: yüzdelik sıralama (%0-100) + demografik norm karşılaştırması.
// Deterministik; sıfır bağımlılık; Plan Z güvenli.
// ============================================================================

export type RsiAgeGroup = 'U12' | 'U14' | 'U16' | 'Pro';
export type Sex = 'M' | 'F';
export type RsiTier = 'Novice' | 'Developing' | 'Advanced' | 'Elite';

export interface RsiNormRow {
  ageGroup: RsiAgeGroup;
  sex: Sex;
  p50: number; // medyan
  p75: number; // iyi dilim
  p90: number; // elit dilim
}

// Demografik norm matrisi (RSI-modified benchmark literatürü bazlı)
export const RSI_NORM_TABLE: RsiNormRow[] = [
  { ageGroup: 'U12', sex: 'M', p50: 1.5, p75: 1.9, p90: 2.3 },
  { ageGroup: 'U12', sex: 'F', p50: 1.4, p75: 1.75, p90: 2.1 },
  { ageGroup: 'U14', sex: 'M', p50: 1.7, p75: 2.1, p90: 2.6 },
  { ageGroup: 'U14', sex: 'F', p50: 1.55, p75: 1.9, p90: 2.3 },
  { ageGroup: 'U16', sex: 'M', p50: 1.9, p75: 2.3, p90: 2.8 },
  { ageGroup: 'U16', sex: 'F', p50: 1.7, p75: 2.05, p90: 2.5 },
  { ageGroup: 'Pro', sex: 'M', p50: 2.2, p75: 2.6, p90: 3.1 },
  { ageGroup: 'Pro', sex: 'F', p50: 1.95, p75: 2.3, p90: 2.8 },
];

/** Yaş → yaş grubu eşlemesi (12 altı U12, 13-14 U14, 15-16 U16, 17+ Pro). */
export function rsiAgeGroupForAge(age: number): RsiAgeGroup {
  if (age <= 12) return 'U12';
  if (age <= 14) return 'U14';
  if (age <= 16) return 'U16';
  return 'Pro';
}

export function rsiNormFor(age: number, sex: Sex): RsiNormRow {
  const g = rsiAgeGroupForAge(age);
  return RSI_NORM_TABLE.find((r) => r.ageGroup === g && r.sex === sex) ?? RSI_NORM_TABLE[RSI_NORM_TABLE.length - 1];
}

/** Tier sınıflandırması: <1.2 Novice, 1.2-1.8 Developing, 1.8-2.5 Advanced, ≥2.5 Elite. */
export function classifyRsiTier(rsi: number): RsiTier {
  if (rsi < 1.2) return 'Novice';
  if (rsi < 1.8) return 'Developing';
  if (rsi < 2.5) return 'Advanced';
  return 'Elite';
}

/** Demografik normlara göre yüzdelik sıralama (0-100). */
export function rsiPercentile(rsi: number, age: number, sex: Sex): number {
  const norm = rsiNormFor(age, sex);
  if (rsi <= norm.p50) return Math.max(1, Math.round((rsi / Math.max(0.01, norm.p50)) * 50));
  if (rsi <= norm.p75) return 50 + Math.round(((rsi - norm.p50) / Math.max(0.01, norm.p75 - norm.p50)) * 25);
  if (rsi <= norm.p90) return 75 + Math.round(((rsi - norm.p75) / Math.max(0.01, norm.p90 - norm.p75)) * 15);
  return Math.min(100, 90 + Math.round(((rsi - norm.p90) / Math.max(0.05, norm.p90)) * 10));
}

export interface RsiAssessment {
  rsi: number;
  tier: RsiTier;
  ageGroup: RsiAgeGroup;
  sex: Sex;
  percentile: number;
  norm: { p50: number; p75: number; p90: number };
  comparison: string;
}

/** Sporcunun RSI değerini demografik normlarla karşılaştırarak değerlendirir. */
export function assessRsiNormative(rsi: number, age: number, sex: Sex): RsiAssessment {
  const norm = rsiNormFor(age, sex);
  const percentile = rsiPercentile(rsi, age, sex);
  const tier = classifyRsiTier(rsi);
  const comparison =
    percentile >= 90
      ? `Elit dilim (%${percentile}) — yaş grubunda (${norm.ageGroup} ${norm.sex === 'M' ? 'erkek' : 'kadın'}) üst %10`
      : percentile >= 75
        ? `İyi dilim (%${percentile}) — ${norm.ageGroup} normunun üstünde (p75=${norm.p75})`
        : percentile >= 50
          ? `Ortalama üstü (%${percentile}) — ${norm.ageGroup} medyanına yakın (p50=${norm.p50})`
          : `Gelişim alanı (%${percentile}) — ${norm.ageGroup} medyanının altında; reaktif güç drilleri önerilir`;
  return { rsi, tier, ageGroup: norm.ageGroup, sex, percentile, norm: { p50: norm.p50, p75: norm.p75, p90: norm.p90 }, comparison };
}

export function rsiTierEngineStatus(): string {
  return 'RSI Tier: U12/U14/U16/Pro × M/F normlar • Novice/Developing/Advanced/Elite • yüzdelik';
}
