'use client';

import React, { useState } from 'react';

// ============================================================================
// LİKYA KAMPÜS GENEL BAKIŞ MODÜLÜ
// Finansal metrikler + 5 bölgeli dijital ikiz haritası + ön muhasebe
// ============================================================================

export default function CampusOverviewModule() {
  const [financials] = useState({
    accommodationProfit: '₺184,500',
    tryBeforeBuyCommission: '₺36,200',
    ticketCommission: '₺14,800',
    tenantRevenueShare: '₺28,900',
    clubCharityFund: '₺12,400',
    gesGenerationKw: '142.8 kW',
    greyWaterRecycledL: '18,500 L',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Finansal Gelir Modeli Metrikleri */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>KONAKLAMA GELİRİ (%100 NET KÂR)</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#48bb78', marginTop: '6px' }}>{financials.accommodationProfit}</div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>40-50 Parsel Karavan & Tiny House</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>"TRY BEFORE BUY" SATIŞ KOMİSYONU (%3 - %15)</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#00f2fe', marginTop: '6px' }}>{financials.tryBeforeBuyCommission}</div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Test Edip Satın Alınan Araç/Ekipman</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>SAHNE & BİLET KOMİSYONU (%10 - %15)</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#ecc94b', marginTop: '6px' }}>{financials.ticketCommission}</div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Amfitiyatro Amatör Gösteriler</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>16 DÜKKAN CİRO PAYI (%8 - %15)</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#e07a5f', marginTop: '6px' }}>{financials.tenantRevenueShare}</div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Bistro, Market, Kiralama, Coworking</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>AMATÖR SPOR KULÜBÜ FONU (UPCYCLING)</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#9f7aea', marginTop: '6px' }}>{financials.clubCharityFund}</div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Tamir Edilen Eşyaların Satış Geliri</div>
        </div>
      </div>

      {/* 30-35 Dönüm 3D Digital Twin Tesis Haritası */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>🗺️ 30-35 DÖNÜM CANLI DİJİTAL İKİZ SAHA HARİTASI (5 ANA BÖLGE)</h2>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Milli Emlak / Orman Tahsisli Arazinin Gerçek Zamanlı IoT ve Doluluk Durumu</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ padding: '6px 12px', background: 'rgba(72, 187, 120, 0.15)', color: '#48bb78', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>☀️ GES: {financials.gesGenerationKw} Canlı</span>
            <span style={{ padding: '6px 12px', background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>💧 Gri Su: {financials.greyWaterRecycledL}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(0, 242, 254, 0.08)', border: '1px solid #00f2fe', borderRadius: '16px', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00f2fe' }}>1. Karavan & Tiny House Showroom</div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>42 Parsel Dolu / 48 Toplam (%87.5)</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>14 Müşteri "Try Before Buy" Test Konaklamasında</div>
          </div>
          <div style={{ background: 'rgba(236, 201, 75, 0.08)', border: '1px solid #ecc94b', borderRadius: '16px', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ecc94b' }}>2. Kültür & Sanat Amfitiyatrosu</div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>500 Kişilik Sahne • Akustik Hazır</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Bu Akşam: "Olympos Gençlik Stand-Up" (380 Bilet Satıldı)</div>
          </div>
          <div style={{ background: 'rgba(72, 187, 120, 0.08)', border: '1px solid #48bb78', borderRadius: '16px', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#48bb78' }}>3. Spor & Biyomekanik Kompleksi</div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>2 Padel, 1 Tenis, Tırmanış, Sauna & Ice Bath</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>3D Biyomekanik Kameralar: 4 Sporcu Analiz Ediliyor</div>
          </div>
          <div style={{ background: 'rgba(224, 122, 95, 0.08)', border: '1px solid #e07a5f', borderRadius: '16px', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#e07a5f' }}>4. Ticari Yaşam Alanı (16 Dükkan)</div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>16 Dükkanın 16'sı Aktif Faaliyette</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Bistro, Doğa Marketi, Outdoor Kiralama, Upcycling Lab</div>
          </div>
          <div style={{ background: 'rgba(159, 122, 234, 0.08)', border: '1px solid #9f7aea', borderRadius: '16px', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#9f7aea' }}>5. Eco-Tech & Doğa Sistemleri</div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>Canopi GES, Gri Su Arıtma, Kompost Reaktörü</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Sponsor Enerji Markalarının Canlı Referans Parkuru</div>
          </div>
        </div>
      </div>
    </div>
  );
}
