'use client';

import React, { useState } from 'react';
import { Radar, Send, CheckCircle2, CalendarClock, Clock, UserPlus, MessageCircle } from 'lucide-react';
import {
  analyzeAllNeeds,
  rankCandidates,
  createInvite,
  respondInvite,
  addAvailability,
  buildShiftQrPayload,
  DEPARTMENT_LABELS,
  type DensityInput,
  type StaffProfile,
  type Invite,
  type InviteStatus,
  type StaffNeed,
  type AvailabilityPool,
} from '../lib/hr/shiftDispatchEngine';

// ============================================================================
// 🎛️ LİKYA İK YÖNETİCİ — Otonom İşe Davet & Dinamik Vardiya Paneli
// Canlı İhtiyaç Radarı • Davet Durum Takibi • Personel Liderlik Kartı
// ============================================================================

const POOL: StaffProfile[] = [
  { id: 'p1', name: 'Deniz A.', departments: ['PADEL', 'FNB'], hourlyRateTL: 180, performanceScore: 94, reliabilityScore: 96, availability: [{ date: '2026-08-16', startHour: 10, endHour: 22 }], rating: 4.9 },
  { id: 'p2', name: 'Elif K.', departments: ['FNB', 'MUTFUK'], hourlyRateTL: 165, performanceScore: 90, reliabilityScore: 92, availability: [{ date: '2026-08-16', startHour: 8, endHour: 20 }], rating: 4.8 },
  { id: 'p3', name: 'Mert Y.', departments: ['PADEL', 'GUVENLIK'], hourlyRateTL: 200, performanceScore: 88, reliabilityScore: 85, availability: [{ date: '2026-08-16', startHour: 14, endHour: 24 }], rating: 4.6 },
  { id: 'p4', name: 'Selin T.', departments: ['MUTFUK', 'RESEPSIYON'], hourlyRateTL: 150, performanceScore: 92, reliabilityScore: 90, availability: [{ date: '2026-08-16', startHour: 9, endHour: 18 }], rating: 4.7 },
  { id: 'p5', name: 'Kaan B.', departments: ['PADEL'], hourlyRateTL: 190, performanceScore: 84, reliabilityScore: 78, availability: [{ date: '2026-08-16', startHour: 12, endHour: 21 }], rating: 4.4 },
];

const DENSITIES: DensityInput[] = [
  { dept: 'PADEL', intensityScore: 82, bookedPct: 87, date: '2026-08-16', startHour: 14, endHour: 20 },
  { dept: 'FNB', intensityScore: 70, bookedPct: 62, date: '2026-08-16', startHour: 12, endHour: 22 },
  { dept: 'MUTFUK', intensityScore: 65, eventFlag: true, date: '2026-08-16', startHour: 11, endHour: 20 },
  { dept: 'ETKINLIK', intensityScore: 55, eventFlag: true, date: '2026-08-16', startHour: 15, endHour: 23 },
];

const STATUS_STYLE: Record<InviteStatus, { color: string; icon: string }> = {
  GÖNDERİLDİ: { color: '#00f2fe', icon: '📨' },
  BEKLİYOR: { color: '#fbbf24', icon: '⏳' },
  KABUL: { color: '#4ade80', icon: '✅' },
  RET: { color: '#f87171', icon: '❌' },
  MÜSAİTLİK_BİLDİRDİ: { color: '#a78bfa', icon: '📅' },
};

