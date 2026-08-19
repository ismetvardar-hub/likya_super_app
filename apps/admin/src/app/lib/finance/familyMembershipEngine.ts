// ============================================================================
// 👨‍👩‍👧‍👦 AİLE ÜYELİĞİ & VİRAL REFERANS MOTORU (1 Müşteri = 10 Müşteri)
// • Dinamik aile indirimi: 1 kişi %0 • 2 kişi %15 • 3 kişi %25 • 4+ %30
// • 10x Referans: 1-3 üye %15 • 4-7 üye %25 • 8-10 üye %100 (VIP kulüp)
// • Çift taraflı teşvik: davet eden + davet edilen ilk ay %10 indirim
// • Her veli için benzersiz referralCode + WhatsApp davet metni
// Deterministik; Plan Z güvenli.
// ============================================================================

export interface FamilyMember {
  id: string;
  name: string;
  relation: 'self' | 'spouse' | 'child' | 'sibling';
  basePriceTl: number;
}

export interface FamilyPricing {
  memberCount: number;
  familyDiscountPct: number;
  priced: { id: string; name: string; netTl: number; discountPct: number }[];
  familyTotalTl: number;
}

/** Aile birey sayısına göre kademeli indirim. */
export function familyTierDiscount(memberCount: number): number {
  if (memberCount >= 4) return 30;
  if (memberCount === 3) return 25;
  if (memberCount === 2) return 15;
  return 0;
}

export function priceFamily(members: FamilyMember[]): FamilyPricing {
  const discountPct = familyTierDiscount(members.length);
  const priced = members.map((m) => ({
    id: m.id,
    name: m.name,
    netTl: Math.round(m.basePriceTl * (1 - discountPct / 100) * 100) / 100,
    discountPct,
  }));
  return {
    memberCount: members.length,
    familyDiscountPct: discountPct,
    priced,
    familyTotalTl: Math.round(priced.reduce((a, p) => a + p.netTl, 0) * 100) / 100,
  };
}

// ── 10x VİRAL REFERANS ──────────────────────────────────────────────────────
export type ReferralTier = 'tier-1' | 'tier-2' | 'tier-3';

export interface ReferralBenefit {
  tier: ReferralTier;
  referredCount: number;
  reward: string;
  discountPct: number;      // 100 = ücretsiz
  likyaPayBonusTl: number;
}

export function referralTier(referredCount: number): ReferralBenefit {
  if (referredCount >= 8) {
    return { tier: 'tier-3', referredCount, reward: '0 ₺ VIP Kulüp Üyeliği', discountPct: 100, likyaPayBonusTl: 0 };
  }
  if (referredCount >= 4) {
    return { tier: 'tier-2', referredCount, reward: '%25 indirim + 500 ₺ LikyaPay hediye', discountPct: 25, likyaPayBonusTl: 500 };
  }
  return { tier: 'tier-1', referredCount, reward: '%15 ilk ay indirimi', discountPct: 15, likyaPayBonusTl: 0 };
}

/** Çift taraflı teşvik: davet edilen yeni veli ilk ay %10. */
export function inviteeFirstMonthDiscount(): { discountPct: number; note: string } {
  return { discountPct: 10, note: 'Davet edilen yeni veli ilk kayıt/first ay %10 indirim kazanır' };
}

// ── DAVET LİNKİ & WHATSAPP METNİ ────────────────────────────────────────────
export function generateReferralCode(parentId: string): string {
  const safe = parentId.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `VELI_${safe.slice(0, 8) || 'X'}_${(parentId.length * 7919) % 100}`;
}

export function referralLink(code: string): string {
  return `https://likya.app/join?ref=${code}`;
}

export function whatsappInviteText(parentName: string, code: string): string {
  const link = referralLink(code);
  return `Merhaba! ${parentName} sizi Likya Kampüsü'ne davet ediyor. 🏆 İlk ayınızda %10 indirim kazanın: ${link}`;
}

/** Tek tıkla WhatsApp paylaşım URL'si. */
export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function familyMembershipEngineStatus(): string {
  return 'Aile & Viral [kademeli %0-30 • 10x referans %15-100 • çift taraflı teşvik • WhatsApp davet]';
}
