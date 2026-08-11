'use client';

import React, { useState } from 'react';

// 16 Dükkan Verisi
const SHOPS = [
  { id: 'D-01', name: 'Migros Kampüs Market', category: 'Gıda & Market', icon: '🛒', dailyTurnover: '₺18,450', orders: 42 },
  { id: 'D-02', name: 'Likya Outdoor & E-Bike', category: 'Spor & Ekipman', icon: '🚲', dailyTurnover: '₺12,200', orders: 28 },
  { id: 'D-03', name: 'Padel Pro Shop', category: 'Spor & Ekipman', icon: '🎾', dailyTurnover: '₺8,900', orders: 19 },
  { id: 'D-04', name: 'Fırın & Kafe', category: 'Yeme & İçme', icon: '🥐', dailyTurnover: '₺9,750', orders: 55 },
  { id: 'D-05', name: 'Sedir Bistro', category: 'Yeme & İçme', icon: '🍽️', dailyTurnover: '₺16,800', orders: 61 },
  { id: 'D-06', name: 'Doğa Organik Market', category: 'Gıda & Market', icon: '🥬', dailyTurnover: '₺7,300', orders: 24 },
  { id: 'D-07', name: 'Upcycling Lab & Atölye', category: 'Hizmet', icon: '🛠️', dailyTurnover: '₺4,200', orders: 12 },
  { id: 'D-08', name: 'Pod-Ofis Coworking', category: 'Hizmet', icon: '💼', dailyTurnover: '₺4,500', orders: 15 },
  { id: 'D-09', name: 'Karavan Aksesuar Showroom', category: 'Showroom', icon: '🚐', dailyTurnover: '₺11,600', orders: 9 },
  { id: 'D-10', name: 'Tiny House Galeri', category: 'Showroom', icon: '🏡', dailyTurnover: '₺14,300', orders: 6 },
  { id: 'D-11', name: 'Sauna & Ice Bath Lounge', category: 'Spor & Wellness', icon: '🧖', dailyTurnover: '₺6,100', orders: 33 },
  { id: 'D-12', name: 'Kamp Ekipman Kiralama', category: 'Spor & Ekipman', icon: '⛺', dailyTurnover: '₺5,800', orders: 21 },
  { id: 'D-13', name: 'Amfitiyatro Bilet Gişesi', category: 'Etkinlik', icon: '🎟️', dailyTurnover: '₺13,400', orders: 47 },
  { id: 'D-14', name: 'Eco-Tech Enerji Mağazası', category: 'Teknoloji', icon: '🔋', dailyTurnover: '₺9,900', orders: 17 },
  { id: 'D-15', name: 'Doğa Kitabevi & Kafe', category: 'Kültür', icon: '📚', dailyTurnover: '₺3,800', orders: 26 },
  { id: 'D-16', name: 'Sporcu Beslenme Bar', category: 'Yeme & İçme', icon: '🥤', dailyTurnover: '₺7,700', orders: 38 },
];

// Canlı Gelen Siparişler
const INITIAL_ORDERS = [
  { id: 'SIP-1042', shop: 'D-01', customer: 'Ayşe K.', items: 'Süt, Ekmek, Yumurta', total: '₺185.50', status: 'Yeni' },
  { id: 'SIP-1041', shop: 'D-03', customer: 'Mehmet T.', items: 'Padel Raketi Pro', total: '₺2,450.00', status: 'Yeni' },
  { id: 'SIP-1040', shop: 'D-05', customer: 'Zeynep A.', items: '2x Sedir Burger, Ayran', total: '₺420.00', status: 'Hazırlanıyor' },
  { id: 'SIP-1039', shop: 'D-02', customer: 'Can D.', items: 'E-Bike 1 Saat Kiralama', total: '₺210.00', status: 'Yeni' },
  { id: 'SIP-1038', shop: 'D-13', customer: 'Elif S.', items: '2x Stand-Up Bileti', total: '₺300.00', status: 'Teslim Edildi' },
  { id: 'SIP-1037', shop: 'D-04', customer: 'Burak Y.', items: '4x Simit, 4x Çay', total: '₺160.00', status: 'Hazırlanıyor' },
];

// Stok Verileri
const INITIAL_STOCK = [
  { id: 'STK-01', shop: 'D-01', product: 'Organik Süt (1L)', stock: 24, price: '₺42.00', inStock: true },
  { id: 'STK-02', shop: 'D-01', product: 'Köy Yumurtası (10lu)', stock: 8, price: '₺95.00', inStock: true },
  { id: 'STK-03', shop: 'D-03', product: 'Padel Topu (3lü)', stock: 0, price: '₺180.00', inStock: false },
  { id: 'STK-04', shop: 'D-05', product: 'Sedir Burger', stock: 32, price: '₺185.00', inStock: true },
  { id: 'STK-05', shop: 'D-02', product: 'E-Bike (Adet)', stock: 6, price: '₺3.50/dk', inStock: true },
  { id: 'STK-06', shop: 'D-04', product: 'Taze Simit', stock: 0, price: '₺15.00', inStock: false },
];

type OrderStatus = 'Yeni' | 'Hazırlanıyor' | 'Teslim Edildi';

