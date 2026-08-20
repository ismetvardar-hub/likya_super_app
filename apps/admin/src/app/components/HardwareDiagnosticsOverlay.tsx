'use client';

import React, { useState } from 'react';

// ============================================================================
// 📊 DONANIM TEŞHİS & TELEMETRİ OVERLAY (Adım 25)
// Antrenör/mühendis için toggle'lanabilir yüzen HUD:
// RSSI (dBm) • bağlantı stabilitesi • uçtan uca paket gecikmesi (ms)
// düşen paket sayacı • frame rate jitter monitörü.
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

export function rssiQuality(rssiDbm: number): string {
  if (rssiDbm >= -55) return 'EXCELLENT';
  if (rssiDbm >= -65) return 'GOOD';
  if (rssiDbm >= -75) return 'FAIR';
  if (rssiDbm >= -85) return 'WEAK';
  return 'POOR';
}

export default function HardwareDiagnosticsOverlay({ metrics }: { metrics: DiagnosticsMetrics }) {
  const [visible, setVisible] = useState(false);
  const q = rssiQuality(metrics.rssiDbm);
  const quality = RSSI_QUALITY[q];
  const stability = metrics.droppedPackets === 0 ? 'Stabil' : metrics.droppedPackets < 10 ? 'Dikkat' : 'Kritik';

  return (
    <>
      <button onClick={() => setVisible((v) => !v)} style={{ fontSize: '9.5px', fontWeight: 800, padding: '7px 13px', borderRadius: 10, border: '1px solid rgba(139,92,246,0.4)', background: 'rgba(139,92,246,0.08)', color: '#c4b5fd', cursor: 'pointer' }}>📊 Donanım Teşhis</button>
      {visible && (
        <div style={{ position: 'fixed', right: 14, top: 70, zIndex: 55, width: 'min(300px, 90vw)', background: 'rgba(2,6,23,0.94)', border: '1px solid rgba(139,92,246,0.35)', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, backdropFilter: 'blur(8px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#c4b5fd' }}>📊 Donanım Teşhis</div>
            <button onClick={() => setVisible(false)} style={{ fontSize: 12, fontWeight: 800, border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer' }}>✕</button>
          </div>
          {[
            ['📶 RSSI', `${metrics.rssiDbm} dBm`, quality.color],
            ['🔗 Stabilite', `${stability} • %${Math.max(0, 100 - metrics.droppedPackets)}`, metrics.droppedPackets === 0 ? '#4ade80' : '#facc15'],
            ['⏱️ Gecikme', `${metrics.latencyMs} ms`, metrics.latencyMs < 100 ? '#4ade80' : '#facc15'],
            ['📉 Düşen Paket', `${metrics.droppedPackets}`, metrics.droppedPackets === 0 ? '#4ade80' : '#fb7185'],
            ['🔄 Jitter', `${metrics.jitterMs} ms`, metrics.jitterMs < 15 ? '#4ade80' : '#facc15'],
            ['🎞️ FPS', `${metrics.framesPerSec}`, metrics.framesPerSec >= 50 ? '#4ade80' : '#facc15'],
          ].map(([k, v, c]) => (
            <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
              <span style={{ color: '#94a3b8' }}>{k}</span>
              <span style={{ fontWeight: 800, color: c as string }}>{v}</span>
            </div>
          ))}
          <div style={{ fontSize: 9, fontWeight: 700, color: quality.color }}>Bağlantı kalitesi: {quality.label}</div>
        </div>
      )}
    </>
  );
}