export default function HRDispatchDashboard() {
  const needs = analyzeAllNeeds(DENSITIES);
  const [activeNeed, setActiveNeed] = useState<StaffNeed>(needs[0]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [pool, setPool] = useState<AvailabilityPool>([]);
  const [log, setLog] = useState<string[]>([]);

  const ranked = rankCandidates(POOL, {
    budgetHourlyTL: 200,
    requiredDept: activeNeed.dept,
    date: activeNeed.date,
    startHour: activeNeed.startHour,
    endHour: activeNeed.endHour,
  });

  const startDispatch = () => {
    const top = ranked.slice(0, Math.max(2, activeNeed.requiredStaff));
    const created = top.map((c) => createInvite(c.staff, activeNeed, { hourlyRateTL: 185, bonusTL: 150 }));
    setInvites(created);
    setLog((l) => [`📨 Otonom davet başlatıldı: ${created.length} personel → ${DEPARTMENT_LABELS[activeNeed.dept]} (${activeNeed.date} ${activeNeed.startHour}:00-${activeNeed.endHour}:00)`, ...l]);
  };

  const acceptInvite = (invite: Invite) => {
    const { invite: updated } = respondInvite(invite, 'KABUL');
    setInvites((list) => list.map((i) => (i.id === invite.id ? updated : i)));
    setLog((l) => [`✅ ${invite.name} vardiyayı kabul etti — QR: ${buildShiftQrPayload(updated)}`, ...l]);
  };

  const declineInvite = (invite: Invite) => {
    const alt = { date: '2026-08-17', startHour: 9, endHour: 18 };
    const { invite: updated, availabilityAdded } = respondInvite(invite, 'RET', alt);
    setInvites((list) => list.map((i) => (i.id === invite.id ? updated : i)));
    if (availabilityAdded) {
      setPool((p) => addAvailability(p, invite.staffId, { date: alt.date, startHour: alt.startHour, endHour: alt.endHour }));
      setLog((l) => [`📅 ${invite.name} 17 Ağustos 09:00-18:00 müsaitliğini bildirdi → Availability Pool hafızasına eklendi`, ...l]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={18} color="#4ade80" /> Otonom İşe Davet & Dinamik Vardiya Motoru
        </h2>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
          Yoğunluk radarları → performans skorlaması → WhatsApp daveti → EVET/HAYIR diyaloğu → QR kartı
        </p>
      </div>

      {/* 📊 Canlı İhtiyaç Radarı */}
      <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(74,222,128,0.25)' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Radar size={14} color="#4ade80" /> 📊 Canlı İhtiyaç Radarı — {needs[0].date}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {needs.map((need) => {
            const sel = activeNeed.dept === need.dept;
            return (
              <button key={need.dept} onClick={() => setActiveNeed(need)}
                style={{
                  textAlign: 'left', cursor: 'pointer', padding: '12px', borderRadius: '12px',
                  background: sel ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${sel ? 'rgba(74,222,128,0.6)' : 'rgba(255,255,255,0.08)'}`,
                  color: '#fff',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>{DEPARTMENT_LABELS[need.dept]}</span>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: need.urgency === 'KRİTİK' ? '#f87171' : need.urgency === 'YÜKSEK' ? '#fbbf24' : '#4ade80', padding: '3px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)' }}>
                    {need.urgency}
                  </span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#4ade80', margin: '6px 0' }}>
                  +{need.requiredStaff} <span style={{ fontSize: '9px', color: '#94a3b8' }}>personel</span>
                </div>
                <div style={{ fontSize: '9px', color: '#94a3b8' }}>
                  🕒 {String(need.startHour).padStart(2, '0')}:00-{String(need.endHour).padStart(2, '0')}:00
                </div>
                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>{need.reason}</div>
              </button>
            );
          })}
        </div>
      </div>


      {/* 🏅 Personel Liderlik Kartı + Davet Başlat */}
      <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,242,254,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🏅 Personel Liderlik Kartı — {DEPARTMENT_LABELS[activeNeed.dept]}
          </div>
          <button onClick={startDispatch} disabled={invites.length > 0}
            style={{ padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(74,222,128,0.6)', background: 'rgba(74,222,128,0.14)', color: '#4ade80', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={14} /> {invites.length > 0 ? 'Davetler Gönderildi ✓' : '⚡ Otonom Davetleri Başlat'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {ranked.map((c, i) => (
            <div key={c.staff.id} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${i === 0 ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.08)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>
                  {i === 0 ? '👑 ' : ''}{c.staff.name} <span style={{ color: '#fbbf24', fontSize: '9px' }}>★{c.staff.rating}</span>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#00f2fe' }}>{c.compositeScore}</span>
              </div>
              <div style={{ fontSize: '9px', color: '#94a3b8', margin: '4px 0' }}>
                {c.staff.departments.map((d) => DEPARTMENT_LABELS[d]).join(' • ')}
              </div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '9px', color: '#64748b' }}>
                <span>🎯 Performans {c.performanceScore}</span>
                <span>🕐 Güvenilirlik {c.reliabilityScore}</span>
                <span>💰 {c.staff.hourlyRateTL}₺/sa</span>
              </div>
              {c.reasons.length > 0 && (
                <div style={{ fontSize: '8px', color: c.availabilityBonus > 0 ? '#4ade80' : '#fbbf24', marginTop: '4px' }}>
                  {c.reasons.join(' • ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>


      {/* 📲 Otonom Davet Durum Takibi */}
      <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(167,139,250,0.25)' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MessageCircle size={14} color="#a78bfa" /> 📲 Otonom Davet Durum Takibi — {invites.length} davet
        </div>
        {invites.length === 0 && (
          <div style={{ fontSize: '10px', color: '#64748b', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.15)' }}>
            ⏳ Henüz davet gönderilmedi — "Otonom Davetleri Başlat" ile ilk dalgayı tetikleyin.
          </div>
        )}
        {invites.map((invite) => {
          const st = STATUS_STYLE[invite.status];
          return (
            <div key={invite.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${st.color}33`, marginBottom: '8px' }}>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>
                  {st.icon} {invite.name} <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '9px' }}>• {DEPARTMENT_LABELS[invite.dept]} • {invite.date} {String(invite.startHour).padStart(2, '0')}:00-{String(invite.endHour).padStart(2, '0')}:00 • {invite.hourlyRateTL}₺/sa + {invite.bonusTL}₺ prim</span>
                </div>
                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px', fontFamily: 'monospace', lineHeight: '1.5' }}>💬 {invite.message}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: st.color, padding: '4px 12px', borderRadius: '12px', background: `${st.color}1a`, border: `1px solid ${st.color}44` }}>{st.icon} {invite.status}</span>
                {invite.status === 'GÖNDERİLDİ' && (
                  <>
                    <button onClick={() => acceptInvite(invite)} style={{ padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(74,222,128,0.5)', background: 'rgba(74,222,128,0.1)', color: '#4ade80', fontSize: '10px', fontWeight: 700 }}>
                      ✅ EVET (Kabul)
                    </button>
                    <button onClick={() => declineInvite(invite)} style={{ padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(248,113,113,0.5)', background: 'rgba(248,113,113,0.08)', color: '#f87171', fontSize: '10px', fontWeight: 700 }}>
                      📅 HAYIR + Müsaitlik
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarClock size={13} color="#4ade80" /> Availability Pool Hafızası ({pool.length} kayıt)
          </div>
          {pool.length === 0 && <div style={{ fontSize: '9px', color: '#64748b' }}>Personel alternatif müsaitlik bildirdikçe burada toplanır.</div>}
          {pool.map((entry, i) => (
            <div key={i} style={{ fontSize: '9px', color: '#a78bfa', fontFamily: 'monospace', lineHeight: '1.6' }}>
              📅 {entry.staffId} → {entry.date} {String(entry.startHour).padStart(2, '0')}:00-{String(entry.endHour).padStart(2, '0')}:00 ({entry.notedAt})
            </div>
          ))}
        </div>
      </div>

      {/* 📜 İşlem akışı */}
      <div style={{ padding: '12px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>📜 Otonom İK İşlem Akışı</div>
        {log.length === 0 && <div style={{ fontSize: '9px', color: '#64748b' }}>Davet bekleniyor...</div>}
        {log.map((l, i) => (
          <div key={i} style={{ fontSize: '9px', color: '#94a3b8', lineHeight: '1.6', fontFamily: 'monospace' }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

