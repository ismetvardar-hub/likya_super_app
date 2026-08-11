'use client';

import React, { useState } from 'react';

export default function MarineEcoBuoyTelemetry() {
  const [buoys, setBuoys] = useState([
    {
      id: 'BUOY-SEA-01',
      location: 'Phaselis Antik Liman & Mercan Koruma Koyu 🪸',
      waterTemp: '26.4°C (Optimal)',
      salinity: '38.2 PSU',
      phLevel: '8.15 pH (Alkali & Sağlıklı)',
      turtleNestStatus: '14 Aktif Caretta Yuvası Gözetimde 🐢',
      acousticFaunaClicks: 'Akdeniz Foku Ses Yankısı Kaydedildi 🦭',
    },
    {
      id: 'BUOY-SEA-02',
      location: 'Patara Kum Tepeleri Açıkları (SİT Alanı) 🌊',
      waterTemp: '25.8°C',
      salinity: '38.0 PSU',
      phLevel: '8.18 pH',
      turtleNestStatus: '28 Yavru Çıkışı Teyit Edildi 🐢✨',
      acousticFaunaClicks: 'Yunus Sürüsü Ekolokasyon Taraması 🐬',
    },
  ]);

  const pingMarineBuoys = () => {
    alert('🐢 CSO Gaia-Eco: Deniz eko-şamandıra ağına akustik sonar sinyali gönderildi. Deniz sıcaklığı ve yuva telemetrisi güncellendi!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Başlık */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(56, 182, 255, 0.2), rgba(15, 76, 129, 0.4))',
          border: '1px solid rgba(56, 182, 255, 0.4)',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🐢</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
              DENİZ EKO-ŞAMANDIRA & CARETTA CARETTA KORUMA TELEMETRİSİ
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Phaselis ve Patara kıyılarındaki su altı hidrofon ve sıcaklık sensörleriyle deniz canlılarını koruyan otonom şamandıralar.
          </p>
        </div>

        <button
          onClick={pingMarineBuoys}
          style={{
            background: 'linear-gradient(135deg, #38b6ff, var(--primary-blue))',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(56, 182, 255, 0.35)',
          }}
        >
          🌊 Deniz Sensörlerini Tara
        </button>
      </div>

      {/* Şamandıra Kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
        {buoys.map((b) => (
          <div
            key={b.id}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{b.id}</span>
                <span
                  style={{
                    background: 'rgba(72, 187, 120, 0.2)',
                    color: 'var(--accent-green)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  AKTİF SENSÖR 📡
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: 'white', marginTop: '8px' }}>{b.location}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deniz Sıcaklığı</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', marginTop: '2px' }}>{b.waterTemp}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tuzluluk & pH</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-cyan)', marginTop: '2px' }}>{b.salinity} • {b.phLevel}</div>
                </div>
              </div>

              <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(0, 242, 254, 0.05)', borderRadius: '10px', border: '1px solid rgba(0, 242, 254, 0.15)', fontSize: '12px', color: '#cbd5e1' }}>
                <div>🐢 <strong>Caretta Yuvaları:</strong> {b.turtleNestStatus}</div>
                <div style={{ marginTop: '4px' }}>🐬 <strong>Akustik Hidrofon:</strong> {b.acousticFaunaClicks}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
