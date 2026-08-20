'use client';

import React, { useState } from 'react';
import {
  SponsorImpressionEngine, auditChecksum, type SponsorImpression,
} from '../../app/lib/enterprise/sponsorImpressionEngine.ts';

// ============================================================================
// 📊 SPONSOR ROI PANYOSU (Adım 147)
// Yayın HUD / mobil besleme / turnuva braketi izlenimleri + etkileşim → CPM,
// ROI ve denetim doğrulaması. Motor: sponsorImpressionEngine.ts
// ============================================================================

export default function SponsorRoiDashboard() {
  const [engine] = useState<SponsorImpressionEngine>(() => new SponsorImpressionEngine());
  const [report, setReport] = useState<ReturnType<SponsorImpressionEngine['roiReport']> | null>(null);
  const [audit, setAudit] = useState<ReturnType<SponsorImpressionEngine['auditVerification']> | null>(null);

  function generate() {
    engine.reset();
    const base = Date.now();
    const surfaces: SponsorImpression['surface'][] = ['broadcast_hud', 'mobile_parent_feed', 'tournament_bracket', 'live_overlay'];
    for (let i = 0; i < 120; i++) {
      const viewable = 40 + (i * 7) % 55;
      engine.recordImpression({
        sponsorId: 'sp-brand-x',
        surface: surfaces[i % surfaces.length],
        tsMs: base + i * 3000,
        viewablePct: viewable,
        interacted: i % 12 === 0,
        sessionId: `sess-${Math.floor(i / 10)}`,
      });
    }
    setReport(engine.roiReport('sp-brand-x', 500, 0.004, 0.5));
    setAudit(engine.auditVerification('sp-brand-x'));
  }

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#F27A1A', marginBottom: 8 }}>📊 Sponsor ROI & CPM Analitiği</div>
      <button onClick={generate} style={primary}>📈 120 İzlenim Üret (4 yüzey)</button>

      {report && audit && (
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 6 }}>
          <div style={cell}>
            <div style={cellLabel}>İzlenim (görünür)</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#00f2fe' }}>{report.viewableImpressions}/{report.impressions}</div>
          </div>
          <div style={cell}>
            <div style={cellLabel}>CTR</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#10B981' }}>%{report.ctrPct.toFixed(1)}</div>
          </div>
          <div style={cell}>
            <div style={cellLabel}>CPM</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#8B5CF6' }}>{report.cpmUsd}$</div>
          </div>
          <div style={cell}>
            <div style={cellLabel}>ROI</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: report.roiPct >= 100 ? '#10B981' : '#F27A1A' }}>%{report.roiPct}</div>
            <div style={{ fontSize: 8, color: '#64748b' }}>{report.totalValueUsd}$ değer / {report.spendUsd}$ harcama</div>
          </div>
          <div style={cell}>
            <div style={cellLabel}>Denetim</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: audit.verified ? '#10B981' : '#F43F5E' }}>{audit.verified ? '✔️ Doğrulandı' : '✗ Hatalı'}</div>
            <div style={{ fontSize: 7, color: '#64748b' }}>#{audit.checksum}</div>
          </div>
        </div>
      )}
      <div style={{ fontSize: 8, color: '#64748b', marginTop: 8 }}>Sağlama toplamı: {auditChecksum([])} (boş) · Kayıtlar değiştirilirse checksum değişir — denetlenebilir kanıt.</div>
    </div>
  );
}

const primary: React.CSSProperties = { fontSize: 10, fontWeight: 800, padding: '8px 14px', borderRadius: 8, border: '1px solid #F27A1A', background: 'rgba(242,122,26,0.14)', color: '#F27A1A', cursor: 'pointer' };
const cell: React.CSSProperties = { border: '1px solid #1e293b', borderRadius: 8, padding: 8 };
const cellLabel: React.CSSProperties = { fontSize: 8, color: '#64748b', marginBottom: 2 };
