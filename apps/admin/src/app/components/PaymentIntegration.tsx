'use client';

import { useState } from 'react';
import { startPayment, detectPaymentGateway } from '../lib/payment/paymentGatewayAdapter';

// ============================================================================
// LİKYA ÖDEME ENTEGRASYONU (iyzico / PayTR / POS)
// Faz 1→Prod: simüle ödeme KALDIRILDI; paymentGatewayAdapter üzerinden sunucu
// proxy (/api/v1/payment) çağrılır; secret yoksa güvenli Sandbox Test Modu.
// ============================================================================

type PaymentMethod = 'iyzico' | 'paytr' | 'pos';

export default function PaymentIntegration() {
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('iyzico');
  const [amount, setAmount] = useState('250.00');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [transactionId, setTransactionId] = useState('');
  const [modeLabel, setModeLabel] = useState('');

  const gateway = detectPaymentGateway();

  const handlePayment = async () => {
    if (!amount || !customerName || !customerEmail) {
      setPaymentStatus('error');
      return;
    }
    setPaymentStatus('processing');
    setTransactionId('');
    try {
      const res = await startPayment({
        kind: 'sale',
        amount: Number(amount),
        item: activeMethod === 'pos' ? 'Fiziksel POS satışı' : `${activeMethod.toUpperCase()} satışı`,
        customer: { name: customerName, email: customerEmail },
        installment: activeMethod === 'iyzico' ? 3 : 1,
      });
      if (res.ok) {
        setPaymentStatus('success');
        setTransactionId(res.reference);
        setModeLabel(res.mode === 'sandbox' ? 'sandbox-simülasyon' : `canlı-${res.gateway}`);
        if (res.checkoutUrl) window.open(res.checkoutUrl, '_blank');
      } else {
        setPaymentStatus('error');
      }
    } catch {
      setPaymentStatus('error');
    }
  };

  const methods: { id: PaymentMethod; name: string; desc: string }[] = [
    { id: 'iyzico', name: 'iyzico', desc: 'Kredi kartı, sanal POS, taksit' },
    { id: 'paytr', name: 'PayTR', desc: 'Sanal POS, havale, cüzdan' },
    { id: 'pos', name: 'Fiziksel POS', desc: 'Dükkanlarda QR ile tahsilat' },
  ];

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>💳</span>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#e2e8f0' }}>Ödeme Entegrasyonu</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>iyzico / PayTR / POS — Faz 1 Kritik Entegrasyon</div>
        </div>
      </div>

      {/* Method Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMethod(m.id)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: activeMethod === m.id ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.15)',
              background: activeMethod === m.id ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.05)',
              color: activeMethod === m.id ? '#00f2fe' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Payment Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Tutar (₺)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '14px',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Müşteri Adı</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Ad Soyad"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '14px',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Müşteri E-posta</label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="ornek@email.com"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '14px',
            }}
          />
        </div>

        <button
          onClick={handlePayment}
          disabled={paymentStatus === 'processing'}
          style={{
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            background: paymentStatus === 'success' ? 'rgba(72,187,120,0.2)' : 'linear-gradient(135deg, #0f4c81, #00f2fe)',
            color: paymentStatus === 'success' ? '#48bb78' : '#fff',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: paymentStatus === 'processing' ? 'not-allowed' : 'pointer',
            opacity: paymentStatus === 'processing' ? 0.6 : 1,
          }}
        >
          {paymentStatus === 'processing' ? '⏳ Ödeme İşleniyor...' : paymentStatus === 'success' ? '✓ Ödeme Başarılı' : `💳 ${activeMethod.toUpperCase()} ile Ödeme Al`}
        </button>

        {paymentStatus === 'success' && (
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(72,187,120,0.1)', border: '1px solid rgba(72,187,120,0.3)', color: '#48bb78', fontSize: '12px' }}>
            ✅ Ödeme başarıyla alındı!
            <br />
            İşlem No: <strong>{transactionId}</strong>
            <br />
            Tutar: <strong>{amount} ₺</strong>
            <br />
            Yöntem: <strong>{activeMethod.toUpperCase()}</strong>
            {modeLabel && (
              <>
                <br />
                Mod: <strong style={{ color: modeLabel.startsWith('canlı') ? '#4ade80' : '#fbbf24' }}>{modeLabel}</strong>
              </>
            )}
          </div>
        )}

        {paymentStatus === 'error' && (
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(224,122,95,0.1)', border: '1px solid rgba(224,122,95,0.3)', color: '#e07a5f', fontSize: '12px' }}>
            ⚠️ Lütfen tüm alanları doldurun.
          </div>
        )}
      </div>
    </div>
  );
}
