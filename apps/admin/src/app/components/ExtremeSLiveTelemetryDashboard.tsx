'use client';

import React, { useEffect, useState } from 'react';
import { generateLiveSnapshot, buildComparisonRows, buildTimeSeries, dashboardSummary, liveTelemetryStatus, type LiveTelemetrySnapshot, type ComparisonRow, type TimePoint } from '../lib/sports/liveTelemetryEngine';

// ============================================================================
// 🖥️ EXTREMES CANLI BİYOMETRİK TELEMETRİ & KIYAS KONTROL PANELİ
// 1. Canlı Sensör Verileri  2. Ayakkabı Basınç Haritası
// 3. Anlık Kıyas & Sapma    4. Zaman Grafiği (Nabız & GCT)
// Mock-first canlı simülasyon (donanım geldiğinde Web Bluetooth'a bağlanır)
// ============================================================================

export default function ExtremeSLiveTelemetryDashboard() {
  const [snap, setSnap] = useState<LiveTelemetrySnapshot>(() => generateLiveSnapshot(1));
  const [history, setHistory] = useState<TimePoint[]>([]);
  const [live, setLive] = useState(true);
  const [seq, setSeq] = useState(0);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setSeq((n) => {
        const next = generateLiveSnapshot(n + 1);
        setSnap(next);
        setHistory((h) => buildTimeSeries(next, h));
        return n + 1;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [live]);

  const rows = buildComparisonRows(snap);
  const summary = dashboardSummary(snap);
  const insoleForefoot = snap.forefootPct;
  const insoleHeel = snap.heelPct;
  const maxHr = 190;
  const maxGct = 240;
  const chartW = 600;
  const chartH = 110;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'linear-gradient(160deg,#0f172a,#1e1b4b)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '20px', padding: '16px', color: '#f8fafc', boxShadow: '0 0 40px rgba(56,189,248,0.08)' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>⚡ ExtremeS Canlı Biyometrik Telemetri & Kıyas Paneli</div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>{liveTelemetryStatus()}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: live ? '#f87171' : '#64748b', letterSpacing: 1 }}>{live ? '● CANLI YAYIN' : '● DURAKLATILDI'}</span>
          <span style={{ fontSize: '9px', fontWeight: 800, padding: '5px 12px', borderRadius: '999px', color: summary.status === 'ok' ? '#4ade80' : '#facc15', background: summary.status === 'ok' ? 'rgba(74,222,128,0.12)' : 'rgba(250,204,21,0.12)', border: `1px solid ${summary.status === 'ok' ? 'rgba(74,222,128,0.4)' : 'rgba(250,204,21,0.4)'}` }}>{summary.text}</span>
          <button onClick={() => setLive((v) => !v)} style={{ fontSize: '9px', fontWeight: 800, padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.4)', background: 'rgba(56,189,248,0.08)', color: '#38bdf8', cursor: 'pointer' }}>{live ? '⏸️ Durdur' : '▶️ Devam'}</button>
        </div>
      </div>

      {/* BÖLGE 1-2-3 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
        {/* 1. CANLI SENSÖR VERİLERİ */}
        <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '14px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: 1 }}>❤️ Canlı Sensör Verileri</div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '30px', fontWeight: 900, color: '#f87171' }}>{snap.heartRate} <span style={{ fontSize: '14px' }}>bpm</span></div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{snap.heartZone} | HRV: {snap.hrvMs} ms</div>
          </div>
          <hr style={{ border: 0, borderTop: '1px solid #334155', margin: '12px 0' }} />
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: 1 }}>⚡ Kol Kinetiği (MiBand)</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#fbbf24', marginTop: '4px' }}>{snap.swingSpeedKmh} <span style={{ fontSize: '12px' }}>km/h</span></div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>Açı: {snap.armAngleDeg}° | Toplam Vuruş: {snap.shotCount}</div>
          </div>
          <hr style={{ border: 0, borderTop: '1px solid #334155', margin: '12px 0' }} />
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: 1 }}>👟 Zemin Temas (FSR)</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>{snap.gctMs} <span style={{ fontSize: '12px' }}>ms</span></div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>Topuk-Burun Geçişi: {32 + (snap.gctMs % 7)} ms</div>
          </div>
        </div>


        {/* 2. AYAKKABI BASINÇ HARİTASI */}
        <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: 1 }}>🦶 Ayakkabı Basınç Haritası (FSR)</div>
          <div style={{ width: '110px', height: '200px', border: '3px solid #475569', borderRadius: '55px 55px 35px 35px', margin: '14px auto', position: 'relative', background: '#0f172a' }}>
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '20px', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff', background: insoleForefoot > 70 ? 'rgba(239,68,68,0.9)' : insoleForefoot > 55 ? 'rgba(250,204,21,0.9)' : 'rgba(34,197,94,0.9)', boxShadow: `0 0 16px ${insoleForefoot > 70 ? 'rgba(239,68,68,0.5)' : insoleForefoot > 55 ? 'rgba(250,204,21,0.5)' : 'rgba(34,197,94,0.5)'}` }}>
              ÖN: %{insoleForefoot}
            </div>
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '16px', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff', background: insoleHeel > 40 ? 'rgba(239,68,68,0.9)' : insoleHeel > 25 ? 'rgba(250,204,21,0.9)' : 'rgba(34,197,94,0.9)', boxShadow: `0 0 16px ${insoleHeel > 40 ? 'rgba(239,68,68,0.5)' : insoleHeel > 25 ? 'rgba(250,204,21,0.5)' : 'rgba(34,197,94,0.5)'}` }}>
              TOPUK: %{insoleHeel}
            </div>
          </div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>Temas Süresi (GCT): <b style={{ color: '#38bdf8' }}>{snap.gctMs} ms</b> • Dağılım %{insoleForefoot}/%{insoleHeel}</div>
        </div>


        {/* 3. ANLIK KIYAS VE SAPMA ANALİZİ */}
        <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '14px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: 1 }}>📊 Anlık Kıyas & Sapma Analizi</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginTop: '8px' }}>
            <thead>
              <tr style={{ color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '5px 2px', borderBottom: '1px solid #334155' }}>Metrik</th>
                <th style={{ padding: '5px 2px', borderBottom: '1px solid #334155' }}>Anlık</th>
                <th style={{ padding: '5px 2px', borderBottom: '1px solid #334155' }}>Hedef</th>
                <th style={{ padding: '5px 2px', borderBottom: '1px solid #334155' }}>Durum</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.metric}>
                  <td style={{ padding: '6px 2px', borderBottom: '1px solid #1e293b', color: '#e2e8f0' }}>{r.metric}</td>
                  <td style={{ padding: '6px 2px', borderBottom: '1px solid #1e293b', color: '#fff', fontWeight: 700 }}>{r.current}</td>
                  <td style={{ padding: '6px 2px', borderBottom: '1px solid #1e293b', color: '#64748b' }}>{r.target}</td>
                  <td style={{ padding: '6px 2px', borderBottom: '1px solid #1e293b', fontWeight: 800, color: r.status === 'ok' ? '#4ade80' : r.status === 'down' ? '#fbbf24' : '#f87171' }}>{r.badge}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginTop: '10px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '8px', color: '#94a3b8' }}>Darbe Dayanımı</div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: snap.impactDurabilityPct > 85 ? '#4ade80' : '#fbbf24' }}>%{snap.impactDurabilityPct}</div>
              <div style={{ fontSize: '8px', color: '#64748b' }}>Stabil</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '8px', color: '#94a3b8' }}>Yorgunluk Riski</div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: snap.fatigueRiskPct < 40 ? '#4ade80' : '#fbbf24' }}>%{snap.fatigueRiskPct}</div>
              <div style={{ fontSize: '8px', color: '#64748b' }}>{snap.fatigueRiskPct < 40 ? 'Düşük' : 'Orta'}</div>
            </div>
          </div>
        </div>
      </div>


      {/* BÖLGE 4: ZAMAN GRAFİĞİ */}
      <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '14px' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: 1 }}>📈 Anlık Gelişim Grafiği (Zaman Ekseni — Nabız & Zemin Teması)</div>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', height: '110px', marginTop: '8px' }}>
          {history.map((p, i) => {
            const x = (i / Math.max(1, history.length - 1)) * chartW;
            const hrY = chartH - ((p.heartRate - 140) / (maxHr - 140)) * chartH;
            const gctY = chartH - ((p.gctMs - 150) / (maxGct - 150)) * chartH;
            const hrPrev = i > 0 ? history[i - 1] : null;
            const gctPrev = i > 0 ? history[i - 1] : null;
            const px = ((i - 1) / Math.max(1, history.length - 1)) * chartW;
            return (
              <g key={i}>
                {hrPrev && <line x1={px} y1={chartH - ((hrPrev.heartRate - 140) / (maxHr - 140)) * chartH} x2={x} y2={hrY} stroke="#f87171" strokeWidth="2" />}
                {gctPrev && <line x1={px} y1={chartH - ((gctPrev.gctMs - 150) / (maxGct - 150)) * chartH} x2={x} y2={gctY} stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />}
                <circle cx={x} cy={hrY} r="2.5" fill="#f87171" />
                <circle cx={x} cy={gctY} r="2.5" fill="#38bdf8" />
              </g>
            );
          })}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', color: '#64748b', marginTop: '4px' }}>
          <span><span style={{ color: '#f87171' }}>── Nabız (bpm)</span> • <span style={{ color: '#38bdf8' }}>- - GCT (ms)</span></span>
          <span>{history.length > 0 ? `Son: ${history[history.length - 1].t}` : 'veri bekleniyor…'}</span>
        </div>
      </div>
    </div>
  );
}

