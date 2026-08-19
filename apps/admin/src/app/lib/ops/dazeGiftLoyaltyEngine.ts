// ============================================================================
// 🎁 AŞAMA 12 — DAZE-GIFT DİNAMİK İKRAM & SADAKAT KUPONU ÜRETİCİSİ
// Geciken sipariş veya yüksek harcama yapan müşterilere otomatik ikram QR
// kuponu basar. Deterministik; Plan Z güvenli (localStorage + DB fallback).
// ============================================================================

import { issueDazeGiftCoupon, redeemDazeGiftCoupon } from './dazeReminderEngine';

export type GiftTrigger = 'late-order' | 'high-spender' | 'birthday' | 'loyalty-tier';

export interface GiftEligibility {
  customerId: string;
  trigger: GiftTrigger;
  reason: string;
  discountTl: number;
}

/** Müşteri profiline göre ikram kuponu üret. */
export function generateGiftCoupon(input: { customerId: string; orderId: string; trigger: GiftTrigger; spendTl?: number; delayMin?: number }): GiftEligibility & { code: string; qrData: string } {
  const discountTl =
    input.trigger === 'late-order' ? 50
    : input.trigger === 'high-spender' && (input.spendTl ?? 0) >= 1000 ? 75
    : input.trigger === 'high-spender' ? 40
    : input.trigger === 'birthday' ? 100
    : 25;

  const reason =
    input.trigger === 'late-order' ? `Sipariş ${input.delayMin ?? 2} dk gecikti — ikram hakkı`
    : input.trigger === 'high-spender' ? `Toplam harcama ₺${input.spendTl} — sadakat ikramı`
    : input.trigger === 'birthday' ? 'Doğum günü ikramı'
    : 'Sadakat seviyesi ikramı';

  const coupon = issueDazeGiftCoupon(input.orderId, 'olagan');
  return {
    customerId: input.customerId, trigger: input.trigger, reason, discountTl,
    code: coupon.code,
    qrData: `DZ-GIFT|${coupon.code}|${input.customerId}|${discountTl}`,
  };
}

export { redeemDazeGiftCoupon };

export function dazeGiftLoyaltyEngineStatus(): string {
  return 'Daze-Gift Sadakat [geciken sipariş • yüksek harcama • doğum günü • QR kupon]';
}
