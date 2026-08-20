'use client';

import React, { useState } from 'react';
import {
  DATA_CHANNEL_NAMES,
  MAX_STREAM_LATENCY_MS,
  packTelemetryPacket,
  unpackTelemetryPacket,
  packEventMarker,
  unpackEventMarker,
  alignFrame,
  buildFrameAlignmentBatch,
  streamLatencyOk,
  telemetryPacketsPerSecond,
  type TelemetryPacketPayload,
  type EventMarkerPayload,
} from '../../app/lib/video/webrtcCourtStreamer.ts';

// ============================================================================
// 📡 SUB-SANİYE WEBRTC DÜŞÜK GECİKMELİ VİDEO & TELEMETRİ PLAYER (Adım 117)
// Video yayını + 100Hz telemetri overlay'i DataChannel'lar üzerinden mikro-saniye
// faz hizalı taşınır (telemetry_channel / event_marker_channel). <300ms hedef.
// Gerçek PeerConnection'a hazır; simülasyon, paketleme ve hizalamayı gösterir.
// Motor: webrtcCourtStreamer.ts
// ============================================================================

export default function LiveWebRtcPlayer() {
  const [latencyMs, setLatencyMs] = useState(95);
  const [packetIndex, setPacketIndex] = useState(0);

  const packet: TelemetryPacketPayload = {
    seq: packetIndex,
    tsUs: packetIndex * 10_000,
    stream: packetIndex % 2 === 0 ? 'insole_left' : 'insole_right',
    grfZ: Math.round(0.4 + Math.sin(packetIndex / 5) * 0.3 * 100) / 100,
    gctMs: 220 + (packetIndex % 18),
  };
  const packed = packTelemetryPacket(packet);
  const unpacked = unpackTelemetryPacket(packed);
  const marker: EventMarkerPayload = { tsUs: packetIndex * 10_000, label: 'rally_start' };
  const markerRoundTrip = unpackEventMarker(packEventMarker(marker));

  // Faz hizalama simülasyonu: video karesi + 500µs kayma (tolerans 1000µs)
  const videoTsUs = packet.tsUs + 500;
  const align = alignFrame(videoTsUs, packet.tsUs);
  const batch = buildFrameAlignmentBatch(
    [10_000, 20_000, 30_000, 40_000],
    [10_500, 20_300, 30_100, 41_900],
  );

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#00f2fe' }}>📡 Canlı Kort Yayını (WebRTC)</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: streamLatencyOk(latencyMs) ? '#10B981' : '#F43F5E' }}>
          {latencyMs}ms {streamLatencyOk(latencyMs) ? `(≤${MAX_STREAM_LATENCY_MS}ms ✓)` : '⚠️ HEDEF AŞILDI'}
        </span>
      </div>

      {/* Video alanı + GRF overlay */}
      <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 10, background: 'radial-gradient(circle, #0f172a, #020617)', overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 9, color: '#64748b' }}>KORT 4 · {packet.stream === 'insole_left' ? 'SOL' : 'SAĞ'} tabanlık</div>
        <div style={{ position: 'absolute', bottom: 6, left: 8, fontSize: 11, fontWeight: 900, color: '#10B981' }}>
          GRF Z: {packet.grfZ.toFixed(2)} BW
        </div>
        <div style={{ position: 'absolute', bottom: 6, right: 8, fontSize: 9, color: '#94a3b8' }}>GCT {packet.gctMs}ms</div>
        {/* Basit canlı çubuk */}
        <div style={{ position: 'absolute', top: 60, left: 20, width: 6, height: `${Math.max(8, packet.grfZ * 100)}%`, background: '#00f2fe', borderRadius: 3 }} />
      </div>

      {/* DataChannel durumu */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 6, fontSize: 8, color: '#94a3b8', flexWrap: 'wrap' }}>
        {DATA_CHANNEL_NAMES.map((ch) => (
          <span key={ch} style={{ border: '1px solid #334155', borderRadius: 6, padding: '3px 8px' }}>🔗 {ch}</span>
        ))}
        <span>Paket hızı: {telemetryPacketsPerSecond()}/sn (100Hz)</span>
      </div>

      {/* Paketleme roundtrip */}
      <div style={{ fontSize: 8, color: '#64748b', marginBottom: 4 }}>
        Paket #{packet.seq}: <code style={{ color: '#8B5CF6' }}>{packed}</code> → doğrulandı: {unpacked?.seq === packet.seq && unpacked.grfZ === packet.grfZ ? '✓' : '✗'} · Marker: {markerRoundTrip?.label ?? '?'}
      </div>

      {/* Faz hizalama */}
      <div style={{ fontSize: 8, color: align.aligned ? '#10B981' : '#F27A1A', marginBottom: 6 }}>
        Faz hizası: video {videoTsUs}µs ↔ telemetri {packet.tsUs}µs → skew {align.skewUs}µs {align.aligned ? '(≤1000µs — mikro-saniye hizalı ✓)' : '(hizalı değil)'}
      </div>
      <div style={{ fontSize: 8, color: '#64748b', marginBottom: 6 }}>
        Batch hizalama: {batch.alignedCount}/{batch.pairCount} kare · max skew {batch.maxSkewUs}µs · {batch.aligned ? 'tam hizalı ✓' : 'yeniden senkron gerekli'}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setPacketIndex((i) => i + 1)} style={mini}>⏭ Sonraki Çerçeve</button>
        <button onClick={() => setLatencyMs((l) => (l >= 300 ? 80 : l + 40))} style={mini}>📈 Gecikme Artır (+40ms)</button>
      </div>
    </div>
  );
}

const mini: React.CSSProperties = { fontSize: 9, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' };
