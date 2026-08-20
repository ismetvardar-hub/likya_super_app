'use client';

import React, { useState } from 'react';
import {
  generatePilotSquad,
  generateParentInvites,
  verifyParentInvite,
  PILOT_SQUAD_NAME,
  PARENT_INVITE_TTL_HOURS,
  type PilotSquadBatch,
  type ParentInvite,
} from '../../app/lib/onboarding/pilotOnboardingEngine.ts';

// ============================================================================
// 🎓 PİLOT EKİP & VELİ HIZLI KAYIT SİHİRBAZI (Adım 104)
// İlk pilot akademi için tek tık kurulum: 1 baş koç + 1 pilot takım
// ("U14 Elit Gelişim") + 4 genç sporcu profili (temel biyometri) +
// otomatik 4 veli davet linki ve 6 haneli doğrulama OTP'leri.
// Motor: pilotOnboardingEngine.ts
// ============================================================================

export default function PilotSquadOnboarding() {
  const [batch, setBatch] = useState<PilotSquadBatch | null>(null);
  const [invites, setInvites] = useState<ParentInvite[]>([]);
  const [verified, setVerified] = useState<string[]>([]);

  function setup() {
    const b = generatePilotSquad();
    setBatch(b);
    setInvites(generateParentInvites(b.athletes));
    setVerified([]);
  }

  function copy(text: string) {
    if (typeof navigator !== 'undefined') navigator.clipboard?.writeText(text).catch(() => undefined);
  }

  function verify(invite: ParentInvite) {
    const res = verifyParentInvite(invites, invite.inviteId, invite.otp);
    if (res.ok && !verified.includes(invite.inviteId)) setVerified((prev) => [...prev, invite.inviteId]);
  }

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      {!batch && (
        <div style={{ textAlign: 'center', padding: 8 }}>
          <div style={{ fontSize: 12, color: '#e2e8f0', marginBottom: 4 }}>🚀 Pilot Akademi Hızlı Kurulum</div>
          <div style={{ fontSize: 9, color: '#64748b', marginBottom: 10 }}>
            1 Baş Koç · {PILOT_SQUAD_NAME} takımı · 4 genç sporcu profili · 4 veli daveti (6 haneli OTP)
          </div>
          <button onClick={setup} style={primary}>⚡ Tek Tıkla Pilot Ekibi Oluştur</button>
        </div>
      )}

      {batch && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#00f2fe' }}>{batch.squad.name}</div>
            <button onClick={setup} style={mini}>🔄 Yeniden Oluştur</button>
          </div>

          {/* Koç */}
          <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 6 }}>
            🧑‍🏫 Baş Koç: <b style={{ color: '#e2e8f0' }}>{batch.coach.fullName}</b> · {batch.coach.certification} · {batch.coach.phone}
          </div>

          {/* Sporcular */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 6, marginBottom: 10 }}>
            {batch.athletes.map((a) => (
              <div key={a.athleteId} style={{ border: '1px solid #1e293b', borderRadius: 8, padding: 8, fontSize: 9 }}>
                <div style={{ fontWeight: 800, color: '#e2e8f0' }}>{a.firstName} <span style={{ color: '#64748b', fontWeight: 500 }}>{a.age} yaş · {a.handedness}</span></div>
                <div style={{ color: '#64748b' }}>{a.baseline.heightCm}cm · {a.baseline.weightKg}kg · 20m {a.baseline.sprint20mSec}s</div>
                <div style={{ color: '#8B5CF6' }}>ACWR {a.baseline.acwrLast7d.toFixed(2)} · {a.baseline.playerProfile}</div>
              </div>
            ))}
          </div>

          {/* Veli davetleri */}
          <div style={{ fontSize: 9, color: '#64748b', marginBottom: 4 }}>
            👨‍👩‍👧 Veli davetleri (OTP geçerlilik: {PARENT_INVITE_TTL_HOURS} saat)
          </div>
          {invites.map((inv) => (
            <div key={inv.inviteId} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              <b style={{ fontSize: 9, color: '#e2e8f0', width: 54 }}>{inv.athleteName}</b>
              <code style={{ fontSize: 8, color: verified.includes(inv.inviteId) ? '#10B981' : '#00f2fe' }}>{inv.otp}</code>
              <span style={{ fontSize: 8, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{inv.inviteLink}</span>
              <button onClick={() => copy(inv.inviteLink)} style={tiny}>📋 Link</button>
              <button onClick={() => copy(inv.otp)} style={tiny}>🔑 OTP</button>
              <button onClick={() => verify(inv)} style={verified.includes(inv.inviteId) ? { ...tiny, borderColor: '#10B981', color: '#10B981' } : tiny}>
                {verified.includes(inv.inviteId) ? '✅ Doğrulandı' : 'Simüle Doğrula'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const primary: React.CSSProperties = { fontSize: 11, fontWeight: 800, padding: '10px 16px', borderRadius: 10, border: '1px solid #10B981', background: 'rgba(16,185,129,0.14)', color: '#10B981', cursor: 'pointer' };
const mini: React.CSSProperties = { fontSize: 9, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' };
const tiny: React.CSSProperties = { fontSize: 8, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' };
