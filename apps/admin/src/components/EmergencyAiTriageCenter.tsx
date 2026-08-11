'use client';

import React, { useState } from 'react';

interface EmergencyIncident {
  id: string;
  type: 'wildfire' | 'mountain_sos' | 'medical' | 'sea_rescue';
  title: string;
  location: string;
  status: 'monitoring' | 'dispatched' | 'contained';
  aiTriageAnalysis: string;
  assignedAsset: string;
  time: string;
}

export default function EmergencyAiTriageCenter() {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([
    {
      id: 'EMG-911',
      type: 'wildfire',
      title: 'Termal Orman Yangını Erken Uyarı Sensörü 🌲🔥',
      location: 'Olympos Yanartaş Sektörü (36.438° K, 30.472° D)',
      status: 'dispatched',
      aiTriageAnalysis: 'FLIR termal sensörleri 62°C yüzey sıcaklığı ve rüzgar hızı artışı tespit etti. Yangın riski %84.',
      assignedAsset: 'SAR Termal Dronu #01 & Bölge Orman Ekipleri',
      time: '14:48:10',
    },
    {
      id: 'EMG-912',
      type: 'mountain_sos',
      title: 'Likya Yolu Dağ Yürüyüşçüsü Acil SOS Sinyali 📡',
      location: 'Gelidonya Feneri Parkuru - Düğüm #4 (Mesh)',
      status: 'contained',
      aiTriageAnalysis: 'Akıllı bileklik üzerinden yüksek nabız ve düşme (fall detection) sinyali alındı. Konum teyit edildi.',
      assignedAsset: 'Otonom İlk Yardım Rover #3 (Defibrilatörlü)',
      time: '14:35:22',
    },
  ]);

  const dispatchEmergencyResponse = () => {
    alert('🚨 Otonom Acil Müdahale Protokolü tetiklendi! En yakın SAR dronu ve mobil revir sevk edildi.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Başlık */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(255, 77, 79, 0.2), rgba(15, 76, 129, 0.4))',
          border: '1px solid rgba(255, 77, 79, 0.4)',
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
            <span style={{ fontSize: '28px' }}>🚨</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
              OTONOM ACİL DURUM & AFET MÜDAHALE AI TRİYAJ MERKEZİ
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Termal FLIR kameraları, dağ BLE Mesh SOS sinyalleri ve otonom ambulans dron filosuyla 7/24 kesintisiz güvenlik.
          </p>
        </div>

        <button
          onClick={dispatchEmergencyResponse}
          style={{
            background: 'linear-gradient(135deg, #ff4d4f, var(--primary-blue))',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(255, 77, 79, 0.4)',
          }}
        >
          🚨 Acil Müdahale Filosunu Sevk Et
        </button>
      </div>

      {/* Olay Kartları Listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {incidents.map((inc) => (
          <div
            key={inc.id}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '18px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#ff4d4f', fontWeight: 'bold' }}>{inc.id}</span>
                <span style={{ fontWeight: 'bold', color: 'white', fontSize: '15px' }}>{inc.title}</span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: inc.status === 'dispatched' ? 'rgba(255, 77, 79, 0.2)' : 'rgba(72, 187, 120, 0.2)',
                    color: inc.status === 'dispatched' ? '#ff4d4f' : 'var(--accent-green)',
                    fontWeight: 'bold',
                  }}
                >
                  {inc.status === 'dispatched' ? 'EKİPLER YOLDA 🛸' : 'KONTROL ALTINDA ✅'}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{inc.time}</span>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>📍 {inc.location}</div>

            <div
              style={{
                background: 'rgba(0,0,0,0.25)',
                borderLeft: '3px solid #ff4d4f',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                color: '#cbd5e1',
              }}
            >
              🤖 <strong>Yapay Zeka Triyaj Raporu:</strong> {inc.aiTriageAnalysis}
            </div>

            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
              🛸 <strong>Görevlendirilen Birim:</strong> <span style={{ color: 'white', fontWeight: 'bold' }}>{inc.assignedAsset}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
