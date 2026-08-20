'use client';

import React from 'react';
import { analyzeCoverage, zoneForPoint, COURT_ZONES, type PositionSample } from '../../app/lib/tactics/courtCoverageEngine.ts';

// ============================================================================
// 🗺️ KORT POZİSYON ISITMA & BÖLGE KAPSAMA (Adım 83)
// 2D kort doluluk ısı haritası + bölge süre %'leri + mesafe/L-R önyargı.
// Motor: courtCoverageEngine.ts
// ============================================================================

export interface CourtCoverageHeatmapProps {
  samples: PositionSample[];
}

const ZONE_COLORS: Record<string, string> = {
  'baseline-defense': 'rgba(0,242,254,0.55)',
  transition: 'rgba(139,92,246,0.55)',
  'net-attack': 'rgba(250,204,21,0.55)',
  'lateral-alley': 'rgba(244,63,94,0.45)',
};

export default function CourtCoverageHeatmap({ samples }: CourtCoverageHeatmapProps) {
  const analysis = analyzeCoverage(samples);

  return (
    <div style={{ width: '100%', maxWidth: 420, background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 10 }}>
      <svg viewBox="0 0 200 240" width="100%" role="img" aria-label="Kort pozisyon ısı haritası">
        {/* Kort */}
        <rect x="30" y="20" width="140" height="200" fill="#0f172a" stroke="#334155" />
        <line x1="100" y1="20" x2="100" y2="220" stroke="#334155" strokeDasharray="4 4" />
        {/* Bölge renkleri */}
        <rect x="30" y="20" width="140" height="60" fill={ZONE_COLORS['net-attack']} opacity={0.5} />
        <rect x="30" y="80" width="140" height="60" fill={ZONE_COLORS.transition} opacity={0.4} />
        <rect x="30" y="140" width="140" height="80" fill={ZONE_COLORS['baseline-defense']} opacity={0.45} />
        {/* Örnek noktalar */}
        {samples.map((s, i) => (
          <circle key={i} cx={30 + s.x * 140} cy={20 + (1 - s.y) * 200} r={2} fill="#fff" opacity={0.5} />
        ))}
        <text x="100" y="236" textAnchor="middle" fontSize={7} fill="#64748b">Ağ</text>
        <text x="22" y="110" fontSize={7} fill="#64748b" transform="rotate(-90 22 110)">File</text>
      </svg>

      {/* Bölge yüzdeleri */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {COURT_ZONES.map((z) => (
          <span key={z.id} style={{ fontSize: 9, color: '#e2e8f0', padding: '4px 8px', borderRadius: 6, background: ZONE_COLORS[z.id].replace('0.5', '0.2') }}>
            {z.name}: %{analysis.zonePcts[z.id] ?? 0}
          </span>
        ))}
      </div>

      {/* Mesafe + L/R önyargı */}
      <div style={{ marginTop: 8, fontSize: 10, color: '#94a3b8' }}>
        📏 Toplam {analysis.totalDistanceM} m · Sol %{analysis.leftPct} / Sağ %{analysis.rightPct}
        {analysis.bias !== 'balanced' && <span style={{ color: '#facc15', marginLeft: 6 }}>· Önyargı: {analysis.bias === 'left' ? 'Sol' : 'Sağ'}</span>}
      </div>
    </div>
  );
}
