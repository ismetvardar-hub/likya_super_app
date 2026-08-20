// ============================================================================
// 🏆 ÇOKLU AKADEMİ CANLI LİDERLİK TABLOSU & PERFORMANS TOPLAYICI (Adım 111)
// Bağlı tüm pilot tesislerden (Antalya, Lara, Belek) anonimleştirilmiş telemetri
// yüzdeliklerini toplar; Academy Power Index (API) hesaplar: takım ortalama RSI,
// sprint çevikliği ve tutarlılık serisi. Sıkı gizlilik filtresi: rakip akademiler
// yalnızca anonim kohort ortalamalarını görür (sporcu kimliği asla sızmaz).
// Saf/deterministik; sıfır bağımlılık.
// ============================================================================

export type AcademyId = 'antalya' | 'lara' | 'belek';

export const PILOT_ACADEMIES: AcademyId[] = ['antalya', 'lara', 'belek'];
export const ACADEMY_LABELS: Record<AcademyId, string> = {
  antalya: 'Antalya',
  lara: 'Lara',
  belek: 'Belek',
};

export interface AthleteTelemetryProfile {
  athleteId: string;
  academy: AcademyId;
  rsi: number;               // Reaktif Güç İndeksi (0-100)
  sprintQuicknessMs: number; // 20m sprint (ms — küçük daha iyi)
  consistencyStreak: number; // üst üste bazal üstü seans sayısı
  gctMs?: number;
}

export interface AcademyAggregate {
  academy: AcademyId;
  athleteCount: number;
  medianRsi: number;
  medianSprintMs: number;
  avgRsi: number;
  avgSprintQuicknessMs: number;
  avgConsistencyStreak: number;
  powerIndex: number;
  anonymized: boolean;
}

export interface LeaderboardRow {
  rank: number;
  academy: AcademyId;
  label: string;
  powerIndex: number;
  avgRsi: number;
  avgSprintQuicknessMs: number;
  avgConsistencyStreak: number;
  athleteCount: number;
  cohortOnly: boolean; // gizlilik: yalnızca kohort ortalamaları yayınlanır
}

// ── Yüzdelik hesap (lineer interpolasyon, deterministik) ─────────────────────
export function percentile(values: number[], pct: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = (Math.max(0, Math.min(100, pct)) / 100) * (sorted.length - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  if (lower === upper) return Math.round(sorted[lower] * 100) / 100;
  const frac = rank - lower;
  return Math.round((sorted[lower] + frac * (sorted[upper] - sorted[lower])) * 100) / 100;
}

export function median(values: number[]): number {
  return percentile(values, 50);
}

// ── Academy Power Index (API): RSI %40 + Çeviklik %35 + Tutarlılık %25 ───────
export function computePowerIndex(avgRsi: number, avgSprintQuicknessMs: number, avgConsistencyStreak: number): number {
  const rsiScore = Math.max(0, Math.min(100, avgRsi));
  const quickScore = Math.max(0, Math.min(100, ((3800 - avgSprintQuicknessMs) / 800) * 100));
  const consistencyScore = Math.max(0, Math.min(100, (avgConsistencyStreak / 10) * 100));
  return Math.round(0.4 * rsiScore + 0.35 * quickScore + 0.25 * consistencyScore);
}

// ── Akademi toplama (yalnızca anonim kohort istatistikleri) ──────────────────
export function aggregateAcademy(profiles: AthleteTelemetryProfile[], academy: AcademyId): AcademyAggregate {
  const cohort = profiles.filter((p) => p.academy === academy);
  const n = cohort.length;
  const sum = (f: (p: AthleteTelemetryProfile) => number) => cohort.reduce((a, p) => a + f(p), 0);
  const avgRsi = n ? sum((p) => p.rsi) / n : 0;
  const avgSprint = n ? sum((p) => p.sprintQuicknessMs) / n : 0;
  const avgConsistency = n ? sum((p) => p.consistencyStreak) / n : 0;
  return {
    academy,
    athleteCount: n,
    medianRsi: median(cohort.map((p) => p.rsi)),
    medianSprintMs: median(cohort.map((p) => p.sprintQuicknessMs)),
    avgRsi: Math.round(avgRsi * 10) / 10,
    avgSprintQuicknessMs: Math.round(avgSprint * 10) / 10,
    avgConsistencyStreak: Math.round(avgConsistency * 100) / 100,
    powerIndex: computePowerIndex(avgRsi, avgSprint, avgConsistency),
    anonymized: true,
  };
}

// ── Liderlik tablosu (sıralı; asla sporcu kimliği içermez) ───────────────────
export function buildLeaderboard(profiles: AthleteTelemetryProfile[]): LeaderboardRow[] {
  const aggregates = PILOT_ACADEMIES.map((a) => aggregateAcademy(profiles, a)).filter((agg) => agg.athleteCount > 0);
  return aggregates
    .sort((a, b) => b.powerIndex - a.powerIndex)
    .map((agg, i) => ({
      rank: i + 1,
      academy: agg.academy,
      label: ACADEMY_LABELS[agg.academy],
      powerIndex: agg.powerIndex,
      avgRsi: agg.avgRsi,
      avgSprintQuicknessMs: agg.avgSprintQuicknessMs,
      avgConsistencyStreak: agg.avgConsistencyStreak,
      athleteCount: agg.athleteCount,
      cohortOnly: true,
    }));
}

// ── Gizlilik izolasyon doğrulaması: kohort özeti sporcu kimliği sızdırmaz ────
export function verifyPrivacyIsolation(profiles: AthleteTelemetryProfile[], targetAcademy: AcademyId): { isolated: boolean; athleteIdsLeaked: string[] } {
  const aggregate = aggregateAcademy(profiles, targetAcademy);
  const serialized = JSON.stringify(aggregate);
  const leaked = profiles.filter((p) => p.academy === targetAcademy && serialized.includes(p.athleteId));
  return { isolated: leaked.length === 0, athleteIdsLeaked: leaked.map((p) => p.athleteId) };
}

export function multiClubLeaderboardStatus(): string {
  return `Çoklu Akademi: ${PILOT_ACADEMIES.length} tesis • API (RSI/çeviklik/tutarlılık) • anonim kohort + gizlilik filtresi`;
}
