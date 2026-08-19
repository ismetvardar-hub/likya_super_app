'use client';

import React, { useState } from 'react';
import { priceFamily, referralTier, generateReferralCode, whatsappInviteText, whatsappShareUrl, familyMembershipEngineStatus, type FamilyMember } from '../lib/finance/familyMembershipEngine';
import { createLessonCredit, vaultBalance, reserveMakeup, transferCredit, lessonCreditVaultStatus, type CreditVault, type LessonCredit } from '../lib/sports/lessonCreditVault';
import { requestChildPurchase, approvePurchase, parentalApprovalEngineStatus, type PurchaseRequest } from '../lib/finance/parentalApprovalEngine';
import { maskCard } from '../lib/security/kvkkMaskingEngine';

// ============================================================================
// ⚡ EXTREMES — MÜŞTERİ PORTALI (Süper-App) — D&D Yazılım Gıda Perakende Ltd. Şti.
// Aile indirimleri • 365 gün ders kredisi • 10x referans • ebeveyn onaylı çocuk
// cüzdanı. Modern kart mimarisi. Plan Z güvenli.
// ============================================================================

const FAMILY: FamilyMember[] = [
  { id: 'V1', name: 'Ali (Veli)', relation: 'self', basePriceTl: 1500 },
  { id: 'V2', name: 'Efe (Çocuk)', relation: 'child', basePriceTl: 900 },
  { id: 'V3', name: 'Deniz (Çocuk)', relation: 'child', basePriceTl: 900 },
];

