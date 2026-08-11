'use client';

import React, { useState } from 'react';

export default function AcousticSpatialCalibrator() {
  const [theaters, setTheaters] = useState([
    {
      id: 'AMP-01',
      name: 'Phaselis Antik Amfi Tiyatro',
      capacity: '2,500 Kişi',
      rt60Reverb: '1.42 s (Doğal Taş Akustiği)',
      liveSPL: '68.2 dB (Konser Öncesi Rüzgar & Dalga)',
      clarityC50: '+4.2 dB (Mükemmel Netlik)',
      eqPreset: 'Klasik Akustik & Senfoni Modu',
      isCalibrating: false,
    },
    {
      id: 'AMP-02',
      name: 'Olympos Vadisi Açık Sahne',
      capacity: '1,200 Kişi',
      rt60Reverb: '1.18 s (Sedir Ormanı Sönümlemesi)',
      liveSPL: '62.4 dB (Doğal Çevre Sesleri)',
      clarityC50: '+5.8 dB (Optimum Konuşma Netliği)',
      eqPreset: 'Tiyatro & Şiir Dinletisi Modu',
      isCalibrating: false,
    },
  ]);

  const calibrateAcoustics = (id: string) => {
    setTheaters((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCalibrating: true } : t))
    );

    setTimeout(() => {
      setTheaters((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, isCalibrating: false, rt60Reverb: '1.35 s (Yapay Zeka Optimize Edildi ✨)' }
            : t
        )
      );
      alert('🎵 Yapay Zeka mekansal ses kalibrasyonunu tamamladı. Doğal taş yansımaları ve rüzgar filtreleri eşitlendi!');
    }, 1800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Başlık */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(159, 122, 234, 0.2), rgba(15, 76, 129, 0.4))',
          border: '1px solid rgba(159, 122, 234, 0.4)',
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
            <span style={{ fontSize: '28px' }}>🎵</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
              ANTİK AMFİ TİYATROLAR İÇİN MEKANSAL AKUSTİK AI KALİBRATÖRÜ
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Bin yıllık Helenistik ve Roma taş tiyatrolarının doğal akustiğini gerçek zamanlı spektrum analiziyle optimize eden ses motoru.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mekansal Ses Kalitesi</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#9f7aea' }}>Hi-Res Spatial 3D 🎧</div>
        </div>
      </div>

      {/* Amfi Tiyatro Kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
        {theaters.map((t) => (
          <div
            key={t.id}
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
                <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{t.id}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.capacity}</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: 'white', marginTop: '8px' }}>{t.name}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Yankılanma (RT60)</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'white', marginTop: '2px' }}>{t.rt60Reverb}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ses Seviyesi (SPL)</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-orange)', marginTop: '2px' }}>{t.liveSPL}</div>
                </div>
              </div>

              <div style={{ marginTop: '14px', fontSize: '12px', color: '#cbd5e1' }}>
                <strong>Akustik Netlik (C50):</strong> {t.clarityC50} • Preset: <em>{t.eqPreset}</em>
              </div>
            </div>

            <button
              onClick={() => calibrateAcoustics(t.id)}
              disabled={t.isCalibrating}
              style={{
                marginTop: '18px',
                background: t.isCalibrating ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #9f7aea, var(--primary-blue))',
                border: 'none',
                color: 'white',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: t.isCalibrating ? 'not-allowed' : 'pointer',
              }}
            >
              {t.isCalibrating ? '⏳ AI Frekansları Kalibre Ediyor...' : '🎛️ Mekansal Akustiği Kalibre Et'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
