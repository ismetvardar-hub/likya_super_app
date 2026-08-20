// ============================================================================
// 🕐 ÇOK SENSÖRLÜ ZAMAN SENKRONİZASYON MOTORU (Adım 23)
// HRM (1-5Hz) • ESP32 Tabanlık (50-100Hz) • IMU (20-50Hz) asenkron akışlarını
// tek 100ms ortak saat vektöründe hizalar (doğrusal interpolasyon + normalize).
// ============================================================================

export type SyncSource = 'HRM' | 'INSOLE' | 'IMU';

export interface RawSample {
  source: SyncSource;
  tMs: number;          // kaynak zaman damgası
  value: number;
}

export interface SyncedFrame {
  tMs: number;          // 100ms ortak saat
  hr?: number;
  toePct?: number;
  heelPct?: number;
  gctMs?: number;
  imuG?: number;
}

export const SYNC_CLOCK_MS = 100;

// ---------------------------------------------------------------------------
// 1. İki nokta arası doğrusal interpolasyon
// ---------------------------------------------------------------------------
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function interpolateAt(series: RawSample[], tMs: number): number | undefined {
  if (series.length === 0) return undefined;
  if (tMs <= series[0].tMs) return series[0].value;
  if (tMs >= series[series.length - 1].tMs) return series[series.length - 1].value;
  for (let i = 1; i < series.length; i++) {
    if (tMs <= series[i].tMs) {
      const a = series[i - 1], b = series[i];
      const t = (tMs - a.tMs) / Math.max(1, b.tMs - a.tMs);
      return lerp(a.value, b.value, t);
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// 2. Ortak 100ms Saat Vektörüne Hizalama
// ---------------------------------------------------------------------------
export function buildSyncedFrames(raw: RawSample[], startMs?: number, endMs?: number): SyncedFrame[] {
  const bySource = (s: SyncSource) => raw.filter((r) => r.source === s).sort((a, b) => a.tMs - b.tMs);
  const hrm = bySource('HRM');
  const insole = bySource('INSOLE');
  const imu = bySource('IMU');

  const allT = raw.map((r) => r.tMs).sort((a, b) => a - b);
  if (allT.length === 0) return [];
  const sMs = startMs ?? Math.floor(allT[0] / SYNC_CLOCK_MS) * SYNC_CLOCK_MS;
  const eMs = endMs ?? Math.ceil(allT[allT.length - 1] / SYNC_CLOCK_MS) * SYNC_CLOCK_MS;

  const frames: SyncedFrame[] = [];
  for (let t = sMs; t <= eMs; t += SYNC_CLOCK_MS) {
    const frame: SyncedFrame = { tMs: t };
    const hr = interpolateAt(hrm, t);
    if (hr !== undefined) frame.hr = Math.round(hr);
    const toe = interpolateAt(insole.filter((x) => true).map((x) => ({ ...x })), t);
    const gctSample = insole.find((x) => x.tMs >= t - 50 && x.tMs <= t + 50);
    const imuVal = interpolateAt(imu, t);
    if (imuVal !== undefined) frame.imuG = Number(imuVal.toFixed(2));
    frames.push(frame);
  }
  return frames;
}

export function sensorSyncStatus(): string {
  return `Sensör Sync: HRM 1-5Hz • Tabanlık 50-100Hz • IMU 20-50Hz → ${SYNC_CLOCK_MS}ms ortak saat`;
}
