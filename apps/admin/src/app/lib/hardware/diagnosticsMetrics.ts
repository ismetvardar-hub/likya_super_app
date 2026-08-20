// ============================================================================
// 📡 DONANIM TEŞHİS METRİKLERİ — saf mantık katmanı (Adım 25)
// RSSI (dBm) kalite eşikleri + bağlantı stabilitesi — UI'dan bağımsız, test edilebilir.
// ============================================================================

export interface DiagnosticsMetrics {
  rssiDbm: number;
  latencyMs: number;
  droppedPackets: number;
  jitterMs: number;
  framesPerSec: number;
}

export const RSSI_QUALITY: Record<string, { label: string; color: string }> = {
  EXCELLENT: { label: 'Mükemmel', color: '#4ade80' },
  GOOD: { label: 'İyi', color: '#a3e635' },
  FAIR: { label: 'Orta', color: '#facc15' },
  WEAK: { label: 'Zayıf', color: '#fb923c' },
  POOR: { label: 'Kritik', color: '#fb7185' },
};

/** RSSI (dBm) → bağlantı kalite sınıfı (BLE tipik eşikler). */
export function rssiQuality(rssiDbm: number): string {
  if (rssiDbm >= -55) return 'EXCELLENT';
  if (rssiDbm >= -65) return 'GOOD';
  if (rssiDbm >= -75) return 'FAIR';
  if (rssiDbm >= -85) return 'WEAK';
  return 'POOR';
}

export type LinkStability = 'Stabil' | 'Dikkat' | 'Kritik';

/** Düşen paket sayacına göre bağlantı stabilite rozeti. */
export function linkStability(droppedPackets: number): LinkStability {
  if (droppedPackets === 0) return 'Stabil';
  if (droppedPackets < 10) return 'Dikkat';
  return 'Kritik';
}

/** Kapsama yüzdesi: 100 − düşen paket. */
export function packetCoveragePct(droppedPackets: number): number {
  return Math.max(0, 100 - droppedPackets);
}

export function diagnosticsMetricsStatus(): string {
  return 'Donanım Teşhis: RSSI dBm eşikleri • stabilite • paket kapsamı — deterministik';
}
