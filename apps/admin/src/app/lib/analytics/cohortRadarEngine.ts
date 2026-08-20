// ============================================================================
// 📡 ANONİM KOHORT YÜZDELİK RADAR MOTORU (Adım 64)
// Sporcuyu anonim yaş/kategori kohortuna karşı 5 eksende karşılaştırır:
// Sprint Hızı • Reaktif Güç (RSI) • Zemin Verimi (GCT) • Yük Kapasitesi (TRIMP) • Bilateral Simetri
// Gizlilik: kohort yalnızca toplu (aggregate) ve anonim dağılımdır — akran PII yok.
// Deterministik; sıfır bağımlılık.
// ============================================================================

export const RADAR_AXES = ['sprintSpeed', 'rsi', 'gct', 'trimp', 'symmetry'] as const;
export type RadarAxisKey = (typeof RADAR_AXES)[number];

export interface RadarAxis {
  key: RadarAxisKey;
  label: string;
  value: number;       // 0-100 yüzdelik
  athleteRaw: number;
  cohortMedian: number;
}

export const RADAR_AXIS_LABELS: Record<RadarAxisKey, string> = {
  sprintSpeed: 'Sprint Hızı',
  rsi: 'Reaktif Güç (RSI)',
  gct: 'Zemin Verimi (GCT)',
  trimp: 'Yük Kapasitesi (TRIMP)',
  symmetry: 'Bilateral Simetri',
};

/** Değerin kohort dağılımındaki yüzdelik dilimi (%0-100): değer ≤ kohort örnekleri oranı. */
export function percentileOf(value: number, cohort: number[]): number {
  if (cohort.length === 0) return 50;
  const below = cohort.filter((v) => v <= value).length;
  return Math.max(0, Math.min(100, Math.round((below / cohort.length) * 100)));
}

export interface RadarInput {
  athlete: Record<RadarAxisKey, number>;
  cohort: Record<RadarAxisKey, number[]>;
}

/** Sporcu ham değerlerini kohort yüzdeliklerine normalize eder. */
export function buildCohortRadar(input: RadarInput): RadarAxis[] {
  return RADAR_AXES.map((key) => {
    const cohortVals = input.cohort[key] ?? [];
    const median = cohortVals.length > 0 ? [...cohortVals].sort((a, b) => a - b)[Math.floor(cohortVals.length / 2)] : 0;
    // GCT: düşük değer daha iyi olduğundan yüzdelik ters çevrilir
    const value = key === 'gct' ? 100 - percentileOf(input.athlete[key], cohortVals) : percentileOf(input.athlete[key], cohortVals);
    return { key, label: RADAR_AXIS_LABELS[key], value, athleteRaw: input.athlete[key], cohortMedian: median };
  });
}

/** Radar verilerinin anonimlik sözleşmesini doğrular (PII alanı yok). */
export function validateAnonymity(cohort: Record<RadarAxisKey, number[]>): boolean {
  // Kohort yalnızca sayısal dağılımlardan oluşmalı; kimlik alanı içermez
  return RADAR_AXES.every((k) => Array.isArray(cohort[k]) && cohort[k].every((v) => typeof v === 'number'));
}

export function cohortRadarStatus(): string {
  return 'Kohort Radar: 5 eksen yüzdelik • anonim toplu dağılım • GCT ters yüzdelik';
}
