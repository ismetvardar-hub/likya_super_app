// ============================================================================
// 🛒 PAZARYERİ KİRALAMA İŞLEM KAYDI (Faz 2)
// "Hemen Kirala" ve "Test Et (TBYB)" işlemlerini try_before_buy_bookings +
// sales_commissions tablolarına işler. supabaseEnvReady() yoksa mock fallback.
// Plan Z güvenli. Kırılmasız.
// ============================================================================

import { insertLiveRow, supabaseSwitchStatus } from '../db/supabaseClient';

export interface RentalTransaction {
  ok: boolean;
  transactionId: string;
  product: string;
  days: number;
  total: number;
  deposit: number;
  mode: 'kiralama' | 'tbyb';
  table: string;
  simulated: boolean;
  message: string;
}

export function generateTransactionId(): string {
  return `RT-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// Kiralama/TBYB işlemini try_before_buy_bookings + sales_commissions'a yaz
export async function recordRentalTransaction(opts: {
  product: string;
  days: number;
  total: number;
  deposit: number;
  mode?: 'kiralama' | 'tbyb';
  delivery?: 'tesis' | 'kargo';
}): Promise<RentalTransaction> {
  const mode = opts.mode ?? (opts.deposit > 0 ? 'kiralama' : 'tbyb');
  const transactionId = generateTransactionId();

  const bookingWrite = await insertLiveRow('try_before_buy_bookings', {
    transaction_id: transactionId,
    product: opts.product,
    days: opts.days,
    total: opts.total,
    deposit: opts.deposit,
    mode,
    delivery: opts.delivery ?? 'tesis',
    status: mode === 'tbyb' ? 'test-asamasi' : 'aktif',
    created_at: new Date().toISOString(),
  });

  // TBYB işlemlerinde satış komisyonu kaydı (%10 varsayılan)
  if (mode === 'tbyb' && bookingWrite.ok) {
    await insertLiveRow('sales_commissions', {
      transaction_id: transactionId,
      product: opts.product,
      commission_rate: 10,
      commission_amount: Math.round(opts.total * 0.1),
      status: 'bekliyor',
      created_at: new Date().toISOString(),
    });
  }

  return {
    ok: bookingWrite.ok,
    transactionId,
    product: opts.product,
    days: opts.days,
    total: opts.total,
    deposit: opts.deposit,
    mode,
    table: bookingWrite.simulated ? 'mock (try_before_buy_bookings+sales_commissions)' : 'try_before_buy_bookings',
    simulated: bookingWrite.simulated,
    message: bookingWrite.simulated
      ? `🛒 ${mode === 'tbyb' ? 'Test Et (TBYB)' : 'Kiralama'} ${transactionId} mock katmanına işlendi (depozito ${opts.deposit}₺). ${supabaseSwitchStatus().mode}`
      : `🛒 ${mode === 'tbyb' ? 'Test Et (TBYB)' : 'Kiralama'} ${transactionId} canlı tablolara yazıldı.`,
  };
}

export function rentalEngineStatus(): string {
  return `Kiralama Motoru [TBYB+sales_commissions • depozito %20 • ${supabaseSwitchStatus().status}]`;
}
