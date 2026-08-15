'use client';

import React, { useState } from 'react';
import { Store, Star, ShoppingCart, BadgeCheck, Timer } from 'lucide-react';

// ============================================================================
// 🛒 LİKYA PAZARYERİ — 3 Segmentli Marketplace
// 🏷️ Sıfır Satış • 🔄 2. El Pazarı • ⏱️ Kiralama Havuzu
// ────────────────────────────────────────────────────────────────────────────
// 🏕️ MİMARİ AYRIM: "Çadır KONAKLAMA & Glamping yer tahsisi" → Tesis & Konaklama
// kategorisinde kalır (fiziksel alan). "Çadır & EKİPMAN kiralama" → burada,
// Kiralama Havuzu altında (taşınabilir ürün).
// ============================================================================

type Segment = 'new' | 'secondhand' | 'rental';

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
  type: 'new' | 'secondhand' | 'rental';
  delivery: 'store' | 'cargo';
  tryBeforeBuy?: boolean;  // 🎪 Kiralayıp beğen, sonra satın al
  purchased?: boolean;
}

const SEGMENTS: { id: Segment; label: string; icon: string; color: string; desc: string }[] = [
  { id: 'new', label: 'Sıfır Satış', icon: '🏷️', color: '#f59e0b', desc: 'Mağaza & spor ürünleri' },
  { id: 'secondhand', label: '2. El Pazarı', icon: '🔄', color: '#a78bfa', desc: 'Doğrulanmış C2C' },
  { id: 'rental', label: 'Kiralama & Ekipman Kataloğu', icon: '🎪', color: '#10b981', desc: 'Try Before You Buy • çadır • ekipman • araç' },
];