export default function TenantManagementPanel() {
  const [selectedShop, setSelectedShop] = useState(SHOPS[0]);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [stock, setStock] = useState(INITIAL_STOCK);

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const toggleStock = (stockId: string) => {
    setStock(stock.map(s => s.id === stockId ? { ...s, inStock: !s.inStock } : s));
  };

  const updateStockQty = (stockId: string, delta: number) => {
    setStock(stock.map(s => s.id === stockId ? { ...s, stock: Math.max(0, s.stock + delta) } : s));
  };

  const statusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Yeni': return { bg: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe' };
      case 'Hazırlanıyor': return { bg: 'rgba(236, 201, 75, 0.15)', color: '#ecc94b' };
      case 'Teslim Edildi': return { bg: 'rgba(72, 187, 120, 0.15)', color: '#48bb78' };
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#070b14', color: '#f8fafc', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* ÜST BAŞLIK */}
      <header
        style={{
          background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.7), rgba(0, 242, 254, 0.2))',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          borderRadius: '24px',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🔵</span>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px', color: '#fff' }}>
                KİRACI YÖNETİM PANELİ
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>
                16 Dükkan • Canlı Sipariş • Stok Takibi • Günlük Ciro
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ padding: '8px 14px', background: 'rgba(72, 187, 120, 0.15)', color: '#48bb78', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            🟢 16/16 Dükkan Aktif
          </span>
          <span style={{ padding: '8px 14px', background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            📊 Toplam Ciro: ₺154,700
          </span>
        </div>
      </header>

      {/* DÜKKAN SEÇİCİ */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '14px' }}>
          🏪 DÜKKAN SEÇİCİ (16 Dükkan)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
          {SHOPS.map((shop) => {
            const isSelected = selectedShop.id === shop.id;
            return (
              <button
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: isSelected ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.08)',
                  background: isSelected ? 'linear-gradient(135deg, rgba(15, 76, 129, 0.6), rgba(0, 242, 254, 0.2))' : 'rgba(255,255,255,0.02)',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 15px rgba(0, 242, 254, 0.2)' : 'none',
                }}
              >
                <div style={{ fontSize: '18px' }}>{shop.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>{shop.name}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{shop.id} • {shop.category}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEÇİLİ DÜKKAN ÖZETİ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>SEÇİLİ DÜKKAN</div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginTop: '6px' }}>{selectedShop.icon} {selectedShop.name}</div>
          <div style={{ fontSize: '11px', color: '#00f2fe', marginTop: '4px' }}>{selectedShop.id} • {selectedShop.category}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>GÜNLÜK CİRO</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#48bb78', marginTop: '6px' }}>{selectedShop.dailyTurnover}</div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Kampüs Payı: %10 (₺{Math.round(parseInt(selectedShop.dailyTurnover.replace(/[₺,]/g, '')) * 0.1).toLocaleString('tr-TR')})</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>BUGÜNKÜ SİPARİŞ</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#00f2fe', marginTop: '6px' }}>{selectedShop.orders}</div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Ortalama Sepet: ₺{Math.round(parseInt(selectedShop.dailyTurnover.replace(/[₺,]/g, '')) / selectedShop.orders).toLocaleString('tr-TR')}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>STOK DURUMU</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#ecc94b', marginTop: '6px' }}>{stock.filter(s => s.shop === selectedShop.id).length} Ürün</div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>{stock.filter(s => s.shop === selectedShop.id && s.inStock).length} Stokta • {stock.filter(s => s.shop === selectedShop.id && !s.inStock).length} Tükendi</div>
        </div>
      </div>

      {/* CANLI GELEN SİPARİŞLER */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
              🔔 CANLI GELEN SİPARİŞLER
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Yeni siparişleri onaylayın, hazırlanma ve teslim durumlarını güncelleyin.</p>
          </div>
          <span style={{ padding: '6px 12px', background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
            {orders.filter(o => o.status === 'Yeni').length} Yeni Sipariş
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((order) => {
            const sc = statusColor(order.status as OrderStatus);
            return (
              <div key={order.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{order.id}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{order.shop}</span>
                    <span style={{ padding: '3px 8px', background: sc.bg, color: sc.color, borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>{order.status}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
                    👤 {order.customer} • {order.items}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#48bb78' }}>{order.total}</span>
                  {order.status === 'Yeni' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Hazırlanıyor')}
                      style={{ background: '#ecc94b', color: '#000', border: 'none', padding: '8px 12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
                    >
                      ✅ Onayla
                    </button>
                  )}
                  {order.status === 'Hazırlanıyor' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Teslim Edildi')}
                      style={{ background: '#48bb78', color: '#000', border: 'none', padding: '8px 12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
                    >
                      📦 Teslim Et
                    </button>
                  )}
                  {order.status === 'Teslim Edildi' && (
                    <span style={{ fontSize: '11px', color: '#48bb78', fontWeight: 'bold' }}>✓ Tamamlandı</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HIZLI STOK GÜNCELLEME TABLOSU */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
              📦 HIZLI STOK GÜNCELLEME
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Ürün stok adedini güncelleyin ve Stokta Var/Yok durumunu değiştirin.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {stock.map((item) => (
            <div key={item.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ minWidth: '200px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{item.product}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.id} • {item.shop}</div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#00f2fe' }}>{item.price}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => updateStockQty(item.id, -1)}
                  style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  −
                </button>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: item.stock === 0 ? '#e07a5f' : '#fff', minWidth: '24px', textAlign: 'center' }}>
                  {item.stock}
                </span>
                <button
                  onClick={() => updateStockQty(item.id, 1)}
                  style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  +
                </button>
              </div>
              <button
                onClick={() => toggleStock(item.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  cursor: 'pointer',
                  background: item.inStock ? 'rgba(72, 187, 120, 0.2)' : 'rgba(224, 122, 95, 0.2)',
                  color: item.inStock ? '#48bb78' : '#e07a5f',
                  border: `1px solid ${item.inStock ? '#48bb78' : '#e07a5f'}`,
                }}
              >
                {item.inStock ? '✓ Stokta Var' : '✗ Stokta Yok'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
