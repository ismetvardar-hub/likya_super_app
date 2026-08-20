// ============================================================================
// 🎥 ÇOK AKIŞLI KAMERA & BLE SAAT SENKRONİZASYONU (Adım 78)
// Kaydedilmiş kort video klipleri (MP4/WebM) ile 100Hz BLE telemetri akışını
// zamansal olarak hizalar:
//   Δt_offset = t_video_anchor − t_ble_anchor
// Her video zaman damgası → karşılık gelen telemetri dilimi (±10ms).
// Deterministik; sıfır bağımlılık.
// ============================================================================

export interface BleTelemetryFrame {
  tMs: number; // BLE epoch millis
  hr?: number;
  gctMs?: number;
  rsi?: number;
}

/** Video-çapa ile BLE-çapa arası ofset: Δt = t_video − t_ble. */
export function computeVideoBleOffset(videoAnchorMs: number, bleAnchorMs: number): number {
  return videoAnchorMs - bleAnchorMs;
}

/** Video zamanını BLE zamanına çevirir: t_ble = t_vid − Δt. */
export function videoToBleTime(videoTimeMs: number, offsetMs: number): number {
  return videoTimeMs - offsetMs;
}

/** Video zamanını BLE zamanına çevirir (eş anlamlı, net API). */
export function mapVideoToBleTime(videoTimeMs: number, offsetMs: number): number {
  return videoTimeMs - offsetMs;
}

export interface TelemetrySlice {
  frame: BleTelemetryFrame | null;
  bleTimeMs: number;
  deltaMs: number;
  matched: boolean;
}

/** Video zaman damgasına karşılık gelen telemetri dilimini bulur (±windowMs). */
export function sliceTelemetryForVideo(
  frames: BleTelemetryFrame[],
  videoTimeMs: number,
  offsetMs: number,
  windowMs = 10,
): TelemetrySlice {
  const bleTime = videoToBleTime(videoTimeMs, offsetMs);
  if (frames.length === 0) return { frame: null, bleTimeMs: bleTime, deltaMs: Infinity, matched: false };

  let best: BleTelemetryFrame | null = null;
  let bestDiff = Infinity;
  for (const f of frames) {
    const diff = Math.abs(f.tMs - bleTime);
    if (diff < bestDiff) { bestDiff = diff; best = f; }
  }
  const matched = best !== null && bestDiff <= windowMs;
  return { frame: matched ? best : null, bleTimeMs: bleTime, deltaMs: matched ? bestDiff : bestDiff, matched };
}

/** Klipte her video zamanı için telemetri dilimlerini eşler (alt-çerçeve doğruluk). */
export function mapVideoClipToTelemetry(
  frames: BleTelemetryFrame[],
  videoTimesMs: number[],
  offsetMs: number,
  windowMs = 10,
): Array<{ videoTimeMs: number; slice: TelemetrySlice }> {
  return videoTimesMs.map((t) => ({ videoTimeMs: t, slice: sliceTelemetryForVideo(frames, t, offsetMs, windowMs) }));
}

/** Clap/impact ses tepe noktasını BLE çapasıyla ilişkilendiren ofset kestirimi. */
export function estimateOffsetFromAnchors(videoAnchorsMs: number[], bleAnchorsMs: number[]): number | null {
  if (videoAnchorsMs.length === 0 || videoAnchorsMs.length !== bleAnchorsMs.length) return null;
  const offsets = videoAnchorsMs.map((v, i) => v - bleAnchorsMs[i]);
  return Math.round(offsets.reduce((a, b) => a + b, 0) / offsets.length);
}

export function videoBleSyncStatus(): string {
  return 'Video↔BLE Sync: Δt=video−BLE • ±10ms eşleştirme • clap anchor kestirimi';
}
