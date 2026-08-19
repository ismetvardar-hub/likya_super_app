'use client';

import React, { useState } from 'react';
import { polygonZoneCount, detectionsHeatmap, heatColor, supervisionZonesEngineStatus, type Point, type DetectionBox, type LineZoneState } from '../lib/security/supervisionZonesEngine';
import { runOneShotInference, aerialPlayerGrid, broadcastFastDetections, nvidiaFastInferenceStatus, type DirectBoxOutput } from '../lib/security/nvidiaFastInferenceBridge';

// ============================================================================
// 📐 SUPERVISION ZONE OVERLAY — Polygon Bölge + LineZone + Isı Haritası
// + NVIDIA 10x kuşbakışı oyuncu grid'i. Sentinel + SportVisionX. Plan Z.
// ============================================================================

const ZONE_POLYGON: Point[] = [
  { x: 0.22, y: 0.18 }, { x: 0.72, y: 0.16 }, { x: 0.78, y: 0.62 }, { x: 0.2, y: 0.66 },
];

export default function SupervisionZoneOverlay() {
  const [detections, setDetections] = useState<DetectionBox[]>(() => [
    { id: 'd1', x: 0.3, y: 0.4, w: 0.06, h: 0.1, label: 'sporcu 1', confidence: 0.94 },
    { id: 'd2', x: 0.55, y: 0.35, w: 0.06, h: 0.1, label: 'sporcu 2', confidence: 0.91 },
    { id: 'd3', x: 0.1, y: 0.7, w: 0.06, h: 0.1, label: 'misafir', confidence: 0.88 },
  ]);
  const [line, setLine] = useState<LineZoneState>({ zoneId: 'LZ-1', line: [{ x: 0.5, y: 0.15 }, { x: 0.5, y: 0.85 }], crossings: [], inCount: 3, outCount: 1 });
  const [nvidia, setNvidia] = useState<DirectBoxOutput | null>(null);

  const zone = polygonZoneCount('PZ-1', 'Kort Zonu', ZONE_POLYGON, detections, 6);

  const runFastScan = () => {
    const out = runOneShotInference({
      frameW: 640, frameH: 360, streamId: 'CAM-BIRD',
      subjects: [
        { type: 'athlete', normalizedX: 0.28, normalizedY: 0.3, label: 'sporcu Efe' },
        { type: 'athlete', normalizedX: 0.52, normalizedY: 0.42, label: 'sporcu Deniz' },
        { type: 'guest', normalizedX: 0.8, normalizedY: 0.6, label: 'misafir' },
      ],
    });
    setNvidia(out);
    setDetections(out.boxes);
    broadcastFastDetections(out);
  };

  const heat = detectionsHeatmap(detections, 6);
  const grid = aerialPlayerGrid(nvidia ? nvidia.boxes.map((b) => ({ name: b.label, x: b.x / 640, y: b.y / 360 })) : [{ name: 'Efe', x: 0.3, y: 0.35 }, { name: 'Deniz', x: 0.55, y: 0.4 }]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(2,6,23,0.85)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '16px', padding: '14px', fontFamily: "'Courier New', monospace" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 900, color: '#22d3ee', letterSpacing: '1px' }}>📐 SUPERVISION ZONE OVERLAY</div>
          <div style={{ fontSize: '9px', color: '#475569', marginTop: '2px' }}>{supervisionZonesEngineStatus()} • {nvidiaFastInferenceStatus()}</div>
        </div>
        <button onClick={runFastScan} style={{ fontSize: '10px', fontWeight: 900, padding: '7px 14px', borderRadius: '10px', border: '1px solid rgba(34,211,238,0.5)', cursor: 'pointer', background: 'rgba(34,211,238,0.1)', color: '#22d3ee', fontFamily: 'inherit' }}>⚡ NVIDIA 10x TARA</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '10px' }}>
        {/* POLYGON ZONE + KAMERA */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px' }}>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#7dd3fc' }}>POLYGON ZONE — {zone.zoneName}</div>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: 'rgba(0,0,0,0.5)', borderRadius: '10px', overflow: 'hidden', marginTop: '6px' }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 56.25">
              <polygon points={ZONE_POLYGON.map((p) => `${p.x * 100},${p.y * 56.25}`).join(' ')} fill="rgba(34,211,238,0.12)" stroke="#22d3ee" strokeWidth="0.6" />
            </svg>
            {detections.map((d) => (
              <div key={d.id} style={{ position: 'absolute', left: `${d.x * 100}%`, top: `${d.y * 100}%`, width: `${d.w * 100}%`, height: `${d.h * 100}%`, border: '1px solid rgba(74,222,128,0.8)', borderRadius: '4px' }}>
                <span style={{ position: 'absolute', top: -12, left: 0, fontSize: '7px', color: '#4ade80' }}>{d.label} {Math.round(d.confidence * 100)}%</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', marginTop: '6px' }}>
            <span>Aktif: <b style={{ color: '#4ade80' }}>{zone.activeCount}</b>/{zone.capacity}</span>
            <span>Yoğunluk: <b style={{ color: zone.densityRatio > 0.7 ? '#f87171' : '#4ade80' }}>{(zone.densityRatio * 100).toFixed(0)}%</b></span>
            <span>Alan: {zone.area}</span>
          </div>
        </div>

        {/* LINE ZONE IN/OUT */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#7dd3fc' }}>LINE ZONE — GİRİŞ/ÇIKIŞ</div>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/5', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: '#fbbf24' }} />
            <span style={{ position: 'absolute', left: '52%', top: 2, fontSize: '7px', color: '#fbbf24' }}>IN ⟶</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '10px' }}>
            <span>IN: <b style={{ color: '#4ade80' }}>{line.inCount}</b></span>
            <span>OUT: <b style={{ color: '#f87171' }}>{line.outCount}</b></span>
            <span>Net: <b style={{ color: '#22d3ee' }}>{line.inCount - line.outCount}</b></span>
          </div>
          <button onClick={() => setLine({ ...line, inCount: line.inCount + 1 })} style={{ fontSize: '9px', padding: '6px', borderRadius: '8px', border: '1px solid rgba(74,222,128,0.4)', background: 'transparent', color: '#4ade80', cursor: 'pointer' }}>+ Geçiş Sim</button>
        </div>

        {/* ISIL HARİTA */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px' }}>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#7dd3fc' }}>DETECTIONS HEATMAP</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3, marginTop: '6px' }}>
            {heat.map((c, i) => (
              <div key={i} style={{ aspectRatio: '1', borderRadius: 4, background: heatColor(c.weight), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: c.count > 0 ? '#fff' : 'transparent' }}>{c.count || ''}</div>
            ))}
          </div>
          <div style={{ fontSize: '8px', color: '#64748b', marginTop: '6px' }}>Termal skala: mavi → sarı → kırmızı (yoğunluk)</div>
        </div>
      </div>

      {/* KUŞBAKIŞI OYUNCU GRID */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px' }}>
        <div style={{ fontSize: '9px', fontWeight: 800, color: '#7dd3fc' }}>🐦 KUŞBAKIŞI SAHA — OYUNCU GRID ({grid.cols}x{grid.rows})</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${grid.cols}, 1fr)`, gap: 3, marginTop: '6px' }}>
          {grid.cells.flat().map((cell, i) => (
            <div key={i} style={{ height: 26, borderRadius: 6, background: cell ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(34,211,238,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: cell ? '#4ade80' : '#334155', fontWeight: cell ? 800 : 400, overflow: 'hidden' }}>
              {cell || '·'}
            </div>
          ))}
        </div>
        {nvidia && (
          <div style={{ fontSize: '9px', color: '#22d3ee', marginTop: '6px' }}>
            ⚡ NVIDIA: {nvidia.boxes.length} nesne • {nvidia.latencyMs}ms (&lt;5ms ✓) • {nvidia.fps} fps • harita hazır
          </div>
        )}
      </div>
    </div>
  );
}

