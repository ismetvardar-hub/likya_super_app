'use client';

import React, { useState } from 'react';
import { Home, ShoppingBag, Beef, Coffee, Truck, Percent, Wallet } from 'lucide-react';

// ============================================================================
// LİKYA ROOM ONLY (SADECE ODA) & YEME-İÇME EKOSİSTEMİ
// Konaklama = Sadece Oda + Likya Çarşı Mobil Sipariş Entegrasyonu
// ============================================================================

interface Accommodation {
  id: string;
  type: string;
  icon: string;
  name: string;
  price: number;
  guests: number;
  nights: number;
  status: 'booked' | 'checked_in';
}

interface CarsiShop {
  id: string;
  name: string;
  icon: string;
  category: string;
  commissionRate: number;
  orders: number;
  revenue: number;
}

interface CarsiOrder {
  id: string;
  shop: string;
  items: string;
  total: number;
  deliveryTo: string;
  status: 'preparing' | 'delivering' | 'delivered';
}

export default function RoomOnlyConcept() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([
    { id: '1', type: 'Karavan', icon: '🚐', name: 'Karavan Parkı A-12', price: 525, guests: 2, nights: 2, status: 'checked_in' },
    { id: '2', type: 'Çadır', icon: '⛺', name: 'Çadır Alanı B-04', price: 525, guests: 1, nights: 3, status: 'booked' },
    { id: '3', type: 'Bungalov', icon: '🏡', name: 'Bungalov C-07', price: 1050, guests: 2, nights: 1, status: 'checked_in' },
  ]);

  const [shops, setShops] = useState<CarsiShop[]>([
    { id: '1', name: 'Likya Kasap', icon: '🥩', category: 'Taze Et & Mangal Paketleri', commissionRate: 3, orders: 45, revenue: 12500 },
    { id: '2', name: 'Likya Manav & Market', icon: '🧺', category: 'Günlük Organik Ürünler', commissionRate: 2, orders: 68, revenue: 9800 },
    { id: '3', name: 'Likya Kafe & Restoran', icon: '☕', category: 'A la Carte', commissionRate: 5, orders: 32, revenue: 15600 },
  ]);

  const [orders, setOrders] = useState<CarsiOrder[]>([
    { id: '1', shop: 'Likya Kasap', items: '2 kg Pirzola, Mangal Kömürü, Çoban Salata Malzemesi', total: 850, deliveryTo: 'Karavan Parkı A-12', status: 'delivering' },
    { id: '2', shop: 'Likya Kafe & Restoran', items: '2x Türk Kahvesi, 1x Limonata', total: 180, deliveryTo: 'Bungalov C-07', status: 'preparing' },
  ]);

  const [commissionTotal, setCommissionTotal] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([
    '🥩 Likya Kasap: 2 kg Pirzola siparişi Karavan Parkı A-12\'ye teslim ediliyor!',
  ]);

  // Likya Çarşı siparişi
  const placeOrder = (shopId: string) => {
    const shop = shops.find((s) => s.id === shopId);
    if (!shop) return;

    const orderTotal = 500;
    const commission = orderTotal * (shop.commissionRate / 100);

    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, orders: s.orders + 1, revenue: s.revenue + orderTotal } : s))
    );
    setCommissionTotal((prev) => prev + commission);

    setOrders((prev) => [
      { id: String(Date.now()), shop: shop.name, items: 'Mangal Paketi + İçecekler', total: orderTotal, deliveryTo: 'Konaklama Alanı', status: 'preparing' },
      ...prev,
    ]);

    setNotifications((prev) => [
      `🛒 ${shop.name} sipariş alındı! (${orderTotal} ₺) %${shop.commissionRate} komisyon (${commission} ₺) Likya Hub'a işlendi`,
      ...prev,
    ]);
  };

  const formatTL = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Home size={20} color="#00f2fe" />
            Room Only — Sadece Oda & Likya Çarşı
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Sıfır mutfak maliyeti • 16 dükkan entegrasyonu • QR sipariş</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
            💰 Konaklama: {formatTL(accommodations.reduce((s, a) => s + a.price * a.nights, 0))} ₺
          </div>
          <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>
            📈 Çarşı Komisyon: {formatTL(commissionTotal)} ₺
          </div>
        </div>
      </div>

      {/* Konaklama Etiketi */}
      <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.2)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#00f2fe', marginBottom: '12px' }}>🏡 Konaklama (Room Only)</h3>
        <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '12px' }}>
          🏡 "Sadece Oda (Room Only)" | 🍳 "Yeme-İçme Tesis İçi Çarşıda"
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {accommodations.map((a) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{a.icon} {a.name}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{a.type} • {a.guests} kişi • {a.nights} gece</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#00f2fe', fontWeight: '600' }}>{formatTL(a.price * a.nights)} ₺</span>
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.3)' }}>
                  🏡 Sadece Oda
                </span>
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                  🍳 Çarşıda
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Likya Çarşı */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🛍️ Likya Çarşı — Tesis İçi Ticari İşletmeler</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {shops.map((s) => (
            <div key={s.id} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{s.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{s.category}</div>
              <div style={{ fontSize: '11px', color: '#00f2fe', marginTop: '4px' }}>Komisyon: %{s.commissionRate}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{s.orders} sipariş • {formatTL(s.revenue)} ₺ ciro</div>
              <button onClick={() => placeOrder(s.id)} style={{ marginTop: '8px', width: '100%', padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                🛒 Sipariş Ver
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Aktif Siparişler */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🚚 Aktif Çarşı Siparişleri</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {orders.map((o) => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{o.shop}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{o.items}</div>
                <div style={{ fontSize: '11px', color: '#00f2fe', marginTop: '4px' }}>📍 {o.deliveryTo}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>{formatTL(o.total)} ₺</span>
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: o.status === 'delivering' ? 'rgba(0,242,254,0.1)' : 'rgba(251,191,36,0.1)', color: o.status === 'delivering' ? '#00f2fe' : '#fbbf24', border: `1px solid ${o.status === 'delivering' ? 'rgba(0,242,254,0.3)' : 'rgba(251,191,36,0.3)'}` }}>
                  {o.status === 'delivering' ? '🚚 Teslim Ediliyor' : '🍳 Hazırlanıyor'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bildirimler */}
      <div style={{ padding: '16px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🔔 Likya Hub Bildirimleri</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((n, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#cbd5e1', padding: '8px', background: 'rgba(15,23,42,0.6)', borderRadius: '8px' }}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
