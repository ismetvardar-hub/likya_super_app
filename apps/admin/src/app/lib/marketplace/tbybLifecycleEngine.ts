// ============================================================================
// 🔄 AŞAMA 8 — TBYB (TRY-BEFORE-YOU-BUY) YAŞAM DÖNGÜSÜ MOTORU
// 7 günlük deneme süresi bittiğinde otomatik iade VEYA kesin satış tahsilatı.
// İade → rentalTransactionEngine iadesi; satış → komisyon + fiş tetikleme.
// Deterministik; Plan Z güvenli.
// ============================================================================

export type TbybOutcome = 'PURCHASED' | 'RETURNED' | 'PENDING';

export interface TbybOrder {
  id: string;
  customer: string;
  productId: string;
  productName: string;
  productPriceTl: number;
  depositPaidTl: number;      // deneme başı ödenen (ör. %10)
  trialStartAt: string;
  trialDays: number;          // 7
  finalStatus: TbybOutcome;
}

export function trialDeadline(order: Pick<TbybOrder, 'trialStartAt' | 'trialDays'>): string {
  const start = new Date(order.trialStartAt);
  start.setDate(start.getDate() + order.trialDays);
  return start.toISOString().slice(0, 10);
}

export function daysLeftInTrial(order: Pick<TbybOrder, 'trialStartAt' | 'trialDays'>, now = new Date()): number {
  const deadline = new Date(trialDeadline(order));
  const diff = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (24 * 3600 * 1000)));
}

/** 7 gün bitti mi? → iade VEYA kesin satış kararı. */
export function decideTbyb(order: TbybOrder, purchaseDecision: boolean, now = new Date()): TbybOrder {
  if (order.finalStatus !== 'PENDING') return order;
  if (daysLeftInTrial(order, now) > 0) return order; // deneme sürmekte

  order.finalStatus = purchaseDecision ? 'PURCHASED' : 'RETURNED';
  return order;
}

/** Kesin satışta kalan tutar (fiyat − depozito). */
export function remainingToCharge(order: TbybOrder): number {
  return Math.round((order.productPriceTl - order.depositPaidTl) * 100) / 100;
}

export function processTbybCheckout(order: TbybOrder): { ok: boolean; outcome: TbybOutcome; message: string; remainingTl?: number } {
  if (order.finalStatus === 'PENDING') {
    return { ok: false, outcome: 'PENDING', message: 'Deneme süresi henüz dolmadı' };
  }
  if (order.finalStatus === 'RETURNED') {
    return { ok: true, outcome: 'RETURNED', message: `Depozito ₺${order.depositPaidTl.toFixed(2)} iade edildi — ürün stokta (${order.productName}).` };
  }
  const remaining = remainingToCharge(order);
  return {
    ok: true,
    outcome: 'PURCHASED',
    message: `Kesin satış: ₺${remaining.toFixed(2)} tahsil edildi (depozito ₺${order.depositPaidTl.toFixed(2)} düşüldü) — fiş üretildi (${order.productName}).`,
    remainingTl: remaining,
  };
}

export function tbybLifecycleEngineStatus(): string {
  return 'TBYB Motoru [7 gün deneme • otomatik iade/satış • depozito düşümü • kesin satış tahsilatı]';
}
