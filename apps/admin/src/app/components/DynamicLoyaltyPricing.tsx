'use client';

import React, { useState } from 'react';
import { Award, TrendingUp, Gift, Zap, Crown, Star, Medal, Gem } from 'lucide-react';

// ============================================================================
// LİKYA PARK İÇİ DİNAMİK SADAKAT & FİYATLANDIRMA MİMARİSİ
// Faz 3 Modül 2: Loyalty Tiers + Yoğunluk Odaklı Dinamik Teklifler
// ============================================================================

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  multiplier: number;
  color: string;
  icon: React.ReactNode;
  benefits: string[];
}

interface ZoneOffer {
  zone: string;
  occupancy: number;
  bonusMultiplier: number;
  offer: string;
}

export default function DynamicLoyaltyPricing() {
  const [visitorPoints, setVisitorPoints] = useState(1250);
  const [currentTier, setCurrentTier] = useState('gold');
  const [offers, setOffers] = useState<ZoneOffer[]>([
    { zone: 'Karavan & Tiny House', occupancy: 45, bonusMultiplier: 1.5, offer: '%50 Ekstra Puan' },
    { zone: 'Spor Kompleksi', occupancy: 55, bonusMultiplier: 1.5, offer: '%50 Ekstra Puan' },
    { zone: 'Restoran & Gıda Alanı', occupancy: 90, bonusMultiplier: 1.0, offer: 'Standart Puan' },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState<string | null>(null);

  const tiers: LoyaltyTier[] = [
    { id: 'bronze', name: 'Bronze', minPoints: 0, multiplier: 1.0, color: '#d97706', icon: <Medal size={16} />, benefits: ['Standart puan kazanımı', 'Aylık bülten'] },
    { id: 'silver', name: 'Silver', minPoints: 500, multiplier: 1.2, color: '#94a3b8', icon: <Star size={16} />, benefits: ['%20 ekstra puan', 'Öncelikli giriş'] },
    { id: 'gold', name: 'Gold', minPoints: 1000, multiplier: 1.5, color: '#fbbf24', icon: <Crown size={16} />, benefits: ['%50 ekstra puan', 'VIP otopark', 'Özel etkinlik erişimi'] },
    { id: 'vip', name: 'VIP', minPoints: 2500, multiplier: 2.0, color: '#a78bfa', icon: <Gem size={16} />, benefits: ['%100 ekstra puan', 'Kişisel asistan', 'Ücretsiz konaklama yükseltme'] },
  ];

  // Yoğunluk sinyali geldiğinde otomatik kupon üretimi
  const generateDynamicOffer = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Az yoğun bölgeye yönlendirme kuponu
      const lowDensityZone = offers.find((o) => o.occupancy < 70);
      if (lowDensityZone) {
        const coupon = `LIKYA-${lowDensityZone.zone.split(' ')[0].toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        setGeneratedCoupon(coupon);
        // Puan kazanımı simülasyonu
        setVisitorPoints((p) => p + Math.floor(50 * (currentTier === 'vip' ? 2 : currentTier === 'gold' ? 1.5 : currentTier === 'silver' ? 1.2 : 1)));
      }
      setIsGenerating(false);
    }, 1000);
  };

  const getTierIcon = (tierId: string) => {
    const tier = tiers.find((t) => t.id === tierId);
    return tier?.icon;
  };

  const getTierColor = (tierId: string) => {
    const tier = tiers.find((t) => t.id === tierId);
    return tier?.color || '#94a3b8';
  };

  const getTierName = (tierId: string) => {
    const tier = tiers.find((t) => t.id === tierId);
    return tier?.name || 'Bronze';
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#fbbf24" />
            Dinamik Sadakat & Fiyatlandırma Mimarisi
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Loyalty Tiers • Yoğunluk Odaklı Dinamik Teklifler • Kural Tabanlı Otomasyon</p>
        </div>

        <button
          onClick={generateDynamicOffer}
          disabled={isGenerating}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', cursor: isGenerating ? 'not-allowed' : 'pointer', border: 'none',
            background: isGenerating ? 'rgba(180,83,9,0.5)' : '#d97706',
            color: '#fff',
          }}
        >
          {isGenerating ? <><Zap size={16} style={{ animation: 'spin 1s linear infinite' }} /> Teklif Üretiliyor...</> : <><Gift size={16} /> Dinamik Teklif Üret</>}
        </button>
      </div>

      {/* Ziyaretçi Sadakat Durumu */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(30,41,59,0.6)', border: `1px solid ${getTierColor(currentTier)}`, padding: '16px', borderRadius: '12px' }}>
          <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {getTierIcon(currentTier)} Mevcut Katman
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: getTierColor(currentTier) }}>
            {getTierName(currentTier)}
          </div>
        </div>

        <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(251,191,36,0.3)', padding: '16px', borderRadius: '12px' }}>
          <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Sadakat Puanı</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#fbbf24' }}>
            {visitorPoints.toLocaleString('tr-TR')} puan
          </div>
        </div>

        <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(167,139,250,0.3)', padding: '16px', borderRadius: '12px' }}>
          <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Puan Çarpanı</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#a78bfa' }}>
            {tiers.find((t) => t.id === currentTier)?.multiplier}x
          </div>
        </div>
      </div>

      {/* Loyalty Tiers */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🏆 Sadakat Katmanları</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {tiers.map((tier) => (
            <div
              key={tier.id}
              style={{
                padding: '16px', borderRadius: '12px', cursor: 'pointer',
                background: currentTier === tier.id ? 'rgba(30,41,59,0.8)' : 'rgba(15,23,42,0.6)',
                border: `1px solid ${currentTier === tier.id ? tier.color : '#1e293b'}`,
              }}
              onClick={() => setCurrentTier(tier.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: tier.color }}>{tier.icon}</span>
                <span style={{ fontWeight: '700', fontSize: '14px', color: tier.color }}>{tier.name}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>
                {tier.minPoints} puan • {tier.multiplier}x çarpan
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                {tier.benefits.map((b, i) => (
                  <div key={i}>• {b}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Yoğunluk Odaklı Dinamik Teklifler */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>📊 Yoğunluk Odaklı Dinamik Teklifler</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {offers.map((offer, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{offer.zone}</div>
                <div style={{ fontSize: '11px', color: offer.occupancy > 85 ? '#f87171' : offer.occupancy > 70 ? '#fbbf24' : '#34d399' }}>
                  Doluluk: %{offer.occupancy}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', background: offer.bonusMultiplier > 1 ? 'rgba(52,211,153,0.2)' : 'rgba(148,163,184,0.2)', color: offer.bonusMultiplier > 1 ? '#34d399' : '#94a3b8', border: `1px solid ${offer.bonusMultiplier > 1 ? 'rgba(52,211,153,0.3)' : 'rgba(148,163,184,0.3)'}` }}>
                  {offer.offer}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Üretilen Kupon */}
      {generatedCoupon && (
        <div style={{ padding: '16px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: '600', marginBottom: '8px' }}>🎟️ Otonom Üretilen İndirim Kuponu</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff', fontFamily: 'monospace', letterSpacing: '2px' }}>{generatedCoupon}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
            Az yoğun bölgeye yönlendirme için otomatik oluşturuldu • Puan kazanımı: +50
          </div>
        </div>
      )}
    </div>
  );
}
