'use client';

import React from 'react';
import { createBroadcastConfig, stageIdentifier, sponsorBanner, telemetryBanner, broadcastTypography, type BroadcastTelemetry } from '../../app/lib/broadcast/broadcastDisplayConfig.ts';

// ============================================================================
// 📺 SEYİRCİ & BÜYÜK EKRAN KORT YAYIN GÖRÜNÜMÜ (Adım 81)
// TV/stadyum tam ekran modu: yüksek kontrast skorbord, canlı telemetri banner,
// sponsor overlay + turnuva aşaması etiketi. Konfig: broadcastDisplayConfig.ts
// ============================================================================

export interface SpectatorBroadcastViewProps {
  homeScore: string;
  awayScore: string;
  homeLabel?: string;
  awayLabel?: string;
  telemetry?: BroadcastTelemetry;
  stage?: string;
  court?: string;
  sponsor?: string | null;
}

export default function SpectatorBroadcastView({ homeScore, awayScore, homeLabel = 'A', awayLabel = 'B', telemetry, stage = 'Quarterfinals', court = 'Court 1', sponsor = null }: SpectatorBroadcastViewProps) {
  const config = createBroadcastConfig({ stage, court, sponsor, showTelemetry: !!telemetry, scoreboardMode: 'big' });
  const typo = broadcastTypography('big');
  const stageText = stageIdentifier(config);
  const sponsorText = sponsorBanner(config);
  const banner = telemetry ? telemetryBanner(config, telemetry) : null;

  return (
    <div style={{ width: '100%', minHeight: 220, background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)', borderRadius: 16, overflow: 'hidden', position: 'relative', border: '1px solid rgba(0,242,254,0.2)' }}>
      {/* Üst etiket: aşama + kort */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
        <span style={{ fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>{stageText}</span>
        {sponsorText && <span style={{ fontSize: 11, fontWeight: 800, color: '#facc15' }}>⭐ {sponsorText}</span>}
      </div>

      {/* Skorbord */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28, padding: '10px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: typo.labelFont, fontWeight: 700, color: '#94a3b8' }}>{homeLabel}</div>
          <div style={{ fontSize: typo.scoreFont, fontWeight: 900, color: '#00f2fe', lineHeight: 1 }}>{homeScore}</div>
        </div>
        <div style={{ fontSize: 34, fontWeight: 900, color: '#334155' }}>:</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: typo.labelFont, fontWeight: 700, color: '#94a3b8' }}>{awayLabel}</div>
          <div style={{ fontSize: typo.scoreFont, fontWeight: 900, color: '#10B981', lineHeight: 1 }}>{awayScore}</div>
        </div>
      </div>

      {/* Canlı telemetri banner */}
      {banner && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 16px', background: 'rgba(0,242,254,0.12)', borderTop: '1px solid rgba(0,242,254,0.2)', fontSize: 12, fontWeight: 800, color: '#a5f3fc' }}>
          {banner}
        </div>
      )}
    </div>
  );
}
