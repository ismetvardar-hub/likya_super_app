// ============================================================================
// 🔄 ADAPTİF ÖRNEKLEME HIZI KONTROLÜ (Adım 24)
// - Drill/Sprint Modu (100Hz): hassas GCT + darbe yükleme analizi
// - Idle/Baseline Modu (20Hz): setler arasında güç tasarrufu (pil ömrü)
// Otomatik geçiş: hareket/yoğunluk eşiğine göre + manuel kilit.
// ============================================================================

export type SamplingMode = 'IDLE_20HZ' | 'DRILL_100HZ';

export interface AdaptiveSampleConfig {
  mode: SamplingMode;
  intervalMs: number;
  description: string;
}

export const ADAPTIVE_MODES: Record<SamplingMode, AdaptiveSampleConfig> = {
  IDLE_20HZ: { mode: 'IDLE_20HZ', intervalMs: 50, description: 'Güç tasarrufu — setler arası bazal izleme' },
  DRILL_100HZ: { mode: 'DRILL_100HZ', intervalMs: 10, description: 'Yüksek hassasiyet — GCT + darbe analizi' },
};

// ---------------------------------------------------------------------------
// 1. Yoğunluk Eşiği → Otomatik Mod Kararı
// ---------------------------------------------------------------------------
export function decideSamplingMode(activityScore: number, locked?: SamplingMode): SamplingMode {
  if (locked) return locked;
  // activityScore 0-100: hız/ivme/nabız kombinasyonu
  return activityScore >= 40 ? 'DRILL_100HZ' : 'IDLE_20HZ';
}

// ---------------------------------------------------------------------------
// 2. Pil Ömrü Tahmini (100Hz vs 20Hz)
// ---------------------------------------------------------------------------
export function estimateBatteryRuntime(powerDrawMa: number, batteryMah: number, mode: SamplingMode): { hours: number; note: string } {
  // Yüksek örnekleme ADC + BLE Notify daha çok güç çeker (~%40 artış)
  const duty = mode === 'DRILL_100HZ' ? 1.0 : 0.45;
  const effectiveMa = powerDrawMa * (0.6 + 0.4 * duty);
  const hours = batteryMah / effectiveMa;
  return {
    hours: Number(hours.toFixed(1)),
    note: mode === 'DRILL_100HZ' ? 'Yüksek örnekleme — pil daha hızlı biter' : 'Tasarruf modu — pil ömrü uzar',
  };
}

// ---------------------------------------------------------------------------
// 3. Simülasyon / UI Durumu
// ---------------------------------------------------------------------------
export function adaptiveSamplingStatus(mode: SamplingMode): string {
  const c = ADAPTIVE_MODES[mode];
  return `Örnekleme: ${c.description} (${c.intervalMs}ms aralık)`;
}
