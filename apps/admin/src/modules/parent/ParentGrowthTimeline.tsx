'use client';

import React from 'react';
import { detectPhv, growthVelocity, type GrowthMeasurement } from '../../app/lib/analytics/growthVelocityEngine.ts';

// ============================================================================
// 🌱 VELİ BÜYÜME ZAMAN ÇİZGESİ & PHV EĞRİSİ (Adım 67)
// 8-18 yaş boy/kilo ilerlemesi + anlık büyüme hızı (cm/yıl) çizgisi +
// PHV bükülme noktası vurgusu + koordinasyon adaptasyonu danışma banner'ı.
// ============================================================================

export interface ParentGrowthTimelineProps {
  measurements: GrowthMeasurement[];
}

export default function ParentGrowthTimeline({ measurements }: ParentGrowthTimelineProps) {
  const velocities = growthVelocity(measurements);
  const phv = detectPhv(measurements);
  const maxH = Math.max(...measurements.map((m) => m.heightCm), 1);
  const minH = Math.min(...measurements.map((m) => m.heightCm), maxH - 1);
  const maxV = Math.max(...velocities.map((v) => v.velocityCmPerYear), 1);
  const W = 640;
  const H = 200;
  const pad = 24;
  const x = (i: number) => pad + (i / Math.max(1, measurements.length - 1)) * (W - pad * 2);
  const yH = (h: number) => H - pad - ((h - minH) / (maxH - minH)) * (H - pad * 2);
  const yV = (v: number) => H - pad - (v / maxV) * (H - pad * 2);

  return (
    <div style={{ width: '100%', maxWidth: 660, background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 10 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Büyüme hızı ve PHV zaman çizelgesi">
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#334155" strokeWidth={1} />
        {/* Boy eğrisi */}
        <polyline
          points={measurements.map((m, i) => `${x(i)},${yH(m.heightCm)}`).join(' ')}
          fill="none" stroke="#00f2fe" strokeWidth={2.5}
        />
        {measurements.map((m, i) => <circle key={i} cx={x(i)} cy={yH(m.heightCm)} r={3} fill="#00f2fe" />)}
        {/* Hız eğrisi */}
        <polyline
          points={velocities.map((v, i) => `${x(i + 0.5)},${yV(v.velocityCmPerYear)}`).join(' ')}
          fill="none" stroke="#10B981" strokeWidth={2} strokeDasharray="5 3"
        />
        {/* PHV tepe noktası */}
        {velocities.filter((v) => v.isPhvPeak).map((v, i) => {
          const vi = velocities.indexOf(v);
          return <circle key={i} cx={x(vi + 0.5)} cy={yV(v.velocityCmPerYear)} r={5} fill="#facc15" />;
        })}
        <text x={pad} y={14} fontSize={9} fill="#a5f3fc">Boy (cm)</text>
        <text x={pad} y={28} fontSize={9} fill="#a7f3d0">Hız (cm/yıl, kesikli)</text>
      </svg>
      <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 10, border: `1px solid ${phv.phvDetected ? 'rgba(250,204,21,0.4)' : 'rgba(16,185,129,0.3)'}`, background: phv.phvDetected ? 'rgba(250,204,21,0.08)' : 'rgba(16,185,129,0.06)', fontSize: 10, color: '#e2e8f0' }}>
        {phv.advisory}
      </div>
    </div>
  );
}
