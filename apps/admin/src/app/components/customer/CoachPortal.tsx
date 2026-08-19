'use client';

import React, { useState } from 'react';
import { generateLiveHubSnapshot, type LivePerformanceHubSnapshot } from '../../lib/sports/livePerformanceHub';
import { generatePostSessionReport } from '../../lib/sports/postSessionReport';
import { hrvDropPlain } from '../../lib/sports/plainLanguage';

// ============================================================================
// 🧑‍🏫 ANTRENÖR PORTALI (/coach) — sporcu takibi + drill atama + rapor onayı
// Sporcu Takip Listesi • Drill & Taktik Atama • Antrenman Sonu Rapor Onayı
// ============================================================================

const ROSTER = ['Efe', 'Deniz', 'Mert', 'Ada', 'Can'];

const DRILLS = [
  { id: 'D1', name: 'Patlayıcı Sıçrama (Plyo)', kind: 'Patlayıcılık', duration: '8 dk', emoji: '🦘' },
  { id: 'D2', name: 'Kısa Sprint 0-10m', kind: 'Kondisyon', duration: '6 dk', emoji: '🏃' },
  { id: 'D3', name: 'Çeviklik Merdiveni (COD)', kind: 'Çeviklik', duration: '10 dk', emoji: '🪜' },
  { id: 'D4', name: 'Raket Salınım Tekniği', kind: 'Teknik', duration: '12 dk', emoji: '🏸' },
];

export default function CoachPortal() {
  const [roster, setRoster] = useState(() => ROSTER.map((name, i) => {
    const hub: LivePerformanceHubSnapshot = generateLiveHubSnapshot(i + 1);
    return {
      name,
      hub,
      zone: hub.physiology.heartZone,
      fatigue: hrvDropPlain(hub.physiology.hrvRmssd, 48),
      risk: (i + 1) % 4 === 0 ? '⚠️ Yorgunluk uyarısı' : i === 2 ? '🔴 Sakatlık riski' : '🟢 Normal',
    };
  }));
  const [assignMsg, setAssignMsg] = useState('');
  const [report, setReport] = useState(() => generatePostSessionReport(3));
  const [coachNote, setCoachNote] = useState('');
  const [sent, setSent] = useState(false);

  const assignDrill = (athlete: string, drill: (typeof DRILLS)[number]) => {
    setAssignMsg(`✅ ${drill.emoji} ${drill.name} (${drill.duration}) → ${athlete} gönderildi`);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'linear-gradient(160deg,#eff6ff,#f0f9ff)', minHeight: '100vh', color: '#0f172a' }}>
      {/* BAŞLIK */}
      <div>
        <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e3a8a' }}>🧑‍🏫 Antrenör Paneli</div>
        <div style={{ fontSize: '11px', color: '#64748b' }}>Caner B. — bugün {roster.length} sporcu takipte · canlı efor + risk radarı</div>
      </div>

      {/* SPORCU TAKİP LİSTESİ */}
      <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '18px', padding: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e3a8a' }}>📋 Sporcu Takip Listesi (Canlı)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
          {roster.map((a) => (
            <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '10px 12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{a.name}</div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>{a.zone} · {a.hub.physiology.heartRate} bpm · GCT {a.hub.comparison.gctMs} ms · RSI {a.hub.comparison.rsi}</div>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', color: a.risk.includes('🟢') ? '#059669' : a.risk.includes('⚠️') ? '#d97706' : '#dc2626', background: a.risk.includes('🟢') ? '#f0fdf4' : a.risk.includes('⚠️') ? '#fffbeb' : '#fef2f2', border: `1px solid ${a.risk.includes('🟢') ? '#bbf7d0' : a.risk.includes('⚠️') ? '#fde68a' : '#fecaca'}` }}>{a.risk}</span>
                <span style={{ fontSize: '9px', fontWeight: 700, color: a.fatigue.level === 'RISK' ? '#dc2626' : '#059669' }}>{a.fatigue.emoji} {a.fatigue.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* DRILL & TAKTİK ATAMA */}
      <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '18px', padding: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e3a8a' }}>🏋️ Drill & Taktik Atama</div>
        <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '4px' }}>Sporcuya tek tıkla kondisyon/patlayıcılık drill'i gönder</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
          {roster.slice(0, 3).map((a) => (
            <div key={`${a.name}-d`} style={{ padding: '8px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#0f172a' }}>{a.name}</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                {DRILLS.map((d) => (
                  <button key={d.id} onClick={() => assignDrill(a.name, d)} style={{ fontSize: '9px', fontWeight: 700, padding: '6px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer' }}>{d.emoji} {d.name}</button>
                ))}
              </div>
            </div>
          ))}
          {assignMsg && <div style={{ fontSize: '10px', fontWeight: 700, color: '#059669', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '8px 12px' }}>{assignMsg}</div>}
        </div>
      </div>

      {/* ANTRENMAN SONU RAPOR ONAYI */}
      <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '18px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e3a8a' }}>📝 Antrenman Sonu Rapor Onayı — {report.header.athlete}</div>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '999px' }}>TRIMP {report.header.trimp}</span>
        </div>
        <div style={{ marginTop: '10px', fontSize: '10px', color: '#334155', lineHeight: '1.6', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px' }}>
          {report.development.aiAdvice}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
          <input value={coachNote} onChange={(e) => setCoachNote(e.target.value)} placeholder="Antrenör notu ekle…" style={{ flex: 1, minWidth: 200, fontSize: '10px', padding: '9px 12px', borderRadius: '10px', border: '1px solid #bfdbfe', outline: 'none' }} />
          <button onClick={() => { setSent(true); }} disabled={!coachNote.trim()} style={{ fontSize: '10px', fontWeight: 800, padding: '9px 16px', borderRadius: '10px', border: 'none', cursor: coachNote.trim() ? 'pointer' : 'not-allowed', background: coachNote.trim() ? 'linear-gradient(135deg,#2563eb,#3b82f6)' : '#cbd5e1', color: '#fff' }}>📲 Sporcuya İlet</button>
        </div>
        {sent && <div style={{ fontSize: '10px', fontWeight: 700, color: '#059669', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '8px 12px', marginTop: '8px' }}>✅ Rapor onaylandı ve sporcuya iletildi.</div>}
      </div>
    </div>
  );
}

