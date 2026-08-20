'use client';

import React, { useState } from 'react';
import { MEMBERSHIP_TIERS, membershipStatus, renewalDate, prorateMembership, type Membership } from '../../app/lib/finance/membershipTierEngine.ts';

// ============================================================================
// 🎫 AKADEMİ ÜYELİK TIER & ABONELİK DÖNGÜSÜ YÖNETİCİSİ (Adım 89)
// Tier kartları + durum/renovasyon + oranlı yükseltme/indirme hesabı.
// Motor: membershipTierEngine.ts
// ============================================================================

export default function MembershipTierManager() {
  const [membership, setMembership] = useState<Membership>({
    memberId: 'm-1',
    tierId: 'competitive-academy',
    startDate: '2026-01-01',
    billingCycleDays: 30,
    lastPayment: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    status: 'Active',
  });
  const [daysInto, setDaysInto] = useState(12);
  const status = membershipStatus(membership.lastPayment, membership.billingCycleDays);
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === membership.tierId);

  return (
    <div style={{ width: '100%', maxWidth: 560, background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      {/* Tier kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginBottom: 10 }}>
        {MEMBERSHIP_TIERS.map((t) => (
          <button key={t.id} onClick={() => setMembership({ ...membership, tierId: t.id })} style={{ padding: 10, borderRadius: 10, border: membership.tierId === t.id ? '1px solid #00f2fe' : '1px solid #334155', background: membership.tierId === t.id ? 'rgba(0,242,254,0.08)' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#00f2fe' }}>{t.name}</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#facc15' }}>${t.monthlyPrice}<span style={{ fontSize: 8, color: '#64748b' }}>/ay</span></div>
            <div style={{ fontSize: 8, color: '#64748b', marginTop: 4 }}>{t.benefits.join(' · ')}</div>
          </button>
        ))}
      </div>

      {/* Durum + oranlı hesap */}
      <div style={{ fontSize: 10, color: '#94a3b8', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <span>Durum: <b style={{ color: status === 'Active' ? '#10B981' : status === 'Past Due' ? '#F27A1A' : '#F43F5E' }}>{status}</b></span>
        <span>Yenileme: {renewalDate(membership.lastPayment, membership.billingCycleDays).slice(0, 10)}</span>
      </div>
      <label style={{ fontSize: 9, color: '#94a3b8', marginTop: 8, display: 'block' }}>
        Döngü günü: <input type="number" value={daysInto} min={0} max={30} onChange={(e) => setDaysInto(Number(e.target.value))} style={{ width: 56, background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '4px 6px' }} />
      </label>
      <div style={{ marginTop: 8, fontSize: 10, color: '#e2e8f0' }}>
        {MEMBERSHIP_TIERS.filter((t) => t.id !== membership.tierId).map((t) => {
          const p = prorateMembership(membership, t.id, daysInto, membership.billingCycleDays);
          return (
            <div key={t.id} style={{ marginTop: 4 }}>
              → {t.name}: {p.chargeOrCredit >= 0 ? `+$${p.chargeOrCredit.toFixed(2)} (yükseltme)` : `−$${Math.abs(p.chargeOrCredit).toFixed(2)} (kredi)`}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 8, fontSize: 9, color: '#64748b' }}>Mevcut: {tier?.name} · ${tier?.monthlyPrice}/ay</div>
    </div>
  );
}
