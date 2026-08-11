'use client';

import React, { useState } from 'react';
import { Store, Star, Tag, TrendingUp, ShoppingCart, Truck, BadgeCheck, Filter, Shield, RefreshCw, Package } from 'lucide-react';

// ============================================================================
// LİKYA KÜLTÜR, BİLİM, SANAT & 2. EL PHYGITAL PAZARYERİ
// B2C (Sıfır & Deneyimlenebilir) + C2C (2. El Dolap Pazarı)
// ============================================================================

interface Product {
  id: string;
  name: string;
  icon: string;
  category: string;
  brand: string;
  dailyRental: number;
  salePrice: number;
  commissionRate: number;
  rating: number;
  reviews: number;
  rentalCount: number;
  saleCount: number;
  verified: boolean;
  type: 'new' | 'secondhand';
  delivery: 'store' | 'cargo';
}

export default function LikyaMarketplace() {
  const [segment, setSegment] = useState<'new' | 'secondhand'>('new');
  const [category, setCategory] = useState('all');
  const [rentalRevenue, setRentalRevenue] = useState(0);
  const [commissionRevenue, setCommissionRevenue] = useState(0);
  const [secondhandRevenue, setSecondhandRevenue] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([
    '🏠 Tiny House 20m² tesiste 45 kez kiralandı, 3 satışa dönüştü!',
  ]);

  const [products, setProducts] = useState<Product[]>([
    // B2C Sıfır Ürünler
    { id: '1', name: 'Tiny House 20m²', icon: '🏠', category: 'Outdoor & Spor', brand: 'TinyLife', dailyRental: 350, salePrice: 850000, commissionRate: 6, rating: 4.9, reviews: 128, rentalCount: 45, saleCount: 3, verified: true, type: 'new', delivery: 'store' },
    { id: '2', name: 'Karavan 6m', icon: '🚐', category: 'Outdoor & Spor', brand: 'CaravanPro', dailyRental: 250, salePrice: 650000, commissionRate: 6, rating: 4.8, reviews: 96, rentalCount: 38, saleCount: 2, verified: true, type: 'new', delivery: 'store' },
    { id: '3', name: 'Dağ Bisikleti', icon: '🚵', category: 'Outdoor & Spor', brand: 'BikeX', dailyRental: 40, salePrice: 12000, commissionRate: 5, rating: 4.7, reviews: 210, rentalCount: 120, saleCount: 15, verified: true, type: 'new', delivery: 'store' },
    { id: '4', name: 'Elektro Gitar', icon: '🎸', category: 'Müzik', brand: 'Fender', dailyRental: 60, salePrice: 15000, commissionRate: 7, rating: 4.8, reviews: 45, rentalCount: 20, saleCount: 4, verified: true, type: 'new', delivery: 'store' },
    { id: '5', name: 'Teleskop 130mm', icon: '🔭', category: 'Bilim & Teknoloji', brand: 'Celestron', dailyRental: 50, salePrice: 8000, commissionRate: 7, rating: 4.9, reviews: 32, rentalCount: 15, saleCount: 2, verified: true, type: 'new', delivery: 'store' },
    { id: '6', name: 'Seramik Seti', icon: '🎨', category: 'Sanat', brand: 'ArtPro', dailyRental: 20, salePrice: 1500, commissionRate: 5, rating: 4.6, reviews: 28, rentalCount: 12, saleCount: 3, verified: true, type: 'new', delivery: 'store' },
    // C2C 2. El Ürünler
    { id: '7', name: '2. El Dağ Bisikleti', icon: '🚲', category: 'Outdoor & Spor', brand: 'Kullanıcı: Can', dailyRental: 0, salePrice: 4500, commissionRate: 10, rating: 4.5, reviews: 8, rentalCount: 0, saleCount: 1, verified: false, type: 'secondhand', delivery: 'store' },
    { id: '8', name: '2. El Akustik Gitar', icon: '🎸', category: 'Müzik', brand: 'Kullanıcı: Elif', dailyRental: 0, salePrice: 2800, commissionRate: 10, rating: 4.7, reviews: 12, rentalCount: 0, saleCount: 2, verified: false, type: 'secondhand', delivery: 'cargo' },
    { id: '9', name: '2. El Robotik Kit', icon: '🤖', category: 'Bilim & Teknoloji', brand: 'Kullanıcı: Mehmet', dailyRental: 0, salePrice: 1200, commissionRate: 8, rating: 4.4, reviews: 5, rentalCount: 0, saleCount: 1, verified: false, type: 'secondhand', delivery: 'store' },
    { id: '10', name: '2. El Resim Seti', icon: '🖌️', category: 'Sanat', brand: 'Kullanıcı: Zeynep', dailyRental: 0, salePrice: 800, commissionRate: 8, rating: 4.6, reviews: 6, rentalCount: 0, saleCount: 1, verified: false, type: 'secondhand', delivery: 'cargo' },
  ]);

  const categories = ['all', 'Outdoor & Spor', 'Müzik', 'Sanat', 'Bilim & Teknoloji'];

  const filteredProducts = products.filter((p) =>
    p.type === segment && (category === 'all' || p.category === category)
  );

  // B2C Kiralama (Tesise %100)
  const rentProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, rentalCount: p.rentalCount + 1 } : p))
    );
    setRentalRevenue((prev) => prev + product.dailyRental);

    setNotifications((prev) => [
      `🎪 ${product.name} kiralandı! (${product.dailyRental} ₺/gün) Kiralama geliri %100 tesise`,
      ...prev,
    ]);
  };

  // B2C Satın Al (Komisyon %5-8)
  const buyProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const commission = product.salePrice * (product.commissionRate / 100);

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, saleCount: p.saleCount + 1 } : p))
    );
    setCommissionRevenue((prev) => prev + commission);

    setNotifications((prev) => [
      `🛒 ${product.name} satın alındı! (${product.salePrice} ₺) %${product.commissionRate} komisyon (${commission} ₺) Likya Hub'a işlendi`,
      ...prev,
    ]);
  };

  // C2C 2. El Satın Al (Komisyon %8-12, Güvenli Ödeme)
  const buySecondhand = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const commission = product.salePrice * (product.commissionRate / 100);

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, saleCount: p.saleCount + 1 } : p))
    );
    setSecondhandRevenue((prev) => prev + commission);

    setNotifications((prev) => [
      `🛡️ ${product.name} satın alındı! (${product.salePrice} ₺) Para Likya Havuz Hesabı'nda blokede. Alıcı onaylayınca satıcıya aktarılacak. %${product.commissionRate} komisyon (${commission} ₺)`,
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
            <Store size={20} color="#fbbf24" />
            Likya Kültür, Bilim, Sanat & 2. El Phygital Pazaryeri
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>B2C Sıfır + C2C 2. El Dolap Pazarı</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
            💰 Kiralama: {formatTL(rentalRevenue)} ₺
          </div>
          <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>
            📈 B2C Komisyon: {formatTL(commissionRevenue)} ₺
          </div>
          <div style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#a78bfa', fontWeight: '600' }}>
            🔄 C2C Komisyon: {formatTL(secondhandRevenue)} ₺
          </div>
        </div>
      </div>

      {/* Segment Anahtarı */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setSegment('new')}
          style={{ padding: '10px 16px', borderRadius: '10px', border: segment === 'new' ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.15)', background: segment === 'new' ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.05)', color: segment === 'new' ? '#00f2fe' : '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
        >
          🆕 Sıfır & Deneyimlenebilir
        </button>
        <button
          onClick={() => setSegment('secondhand')}
          style={{ padding: '10px 16px', borderRadius: '10px', border: segment === 'secondhand' ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.15)', background: segment === 'secondhand' ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.05)', color: segment === 'secondhand' ? '#a78bfa' : '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
        >
          🔄 2. El Dolap Pazarı
        </button>
      </div>

      {/* Kategori Filtresi */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: category === c ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.15)', background: category === c ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.05)', color: category === c ? '#fbbf24' : '#94a3b8', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
          >
            {c === 'all' ? 'Tümü' : c}
          </button>
        ))}
      </div>

      {/* Ürün Kataloğu */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {filteredProducts.map((p) => (
            <div key={p.id} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '28px' }}>{p.icon}</div>
                <div style={{ display: 'flex', gap: '4px', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {p.type === 'new' ? (
                    <>
                      <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.3)' }}>
                        🏷️ Tesiste Deneyimlenebilir
                      </span>
                      <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                        📉 %{p.commissionRate} Düşük Komisyon
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
                        {p.delivery === 'store' ? '🏷️ Tesiste Görüp Deneyebilirsin' : '📦 Kargo İle Hemen Teslim'}
                      </span>
                      <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                        🛡️ Likya Güvenli Alışveriş Koruması
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#f1f5f9', marginTop: '8px' }}>{p.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{p.brand} • {p.category}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <Star size={12} color="#fbbf24" fill="#fbbf24" />
                <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>{p.rating}</span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>({p.reviews} Deneyimci Yorumu)</span>
                {p.verified && <BadgeCheck size={12} color="#00f2fe" />}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                {p.type === 'new' ? (
                  <>
                    <span style={{ fontSize: '12px', color: '#00f2fe', fontWeight: '600' }}>Kira: {formatTL(p.dailyRental)} ₺/gün</span>
                    <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>Satış: {formatTL(p.salePrice)} ₺</span>
                  </>
                ) : (
                  <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: '700' }}>{formatTL(p.salePrice)} ₺</span>
                )}
              </div>
              {p.type === 'new' && (
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                  {p.rentalCount} kez kiralandı • {p.saleCount} satışa dönüştü
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                {p.type === 'new' ? (
                  <>
                    <button onClick={() => rentProduct(p.id)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                      🎪 Kirala
                    </button>
                    <button onClick={() => buyProduct(p.id)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #d97706, #fbbf24)', color: '#000', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                      🛒 Satın Al
                    </button>
                  </>
                ) : (
                  <button onClick={() => buySecondhand(p.id)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #6d28d9, #a78bfa)', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                    🛡️ Güvenli Satın Al
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bildirimler */}
      <div style={{ padding: '16px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🔔 Likya Hub Pazaryeri Bildirimleri</h3>
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
