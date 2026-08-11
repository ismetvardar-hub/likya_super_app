'use client';

import React from 'react';

interface FoodTabProps {
  cart: Array<{ id: string; name: string; price: number; qty: number }>;
  addToCart: (dish: { id: string; name: string; price: number }) => void;
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  setCart: React.Dispatch<React.SetStateAction<Array<any>>>;
}

export default function FoodTab({ cart, addToCart, walletBalance, setWalletBalance, setCart }: FoodTabProps) {
  const dishes = [
    { id: 'f1', name: 'Likya Köy Kahvaltı Tabağı (Organik)', desc: 'Toros zeytinyağı, keçi peyniri, köy yumurtası, adaçayı', price: 180, shop: 'Sedir Cafe (D-03)', icon: '🍳' },
    { id: 'f2', name: 'Odun Ateşinde Gurme Burger & Patates', desc: '%100 yerli dana eti, füme peynir, trüflü mayonez', price: 240, shop: 'Bistro & Grill (D-05)', icon: '🍔' },
    { id: 'f3', name: 'Taze Sıkılmış Toros Narenciye & Detox', desc: 'Portakal, nar, zencefil ve taze nane', price: 75, shop: 'Doğa Marketi (D-01)', icon: '🍹' },
  ];

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #e53e3e, #dd6b20)', borderRadius: '16px', padding: '14px', color: '#fff' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold' }}>🍔 LİKYA KAMPÜS RESTORAN & KAFELERİ</div>
        <div style={{ fontSize: '16px', fontWeight: '900', marginTop: '2px' }}>Sedir Cafe, Bistro & Gurme Lezzetler</div>
        <div style={{ fontSize: '10px', opacity: 0.9, marginTop: '2px' }}>Karavanınıza, Parselinize veya Amfitiyatroya Sıcak Teslimat</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {dishes.map((dish) => (
          <div key={dish.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ fontSize: '32px' }}>{dish.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{dish.name}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>{dish.desc}</div>
              <div style={{ fontSize: '9px', color: '#ff6000', fontWeight: 'bold', marginTop: '2px' }}>{dish.shop}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#48bb78' }}>₺{dish.price}</div>
              <button
                onClick={() => addToCart(dish)}
                style={{ marginTop: '4px', background: '#ff6000', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                + Ekle
              </button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{ background: 'rgba(255, 96, 0, 0.15)', border: '1px solid #ff6000', borderRadius: '14px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>🛒 Sepet Toplamı ({cart.reduce((s, i) => s + i.qty, 0)} Ürün):</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#48bb78' }}>₺{cartTotal}</span>
          </div>
          <button
            onClick={() => {
              if (walletBalance >= cartTotal) {
                setWalletBalance(prev => prev - cartTotal);
                setCart([]);
                alert(`₺${cartTotal} tutarındaki siparişiniz alındı! Otonom servis aracımız parselinize getiriyor.`);
              } else {
                alert('Yetersiz bakiye! Lütfen cüzdanınıza bakiye yükleyin.');
              }
            }}
            style={{ marginTop: '8px', width: '100%', background: '#ff6000', border: 'none', color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Likya Pay ile Siparişi Onayla (₺{cartTotal})
          </button>
        </div>
      )}
    </>
  );
}
