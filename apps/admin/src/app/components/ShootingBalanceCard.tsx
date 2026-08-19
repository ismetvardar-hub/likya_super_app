'use client';

import React, { useState } from 'react';
import { analyzeShootingBase, shootingBaseBiomechanicsStatus, type ShootingBaseReport } from '../lib/sports/shootingBaseBiomechanics';

// ============================================================================
// 🏀 ŞUT DENGE TEMELİ KARTI — Base & Landing Balance analizörü
// Ayak genişliği (omuz hizası) • Diz valgusu • Stacked posture • Sessiz iniş.
// SportVisionX görünümüne bağlanır. Deterministik; Plan Z güvenli.
// ============================================================================

const ATHLETES = ['Efe K.', 'Deniz A.', 'Mert S.', 'Zeynep T.', 'Alp Y.'];

export default function ShootingBalanceCard() {
  const [athlete, setAthlete] = useState('Efe K.');
  const [report, setReport] = useState<ShootingBaseReport | null>(null);

  const run = () => {
    const r = analyzeShootingBase({ athlete, shoulderWidthCm: 42, stanceWidthCm: 48, kneeValgusDeg: 7, chestHipOffsetCm: 3, landingNoiseDb: 48 });
    setReport(r);
  };

  const scoreColor = report ? (report.baseScore >= 85 ? '#4ade80' : report.baseScore >= 65 ? '#a3e635' : report.baseScore >= 45 ? '#fbbf24' : '#f87171') : '#64748b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '16px', padding: '16px', boxShadow: '0 0 26px rgba(251,191,36,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>🏀 Şut Denge Temeli — Base & Landing</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{shootingBaseBiomechanicsStatus()}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select value={athlete} onChange={(e) => setAthlete(e.target.value)} style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', cursor: 'pointer' }}>
            {ATHLETES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={run} style={{ fontSize: '10px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#fbbf24,#f97316)', color: '#0d1322' }}>🎯 Analiz Et</button>
        </div>
      </div>

      {report && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '8px' }}>
            <Metric label="GENEL DENGE SKORU" value={`${report.baseScore}/100`} color={scoreColor} />
            <Metric label="AYAK POZİSYONU" value={report.foot.stanceVerdict} color={report.foot.stanceVerdict === 'IDEAL' ? '#4ade80' : report.foot.stanceVerdict === 'GENIS' ? '#a3e635' : '#f87171'} sub={`oran ${report.foot.stanceRatio} (omuz ${report.foot.shoulderWidthCm}cm)`} />
            <Metric label="DİZ POSTÜRÜ" value={report.knee.kneeVerdict === 'STABLE' ? 'STABLE' : '⚠️ İÇE ÇÖKME'} color={report.knee.kneeVerdict === 'STABLE' ? '#4ade80' : '#f87171'} sub={`valgus ${report.knee.kneeValgusDeg}°`} />
            <Metric label="GÖVDE HİZASI" value={report.posture.stackedPosture ? 'STACKED' : 'KAYMIŞ'} color={report.posture.stackedPosture ? '#4ade80' : '#fbbf24'} sub={`kayma ${report.posture.chestHipOffsetCm}cm`} />
            <Metric label="SESSİZ İNİŞ" value={report.landing.softLanding ? 'YUMUŞAK' : 'SERT'} color={report.landing.softLanding ? '#4ade80' : '#f87171'} sub={`skor ${report.landing.landingNoiseScore}/100`} />
          </div>
          <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '12px', padding: '10px 12px', fontSize: '11px', color: '#e2e8f0', lineHeight: 1.6 }}>
            <b style={{ color: scoreColor }}>{report.athlete}</b> — {report.prescription}
          </div>
        </>
      )}
    </div>
  );
}

function Metric({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
      <div style={{ fontSize: '14px', fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: '8px', color: '#64748b', letterSpacing: '0.5px', marginTop: '2px' }}>{label}</div>
      {sub && <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}
