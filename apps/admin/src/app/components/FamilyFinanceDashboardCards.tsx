'use client';

import React, { useState } from 'react';
import { priceFamily, referralTier, generateReferralCode, whatsappInviteText, whatsappShareUrl, inviteeFirstMonthDiscount, familyMembershipEngineStatus, type FamilyMember } from '../lib/finance/familyMembershipEngine';
import { createLessonCredit, reserveMakeup, vaultBalance, transferCredit, lessonCreditVaultStatus, type CreditVault, type LessonCredit } from '../lib/sports/lessonCreditVault';
import { requestChildPurchase, approvePurchase, parentalApprovalEngineStatus, type PurchaseRequest, type ChildSpendProfile } from '../lib/finance/parentalApprovalEngine';

// ============================================================================
// 👨‍👩‍👧‍👦 VELİ & AİLE FİNANS PANELİ — Aile/Kart • Ders Kredisi • 10x Referans
// + Ebeveyn Onay demosu. Holistic görünümüne bağlı. Plan Z güvenli.
// ============================================================================

const FAMILY: FamilyMember[] = [
  { id: 'V1', name: 'Ali (Veli)', relation: 'self', basePriceTl: 1500 },
  { id: 'V2', name: 'Ayşe (Eş)', relation: 'spouse', basePriceTl: 1200 },
  { id: 'V3', name: 'Efe (Çocuk)', relation: 'child', basePriceTl: 900 },
  { id: 'V4', name: 'Deniz (Çocuk)', relation: 'child', basePriceTl: 900 },
];

export default function FamilyFinanceDashboardCards() {
  const [family] = useState(FAMILY);
  const [vault, setVault] = useState<CreditVault>(() => {
    const credits: LessonCredit[] = [
      createLessonCredit('Efe', 'LES-01', new Date('2026-08-05')),
      createLessonCredit('Efe', 'LES-02', new Date('2026-08-08')),
      createLessonCredit('Deniz', 'LES-03', new Date('2026-08-10')),
    ];
    return { ownerId: 'V1', credits };
  });
  const [approval, setApproval] = useState<{ state: string; message: string } | null>(null);
  const [referralCount, setReferralCount] = useState(2);

  const pricing = priceFamily(family);
  const benefit = referralTier(referralCount);
  const code = generateReferralCode('V1');
  const balance = vaultBalance(vault);
  const profile: ChildSpendProfile = { childId: 'Efe', dailyMicroLimitTl: 150, spentTodayTl: 40, cardSaved: true };
  const purchase: PurchaseRequest = { requestId: 'RQ-001', childId: 'Efe', childName: 'Efe', item: 'Raket Kiralama', amountTl: 450, category: 'kiralama' };

  const runApprovalFlow = () => {
    const first = requestChildPurchase(purchase, profile);
    setApproval({ state: first.state, message: first.message });
    if (first.state === 'PENDING_PARENT_APPROVAL') {
      setTimeout(() => {
        const approved = approvePurchase(purchase, true);
        setApproval({ state: approved.state, message: approved.message });
      }, 1500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))', border: '1px solid rgba(129,140,248,0.35)', borderRadius: '16px', padding: '16px', boxShadow: '0 0 26px rgba(129,140,248,0.08)' }}>
      <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>👨‍👩‍👧‍👦 Aile & Kulüp Finans</div>
      <div style={{ fontSize: '10px', color: '#64748b' }}>{familyMembershipEngineStatus()} • {lessonCreditVaultStatus()} • {parentalApprovalEngineStatus()}</div>

      {/* 1. AİLEM & KARTIM */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#a5b4fc' }}>💳 AİLEM & KAYITLI KARTIM — {pricing.memberCount} BİREY (%{pricing.familyDiscountPct} indirim)</div>
        <div style={{ fontSize: '10px', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.7 }}>
          {pricing.priced.map((m) => <span key={m.id}>• {m.name}: ₺{m.netTl.toFixed(0)}<br /></span>)}
          <b style={{ color: '#4ade80' }}>Aile toplamı: ₺{pricing.familyTotalTl.toFixed(0)}</b> <span style={{ color: '#64748b', fontSize: '9px' }}>• tek ekstre / ortak karttan tahsil</span>
        </div>
      </div>

      {/* 2. DERS KREDİLERİM */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#fbbf24' }}>🎟️ DERS ALACAKLARIM (365 GÜN KREDİ)</div>
        <div style={{ fontSize: '10px', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.7 }}>
          Kullanılabilir: <b style={{ color: '#4ade80' }}>{balance.usable} kredi</b> • süresi dolan: {balance.expired}
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
            <button onClick={() => { reserveMakeup(vault, 'group'); setVault({ ...vault }); }} style={btn}>📅 Telafi Rezerve (grup)</button>
            <button onClick={() => { reserveMakeup(vault, 'private'); setVault({ ...vault }); }} style={btn}>🎯 Özel Derse Çevir (3→1)</button>
            <button onClick={() => { transferCredit(vault, 'Deniz', vault.credits[1]?.id ?? ''); setVault({ ...vault }); }} style={btn}>↔️ Kardeşe Devret</button>
          </div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>Katılınmayan dersler yanmaz — 365 gün veli ekranında birikir.</div>
        </div>
      </div>

      {/* 3. DAVET ET & 10x REFERANS */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#4ade80' }}>🚀 DAVET ET & İNDİRİM KAZAN — 1 MÜŞTERİ = 10 MÜŞTERİ</div>
        <div style={{ fontSize: '10px', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.7 }}>
          Getirilen: <b style={{ color: '#22d3ee' }}>{benefit.referredCount} üye</b> → {benefit.reward}
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            <button onClick={() => setReferralCount((c) => Math.min(10, c + 1))} style={btn}>➕ +1 üye</button>
            <span style={{ fontSize: '9px', color: '#64748b' }}>{inviteeFirstMonthDiscount().note}</span>
          </div>
          <div style={{ marginTop: '6px', fontSize: '9px', color: '#94a3b8' }}>
            Kod: <b style={{ color: '#4ade80' }}>{code}</b> • Link: {`https://likya.app/join?ref=${code}`}
          </div>
          <a href={whatsappShareUrl(whatsappInviteText('Ali', code))} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '6px', fontSize: '10px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', textDecoration: 'none', background: 'linear-gradient(135deg,#25d366,#4ade80)', color: '#0d1322' }}>📲 WhatsApp ile Davet Et</a>
        </div>
      </div>

      {/* 4. EBEVEYN ONAY DEMOSU */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#f87171' }}>🛡️ EBEVEYN ONAY (Efe — Raket Kiralama ₺450)</div>
        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
          <button onClick={runApprovalFlow} style={btn}>🧪 Onay Akışını Dene</button>
          <span style={{ fontSize: '9px', color: '#64748b' }}>Mikro ≤150₺ otomatik • 450₺ → veli onayı bekler (bloke) → onayda e-fiş</span>
        </div>
        {approval && (
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#e2e8f0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 10px', lineHeight: 1.5 }}>
            <b style={{ color: approval.state === 'APPROVED' ? '#4ade80' : approval.state === 'PENDING_PARENT_APPROVAL' ? '#fbbf24' : '#f87171' }}>{approval.state}</b> — {approval.message}
          </div>
        )}
      </div>
    </div>
  );
}

const btn: React.CSSProperties = { fontSize: '9px', fontWeight: 800, padding: '7px 12px', borderRadius: '10px', border: '1px solid rgba(129,140,248,0.4)', background: 'rgba(129,140,248,0.08)', color: '#a5b4fc', cursor: 'pointer' };