export default function ExtremeSCustomerPortal() {
  const [family] = useState(FAMILY);
  const [vault, setVault] = useState<CreditVault>(() => {
    const credits: LessonCredit[] = [createLessonCredit('Efe', 'L1'), createLessonCredit('Efe', 'L2'), createLessonCredit('Efe', 'L3')];
    return { ownerId: 'V1', credits };
  });
  const [approval, setApproval] = useState<{ state: string; message: string } | null>(null);
  const [referrals, setReferrals] = useState(3);

  const pricing = priceFamily(family);
  const benefit = referralTier(referrals);
  const code = generateReferralCode('V1');
  const balance = vaultBalance(vault);
  const progress = Math.min(100, Math.round((referrals / 8) * 100));

  const purchase: PurchaseRequest = { requestId: 'RQ-2', childId: 'Efe', childName: 'Efe', item: 'Raket Kiralama', amountTl: 450, category: 'kiralama' };
  const runApproval = () => {
    const first = requestChildPurchase(purchase, { childId: 'Efe', dailyMicroLimitTl: 150, spentTodayTl: 30, cardSaved: true });
    setApproval({ state: first.state, message: first.message });
    if (first.state === 'PENDING_PARENT_APPROVAL') setTimeout(() => setApproval({ state: 'APPROVED', message: approvePurchase(purchase, true).message }), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: 860, margin: '0 auto', background: 'linear-gradient(160deg, #f8fafc, #eef2ff)', borderRadius: '22px', padding: '20px', boxShadow: '0 12px 40px rgba(79,70,229,0.15)', color: '#0f172a' }}>
      {/* ÜST BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 900, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>⚡ ExtremeS</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>Hoş geldiniz Ali Bey • D&D Yazılım Gıda Perakende Ltd. Şti.</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, padding: '6px 12px', borderRadius: '999px', background: '#4f46e5', color: '#fff' }}>💳 {maskCard('4546710011223344')} (Token)</span>
          <span style={{ fontSize: '10px', fontWeight: 800, padding: '6px 12px', borderRadius: '999px', background: '#ecfdf5', color: '#059669', border: '1px solid #34d399' }}>👨‍👩‍👧‍👦 Aile %{pricing.familyDiscountPct} İndirim</span>
        </div>
      </div>

      {/* HIZLI REZERVASYON */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '10px' }}>
        {[{ icon: '🎾', label: 'Padel Kort A', sub: '16:00 • ₺400' }, { icon: '🏸', label: 'Tenis Kort B', sub: '18:00 • ₺350' }, { icon: '🧑‍🏫', label: 'Özel Antrenman', sub: 'Kredi ile 3→1' }].map((c) => (
          <button key={c.label} style={{ padding: '16px 10px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(15,23,42,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '24px' }}>{c.icon}</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{c.label}</div>
            <div style={{ fontSize: '10px', color: '#4f46e5', fontWeight: 700 }}>{c.sub}</div>
          </button>
        ))}
      </div>

      {/* DERS KREDİSİ CÜZDANI */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>🎟️ Ders Kredisi Cüzdanı <span style={{ color: '#64748b', fontWeight: 400 }}>({lessonCreditVaultStatus()})</span></div>
        <div style={{ fontSize: '26px', fontWeight: 900, color: '#4f46e5' }}>{balance.usable} <span style={{ fontSize: '12px', color: '#64748b' }}>kredi • 365 gün</span></div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => { reserveMakeup(vault, 'group'); setVault({ ...vault }); }} style={lightBtn}>📅 Telafi Rezerve</button>
          <button onClick={() => { reserveMakeup(vault, 'private'); setVault({ ...vault }); }} style={lightBtn}>🎯 Özel Derse Çevir</button>
          <button onClick={() => { transferCredit(vault, 'Deniz', vault.credits[0]?.id ?? ''); setVault({ ...vault }); }} style={lightBtn}>↔️ Kardeşe Devret</button>
        </div>
      </div>

      {/* EBEVEYN ONAY KARTI */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>🛡️ Çocuk Harcama Denetimi — Efe (18 yaş altı)</div>
        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>Günlük mikro limit: ₺150 • Harcanan: ₺30 • {parentalApprovalEngineStatus()}</div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={runApproval} style={primaryBtn}>🧪 ₺450 Raket Kiralama Talebi</button>
          {approval && (
            <div style={{ fontSize: '11px', fontWeight: 700, color: approval.state === 'APPROVED' ? '#059669' : approval.state === 'PENDING_PARENT_APPROVAL' ? '#b45309' : '#dc2626', background: approval.state === 'APPROVED' ? '#ecfdf5' : approval.state === 'PENDING_PARENT_APPROVAL' ? '#fffbeb' : '#fef2f2', border: '1px solid currentColor', borderRadius: '10px', padding: '8px 12px' }}>
              {approval.state} — {approval.message.slice(0, 70)}…
            </div>
          )}
        </div>
      </div>

      {/* 10x REFERANS */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>🎁 10x Viral Referans — Davet Et & İndirim Kazan</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 900, color: '#4f46e5' }}>EXTREMES-{code} <span style={{ color: '#64748b', fontWeight: 400 }}>• {referrals} davet → {benefit.reward}</span></span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setReferrals((c) => Math.min(10, c + 1))} style={lightBtn}>➕ +1</button>
            <a href={whatsappShareUrl(whatsappInviteText('Ali', code))} target="_blank" rel="noreferrer" style={{ fontSize: '10px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', textDecoration: 'none', background: 'linear-gradient(135deg,#25d366,#4ade80)', color: '#0d1322' }}>📲 WhatsApp Davet</a>
          </div>
        </div>
        <div style={{ marginTop: '10px', height: '8px', borderRadius: '99px', background: '#e2e8f0', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, borderRadius: '99px', background: 'linear-gradient(90deg,#4f46e5,#7c3aed)', transition: 'width .3s' }} />
        </div>
        <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>8 davete kadar ücretsiz VIP üyelik ilerlemesi: %{progress} ({Math.max(0, 8 - referrals)} kaldı)</div>
      </div>
      <div style={{ fontSize: '9px', color: '#94a3b8', textAlign: 'center' }}>{familyMembershipEngineStatus()}</div>
    </div>
  );
}

const lightBtn: React.CSSProperties = { fontSize: '10px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', border: '1px solid #c7d2fe', background: '#eef2ff', color: '#4f46e5', cursor: 'pointer' };
const primaryBtn: React.CSSProperties = { fontSize: '10px', fontWeight: 800, padding: '9px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff' };

