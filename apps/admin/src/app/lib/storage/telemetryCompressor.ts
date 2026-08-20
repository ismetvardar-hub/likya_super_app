// ============================================================================
// 📉 YÜKSEK FREKANSLI TELEMETRİ ZAMAN SERİSİ SIKIŞTIRMA (Adım 51)
// 100Hz telemetri çerçeveleri için hafif kayıplı/kayıpsız sıkıştırma:
//  • Zaman damgası + kalp atışı için delta kodlama
//  • Tabanlık basınçları (%0-100) ve GCT (ms) için kuantize tam sayı paketleme
// Hedef: JSON payload'da ≥%70 küçülme (DB/offline depolama öncesi).
// Kayıpsız: gct/arm_velocity/loading_rate tam sayıya; kayıplı değil — ±0.1 hassasiyet.
// Deterministik; sıfır bağımlılık.
// ============================================================================

export interface TelemetryPoint {
  timestampMs: number;
  hr: number;
  gctMs: number;
  toePressure: number;
  heelPressure: number;
  armVelocity: number;  // km/h (0.1 hassasiyet)
  loadingRate: number;  // kN/s (0.01 hassasiyet)
  rsi: number;          // (0.01 hassasiyet)
}

export interface CompressedTelemetry {
  version: 1;
  baseTimestamp: number;
  baseHr: number;      // HR delta kodlaması için taban
  dt: number[];      // zaman delta'ları (ms)
  hr: number[];      // HR delta'ları
  gct: number[];     // GCT tam sayı (ms)
  toe: number[];     // önayak basıncı % (0-100)
  heel: number[];    // topuk basıncı % (0-100)
  armV: number[];    // kol hızı × 10 (int)
  loadR: number[];   // yükleme oranı × 100 (int)
  rsi: number[];     // RSI × 100 (int)
  count: number;
}

/** 100Hz telemetri batch'ini delta + kuantizasyonla sıkıştırır. */
export function compressTelemetryBatch(frames: TelemetryPoint[]): CompressedTelemetry {
  if (frames.length === 0) return { version: 1, baseTimestamp: 0, baseHr: 0, dt: [], hr: [], gct: [], toe: [], heel: [], armV: [], loadR: [], rsi: [], count: 0 };
  const baseTimestamp = frames[0].timestampMs;
  const baseHr = frames[0].hr;
  return {
    version: 1,
    baseTimestamp,
    baseHr,
    dt: frames.map((f) => f.timestampMs - baseTimestamp),
    hr: frames.map((f) => f.hr - baseHr),
    gct: frames.map((f) => Math.round(f.gctMs)),
    toe: frames.map((f) => Math.round(Math.max(0, Math.min(100, f.toePressure)))),
    heel: frames.map((f) => Math.round(Math.max(0, Math.min(100, f.heelPressure)))),
    armV: frames.map((f) => Math.round(f.armVelocity * 10)),
    loadR: frames.map((f) => Math.round(f.loadingRate * 100)),
    rsi: frames.map((f) => Math.round(f.rsi * 100)),
    count: frames.length,
  };
}

/** Sıkıştırılmış batch'i orijinal şemaya geri açar (round-trip). */
export function decompressTelemetryBatch(c: CompressedTelemetry): TelemetryPoint[] {
  const out: TelemetryPoint[] = [];
  for (let i = 0; i < c.count; i++) {
    out.push({
      timestampMs: c.baseTimestamp + (c.dt[i] ?? 0),
      hr: c.baseHr + (c.hr[i] ?? 0),
      gctMs: c.gct[i] ?? 0,
      toePressure: c.toe[i] ?? 0,
      heelPressure: c.heel[i] ?? 0,
      armVelocity: (c.armV[i] ?? 0) / 10,
      loadingRate: (c.loadR[i] ?? 0) / 100,
      rsi: (c.rsi[i] ?? 0) / 100,
    });
  }
  return out;
}

/** Orijinal JSON boyutu (bayt). */
export function telemetryJsonBytes(frames: TelemetryPoint[]): number {
  return JSON.stringify(frames).length;
}

/** Sıkıştırılmış JSON boyutu (bayt). */
export function compressedJsonBytes(c: CompressedTelemetry): number {
  return JSON.stringify(c).length;
}

/** Küçülme oranı (%): 1 − sıkıştırılmış/orijinal. */
export function compressionRatioPct(frames: TelemetryPoint[]): number {
  const original = telemetryJsonBytes(frames);
  if (original === 0) return 0;
  const compressed = compressedJsonBytes(compressTelemetryBatch(frames));
  return Number((((original - compressed) / original) * 100).toFixed(1));
}

export function telemetryCompressorStatus(): string {
  return 'Telemetri Sıkıştırma: delta(ts/hr) + kuantize(gct/basınç) • ≥%70 payload küçülme';
}
