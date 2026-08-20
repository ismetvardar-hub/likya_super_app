// ============================================================================
// 📈 AKADEMİ GELİR ANALİTİĞİ & MRR MOTORU (Adım 92)
// MRR • ARR • Churn Oranı • ARPU (sporcu başı gelir) • 3/6 aylık nakit akışı tahmini
// Özel koçluk komisyon payları dahil. Deterministik; sıfır bağımlılık.
// ============================================================================

export interface RevenueInput {
  activeMembers: number;
  avgMonthlyPrice: number;        // ortalama üyelik ($/ay)
  churnedLastMonth: number;
  privateSessionsPerMonth: number;
  privateSessionPrice: number;
  privateCoachSplitPct: number;   // koç payı (%)
  commissionPct: number;          // akademi komisyonu (%)
}

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  churnRatePct: number;
  arpu: number;
  coachingRevenue: number;
  totalMonthly: number;
}

export function computeRevenueMetrics(input: RevenueInput): RevenueMetrics {
  const mrr = Math.round(input.activeMembers * input.avgMonthlyPrice * 100) / 100;
  const arr = Math.round(mrr * 12 * 100) / 100;
  const total = input.activeMembers + input.churnedLastMonth;
  const churnRatePct = total > 0 ? Number(((input.churnedLastMonth / total) * 100).toFixed(1)) : 0;
  const arpu = input.activeMembers > 0 ? Number((mrr / input.activeMembers).toFixed(2)) : 0;
  const grossCoaching = input.privateSessionsPerMonth * input.privateSessionPrice;
  const coachingRevenue = Math.round(grossCoaching * (input.commissionPct / 100) * 100) / 100;
  return { mrr, arr, churnRatePct, arpu, coachingRevenue, totalMonthly: Math.round((mrr + coachingRevenue) * 100) / 100 };
}

export interface ForecastPoint {
  month: number;
  projectedMrr: number;
  projectedArr: number;
}

/** Aylık büyüme ile 3/6 aylık nakit akışı tahmini. */
export function forecastCashFlow(mrr: number, monthlyGrowthPct: number, months = 6): ForecastPoint[] {
  return Array.from({ length: months }, (_, i) => {
    const projectedMrr = Math.round(mrr * Math.pow(1 + monthlyGrowthPct / 100, i + 1) * 100) / 100;
    return { month: i + 1, projectedMrr, projectedArr: Math.round(projectedMrr * 12 * 100) / 100 };
  });
}

export function forecastSummary(mrr: number, growthPct: number): { threeMonth: number; sixMonth: number } {
  const f = forecastCashFlow(mrr, growthPct, 6);
  const threeMonth = Math.round(f.slice(0, 3).reduce((a, p) => a + p.projectedMrr, 0) * 100) / 100;
  const sixMonth = Math.round(f.reduce((a, p) => a + p.projectedMrr, 0) * 100) / 100;
  return { threeMonth, sixMonth };
}

export function revenueAnalyticsStatus(): string {
  return 'Gelir Analitiği: MRR/ARR • churn • ARPU • komisyon • 3/6 ay tahmin';
}
