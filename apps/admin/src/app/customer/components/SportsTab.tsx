'use client';

import React, { useState } from 'react';

export default function SportsTab() {
  const [activeRide, setActiveRide] = useState<{ name: string; minutes: number } | null>(null);

  const facilities = [
    { id: 's1', name: 'Padel Kortu #1 (Akıllı Kameralı)', hours: 'Bugün 18:00 - 19:00', price: '₺200 / Saat', badge: '3D Biyomekanik Aktif 📹', icon: '🎾' },
    { id: 's2', name: 'Ahşap Orman Saunası & Ice Bath', hours: 'Bugün 19:30 - 20:30', price: '₺150 / Kişi', badge: 'Doğal Isı Geri Kazanımı ♨️', icon: '🧖' },
    { id: 's3', name: 'Doğal Kaya Tırmanış Duvarı', hours: 'Bugün 16:00 - 17:00', price: '₺100 / Saat', badge: 'Ekipman Dahil 🧗', icon: '🧗' },
  ];

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #38a169, #276749)', borderRadius: '16px', padding: '14px', color: '#fff' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold' }}>🎾 SPOR, BİYOMEKANİK & SAĞLIK</div>
        <div style={{ fontSize: '16px', fontWeight: '900', marginTop: '2px' }}>Kort, Tırmanış, Sauna & Ice Bath</div>
        <div style={{ fontSize: '10px', opacity: 0.9, marginTop: '2px' }}>Akıllı 3D Biyomekanik Kamera Analizi Dahil</div>
      </div>

      {/* E-Bike & Scooter Kiralama */}
      <div style={{ background: 'linear-gradient(135deg, rgba(56, 161, 105, 0.15), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(56, 161, 105, 0.3)', borderRadius: '16px', padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#48bb78' }}>🚴 Kampüs İçi E-Bike & Scooter</div>
          <span style={{ background: 'rgba(72, 187, 120, 0.2)', color: '#48bb78', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '6px' }}>Sıfır Emisyon ⚡</span>
        </div>
        <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '4px' }}>
          30-35 dönümlük eko-parkurda hız limiti 20 km/s.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
          {[
            { id: 'eb1', name: 'Toros E-Bike #12', loc: 'İstasyon A (Showroom)', battery: '%85 Şarj • 35km Menzil', price: '₺3.5 / dk', icon: '🚴' },
            { id: 'eb2', name: 'Likya E-Scooter #07', loc: 'İstasyon B (Göl Kenarı)', battery: '%92 Şarj • 28km Menzil', price: '₺2.8 / dk', icon: '🛴' },
          ].map((v) => (
            <div key={v.id} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '24px' }}>{v.icon}</span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{v.name} <span style={{ fontSize: '9px', color: '#48bb78' }}>({v.price})</span></div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>{v.loc} • {v.battery}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveRide({ name: v.name, minutes: 1 });
                  alert(`🔓 ${v.name} Kilidi Açıldı! Sürüş başladı.`);
                }}
                style={{ background: activeRide?.name === v.name ? '#f59e0b' : '#38a169', border: 'none', color: activeRide?.name === v.name ? '#000' : '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {activeRide?.name === v.name ? '⏱️ Sürüşte' : '📱 QR ile Aç'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Kort ve Tesisler */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {facilities.map((facility) => (
          <div key={facility.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '28px' }}>{facility.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{facility.name}</div>
                  <div style={{ fontSize: '11px', color: '#38a169' }}>{facility.hours}</div>
                </div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#48bb78' }}>{facility.price}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>{facility.badge}</span>
              <button
                onClick={() => alert(`"${facility.name}" rezervasyonunuz onaylandı!`)}
                style={{ background: '#38a169', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Kortu Ayır
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
