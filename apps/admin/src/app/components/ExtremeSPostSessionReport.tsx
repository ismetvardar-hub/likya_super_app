'use client';

import React, { useState } from 'react';
import { generatePostSessionReport, deltaPct, postSessionReportStatus, type PostSessionReport } from '../lib/sports/postSessionReport';

// ============================================================================
// 🏆 SPORTVISIONX ÖLÇÜM & GELİŞİM RAPORU (Post-Session)
// 1. Performans Özeti & Trendler  2. Spor Bilimi (Yorgunluk & Sakatlık)
// 3. Gelişim Alanları & AI Tavsiye  4. Tarihsel Kıyaslama
// ============================================================================

export default function ExtremeSPostSessionReport() {
  const [report, setReport] = useState<PostSessionReport>(() => generatePostSessionReport(2));
  const [notified, setNotified] = useState(false);

  const tierColor = (t: string) => (t === 'Elit' ? '#4ade80' : t === 'Yüksek' ? '#38bdf8' : t === 'İyi' ? '#fbbf24' : '#fb7185');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(160deg,#0f172a,#1e1b4b)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '20px', padding: '16px', color: '#f8fafc' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>🏆 SportVisionX Ölçüm & Gelişim Raporu</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '9px', fontWeight: 800, color: '#c4b5fd', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.4)', padding: '4px 10px', borderRadius: '999px' }}>{postSessionReportStatus()}</span>
          <button onClick={() => { setReport(generatePostSessionReport(Math.floor(Math.random() * 11))); setNotified(false); }} style={{ fontSize: '9px', fontWeight: 800, padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(167,139,250,0.4)', background: 'rgba(167,139,250,0.08)', color: '#c4b5fd', cursor: 'pointer' }}>🔄 Yeni Rapor</button>
        </div>
      </div>

      {/* RAPOR BAŞLIĞI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 14px' }}>
        {[
          ['Sporcu', report.header.athlete],
          ['Tarih', report.header.date],
          ['Tür', report.header.sessionType],
          ['Antrenör', report.header.coach],
          ['Toplam Süre', report.header.totalTime],
          ['TRIMP (Yük)', `${report.header.trimp}`],
        ].map(([k, v]) => (
          <div key={k as string}>
            <div style={{ fontSize: '8.5px', color: '#94a3b8' }}>{k}</div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* 1️⃣ PERFORMANS ÖZETİ & TRENDLER */}
      <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24' }}>1️⃣ Performans Özeti & Trendler</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          {report.performance.map((p) => (
            <div key={p.title}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#e2e8f0' }}>{p.title}: <span style={{ color: tierColor(p.tier) }}>%{p.scorePct} ({p.tier})</span></span>
                <div style={{ width: '120px', height: '7px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.scorePct}%`, borderRadius: '99px', background: tierColor(p.tier) }} />
                </div>
              </div>
              {p.lines.map((l) => <div key={l} style={{ fontSize: '9px', color: '#94a3b8', marginTop: '3px', paddingLeft: '12px' }}>• {l}</div>)}
            </div>
          ))}
        </div>
      </div>

      {/* 2️⃣ SPOR BİLİMİ ANALİZİ */}
      <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8' }}>2️⃣ Spor Bilimi Analizi (Yorgunluk & Sakatlık Riski)</div>
        <div style={{ marginTop: '10px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, padding: '5px 12px', borderRadius: '999px', color: report.injury.riskSafe ? '#4ade80' : '#fbbf24', background: report.injury.riskSafe ? 'rgba(74,222,128,0.12)' : 'rgba(250,204,21,0.12)', border: `1px solid ${report.injury.riskSafe ? 'rgba(74,222,128,0.4)' : 'rgba(250,204,21,0.4)'}` }}>
            🛡️ Sakatlık Riski: {report.injury.risk}
          </span>
          {report.injury.details.map((d) => <div key={d} style={{ fontSize: '9px', color: '#94a3b8', marginTop: '5px', paddingLeft: '12px' }}>• {d}</div>)}
          <div style={{ marginTop: '8px', fontSize: '10px', fontWeight: 800, color: report.fatigue.status === 'STABİL' ? '#4ade80' : '#fbbf24' }}>
            🔋 Yorgunluk Yönetimi: {report.fatigue.status}
          </div>
          <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px', paddingLeft: '12px' }}>• {report.fatigue.note}</div>
        </div>
      </div>


      {/* 3️⃣ GELİŞİM ALANLARI & ANTRENÖR TAVSİYESİ */}
      <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#a78bfa' }}>3️⃣ Gelişim Alanları & Antrenör Tavsiyesi (AI)</div>
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {report.development.positives.map((p) => <div key={p} style={{ fontSize: '9.5px', color: '#4ade80', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '8px', padding: '7px 10px' }}>➕ {p}</div>)}
          {report.development.negatives.map((n) => <div key={n} style={{ fontSize: '9.5px', color: '#fb7185', background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.3)', borderRadius: '8px', padding: '7px 10px' }}>➖ {n}</div>)}
          <div style={{ fontSize: '10px', color: '#c4b5fd', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '10px', padding: '9px 12px' }}>
            💡 TAVSİYE (AI): "{report.development.aiAdvice}"
          </div>
        </div>
      </div>


      {/* 4️⃣ TARİHSEL KIYASLAMA */}
      <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#4ade80' }}>4️⃣ Tarihsel Kıyaslama (Trend Analizi)</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginTop: '8px' }}>
          <thead>
            <tr style={{ color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '6px 4px', borderBottom: '1px solid #334155' }}>Metrik</th>
              <th style={{ padding: '6px 4px', borderBottom: '1px solid #334155' }}>Son 1 Ay Ort.</th>
              <th style={{ padding: '6px 4px', borderBottom: '1px solid #334155' }}>Bugün</th>
              <th style={{ padding: '6px 4px', borderBottom: '1px solid #334155' }}>Gelişim Trendi</th>
            </tr>
          </thead>
          <tbody>
            {report.trends.map((t) => (
              <tr key={t.label}>
                <td style={{ padding: '6px 4px', borderBottom: '1px solid #1e293b', color: '#e2e8f0' }}>{t.label}</td>
                <td style={{ padding: '6px 4px', borderBottom: '1px solid #1e293b', color: '#64748b' }}>{t.lastMonth}</td>
                <td style={{ padding: '6px 4px', borderBottom: '1px solid #1e293b', color: '#fff', fontWeight: 700 }}>{t.today}</td>
                <td style={{ padding: '6px 4px', borderBottom: '1px solid #1e293b', fontWeight: 800, color: t.direction === 'up' ? '#4ade80' : t.direction === 'down' ? '#fb7185' : '#94a3b8' }}>
                  {t.direction === 'up' ? '🚀' : t.direction === 'down' ? '📉' : '➖'} {t.deltaPct >= 0 ? '+' : ''}{t.deltaPct}% ({t.note})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
          <button onClick={() => { setNotified(true); }} style={{ fontSize: '9px', fontWeight: 800, padding: '7px 13px', borderRadius: '10px', border: '1px solid rgba(74,222,128,0.4)', background: 'rgba(74,222,128,0.1)', color: '#4ade80', cursor: 'pointer' }}>📲 Sporcunun Telefonuna Bildir</button>
          {notified && <span style={{ fontSize: '9px', fontWeight: 700, color: '#4ade80' }}>📲 Bildirim gönderildi: {report.notification.slice(0, 64)}…</span>}
        </div>
      </div>
    </div>
  );
}

