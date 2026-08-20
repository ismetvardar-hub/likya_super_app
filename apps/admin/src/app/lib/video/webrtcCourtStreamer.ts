// ============================================================================
// 📡 SUB-SANİYE WEBRTC DÜŞÜK GECİKMELİ VİDEO & TELEMETRİ STREAMER (Adım 117)
// <300ms video yayını, 100Hz telemetri ile eşzamanlı DataChannel'lar üzerinden:
//   • `telemetry_channel`   → 100Hz tabanlık GRF paketleri
//   • `event_marker_channel` → ralli/olay işaretleri
// Video + zemin tepki kuvveti (GRF) overlay'ini mikro-saniye faz hizasında
// tutar (uzak koçluk için). Paketleme/serileştirme saf ve deterministiktir.
// ============================================================================

export const MAX_STREAM_LATENCY_MS = 300;
export const TELEMETRY_CHANNEL = 'telemetry_channel';
export const EVENT_MARKER_CHANNEL = 'event_marker_channel';
export const DATA_CHANNEL_NAMES = [TELEMETRY_CHANNEL, EVENT_MARKER_CHANNEL] as const;
export const TELEMETRY_STREAM_HZ = 100;
export const FRAME_ALIGN_TOLERANCE_US = 1000;

export interface TelemetryPacketPayload {
  seq: number;
  tsUs: number;                // mikro-saniye zaman damgası
  stream: 'insole_left' | 'insole_right';
  grfZ: number;                // zemin tepki kuvveti Z ekseni (vücut ağırlığı katı)
  gctMs: number;
}

export interface EventMarkerPayload {
  tsUs: number;
  label: string;               // 'rally_start' | 'PB_ACHIEVED' | 'drill_end' | ...
}

// ── DataChannel paketleme (JSON, düşük ek yük) ───────────────────────────────
export function packTelemetryPacket(p: TelemetryPacketPayload): string {
  return JSON.stringify({ t: p.tsUs, s: p.seq, c: p.stream, g: p.grfZ, d: p.gctMs });
}

export function unpackTelemetryPacket(json: string): TelemetryPacketPayload | null {
  try {
    const o = JSON.parse(json);
    if (!o || typeof o !== 'object' || typeof o.t !== 'number' || typeof o.s !== 'number') return null;
    return { tsUs: o.t, seq: o.s, stream: o.c as TelemetryPacketPayload['stream'], grfZ: o.g ?? 0, gctMs: o.d ?? 0 };
  } catch {
    return null;
  }
}

export function packEventMarker(m: EventMarkerPayload): string {
  return JSON.stringify({ t: m.tsUs, l: m.label });
}

export function unpackEventMarker(json: string): EventMarkerPayload | null {
  try {
    const o = JSON.parse(json);
    if (!o || typeof o !== 'object' || typeof o.t !== 'number' || typeof o.l !== 'string') return null;
    return { tsUs: o.t, label: o.l };
  } catch {
    return null;
  }
}

export function telemetryChannelName(): string {
  return TELEMETRY_CHANNEL;
}

export function eventMarkerChannelName(): string {
  return EVENT_MARKER_CHANNEL;
}

export function streamLatencyOk(latencyMs: number): boolean {
  return latencyMs >= 0 && latencyMs <= MAX_STREAM_LATENCY_MS;
}

export function telemetryPacketsPerSecond(hz = TELEMETRY_STREAM_HZ): number {
  return Math.max(1, Math.round(hz));
}

// ── Mikro-saniye faz hizalama (video karesi ↔ telemetri karesi) ──────────────
export interface FrameAlignment {
  videoTsUs: number;
  telemetryTsUs: number;
  skewUs: number;
  aligned: boolean;            // skew <= tolerans (1ms)
}

export function alignFrame(videoTsUs: number, telemetryTsUs: number, toleranceUs = FRAME_ALIGN_TOLERANCE_US): FrameAlignment {
  const skewUs = Math.abs(videoTsUs - telemetryTsUs);
  return { videoTsUs, telemetryTsUs, skewUs, aligned: skewUs <= toleranceUs };
}

export interface AlignmentBatch {
  videoFrames: number[];
  telemetryTsUs: number[];
  pairCount: number;
  alignedCount: number;
  maxSkewUs: number;
  aligned: boolean;
}

export function buildFrameAlignmentBatch(videoFrames: number[], telemetryTsUs: number[]): AlignmentBatch {
  const pairCount = Math.min(videoFrames.length, telemetryTsUs.length);
  let alignedCount = 0;
  let maxSkewUs = 0;
  for (let i = 0; i < pairCount; i++) {
    const a = alignFrame(videoFrames[i], telemetryTsUs[i]);
    if (a.aligned) alignedCount++;
    maxSkewUs = Math.max(maxSkewUs, a.skewUs);
  }
  return {
    videoFrames,
    telemetryTsUs,
    pairCount,
    alignedCount,
    maxSkewUs,
    aligned: pairCount > 0 && alignedCount === pairCount,
  };
}

export function webrtcCourtStreamerStatus(): string {
  return `WebRTC: <${MAX_STREAM_LATENCY_MS}ms • ${TELEMETRY_CHANNEL} + ${EVENT_MARKER_CHANNEL} • ±${FRAME_ALIGN_TOLERANCE_US}µs faz hizası`;
}
