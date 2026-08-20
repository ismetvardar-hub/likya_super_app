'use client';

import React from 'react';
import { buildCohortRadar, type RadarInput } from '../../app/lib/analytics/cohortRadarEngine.ts';

// ============================================================================
// 📡 ANONİM KOHORT YÜZDELİK RADAR (Adım 64)
// 5 eksenli SVG radar: Sprint Hızı, RSI, GCT, TRIMP, Bilateral Simetri.
// Değerler %0-100 yüzdelik (kohort toplu/anonim dağılım — akran PII yok).
// ============================================================================

export interface CohortPercentileRadarProps {
  input: RadarInput;
  size?: number;
}

export default function CohortPercentileRadar({ input, size = 320 }: CohortPercentileRadarProps) {
  const axes = buildCohortRadar(input);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 40;
  const n = axes.length;

  const pointAt = (value: number, i: number): [number, number] => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rad = (value / 100) * r;
    return [cx + rad * Math.cos(angle), cy + rad * Math.sin(angle)];
  };
  const polygon = axes.map((a, i) => pointAt(a.value, i).join(',')).join(' ');
  const gridLevels = [25, 50, 75, 100];

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', background: 'rgba(2,6,23,0.6)', borderRadius: 14, padding: 8 }}>
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }} role="img" aria-label="Anonim kohort yüzdelik radar">
        {gridLevels.map((lvl) => (
          <polygon
            key={lvl}
            points={axes.map((_, i) => pointAt(lvl, i).join(',')).join(' ')}
            fill="none"
            stroke="rgba(148,163,184,0.18)"
            strokeWidth={0.8}
          />
        ))}
        {axes.map((_, i) => {
          const [x, y] = pointAt(100, i);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(148,163,184,0.18)" strokeWidth={0.8} />;
        })}
        <polygon points={polygon} fill="rgba(0,242,254,0.18)" stroke="#00f2fe" strokeWidth={2} />
        {axes.map((a, i) => {
          const [x, y] = pointAt(a.value, i);
          const [lx, ly] = pointAt(112, i);
          return (
            <g key={a.key}>
              <circle cx={x} cy={y} r={3.5} fill="#00f2fe" />
              <text x={lx} y={ly} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#a5f3fc">{a.label}</text>
              <text x={lx} y={ly + 10} textAnchor="middle" fontSize={8} fill="#facc15">{a.value}</text>
            </g>
          );
        })}
        <text x={cx} y={cy + 3} textAnchor="middle" fontSize={9} fill="#64748b" fontWeight={600}>Anonim kohort yüzdelik</text>
      </svg>
    </div>
  );
}
