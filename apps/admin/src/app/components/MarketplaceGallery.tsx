'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

// ============================================================================
// 🖼️ LİKYA PAZARYERİ GÖRSEL VİTRİNİ — Fotoğraflı Ürün Kartları
// 🏷️ Sıfır Mağaza • 🔄 2. El Pazarı • 🎪 Kiralama / Try Before You Buy
// Kırılmasız eklenti: mevcut LikyaMarketplace (yönetim paneli) korunur; bu
// vitrin onun ÜZERİNE biner. Görsel yüklenemezse hafif CSS fallback devreye
// girer (ikon + degrade) — asla boş kart görünmez.
// ============================================================================

type SegmentId = 'new' | 'secondhand' | 'rental';

interface GalleryProduct {
  id: string;
  name: string;
  brand: string;
  segment: SegmentId;
  price: number;
  unit: 'satış' | 'günlük';
  condition: 'Sıfır' | 'A+ Doğrulanmış' | 'Teste Uygun';
  conditionColor: string;
  image: string;
  fallbackIcon: string;
  action: string;
  actionColor: string;
  category: string;
  tryBeforeBuy?: boolean;
  details: string[];
}

// Deterministik ürün kataloğu — Unsplash görselleri; onError'de fallback çalışır
const PRODUCTS: GalleryProduct[] = [
  // ── 🏷️ SIFIR MAĞAZA ──────────────────────────────────────────────
  {
    id: 'new-1', name: 'Babolat Pure Aero 2026', brand: 'Babolat', segment: 'new',
    price: 12999, unit: 'satış', condition: 'Sıfır', conditionColor: '#22c55e',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80&auto=format&fit=crop',
    fallbackIcon: '🏸', action: 'Satın Al', actionColor: '#f59e0b', category: 'Tenis & Padel',
    details: ['Rafael Nadal imza serisi', 'NAD özellikli gövde', 'Aerodinamik woofer tasarım', '2 yıl garantili'],
  },
  {
    id: 'new-2', name: 'Bullpadel Vertex 04', brand: 'Bullpadel', segment: 'new',
    price: 10999, unit: 'satış', condition: 'Sıfır', conditionColor: '#22c55e',
    image: 'https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=800&q=80&auto=format&fit=crop',
    fallbackIcon: '🎾', action: 'Satın Al', actionColor: '#f59e0b', category: 'Padel',
    details: ['Üst seviye padel raketi', 'Karbon 12K yüzey', 'Profesyonel kontrol', '2 yıl garantili'],
  },
  {
    id: 'new-3', name: 'Daze Techform Tişört', brand: 'Daze', segment: 'new',
    price: 749, unit: 'satış', condition: 'Sıfır', conditionColor: '#22c55e',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80&auto=format&fit=crop',
    fallbackIcon: '👕', action: 'Satın Al', actionColor: '#f59e0b', category: 'Giyim',
    details: ['Likya özel koleksiyon', 'Nefes alan kumaş', 'UV koruma SPF50', 'Yıkama garantisi'],
  },
  {
    id: 'new-4', name: 'Head Speed Pro 2026', brand: 'Head', segment: 'new',
    price: 11999, unit: 'satış', condition: 'Sıfır', conditionColor: '#22c55e',
    image: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=800&q=80&auto=format&fit=crop',
    fallbackIcon: '🏸', action: 'Satın Al', actionColor: '#f59e0b', category: 'Tenis & Padel',
    details: ['Auxetic 2.0 teknolojisi', 'Hafif 280g', 'Turnuva sertifikalı', '2 yıl garantili'],
  },

  // ── 🔄 2. EL PAZARI ──────────────────────────────────────────────
  {
    id: 'used-1', name: 'Wilson Blade V9', brand: 'Wilson', segment: 'secondhand',
    price: 7450, unit: 'satış', condition: 'A+ Doğrulanmış', conditionColor: '#a78bfa',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&auto=format&fit=crop',
    fallbackIcon: '🏸', action: 'Satın Al', actionColor: '#a78bfa', category: 'Tenis',
    details: ['%90 kondisyon — doğrulanmış', 'Grip bandı değişti', 'Tel çatısı sağlam', 'Orijinal kılıf'],
  },
  {
    id: 'used-2', name: 'Head Speed Pro', brand: 'Head', segment: 'secondhand',
    price: 6200, unit: 'satış', condition: 'A+ Doğrulanmış', conditionColor: '#a78bfa',
    image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&q=80&auto=format&fit=crop',
    fallbackIcon: '🎾', action: 'Satın Al', actionColor: '#a78bfa', category: 'Tenis',
    details: ['%85 kondisyon', 'Görsel kontrol yapıldı', 'Tek sahibinden', 'İade garantili'],
  },
  {
    id: 'used-3', name: 'E-Bisiklet Likya Line', brand: 'Kullanıcı: Mehmet', segment: 'secondhand',
    price: 7200, unit: 'satış', condition: 'A+ Doğrulanmış', conditionColor: '#a78bfa',
    image: 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=800&q=80&auto=format&fit=crop',
    fallbackIcon: '🚲', action: 'Satın Al', actionColor: '#a78bfa', category: 'Ulaşım',
    details: ['%90 kondisyon', 'Yeni batarya', 'Kampüs içi bakım yapıldı', 'Test sürüşü ücretsiz'],
  },
  {
    id: 'used-4', name: 'Kamp Çadırı 4 Kişilik', brand: 'Kullanıcı: Elif', segment: 'secondhand',
    price: 950, unit: 'satış', condition: 'A+ Doğrulanmış', conditionColor: '#a78bfa',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80&auto=format&fit=crop',
    fallbackIcon: '⛺', action: 'Satın Al', actionColor: '#a78bfa', category: 'Kamp',
    details: ['%88 kondisyon', 'Su geçirmez testi yapıldı', 'Kurulum videosu dahil', 'İade garantili'],
  },

  // ── 🎪 KİRALAMA / TRY BEFORE YOU BUY ─────────────────────────────
  {
    id: 'rent-1', name: '4 Kişilik Glamping Çadırı', brand: 'Likya Outdoor', segment: 'rental',
    price: 450, unit: 'günlük', condition: 'Teste Uygun', conditionColor: '#00f2fe',
    image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=800&q=80&auto=format&fit=crop',
    fallbackIcon: '⛺', action: 'Hemen Kirala', actionColor: '#10b981', category: 'Konaklama Ekipmanı',
    tryBeforeBuy: true,
    details: ['TBYB: kirala-beğen-satın al', 'Kurulum dahil', 'Isıtma seçeneği', 'Günlük 450₺'],
  },
  {
    id: 'rent-2', name: 'Slinger Top Fırlatma Makinesi', brand: 'Likya Akademi', segment: 'rental',
    price: 350, unit: 'günlük', condition: 'Teste Uygun', conditionColor: '#00f2fe',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80&auto=format&fit=crop',
    fallbackIcon: '🎯', action: 'Hemen Kirala', actionColor: '#10b981', category: 'Antrenman',
    tryBeforeBuy: true,
    details: ['Portatif antrenman asistanı', '120 top kapasite', 'Açı ayarlanabilir', 'Akademi indirimi'],
  },
  {
    id: 'rent-3', name: 'Padel Test Kiti', brand: 'Bullpadel', segment: 'rental',
    price: 150, unit: 'günlük', condition: 'Teste Uygun', conditionColor: '#00f2fe',
    image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&q=80&auto=format&fit=crop',
    fallbackIcon: '🏓', action: '3D İncele', actionColor: '#10b981', category: 'Padel',
    tryBeforeBuy: true,
    details: ['3 raket seti — 30 gün test', 'Toplar dahil', 'TBYB: beğendiğini satın al', 'Koç desteği'],
  },
  {
    id: 'rent-4', name: 'Karavan Ekipman Paketi', brand: 'Likya Outdoor', segment: 'rental',
    price: 280, unit: 'günlük', condition: 'Teste Uygun', conditionColor: '#00f2fe',
    image: 'https://images.unsplash.com/photo-1503264116251-35a269479413?w=800&q=80&auto=format&fit=crop',
    fallbackIcon: '🚐', action: 'Hemen Kirala', actionColor: '#10b981', category: 'Karavan',
    tryBeforeBuy: true,
    details: ['Kamp masası + sandalye seti', 'Tüp bağlantı aparatı', 'Aydınlatma kiti', 'Günlük 280₺'],
  },
];

