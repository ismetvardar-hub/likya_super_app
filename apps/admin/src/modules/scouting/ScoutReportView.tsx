'use client';

import React, { useState } from 'react';
import { buildScoutReport, reportMarkdown, reportPdfStructure, type ScoutMetrics } from '../../app/lib/scouting/scoutReportGenerator.ts';

// ============================================================================
// 🕵️ YETENEK SCOUT RAPOR GÖRÜNÜMÜ (Adım 77)
// 20-80 skala değerlendirmesi + radar profil + tek tık print/PDF + gizli notlar.
// Motor: scoutReportGenerator.ts
// ============================================================================

const DEFAULT_METRICS: ScoutMetrics = { speedKmh: 24, reactivePower: 2.1, strikeMechanics: 72, staminaIndex: 78, mentalResilience: 66 };

export default function ScoutReportView({ athleteName = 'Efe Yılmaz' }: { athleteName?: string }) {
  const [metrics, setMetrics] = useState<ScoutMetrics>(DEFAULT_METRICS);
  const report = buildScoutReport({ athleteName, metrics });
  const pdf = reportPdfStructure(report);

  return (
    <div style={{ width: '100%', maxWidth: 620, background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {(['speedKmh', 'reactivePower', 'strikeMechanics', 'staminaIndex', 'mentalResilience'] as (keyof ScoutMetrics)[]).map((k) => (
          <label key={k} style={{ fontSize: 9, color: '#94a3b8' }}>
            {k}: <input type="number" value={metrics[k]} onChange={(e) => setMetrics({ ...metrics, [k]: Number(e.target.value) })} style={{ width: 52, background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '4px 6px', fontSize: 10 }} />
          </label>
        ))}
      </div>

      {/* Radar profili */}
      <svg viewBox="0 0 200 200" width="100%" style={{ maxWidth: 220 }}>
        {[0.33, 0.66, 1].map((s) => (
          <polygon key={s} points={report.radar.map((_, i) => polar(100 * s, i, report.radar.length)).join(' ')} fill="none" stroke="rgba(148,163,184,0.2)" />
        ))}
        {report.radar.map((_, i) => { const [x, y] = polar(100, i, report.radar.length); return <line key={i} x1={100} y1={100} x2={x} y2={y} stroke="rgba(148,163,184,0.2)" />; })}
        <polygon points={report.radar.map((_, i) => polar(report.radar[i].grade, i, report.radar.length)).join(' ')} fill="rgba(0,242,254,0.2)" stroke="#00f2fe" strokeWidth={1.5} />
      </svg>

      {/* Değerlendirme tablosu */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8, fontSize: 10 }}>
        <thead><tr><th style={{ textAlign: 'left', color: '#00f2fe' }}>Metrik</th><th style={{ color: '#00f2fe' }}>Değer</th><th style={{ color: '#00f2fe' }}>Skor</th><th style={{ color: '#00f2fe' }}>Tier</th></tr></thead>
        <tbody>
          {report.grades.map((g) => (
            <tr key={g.metric}><td style={{ color: '#e2e8f0', padding: 4 }}>{g.label}</td><td style={{ color: '#94a3b8', textAlign: 'center' }}>{g.value} {g.unit}</td><td style={{ color: '#facc15', textAlign: 'center' }}>{g.grade}</td><td style={{ color: '#e2e8f0', textAlign: 'center' }}>{g.tier}</td></tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 8, fontSize: 11, fontWeight: 800, color: '#fff' }}>Genel: {report.overall}/80 · Risk: {report.risk}</div>
      <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 4 }}>{report.summary}</div>
      <div style={{ marginTop: 8, fontSize: 9, color: '#64748b', borderTop: '1px solid #1e293b', paddingTop: 6 }}>🔒 {report.confidentialNotes}</div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={() => window.print()} style={btnStyle}>🖨️ PDF / Yazdır</button>
        <button onClick={() => navigator.clipboard?.writeText(reportMarkdown(report))} style={btnStyle}>📋 Markdown Kopyala</button>
      </div>
      <div style={{ fontSize: 8, color: '#475569', marginTop: 8 }}>{pdf.footer}</div>
    </div>
  );
}

function polar(radius: number, i: number, n: number): [number, number] {
  const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
  return [Math.round(100 + radius * Math.cos(angle)), Math.round(100 + radius * Math.sin(angle))];
}

const btnStyle: React.CSSProperties = { fontSize: 10, fontWeight: 800, padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(0,242,254,0.4)', background: 'rgba(0,242,254,0.08)', color: '#00f2fe', cursor: 'pointer' };
