// ============================================================================
// 🍳 DAZE CHEF 120s & POS İŞLEM MOTORU (Faz 2)
// Multimodal görsel analizinden / manuel reçeteden gelen mutfak siparişlerini
// pos_transactions + upcycling_items tablolarına yazar; 120s sayacı
// tetiklendiğinde mutfak paneline anlık fiş formatında veri aktarır.
// supabaseEnvReady() yoksa mock fallback (asla çökme). Plan Z.
// ============================================================================

import { insertLiveRow, supabaseSwitchStatus } from '../db/supabaseClient';

export interface PosReceipt {
  ok: boolean;
  receiptNo: string;
  item: string;
  amount: number;
  qty: number;
  orderType: 'daze-chef' | 'upcycling';
  table: string;
  simulated: boolean;
  message: string;
}

// Fiş numarası (deterministik)
export function generateReceiptNo(): string {
  return `DC-${Date.now().toString().slice(-6)}`;
}

// Mutfak siparişini POS'a kaydet (pos_transactions / upcycling_items)
export async function recordKitchenOrder(item: string, amount: number, qty = 1, orderType: 'daze-chef' | 'upcycling' = 'daze-chef'): Promise<PosReceipt> {
  const table = orderType === 'daze-chef' ? 'pos_transactions' : 'upcycling_items';
  const receiptNo = generateReceiptNo();

  const write = await insertLiveRow(table, {
    receipt_no: receiptNo,
    item,
    amount,
    qty,
    order_type: orderType,
    status: 'hazirlaniyor',
    created_at: new Date().toISOString(),
  });

  return {
    ok: write.ok,
    receiptNo,
    item,
    amount,
    qty,
    orderType,
    table,
    simulated: write.simulated,
    message: write.simulated
      ? `🧾 Fiş ${receiptNo} — "${item}" (${qty}x${amount}₺) mock katmanına yazıldı. ${supabaseSwitchStatus().mode}`
      : `🧾 Fiş ${receiptNo} — "${item}" ${table} tablosuna canlı yazıldı.`,
  };
}

// 120s hazırlık sayacı fiş formatı (mutfak paneline anlık)
export function kitchenReceiptDisplay(r: PosReceipt, countdown: number): string {
  const mm = `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`;
  return [
    `🍜 DAZE CHEF — SİPARİŞ FİŞİ`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `Fiş: ${r.receiptNo}  |  Kalan: ${mm}`,
    `Ürün: ${r.item}`,
    `Adet: ${r.qty}  |  Tutar: ${(r.amount * r.qty).toLocaleString('tr-TR')}₺`,
    `Durum: hazırlanıyor → ${countdown <= 30 ? 'servise yaklaşıyor!' : 'mutfakta'}`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
  ].join('\n');
}

export function dazeChefPosStatus(): string {
  return `Daze Chef POS [pos_transactions+upcycling • fiş formatı • ${supabaseSwitchStatus().status}]`;
}