const SEGMENTS: { id: SegmentId | 'all'; label: string; icon: string; color: string }[] = [
  { id: 'all', label: 'Tümü', icon: '🛒', color: '#94a3b8' },
  { id: 'new', label: '🏷️ Sıfır Mağaza', icon: '', color: '#f59e0b' },
  { id: 'secondhand', label: '🔄 2. El Pazarı', icon: '', color: '#a78bfa' },
  { id: 'rental', label: '🎪 Kiralama / TBYB', icon: '', color: '#10b981' },
];


// ─── Kart bileşeni: görsel onError'de ikon + degrade fallback gösterir ───
function GalleryCard({
  product,
  isMobile,
  onView3D,
  onAction,
}: {
  product: GalleryProduct;
  isMobile: boolean;
  onView3D: (p: GalleryProduct) => void;
  onAction: (p: GalleryProduct) => void;
}) {
  const [imgOk, setImgOk] = useState(true);
  const width = isMobile ? 260 : 'auto';

  return (
    <div
      style={{
        flex: isMobile ? '0 0 260px' : '1 1 0',
        minWidth: isMobile ? 260 : 0,
        width,
        background: 'linear-gradient(160deg, rgba(15,23,42,0.9), rgba(13,19,34,0.95))',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,242,254,0.18)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Görsel alanı — 4:3 aspect ratio */}
      <div style={{ position: 'relative', aspectRatio: '4/3', background: '#0a0f1c', overflow: 'hidden' }}>
        {imgOk ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgOk(false)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          // 🎨 Hafif CSS fallback: ikon + degrade — asla boş kart yok
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${product.conditionColor}22, rgba(0,242,254,0.08))`,
            fontSize: '52px',
          }}>
            {product.fallbackIcon}
          </div>
        )}

        {/* Durum rozeti — köşede */}
        <span style={{
          position: 'absolute', top: '10px', left: '10px',
          padding: '3px 9px', borderRadius: '999px', fontSize: '10px', fontWeight: 700,
          background: `${product.conditionColor}22`, border: `1px solid ${product.conditionColor}55`,
          color: product.conditionColor, letterSpacing: '0.3px',
        }}>
          {product.condition}
        </span>

        {/* TBYB rozeti */}
        {product.tryBeforeBuy && (
          <span style={{
            position: 'absolute', bottom: '10px', left: '10px',
            padding: '3px 9px', borderRadius: '999px', fontSize: '10px', fontWeight: 700,
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.6)',
            color: '#fbbf24',
          }}>
            🎪 Try Before You Buy
          </span>
        )}

        {/* 3D görüntüle rozeti */}
        <button
          onClick={() => onView3D(product)}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            padding: '4px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: 700,
            border: '1px solid rgba(0,242,254,0.6)', background: 'rgba(0,242,254,0.15)',
            color: '#67e8f9', cursor: 'pointer', backdropFilter: 'blur(4px)',
          }}
        >
          🧊 3D Görüntüle
        </button>
      </div>

      {/* Bilgi alanı */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.4px' }}>{product.category}</div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', lineHeight: 1.35 }}>{product.name}</div>
        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{product.brand}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: 'auto', paddingTop: '6px' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#00f2fe' }}>
            {product.price.toLocaleString('tr-TR')}₺
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>/{product.unit}</span>
        </div>
        <button
          onClick={() => onAction(product)}
          style={{
            marginTop: '4px', padding: '9px 0', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${product.actionColor}, ${product.actionColor}88)`,
            color: '#0d1322', fontWeight: 800, fontSize: '12px',
          }}
        >
          {product.action}
        </button>
      </div>
    </div>
  );
}



