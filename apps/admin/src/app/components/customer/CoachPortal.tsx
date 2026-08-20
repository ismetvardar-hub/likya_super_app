'use client';

import React, { useState } from 'react';
import { generateLiveHubSnapshot, type LivePerformanceHubSnapshot } from '../../lib/sports/livePerformanceHub';
import { generatePostSessionReport } from '../../lib/sports/postSessionReport';
import { hrvDropPlain } from '../../lib/sports/plainLanguage';
import { buildSquadDigest, buildDigestHtml, buildDigestMailto, buildDigestDispatchPayload, coachDigestStatus } from '../../lib/ops/coachDigestGenerator';
import { buildCoachAlert, dispatchTelegramAlert, formatTelegramAlert, telegramAlertStatus, type CoachAlertKind } from '../../lib/ops/telegramAlertAdapter';

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
  const [digestPreview, setDigestPreview] = useState(false);
  const [tgAlert, setTgAlert] = useState('');

  const digest = buildSquadDigest([
    report,
    generatePostSessionReport(1),
    generatePostSessionReport(4),
  ], 24);

  const fireTgAlert = async (kind: CoachAlertKind) => {
    const alert = kind === 'INJURY_RED_ZONE'
      ? buildCoachAlert('INJURY_RED_ZONE', 'Mert', 'ACWR 1.8', '> 1.4', 'Sakatlık riski kritik — seansı durdur')
      : kind === 'HR_SPIKE'
        ? buildCoachAlert('HR_SPIKE', 'Efe', '192 bpm', '> 185 bpm', 'Aşırı nabız yükselmesi — mola öner')
        : buildCoachAlert('SEVERE_DECEL', 'Deniz', '-4.2 m/s²', '> -3.5', 'Sert frenleme — diz yükü alarmı');
    const res = await dispatchTelegramAlert(alert);
    setTgAlert(res.ok ? `🤖 ${formatTelegramAlert(alert).split('\n').slice(0, 2).join(' ')}` : '🤖 Telegram simülasyonu hazır (token eklendiğinde gerçek gönderim)');
  };

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

      {/* SQUAD DIGEST + TELEGRAM ALARM */}
      <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '18px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e3a8a' }}>📊 Squad Özeti — {digest.window.label} {coachDigestStatus().split(':')[1]}</div>
          <button onClick={() => setDigestPreview(true)} style={{ fontSize: '10px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer' }}>👁️ Önizle</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '10px' }}>
          {[
            ['🧠 Toplam Yük (TRIMP)', String(digest.totalTrimp)],
            ['🚩 Sakatlık Bayrağı', String(digest.injuryFlags)],
            ['⭐ En İyi RSI', `${digest.topRsi.athlete} (${digest.topRsi.value})`],
            ['🚀 GCT İyileşme', `${digest.topGctImprovement.athlete} (+%${digest.topGctImprovement.deltaMs})`],
          ].map(([k, v]) => (
            <div key={k as string} style={{ textAlign: 'center', padding: '10px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '8.5px', color: '#64748b' }}>{k}</div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#1d4ed8' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px', alignItems: 'center' }}>
          <a href={buildDigestMailto(digest, 'caner@likya-campus.com')} style={{ fontSize: '9.5px', fontWeight: 800, padding: '8px 13px', borderRadius: '10px', textDecoration: 'none', background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff' }}>✉️ E-posta Gönder</a>
          {[['INJURY_RED_ZONE', '🔴 Risk'], ['HR_SPIKE', '❤️‍🔥 HR'], ['SEVERE_DECEL', '🛑 Decel']].map(([k, label]) => (
            <button key={k} onClick={() => fireTgAlert(k as CoachAlertKind)} style={{ fontSize: '9.5px', fontWeight: 800, padding: '8px 13px', borderRadius: '10px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}>🤖 Telegram {label}</button>
          ))}
        </div>
        {tgAlert && <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '8px 12px', marginTop: '8px' }}>{tgAlert}</div>}
        <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '8px' }}>{telegramAlertStatus()}</div>
      </div>

      {/* DIGEST ÖNİZLEME MODALI */}
      {digestPreview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setDigestPreview(false)}>
          <div style={{ width: 'min(640px, 94vw)', maxHeight: '86vh', overflowY: 'auto', background: '#fff', borderRadius: 16 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>👁️ Digest E-posta Önizlemesi</span>
              <button onClick={() => setDigestPreview(false)} style={{ fontSize: 14, fontWeight: 800, border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer' }}>✕</button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: buildDigestHtml(digest) }} />
          </div>
        </div>
      )}
    </div>
  );
}

