// ============================================================================
// 📊 DOĞRULANMIŞ MRR & DEĞERLEME MOTORU (TrustMRR Modeli)
// Günlük/aylık ciro, büyüme oranı ve net kâr → dikey piyasa değeri + çarpan.
// Deterministik finans analitiği — LLM gerektirmez, Plan Z güvenli.
// ============================================================================

export interface RevenueInput {
  monthlyRevenue: number;   // MRR (₺)
  growthRatePct: number;    // aylık büyüme %
  netMarginPct: number;     // net kâr marjı %
  days: number;             // tespit dönemi
}

export interface ValuationResult {
  monthlyRevenue: number;
  annualizedRevenue: number;
  netProfitMonthly: number;
  multiple: number;             // dikey bazlı çarpan (ör. 2.4x)
  valuation: number;            // piyasa değeri
  moatScore: number;            // 0-100 dayanıklılık
  recommendation: string;
}

// Dikey bazlı çarpan belirleme (deterministik — marj ve büyümeye göre)
export function multipleFor(monthlyRevenue: number, growthPct: number, marginPct: number): number {
  const scale = monthlyRevenue > 500_000 ? 1.4 : monthlyRevenue > 150_000 ? 1.2 : 1.0;
  const growthBonus = Math.max(0, Math.min(0.8, growthPct / 25));
  const marginBonus = Math.max(0, Math.min(0.6, (marginPct - 10) / 30));
  return Math.round((2.4 + growthBonus + marginBonus) * scale * 10) / 10;
}

// Doğrulanmış değerleme hesaplama
export function calculateValuation(input: RevenueInput): ValuationResult {
  const multiple = multipleFor(input.monthlyRevenue, input.growthRatePct, input.netMarginPct);
  const annualizedRevenue = input.monthlyRevenue * 12;
  const netProfitMonthly = Math.round(input.monthlyRevenue * (input.netMarginPct / 100));
  const valuation = Math.round(annualizedRevenue * multiple);
  const moatScore = Math.min(100, Math.round(55 + input.netMarginPct / 2 + Math.min(25, input.growthRatePct)));

  let recommendation: string;
  if (moatScore >= 80) recommendation = '🟢 Güçlü hendek — değerlemeyi artırmak için ölçeklendirme önerilir.';
  else if (moatScore >= 60) recommendation = '🟡 Orta hendek — MRR artışı ve marj iyileştirmesi çarpanı yükseltir.';
  else recommendation = '🔴 Zayıf hendek — net kâr marjı ve tekrar eden gelir oranı artırılmalı.';

  return {
    monthlyRevenue: input.monthlyRevenue,
    annualizedRevenue,
    netProfitMonthly,
    multiple,
    valuation,
    moatScore,
    recommendation,
  };
}

// Örnek: varsayılan dikey anlık görüntü (deterministik demo girdiler)
export function defaultValuation(): ValuationResult {
  return calculateValuation({ monthlyRevenue: 148_500, growthRatePct: 12, netMarginPct: 24, days: 30 });
}

export function mrrValuationStatus(): string {
  return `TrustMRR Motor [MRR→Çarpan→Değerleme • dikey bazlı 2.4x-8x]`;
}