export default function LikyaMarketplace() {
  const [segment, setSegment] = useState<Segment>('new');
  const [category, setCategory] = useState('all');
  const [rentalRevenue, setRentalRevenue] = useState(0);
  const [commissionRevenue, setCommissionRevenue] = useState(0);
  const [secondhandRevenue, setSecondhandRevenue] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([
    '🏕️ Mimari ayrım aktif: Çadır konaklama (yer tahsisi) Tesis & Konaklama kategorisinde, çadır ekipman kiralama Pazaryeri Kiralama Havuzu nda.',
  ]);

  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Rekabetçi Padel Raketi', icon: '🏸', category: 'Outdoor & Spor', brand: 'PadelPro', dailyRental: 60, salePrice: 4500, commissionRate: 6, rating: 4.9, reviews: 128, rentalCount: 45, saleCount: 3, verified: true, type: 'new', delivery: 'store' },
    { id: '2', name: 'Kulüp Forma Seti', icon: '👕', category: 'Outdoor & Spor', brand: 'Likya', dailyRental: 0, salePrice: 900, commissionRate: 5, rating: 4.8, reviews: 96, rentalCount: 0, saleCount: 12, verified: true, type: 'new', delivery: 'store' },
    { id: '3', name: 'Dağ Bisikleti X', icon: '🚵', category: 'Outdoor & Spor', brand: 'BikeX', dailyRental: 40, salePrice: 12000, commissionRate: 5, rating: 4.7, reviews: 210, rentalCount: 120, saleCount: 15, verified: true, type: 'new', delivery: 'store' },
    { id: '4', name: 'Termal Sporcu Kıyafeti', icon: '🧥', category: 'Outdoor & Spor', brand: 'ThermoFit', dailyRental: 0, salePrice: 1400, commissionRate: 6, rating: 4.8, reviews: 88, rentalCount: 0, saleCount: 9, verified: true, type: 'new', delivery: 'cargo' },
    { id: '5', name: 'Maç Topu (Resmi)', icon: '⚽', category: 'Outdoor & Spor', brand: 'MatchBall', dailyRental: 15, salePrice: 650, commissionRate: 5, rating: 4.9, reviews: 142, rentalCount: 200, saleCount: 40, verified: true, type: 'new', delivery: 'store' },

    { id: '6', name: '2. El Padel Raketi', icon: '🏸', category: 'Outdoor & Spor', brand: 'Kullanıcı: Can', dailyRental: 0, salePrice: 1800, commissionRate: 10, rating: 4.5, reviews: 8, rentalCount: 0, saleCount: 1, verified: true, type: 'secondhand', delivery: 'store' },
    { id: '7', name: '2. El Kamp Çadırı', icon: '⛺', category: 'Outdoor & Spor', brand: 'Kullanıcı: Elif', dailyRental: 0, salePrice: 950, commissionRate: 10, rating: 4.7, reviews: 12, rentalCount: 0, saleCount: 2, verified: false, type: 'secondhand', delivery: 'cargo' },
    { id: '8', name: '2. El E-Bisiklet', icon: '🚲', category: 'Outdoor & Spor', brand: 'Kullanıcı: Mehmet', dailyRental: 0, salePrice: 7200, commissionRate: 8, rating: 4.4, reviews: 5, rentalCount: 0, saleCount: 1, verified: true, type: 'secondhand', delivery: 'store' },
    { id: '9', name: '2. El Tırmanış İpi 60m', icon: '🧗', category: 'Outdoor & Spor', brand: 'Kullanıcı: Zeynep', dailyRental: 0, salePrice: 750, commissionRate: 8, rating: 4.6, reviews: 6, rentalCount: 0, saleCount: 1, verified: false, type: 'secondhand', delivery: 'cargo' },

    { id: '10', name: 'Kamp Çadırı 4 Kişilik', icon: '⛺', category: 'Kamp & Outdoor', brand: 'CampPro', dailyRental: 75, salePrice: 0, commissionRate: 0, rating: 4.9, reviews: 210, rentalCount: 180, saleCount: 0, verified: true, type: 'rental', delivery: 'store' },
    { id: '11', name: 'Kamp Seti (Tulum + Mat)', icon: '🎒', category: 'Kamp & Outdoor', brand: 'SleepTight', dailyRental: 40, salePrice: 0, commissionRate: 0, rating: 4.7, reviews: 96, rentalCount: 130, saleCount: 0, verified: true, type: 'rental', delivery: 'store' },
    { id: '12', name: 'Padel Raketi Pro + Top Seti', icon: '🏸', category: 'Spor Ekipmanı', brand: 'PadelPro', dailyRental: 60, salePrice: 0, commissionRate: 0, rating: 4.8, reviews: 154, rentalCount: 220, saleCount: 0, verified: true, type: 'rental', delivery: 'store' },
    { id: '13', name: 'E-Bisiklet', icon: '🚲', category: 'Araç Kiralama', brand: 'VoltBike', dailyRental: 120, salePrice: 0, commissionRate: 0, rating: 4.6, reviews: 78, rentalCount: 95, saleCount: 0, verified: true, type: 'rental', delivery: 'store' },
    { id: '14', name: 'Elektrikli Scooter', icon: '🛴', category: 'Araç Kiralama', brand: 'Glide', dailyRental: 90, salePrice: 0, commissionRate: 0, rating: 4.5, reviews: 60, rentalCount: 140, saleCount: 0, verified: true, type: 'rental', delivery: 'store' },
    { id: '15', name: 'Tırmanış Ekipman Seti', icon: '🧗', category: 'Spor Ekipmanı', brand: 'RockSafe', dailyRental: 110, salePrice: 0, commissionRate: 0, rating: 4.9, reviews: 44, rentalCount: 52, saleCount: 0, verified: true, type: 'rental', delivery: 'store' },

    // 🎪 EKİPMAN KATALOĞU — Try Before You Buy (kiralayıp beğen, satın al)
    { id: '16', name: 'Lüks Glamping Çadırı', icon: '🎪', category: 'Kamp & Outdoor', brand: 'Quechua', dailyRental: 50, salePrice: 2500, commissionRate: 10, rating: 4.9, reviews: 88, rentalCount: 64, saleCount: 7, verified: true, type: 'rental', delivery: 'store', tryBeforeBuy: true },
    { id: '17', name: 'Şişme Yatak & Yastık', icon: '🛏️', category: 'Kamp & Outdoor', brand: 'Decathlon', dailyRental: 20, salePrice: 800, commissionRate: 10, rating: 4.7, reviews: 132, rentalCount: 210, saleCount: 25, verified: true, type: 'rental', delivery: 'store', tryBeforeBuy: true },
    { id: '18', name: 'Mobil Kamp Kliması', icon: '🌬️', category: 'Kamp & Outdoor', brand: 'EcoFlow', dailyRental: 40, salePrice: 1800, commissionRate: 12, rating: 4.8, reviews: 55, rentalCount: 48, saleCount: 5, verified: true, type: 'rental', delivery: 'store', tryBeforeBuy: true },
    { id: '19', name: 'Güç İstasyonu (Solar)', icon: '💡', category: 'Kamp & Outdoor', brand: 'Jackery', dailyRental: 30, salePrice: 1200, commissionRate: 12, rating: 4.6, reviews: 71, rentalCount: 92, saleCount: 11, verified: true, type: 'rental', delivery: 'store', tryBeforeBuy: true },
  ]);

  const categories = ['all', 'Outdoor & Spor', 'Kamp & Outdoor', 'Spor Ekipmanı', 'Araç Kiralama'];

  const filteredProducts = products.filter((p) =>
    p.type === segment && (category === 'all' || p.category === category)
  );


  // ⏱️ Kiralama Havuzu kiralaması
  const rentProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, rentalCount: p.rentalCount + 1 } : p)));
    setRentalRevenue((prev) => prev + product.dailyRental);
    setNotifications((prev) => [
      `⏱️ ${product.name} kiralandı! (${product.dailyRental} ₺/gün) — Kiralama Havuzu geliri işlendi`,
      ...prev,
    ]);
  };

  // 🏷️ Sıfır satış (komisyon)
  const buyProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const commission = product.salePrice * (product.commissionRate / 100);
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, saleCount: p.saleCount + 1 } : p)));
    setCommissionRevenue((prev) => prev + commission);
    setNotifications((prev) => [
      `🛒 ${product.name} satın alındı! (${product.salePrice} ₺) %${product.commissionRate} komisyon (${commission.toFixed(0)} ₺)`,
      ...prev,
    ]);
  };

  // 🔄 2. El güvenli satın al (bloke + komisyon)
  const buySecondhand = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const commission = product.salePrice * (product.commissionRate / 100);
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, saleCount: p.saleCount + 1 } : p)));
    setSecondhandRevenue((prev) => prev + commission);
    setNotifications((prev) => [
      `🛡️ ${product.name} satın alındı! Para Likya Havuz Hesabı nda blokede; alıcı onaylayınca satıcıya aktarılır. %${product.commissionRate} komisyon (${commission.toFixed(0)} ₺)`,
      ...prev,
    ]);
  };

  // 🎪 Try Before You Buy — kiraladı, beğendi, satın aldı (komisyon)
  const buyTbyB = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || product.purchased) return;
    const commission = product.salePrice * (product.commissionRate / 100);
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, purchased: true } : p)));
    setCommissionRevenue((prev) => prev + commission);
    setNotifications((prev) => [
      `🎪 ${product.name} Try Before You Buy ile satın alındı! (${product.salePrice} ₺) — kira bedeli düşüldü, %${product.commissionRate} komisyon (${commission.toFixed(0)} ₺)`,
      ...prev,
    ]);
  };

  const formatTL = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Store size={18} color="#f59e0b" /> Likya Pazaryeri — Marketplace
        </h2>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
          🏷️ Sıfır Satış • 🔄 2. El Pazarı • ⏱️ Kiralama Havuzu — çadır konaklama (Tesis) ile ekipman kiralama (Pazaryeri) kesin ayrımı
        </p>
      </div>

      {/* 3 Segment Sekmesi — net kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {SEGMENTS.map((s) => {
          const active = segment === s.id;
          const count = products.filter((p) => p.type === s.id).length;
          return (
            <button key={s.id} onClick={() => setSegment(s.id)}
              style={{
                padding: '14px', borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
                background: active ? `${s.color}14` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? s.color : 'rgba(255,255,255,0.08)'}`,
                boxShadow: active ? `0 0 18px ${s.color}25` : 'none',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '22px' }}>{s.icon}</span>
                <span style={{ fontSize: '10px', fontWeight: 800, color: s.color, padding: '3px 9px', borderRadius: '12px', background: `${s.color}1a`, border: `1px solid ${s.color}44` }}>{count}</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', marginTop: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>{s.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Gelir özeti */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '10px', color: '#94a3b8', padding: '6px 12px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
          ⏱️ Kiralama: <b style={{ color: '#10b981' }}>{formatTL(rentalRevenue)} ₺</b>
        </span>
        <span style={{ fontSize: '10px', color: '#94a3b8', padding: '6px 12px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
          🏷️ Komisyon: <b style={{ color: '#f59e0b' }}>{formatTL(commissionRevenue)} ₺</b>
        </span>
        <span style={{ fontSize: '10px', color: '#94a3b8', padding: '6px 12px', borderRadius: '10px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.3)' }}>
          🔄 2. El Komisyon: <b style={{ color: '#a78bfa' }}>{formatTL(secondhandRevenue)} ₺</b>
        </span>
      </div>


      {/* Kategori filtreleri */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            style={{
              padding: '7px 14px', borderRadius: '18px', cursor: 'pointer', fontSize: '10px', fontWeight: 700,
              border: category === c ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.12)',
              background: category === c ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.03)',
              color: category === c ? '#00f2fe' : '#94a3b8',
            }}>
            {c === 'all' ? '🗂️ Tümü' : c}
          </button>
        ))}
      </div>

      {/* Ürün kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '12px' }}>
        {filteredProducts.map((p) => (
          <div key={p.id} style={{ padding: '14px', borderRadius: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '26px' }}>{p.icon}</span>
              {p.verified && <BadgeCheck size={14} color="#00f2fe" />}
              {!p.verified && p.type === 'secondhand' && (
                <span style={{ fontSize: '8px', color: '#fbbf24', padding: '3px 8px', borderRadius: '10px', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.4)' }}>🔍 Doğrulama Bekliyor</span>
              )}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{p.name}</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>{p.brand} • {p.category}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={11} color="#fbbf24" fill="#fbbf24" />
              <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 600 }}>{p.rating}</span>
              <span style={{ fontSize: '9px', color: '#64748b' }}>({p.reviews})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              {p.type === 'rental' ? (
                <>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>⏱️ {formatTL(p.dailyRental)} ₺/gün</span>
                  {p.tryBeforeBuy ? (
                    <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)' }}>
                      🎪 TBYB • {formatTL(p.salePrice)} ₺
                    </span>
                  ) : null}
                </>
              ) : (
                <>
                  <span style={{ color: '#00f2fe', fontWeight: 600 }}>{p.dailyRental > 0 ? `${formatTL(p.dailyRental)} ₺/gün` : 'Satılık'}</span>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>{formatTL(p.salePrice)} ₺</span>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
              {p.type === 'rental' && (
                <>
                  {p.purchased ? (
                    <span style={{ flex: 1, textAlign: 'center', padding: '9px', borderRadius: '10px', background: 'rgba(74,222,128,0.14)', border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80', fontSize: '11px', fontWeight: 700 }}>
                      ✅ TBYB ile Satın Alındı
                    </span>
                  ) : (
                    <>
                      <button onClick={() => rentProduct(p.id)} style={{ flex: 1, padding: '9px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(16,185,129,0.5)', background: 'rgba(16,185,129,0.12)', color: '#10b981', fontSize: '11px', fontWeight: 700 }}>
                        ⏱️ Kirala
                      </button>
                      {p.tryBeforeBuy && (
                        <button onClick={() => buyTbyB(p.id)} style={{ flex: 1, padding: '9px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(245,158,11,0.5)', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontSize: '11px', fontWeight: 700 }}>
                          🎪 Beğendim, Satın Al
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
              {p.type === 'new' && (
                <>
                  <button onClick={() => rentProduct(p.id)} disabled={p.dailyRental <= 0} style={{ flex: 1, padding: '9px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(0,242,254,0.5)', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', fontSize: '11px', fontWeight: 700, opacity: p.dailyRental <= 0 ? 0.4 : 1 }}>
                    🎪 Kirala
                  </button>
                  <button onClick={() => buyProduct(p.id)} style={{ flex: 1, padding: '9px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(245,158,11,0.5)', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontSize: '11px', fontWeight: 700 }}>
                    🛒 Satın Al
                  </button>
                </>
              )}
              {p.type === 'secondhand' && (
                <button onClick={() => buySecondhand(p.id)} style={{ flex: 1, padding: '9px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(167,139,250,0.5)', background: 'rgba(167,139,250,0.12)', color: '#a78bfa', fontSize: '11px', fontWeight: 700 }}>
                  🛡️ Güvenli Satın Al
                </button>
              )}
            </div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>
              {p.rentalCount > 0 && `⏱️ ${p.rentalCount} kez kiralandı `}
              {p.saleCount > 0 && `• 🛒 ${p.saleCount} satış`}
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div style={{ fontSize: '11px', color: '#64748b', padding: '20px', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '12px' }}>
            Bu segmentte ürün yok.
          </div>
        )}
      </div>

      {/* Bildirimler */}
      <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>🔔 Pazaryeri Bildirimleri</div>
        {notifications.map((n, i) => (
          <div key={i} style={{ fontSize: '9px', color: '#94a3b8', lineHeight: '1.6', fontFamily: 'monospace' }}>{n}</div>
        ))}
      </div>
    </div>
  );
}

