'use client';

import React, { useState } from 'react';
import { Gift, QrCode, Send, Wallet, Sparkles, Users } from 'lucide-react';

// ============================================================================
// LİKYA ESPİRİLİ İKRAM / HEDİYE MEKANİZMASI
// Fiziksel mağaza / alt kiracı entegrasyonu + QR teslimat
// ============================================================================

interface GiftItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  description: string;
  cashbackRate: number;
}

interface GiftClaim {
  id: string;
  giftName: string;
  giftIcon: string;
  sender: string;
  qrCode: string;
  status: 'pending' | 'redeemed' | 'expired';
}

export default function GiftSystem() {
  const [gifts] = useState<GiftItem[]>([
    { id: '1', name: 'Maç Sonu Soğuk Su', price: 20, icon: '🧊', description: 'Maç sonrası serinletici soğuk su', cashbackRate: 10 },
    { id: '2', name: 'Teselli Kahvesi', price: 80, icon: '☕', description: 'Kaybeden takıma sıcak teselli kahvesi', cashbackRate: 10 },
    { id: '3', name: 'Şampiyonluk Yemeği', price: 250, icon: '🍕', description: 'Turnuva şampiyonuna kral yemeği', cashbackRate: 10 },
    { id: '4', name: 'Centilmenlik Çayı', price: 40, icon: '🍵', description: 'Centilmenlik ruhuna uygun sıcak çay', cashbackRate: 10 },
    { id: '5', name: 'Kupa Günü Limonata', price: 30, icon: '🍋', description: 'Kupa günü ferahlatıcı limonata', cashbackRate: 10 },
  ]);

  const [myGifts, setMyGifts] = useState<GiftClaim[]>([
    { id: '1', giftName: 'Teselli Kahvesi', giftIcon: '☕', sender: 'Ahmet', qrCode: 'LIKYA-GIFT-4821', status: 'pending' },
    { id: '2', giftName: 'Maç Sonu Soğuk Su', giftIcon: '🧊', sender: 'Can', qrCode: 'LIKYA-GIFT-7734', status: 'pending' },
  ]);

  const [balance, setBalance] = useState(500);
  const [tokenBalance, setTokenBalance] = useState(250);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [recipient, setRecipient] = useState('Mehmet');
  const [showQr, setShowQr] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([
    '🏀 Ahmet, turnuva maçından sonra Mehmet\'e "Teselli Kahvesi" ısmarladı! ☕',
    '🧊 Can, kaybeden takıma "Birer Soğuk Su" gönderdi! 🧊',
  ]);

  const sendGift = () => {
    if (!selectedGift) return;
    if (balance < selectedGift.price) return;

    // Bakiye düşümü
    setBalance((prev) => prev - selectedGift.price);

    // %10 Token Cashback
    const cashback = Math.floor(selectedGift.price * (selectedGift.cashbackRate / 100));
    setTokenBalance((prev) => prev + cashback);

    // QR kod üret
    const qrCode = `LIKYA-GIFT-${Math.floor(1000 + Math.random() * 9000)}`;

    // Hediyeyi alıcıya gönder
    setMyGifts((prev) => [
      { id: String(Date.now()), giftName: selectedGift.name, giftIcon: selectedGift.icon, sender: 'Sen', qrCode, status: 'pending' },
      ...prev,
    ]);

    // Sosyal akış duyurusu
    setNotifications((prev) => [
      `🎁 Sen, ${recipient}'e "${selectedGift.name}" gönderdin! ${selectedGift.icon} (Centilmenliğin için %${selectedGift.cashbackRate} Token kazandın! 🎁)`,
      ...prev,
    ]);

    setSelectedGift(null);
  };

  const redeemGift = (id: string) => {
    setMyGifts((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: 'redeemed' } : g))
    );
    setShowQr(null);
  };

  const formatTL = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gift size={20} color="#fbbf24" />
            Espirili İkram & Hediye
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Maç sonu soğuk su, teselli kahvesi, şampiyonluk yemeği...</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
            💰 {formatTL(balance)} ₺
          </div>
          <div style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#a78bfa', fontWeight: '600' }}>
            🎁 {tokenBalance} Token
          </div>
        </div>
      </div>

      {/* Sosyal Akış */}
      <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🔔 Espirili Sosyal Akış</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((n, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#cbd5e1', padding: '8px', background: 'rgba(15,23,42,0.6)', borderRadius: '8px' }}>
              {n}
            </div>
          ))}
        </div>
      </div>

      {/* Hediye Kataloğu */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🎁 Hediye Kataloğu</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {gifts.map((g) => (
            <div key={g.id} style={{ background: 'rgba(30,41,59,0.6)', border: selectedGift?.id === g.id ? '1px solid #fbbf24' : '1px solid rgba(51,65,85,0.5)', borderRadius: '12px', padding: '16px', cursor: 'pointer' }} onClick={() => setSelectedGift(g)}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{g.icon}</div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#f1f5f9' }}>{g.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{g.description}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#fbbf24' }}>{formatTL(g.price)} ₺</span>
                <span style={{ fontSize: '10px', color: '#34d399' }}>%{g.cashbackRate} Token</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gönderim Formu */}
      {selectedGift && (
        <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fbbf24', marginBottom: '12px' }}>
            {selectedGift.icon} {selectedGift.name} Gönder
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Alıcı adı"
              style={{ flex: 1, minWidth: '120px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}
            />
            <button
              onClick={sendGift}
              disabled={balance < selectedGift.price}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: 'none', background: balance >= selectedGift.price ? 'linear-gradient(135deg, #d97706, #fbbf24)' : 'rgba(148,163,184,0.3)', color: balance >= selectedGift.price ? '#000' : '#94a3b8', fontWeight: 'bold', fontSize: '13px', cursor: balance >= selectedGift.price ? 'pointer' : 'not-allowed' }}
            >
              <Send size={14} /> Gönder ({formatTL(selectedGift.price)} ₺)
            </button>
          </div>
          <div style={{ fontSize: '11px', color: '#34d399', marginTop: '8px' }}>
            💡 Centilmenliğin için %{selectedGift.cashbackRate} Token kazanacaksın! ({Math.floor(selectedGift.price * 0.1)} Token)
          </div>
        </div>
      )}

      {/* Hediyelerim / QR Kodlar */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🎟️ Hediyelerim / Dijital Kuponlarım</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {myGifts.map((g) => (
            <div key={g.id} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#f1f5f9' }}>{g.giftIcon} {g.giftName}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Gönderen: {g.sender}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: g.status === 'pending' ? 'rgba(251,191,36,0.2)' : 'rgba(52,211,153,0.2)', color: g.status === 'pending' ? '#fbbf24' : '#34d399', border: `1px solid ${g.status === 'pending' ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}` }}>
                    {g.status === 'pending' ? '⏳ Bekliyor' : '✅ Teslim Edildi'}
                  </span>
                  <button
                    onClick={() => setShowQr(showQr === g.id ? null : g.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #00f2fe', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    <QrCode size={12} /> QR Göster
                  </button>
                </div>
              </div>

              {/* QR Kod */}
              {showQr === g.id && (
                <div style={{ marginTop: '12px', padding: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,242,254,0.3)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>Kafeteryada QR kodunu göstererek ücretsiz alabilirsin</div>
                  <div style={{ width: '100px', height: '100px', margin: '0 auto', background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#000', fontFamily: 'monospace', padding: '4px', wordBreak: 'break-all' }}>
                    {g.qrCode}
                  </div>
                  <div style={{ fontSize: '12px', color: '#00f2fe', marginTop: '8px', fontWeight: 'bold' }}>{g.qrCode}</div>
                  <button
                    onClick={() => redeemGift(g.id)}
                    style={{ marginTop: '10px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10B981, #48bb78)', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    ✓ Teslim Aldım
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
