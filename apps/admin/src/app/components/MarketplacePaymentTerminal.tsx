'use client';

import { useState } from 'react';
import { startPayment, rentalDeposit, tbybDeposit, detectPaymentGateway, type PaymentKind } from '../lib/payment/paymentGatewayAdapter';
import { issueDazeGiftCoupon, redeemDazeGiftCoupon } from '../lib/ops/dazeReminderEngine';

// ============================================================================
// 💳 PAZARYERİ ÖDEME TERMİNALİ — Kiralama Depozitosu / TBYB / Satış
// paymentGatewayAdapter üzerinden işler; secret yoksa Sandbox Test Modu.
// Daze-Gift kupon hızlı üretim/kullanım entegrasyonu (Daze-Reminder motoru).
// ============================================================================

interface Result {
  ok: boolean;
  kind: PaymentKind;
  ref: string;
  msg: string;
}

export default function MarketplacePaymentTerminal() {
  const [result, setResult] = useState<Result | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const gateway = detectPaymentGateway();

  const pay = async (kind: PaymentKind, amount: number, item: string) => {
    const res = await startPayment({
      kind, amount, item,
      customer: { name: 'Likya Misafiri', email: 'misafir@likya.app' },
    });
    setResult({ ok: res.ok, kind, ref: res.reference, msg: res.message });
  };

  const redeem = () => {
    const c = redeemDazeGiftCoupon(couponCode.trim().toUpperCase());
    if (c) {
      setResult({ ok: true, kind: 'sale', ref: c.code, msg: `🎁 Daze-Gift kuponu kullanıldı — ${c.discount} TL indirim tanımlandı (${c.reason === 'termal-koruma' ? 'termal koruma ikramı' : 'olağan'}).` });
    } else {
      setResult({ ok: false, kind: 'sale', ref: '', msg: 'Kupon bulunamadı veya zaten kullanılmış.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))', border: '1px solid rgba(0,242,254,0.3)', borderRadius: '16px', padding: '16px', boxShadow: '0 0 26px rgba(0,242,254,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>💳 Pazaryeri Ödeme Terminali</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Kiralama depozitosu • TBYB • satış — tek tıkla başlat</div>
        </div>
        <span style={{ fontSize: '9px', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', color: gateway === 'sandbox' ? '#fbbf24' : '#4ade80', background: gateway === 'sandbox' ? 'rgba(251,191,36,0.12)' : 'rgba(74,222,128,0.12)', border: `1px solid ${gateway === 'sandbox' ? 'rgba(251,191,36,0.4)' : 'rgba(74,222,128,0.4)'}` }}>
          {gateway === 'sandbox' ? '🟡 SANDBOX' : `🟢 ${gateway.toUpperCase()}`}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '8px' }}>
        <button onClick={() => pay('sale', 240, 'Yerel Ürün Sepeti (Kekik Balı + Peynir)')} style={btn}>🛒 Satın Al — 240 ₺</button>
        <button onClick={() => pay('rental-deposit', rentalDeposit(1200), 'Kamp Ekipmanı Kiralama Depozitosu')} style={btn}>⛺ Kiralama Depozitosu — {rentalDeposit(1200)} ₺ (%25)</button>
        <button onClick={() => pay('tbyb', tbybDeposit(450), 'Try-Before-You-Buy (Trekking Seti)')} style={btn}>🔄 TBYB Deneme — {tbybDeposit(450)} ₺ (%10)</button>
        <button onClick={() => { const c = issueDazeGiftCoupon(`O-${Date.now().toString().slice(-4)}`, 'termal-koruma'); setResult({ ok: true, kind: 'sale', ref: c.code, msg: `🎁 Daze-Gift ikram kuponu üretildi: ${c.code} (50 ₺) — 2dk termal koruma aşımı senaryosu.` }); }} style={btn}>🎁 Daze-Gift Kupon Üret</button>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="DG-XXXX kupon kodu" style={{ flex: 1, fontSize: '11px', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0' }} />
        <button onClick={redeem} style={{ ...btn, width: 'auto', padding: '0 16px' }}>Kullan</button>
      </div>

      {result && (
        <div style={{ background: result.ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${result.ok ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.35)'}`, borderRadius: '12px', padding: '10px 12px', fontSize: '11px', color: '#e2e8f0', lineHeight: 1.5 }}>
          <b>{result.ref}</b> — {result.msg}
        </div>
      )}
    </div>
  );
}

const btn: React.CSSProperties = {
  fontSize: '10px', fontWeight: 800, padding: '10px 8px', borderRadius: '10px', border: 'none', cursor: 'pointer',
  background: 'linear-gradient(135deg,#00f2fe,#4facfe)', color: '#0d1322', textAlign: 'center',
};
