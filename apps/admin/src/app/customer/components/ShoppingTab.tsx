'use client';

import React from 'react';

export default function ShoppingTab() {
  const products = [
    { id: 't1', title: 'Naturehike Cloud Up 2 Kişilik Çadır', price: 4850, rating: '⭐ 4.9 (128)', badge: 'Hızlı Teslimat ⚡', icon: '🏕️' },
    { id: 't2', title: 'Toros E-Bike 750W Katlanır Dağ Bisikleti', price: 34900, rating: '⭐ 4.8 (42)', badge: 'Üretici Garantili 🛡️', icon: '🚴' },
    { id: 't3', title: 'EcoFlow 100W Esnek Güneş Paneli', price: 7200, rating: '⭐ 5.0 (64)', badge: 'Güneş Kampüsü ☀️', icon: '⚡' },
    { id: 't4', title: 'Stanley Adventure Vakumlu Termos 1.4L', price: 1850, rating: '⭐ 4.9 (310)', badge: 'Çok Satan 🔥', icon: '☕' },
  ];

  return (
    <>
      {/* Alışveriş Banner */}
      <div style={{ background: 'linear-gradient(135deg, #f27a1a, #e65100)', borderRadius: '16px', padding: '14px', color: '#fff' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>🟠 LİKYA SIFIR EKİPMAN & DOĞA MARKETİ</div>
        <div style={{ fontSize: '16px', fontWeight: '900', marginTop: '2px' }}>Üreticiden 0-Km Kamp & Karavan Ekipmanları</div>
        <div style={{ fontSize: '10px', opacity: 0.9, marginTop: '2px' }}>Orijinal Üretici Garantili • Hızlı Kargo veya Kampüsten Teslim</div>
      </div>

      {/* Kategori Hapları */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['Tümü', '🏕️ Çadır & Mat', '🚴 E-Bike', '⚡ Güneş Paneli', '🍳 Kamp Mutfağı', '🎒 Çanta'].map((cat, idx) => (
          <span key={idx} style={{ padding: '6px 10px', borderRadius: '20px', background: idx === 0 ? '#f27a1a' : 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
            {cat}
          </span>
        ))}
      </div>

      {/* Ürün Listesi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {products.map((item) => (
          <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '36px', textAlign: 'center', margin: '4px 0' }}>{item.icon}</div>
              <div style={{ fontSize: '9px', color: '#f27a1a', fontWeight: 'bold' }}>{item.badge}</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', marginTop: '2px', lineHeight: '1.3' }}>{item.title}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{item.rating}</div>
            </div>
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#00f2fe' }}>₺{item.price.toLocaleString()}</div>
              <button
                onClick={() => alert(`"${item.title}" sepetinize eklendi!`)}
                style={{ marginTop: '6px', width: '100%', background: '#f27a1a', border: 'none', color: '#fff', padding: '6px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Sepete Ekle
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
