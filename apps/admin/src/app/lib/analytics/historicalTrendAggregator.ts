// ============================================================================
// 📊 TARİHSEL TREND AGGREGATOR (Adım 55) — TS istemci sarmalayıcıları
// get_athlete_weekly_rollup / get_squad_performance_summary SQL fonksiyonlarının
// deterministik TS karşılıkları + satır ayrıştırıcılar (offline/mock için).
// Sıfır bağımlılık; node-runnable.
// ============================================================================

export interface SessionRow {
  id: string;
  athleteId: string;
  sessionDate: string; // ISO gün
  trimp: number;
  acwr: number;
  avgHr?: number;
  avgGctMs?: number;
  avgRsi?: number;
  injuryRiskLevel?: 'low' | 'medium' | 'high';
  peakStrikeForce?: number;
}

export interface WeeklyRollup {
  weekStart: string;      // ISO gün (Pazartesi)
  totalTrimp: number;
  avgRsi: number;
  avgGctMs: number;
  avgAcwr: number;
  peakStrikeForce: number;
  sessionCount: number;
}

/** ISO gününü o haftanın Pazartesi'sine çevirir. */
export function mondayOf(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00Z`);
  const diff = (d.getUTCDay() + 6) % 7; // Pazar=0 → Pazartesi başlangıç
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

/** SQL get_athlete_weekly_rollup satırını ayrıştırır (numeric metinlere dayanıklı). */
export function parseWeeklyRollup(row: Record<string, unknown>): WeeklyRollup {
  const num = (v: unknown) => Number(v ?? 0);
  return {
    weekStart: String(row.week_start ?? row.weekStart ?? ''),
    totalTrimp: num(row.total_trimp ?? row.totalTrimp),
    avgRsi: num(row.avg_rsi ?? row.avgRsi),
    avgGctMs: num(row.avg_gct_ms ?? row.avgGctMs),
    avgAcwr: num(row.avg_acwr ?? row.avgAcwr),
    peakStrikeForce: num(row.peak_strike_force ?? row.peakStrikeForce),
    sessionCount: num(row.session_count ?? row.sessionCount),
  };
}

/** Seans kayıtlarından haftalık toplamayı deterministik olarak hesaplar. */
export function aggregateWeeklyRollups(sessions: SessionRow[]): WeeklyRollup[] {
  const byWeek = new Map<string, SessionRow[]>();
  for (const s of sessions) {
    const w = mondayOf(s.sessionDate);
    const arr = byWeek.get(w) ?? [];
    arr.push(s);
    byWeek.set(w, arr);
  }
  const rollups: WeeklyRollup[] = [];
  for (const [weekStart, rows] of Array.from(byWeek.entries())) {
    const avg = (arr: number[]) => (arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length);
    rollups.push({
      weekStart,
      totalTrimp: Number(rows.reduce((a, s) => a + s.trimp, 0).toFixed(1)),
      avgRsi: Number(avg(rows.map((s) => s.avgRsi ?? 0)).toFixed(2)),
      avgGctMs: Number(avg(rows.map((s) => s.avgGctMs ?? 0)).toFixed(1)),
      avgAcwr: Number(avg(rows.map((s) => s.acwr)).toFixed(2)),
      peakStrikeForce: Number(Math.max(...rows.map((s) => s.peakStrikeForce ?? 0)).toFixed(1)),
      sessionCount: rows.length,
    });
  }
  return rollups.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

export interface SquadSummary {
  athleteCount: number;
  readyPct: number;
  mediumRiskCount: number;
  highRiskCount: number;
  avgTrimp: number;
  avgAcwr: number;
}

/** SQL get_squad_performance_summary satırını ayrıştırır. */
export function parseSquadSummary(row: Record<string, unknown>): SquadSummary {
  const num = (v: unknown) => Number(v ?? 0);
  return {
    athleteCount: num(row.athlete_count ?? row.athleteCount),
    readyPct: num(row.ready_pct ?? row.readyPct),
    mediumRiskCount: num(row.medium_risk_count ?? row.mediumRiskCount),
    highRiskCount: num(row.high_risk_count ?? row.highRiskCount),
    avgTrimp: num(row.avg_trimp ?? row.avgTrimp),
    avgAcwr: num(row.avg_acwr ?? row.avgAcwr),
  };
}

export interface AthleteRisk {
  athleteId: string;
  injuryRisk: 'low' | 'medium' | 'high';
}

/** Takım performans özetini TS tarafında hesaplar. */
export function squadPerformanceSummary(sessions: SessionRow[], risks: AthleteRisk[]): SquadSummary {
  const athleteIds = new Set<string>([...sessions.map((s) => s.athleteId), ...risks.map((r) => r.athleteId)]);
  const athleteCount = athleteIds.size;
  const mediumRiskCount = risks.filter((r) => r.injuryRisk === 'medium').length;
  const highRiskCount = risks.filter((r) => r.injuryRisk === 'high').length;
  const readyCount = risks.filter((r) => r.injuryRisk === 'low').length;
  const readyPct = athleteCount > 0 ? Math.round((readyCount / athleteCount) * 1000) / 10 : 100;
  const avg = (arr: number[]) => (arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length);
  return {
    athleteCount,
    readyPct,
    mediumRiskCount,
    highRiskCount,
    avgTrimp: Number(avg(sessions.map((s) => s.trimp)).toFixed(1)),
    avgAcwr: Number(avg(sessions.map((s) => s.acwr)).toFixed(2)),
  };
}

export function historicalTrendStatus(): string {
  return 'Trend Aggregator: haftalık rollup (TRIMP/RSI/GCT/ACWR/tepe kuvvet) + takım hazırlığı';
}
