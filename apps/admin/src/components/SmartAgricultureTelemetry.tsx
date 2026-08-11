'use client';

import React, { useState } from 'react';

export default function SmartAgricultureTelemetry() {
  const [sectors, setSectors] = useState([
    {
      id: 'SEC-01',
      name: 'Toros Zeytinliği & Hatıra Koruluğu 🫒',
      soilMoisture: '%54 (Optimum)',
      phLevel: '6.8 pH',
      irrigationStatus: 'Otomatik Beklemede (Yağmur Öngörüsü)',
      waterSavedLitres: '14,200 Litre',
      sunlightUV: '5.2 UV',
      isIrrigating: false,
    },
    {
      id: 'SEC-02',
      name: 'Permakültür Ekolojik Sera (Tıbbi Bitkiler) 🌿',
      soilMoisture: '%42 (Hafif Kuru)',
      phLevel: '6.5 pH',
      irrigationStatus: 'Güneş Enerjili Damla Sulama Aktif',
      waterSavedLitres: '8,900 Litre',
      sunlightUV: '4.8 UV',
      isIrrigating: true,
    },
  ]);

  const toggleIrrigation = (id: string) => {
    setSectors((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              isIrrigating: !s.isIrrigating,
              irrigationStatus: !s.isIrrigating ? 'Güneş Enerjili Damla Sulama Aktif' : 'Sulama Kapatıldı (Tasarruf Modu)',
            }
          : s
      )
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Başlık */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(72, 187, 120, 0.2), rgba(15, 76, 129, 0.4))',
          border: '1px solid rgba(72, 187, 120, 0.4)',
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
            <span style={{ fontSize: '28px' }}>🌿</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
              OTONOM AKILLI TARIM & DAMLA SULAMA TELEMETRİSİ
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Toprak nem sensörleri ve hava durumu algoritmalarıyla çalışan %100 güneş enerjili hassas sulama ağı.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Toplam Su Tasarrufu</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-green)' }}>23,100 Litre 💧</div>
        </div>
      </div>

      {/* Sektörler Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
        {sectors.map((sec) => (
          <div
            key={sec.id}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{sec.id}</span>
                <span
                  style={{
                    background: sec.isIrrigating ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.06)',
                    color: sec.isIrrigating ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  {sec.isIrrigating ? 'SULANIYOR 💧' : 'BEKLEMEDE ⏳'}
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>{sec.name}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Toprak Nemi</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', marginTop: '2px' }}>{sec.soilMoisture}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Toprak pH / UV</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', marginTop: '2px' }}>{sec.phLevel} • {sec.sunlightUV}</div>
                </div>
              </div>

              <div style={{ marginTop: '14px', fontSize: '12px', color: '#cbd5e1' }}>
                <strong>Sulama Durumu:</strong> {sec.irrigationStatus}
              </div>
            </div>

            <button
              onClick={() => toggleIrrigation(sec.id)}
              style={{
                marginTop: '18px',
                background: sec.isIrrigating ? 'rgba(255, 77, 79, 0.2)' : 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
                border: sec.isIrrigating ? '1px solid #ff4d4f' : 'none',
                color: sec.isIrrigating ? '#ff4d4f' : 'white',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {sec.isIrrigating ? '⏹️ Sulamayı Durdur' : '🚰 Güneş Enerjili Damla Sulama Başlat'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