// ─── Ana vitrin bileşeni ───
export default function MarketplaceGallery() {
  const [segment, setSegment] = useState<SegmentId | 'all'>('all');
  const [selected, setSelected] = useState<GalleryProduct | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Mobil tespiti → yatay kaydırılabilir kartlar / masaüstü grid
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const visible = segment === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.segment === segment);

  const handleAction = (p: GalleryProduct) => {
    setSelected(p); // aksiyon → ürün detayı/3D modalı açar
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Vitrin başlığı */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>🖼️ Pazaryeri Görsel Vitrini</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Sıfır • 2. El Doğrulamalı • Kiralama & Try Before You Buy — {visible.length} ürün
          </div>
        </div>
      </div>

      {/* Sekmeler / dinamik filtreleme */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {SEGMENTS.map((s) => {
          const active = segment === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSegment(s.id)}
              style={{
                padding: '7px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 700,
                border: active ? `1px solid ${s.color}` : '1px solid rgba(255,255,255,0.12)',
                background: active ? `${s.color}1f` : 'rgba(255,255,255,0.03)',
                color: active ? s.color : '#94a3b8', transition: 'all 0.2s',
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Kart ızgarası: masaüstü grid / mobil yatay scroll */}
      <div
        style={
          isMobile
            ? { display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 2px 10px', WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' as const }
            : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }
        }
      >
        {visible.map((p) => (
          <div key={p.id} style={isMobile ? { scrollSnapAlign: 'start' as const } : undefined}>
            <GalleryCard product={p} isMobile={isMobile} onView3D={setSelected} onAction={handleAction} />
          </div>
        ))}
      </div>

      {/* 🧊 3D ÖNİZLEME MODALI — Meshy/in3D köprüsü entegrasyonu */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '420px', maxHeight: '88vh', overflowY: 'auto',
              background: 'linear-gradient(160deg, #0f172a, #0d1322)',
              border: '1px solid rgba(0,242,254,0.4)', borderRadius: '18px', padding: '20px',
              boxShadow: '0 0 40px rgba(0,242,254,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>🧊 {selected.name}</div>
              <button onClick={() => setSelected(null)} style={{ border: 'none', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={16} />
              </button>
            </div>

            {/* 3D/GLTF görünüm alanı */}
            <div style={{
              aspectRatio: '4/3', borderRadius: '12px', overflow: 'hidden',
              background: 'radial-gradient(circle at 50% 40%, rgba(0,242,254,0.15), rgba(13,19,34,0.9))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px',
            }}>
              <span style={{ fontSize: '64px' }}>{selected.fallbackIcon}</span>
            </div>

            {/* Meshy / in3D köprü rozetleri */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <span style={{ padding: '3px 8px', borderRadius: '999px', fontSize: '9px', background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.5)', color: '#a5b4fc' }}>
                🧊 Meshy: GLTF yükleniyor…
              </span>
              <span style={{ padding: '3px 8px', borderRadius: '999px', fontSize: '9px', background: 'rgba(0,242,254,0.12)', border: '1px solid rgba(0,242,254,0.5)', color: '#67e8f9' }}>
                👤 in3D: avatar köprüsü hazır
              </span>
              {selected.tryBeforeBuy && (
                <span style={{ padding: '3px 8px', borderRadius: '999px', fontSize: '9px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.5)', color: '#fbbf24' }}>
                  🎪 TBYB uygun
                </span>
              )}
            </div>

            {/* Detay listesi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {selected.details.map((d) => (
                <div key={d} style={{ fontSize: '11px', color: '#cbd5e1', display: 'flex', gap: '6px' }}>
                  <span style={{ color: '#00f2fe' }}>•</span>{d}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setSelected(null)}
                style={{ flex: 1, padding: '10px 0', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }}
              >
                Kapat
              </button>
              <button
                onClick={() => { setSelected(null); alert(`🛒 "${selected.name}" için ${selected.action} işlemi kuyruğa alındı (simülasyon).`); }}
                style={{ flex: 1, padding: '10px 0', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, border: 'none', background: `linear-gradient(135deg, ${selected.actionColor}, ${selected.actionColor}88)`, color: '#0d1322' }}
              >
                {selected.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

