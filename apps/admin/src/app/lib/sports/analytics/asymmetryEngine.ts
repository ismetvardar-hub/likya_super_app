// ============================================================================
// ⚖️ ASİMETRİ & BİLATERAL DENGE MOTORU (Adım 28)
// Asymmetry Index (%) = |GCT_L − GCT_R| / max(GCT_L, GCT_R) × 100
// Sol/sağ tepe darbe yükü dengesi (örn. %52 Sol / %48 Sağ)
// Asimetri > %10 → yorgunluk/sakatlık riski otomatik uyarısı.
// Deterministik; sıfır bağımlılık; canlı stride akışından beslenir.
// ============================================================================

import type { BilateralStridePacket } from '../../hardware/ble/dualInsoleManager.ts';

/** Uyarı eşiği: asimetri bu değeri aşarsa risk işareti. */
export const ASYMMETRY_WARNING_THRESHOLD = 10;

/**
 * Bilateral asimetri indeksi:
 * |GCT_sol − GCT_sağ| / max(GCT_sol, GCT_sağ) × 100
 */
export function asymmetryIndex(gctLeftMs: number, gctRightMs: number): number {
  const mx = Math.max(gctLeftMs, gctRightMs);
  if (mx <= 0) return 0;
  return Number(((Math.abs(gctLeftMs - gctRightMs) / mx) * 100).toFixed(1));
}

export interface LoadBalance {
  leftPct: number;
  rightPct: number;
}

/** Sol/sağ tepe darbe yükü denge oranı (toplam %100 olacak şekilde). */
export function bilateralLoadBalance(peakLoadLeftN: number, peakLoadRightN: number): LoadBalance {
  const total = peakLoadLeftN + peakLoadRightN;
  if (total <= 0) return { leftPct: 50, rightPct: 50 };
  const leftPct = Math.round((peakLoadLeftN / total) * 100);
  return { leftPct, rightPct: 100 - leftPct };
}

export type BalanceStatus = 'balanced' | 'warning' | 'critical';

export interface StrideAnalysis {
  asymmetryIndexPct: number;
  loadBalance: LoadBalance;
  status: BalanceStatus;
  warning: boolean;
  warningMessage: string;
}

/** Tek bir bilateral stride'ı analiz eder; eşik aşımında uyarı üretir. */
export function analyzeStride(input: {
  gctLeftMs: number;
  gctRightMs: number;
  peakLoadLeftN: number;
  peakLoadRightN: number;
}): StrideAnalysis {
  const ai = asymmetryIndex(input.gctLeftMs, input.gctRightMs);
  const balance = bilateralLoadBalance(input.peakLoadLeftN, input.peakLoadRightN);
  const status: BalanceStatus = ai > ASYMMETRY_WARNING_THRESHOLD * 2 ? 'critical' : ai > ASYMMETRY_WARNING_THRESHOLD ? 'warning' : 'balanced';
  const warning = status !== 'balanced';
  const warningMessage = warning
    ? `⚠️ Asimetri %${ai} (eşik >%${ASYMMETRY_WARNING_THRESHOLD}) — ${balance.leftPct}/${balance.rightPct} yük dengesi; yorgunluk/sakatlık riski, tek taraf çalışması önerilir`
    : `✅ Asimetri %${ai} — bilateral denge sağlıklı (${balance.leftPct}L/${balance.rightPct}R)`;
  return { asymmetryIndexPct: ai, loadBalance: balance, status, warning, warningMessage };
}

/** Stride penceresi ortalamasını analiz eder (maks GCT + ortalama tepe yükler). */
export function analyzeStrideWindow(packets: BilateralStridePacket[]): StrideAnalysis {
  if (packets.length === 0) {
    return { asymmetryIndexPct: 0, loadBalance: { leftPct: 50, rightPct: 50 }, status: 'balanced', warning: false, warningMessage: 'Pencere boş — veri yok' };
  }
  const stance = packets.filter((p) => p.left.gctMs > 0 && p.right.gctMs > 0);
  if (stance.length === 0) {
    return { asymmetryIndexPct: 0, loadBalance: { leftPct: 50, rightPct: 50 }, status: 'balanced', warning: false, warningMessage: 'Duruş fazı (stance) örneği yok' };
  }
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const gctL = avg(stance.map((p) => p.left.gctMs));
  const gctR = avg(stance.map((p) => p.right.gctMs));
  // Tepe yük yaklaşımı: toe+heel toplamı × darbe çarpanı (strikeForce)
  const loadL = avg(stance.map((p) => (p.left.toePct + p.left.heelPct) * (0.5 + p.left.strikeForce)));
  const loadR = avg(stance.map((p) => (p.right.toePct + p.right.heelPct) * (0.5 + p.right.strikeForce)));
  return analyzeStride({ gctLeftMs: gctL, gctRightMs: gctR, peakLoadLeftN: loadL, peakLoadRightN: loadR });
}

export function asymmetryEngineStatus(): string {
  return `Asimetri: |GCT_L−GCT_R|/max×100 • L/R yük dengesi • uyarı >%${ASYMMETRY_WARNING_THRESHOLD}`;
}
