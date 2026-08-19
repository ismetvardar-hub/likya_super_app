'use client';

import React, { useState } from 'react';
import { startPayment } from '../lib/payment/paymentGatewayAdapter';
import { buildReceipt } from '../lib/finance/digitalReceiptGenerator';
import { orderPlaced, kitchenTimerTick } from '../lib/ops/dazeHubEventBus';

// ============================================================================
// 🖥️ AŞAMA 13 — DAZE VISION KIOSK MODE (dokunmatik ekran)
// Self-servis sipariş: sadeleştirilmiş kart + QR ödeme + anlık fiş çıktısı.
// CEOCommandCenter'a kiosk görünümü olarak bağlanır. Plan Z güvenli.
// ============================================================================

const KIOSK_MENU = [
  { id: 'levrek', icon: '🐟', name: 'Akdeniz Levrek Izgara', price: 240 },
  { id: 'pide', icon: '🥙', name: 'Köfte Ezmeli Pide', price: 180 },
  { id: 'salata', icon: '🥗', name: 'Likya Bahçe Salatası', price: 90 },
  { id: 'kofte', icon: '🍖', name: 'Izgara Köfte', price: 160 },
  { id: 'baklava', icon: '🍯', name: 'Fıstıklı Baklava', price: 85 },
  { id: 'ayran', icon: '🥛', name: 'Organik Ayran', price: 25 },
];

export default function DazeVisionKioskView() {
  const [selected, setSelected] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [receiptText, setReceiptText] = useState('');

  const item = KIOSK_MENU.find((m) => m.id === selected);
  const total = item ? item.price * qty : 0;

  const order = async () => {
    if (!item) return;
    setStatus('processing');
    const pay = await startPayment({ kind: 'sale', amount: total, item: item.name, customer: { name: 'Kiosk Misafiri', email: 'kiosk@likya.app' } });
    const orderId = `K-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    orderPlaced(orderId, item.name, total);
    kitchenTimerTick(orderId, 120);
    const receipt = buildReceipt({ kind: 'pos', reference: pay.reference, customer: 'Kiosk Misafiri', amountTl: total, item: item.name, vatRate: 0.2 });
    setReceiptText(receiptAsText(receipt));
    setStatus('success');
    setTimeout(() => { setStatus('idle'); setSelected(null); setQty(1); setReceiptText(''); }, 9000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 900, color: '#00f2fe', letterSpacing: '1px' }}>🖥️ DAZE VISION KIOSK</div>
        <div style={{ fontSize: '11px', color: '#64748b' }}>Dokunmatik self-servis • QR ödeme • anlık dijital fiş</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '10px' }}>
        {KIOSK_MENU.map((m) => (
          <button key={m.id} onClick={() => { setSelected(m.id); setStatus('idle'); }}
            style={{ padding: '16px 10px', borderRadius: '16px', cursor: 'pointer', fontSize: '13px', fontWeight: 800, color: '#fff',
              background: selected === m.id ? 'rgba(0,242,254,0.15)' : 'rgba(255,255,255,0.04)',
              border: selected === m.id ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: '28px' }}>{m.icon}</div>
            {m.name}
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#00f2fe', marginTop: '4px' }}>₺{m.price}</div>
          </button>
        ))}
      </div>

      {item && status !== 'success' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', padding: '14px' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{item.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={qBtn}>−</button>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#00f2fe' }}>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(9, q + 1))} style={qBtn}>+</button>
          </div>
          <div style={{ flex: 1, textAlign: 'right', fontSize: '18px', fontWeight: 900, color: '#4ade80' }}>₺{total}</div>
          <button onClick={() => void order()} disabled={status === 'processing'} style={{ fontSize: '14px', fontWeight: 900, padding: '12px 22px', borderRadius: '14px', border: 'none', cursor: status === 'processing' ? 'wait' : 'pointer', background: 'linear-gradient(135deg,#00f2fe,#4facfe)', color: '#0d1322' }}>
            {status === 'processing' ? '⏳ Ödeniyor...' : '📲 QR İLE ÖDE'}
          </button>
        </div>
      )}

      {status === 'success' && (
        <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.4)', borderRadius: '16px', padding: '16px', fontSize: '11px', color: '#4ade80', whiteSpace: 'pre-line', fontFamily: "'Courier New', monospace", lineHeight: 1.6 }}>
          {receiptText}
        </div>
      )}
    </div>
  );
}

function receiptAsText(r: { receiptNo: string; kind: string; reference: string; customer: string; item: string; netTl: number; vatTl: number; grossTl: number; qrData: string }): string {
  return [
    '🧾 LİKYA DAZE HUB — DİJİTAL FİŞ',
    `No: ${r.receiptNo} | ${r.kind.toUpperCase()}`,
    `Referans: ${r.reference}`,
    `Müşteri: ${r.customer}`,
    `Ürün: ${r.item}`,
    `Net: ₺${r.netTl.toFixed(2)} | KDV: ₺${r.vatTl.toFixed(2)}`,
    `Toplam: ₺${r.grossTl.toFixed(2)}`,
    `QR: ${r.qrData}`,
  ].join('\n');
}

const qBtn: React.CSSProperties = { width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '18px', cursor: 'pointer' };
