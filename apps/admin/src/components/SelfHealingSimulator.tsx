'use client';

import React, { useState } from 'react';

interface SystemIncident {
  id: string;
  source: string;
  severity: 'low' | 'medium' | 'critical';
  description: string;
  detectedAt: string;
  aiDiagnosis: string;
  healedAt?: string;
  status: 'detecting' | 'healing' | 'resolved';
}

export default function SelfHealingSimulator() {
  const [incidents, setIncidents] = useState<SystemIncident[]>([
    {
      id: 'INC-401',
      source: 'Otonom Kargo Rover #2',
      severity: 'medium',
      description: 'Lidar sensöründe tozlanma ve 150ms telemetri gecikmesi tespit edildi.',
      detectedAt: '14:32:10',
      aiDiagnosis: 'CTO Ajanı (Helios-Tech) optik kalibrasyon protokolünü devreye soktu ve rotayı Rover #1 üzerinden yedekledi.',
      healedAt: '14:32:14 (4 sn)',
      status: 'resolved',
    },
    {
      id: 'INC-402',
      source: 'Supabase Biletleme Veritabanı',
      severity: 'critical',
      description: 'Konser kapı girişlerinde 800 eşzamanlı QR tarama sorgusunda bağlantı havuzu doldu.',
      detectedAt: '14:15:02',
      aiDiagnosis: 'Sovereign AI otomatik olarak Deno Edge Function önbelleğini (In-Memory Cache) aktifleştirdi.',
      healedAt: '14:15:05 (3 sn)',
      status: 'resolved',
    },
  ]);

  const [isInjectingFault, setIsInjectingFault] = useState(false);

  const simulateFaultAndHeal = () => {
    setIsInjectingFault(true);
    const newInc: SystemIncident = {
      id: `INC-${Math.floor(100 + Math.random() * 900)}`,
      source: 'Güneş Enerjisi (GES) Mikro-Şebeke',
      severity: 'medium',
      description: 'Bölgesel bulutlanma sebebiyle inverter voltaj dalgalanması tespit edildi.',
      detectedAt: new Date().toLocaleTimeString('tr-TR'),
      aiDiagnosis: 'Yapay zeka batarya deşarj hızını 142 kW seviyesine dengeledi ve şebeke kesintisini önledi.',
      status: 'healing',
    };

    setIncidents((prev) => [newInc, ...prev]);

    setTimeout(() => {
      setIncidents((prev) =>
        prev.map((i) =>
          i.id === newInc.id
            ? { ...i, status: 'resolved', healedAt: `${new Date().toLocaleTimeString('tr-TR')} (2 sn)` }
            : i
        )
      );
      setIsInjectingFault(false);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Bilgi ve Aksiyon */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(72, 187, 120, 0.15), rgba(15, 76, 129, 0.3))',
          border: '1px solid rgba(72, 187, 120, 0.3)',
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
            <span style={{ fontSize: '28px' }}>🛡️</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
              OTONOM SELF-HEALING (KENDİ KENDİNİ ONARAN) AI MOTORU
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Sistemde meydana gelen veritabanı, donanım veya şebeke aksaklıklarını insansız olarak saniyeler içinde onaran AI döngüsü.
          </p>
        </div>

        <button
          onClick={simulateFaultAndHeal}
          disabled={isInjectingFault}
          style={{
            background: isInjectingFault
              ? 'rgba(255,255,255,0.1)'
              : 'linear-gradient(135deg, var(--accent-orange), #ff4d4f)',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: isInjectingFault ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 6px 18px rgba(224, 122, 95, 0.35)',
          }}
        >
          <span>{isInjectingFault ? '⏳ Yapay Zeka Onarıyor...' : '⚡ Sentetik Hata Simüle Et & Onar'}</span>
        </button>
      </div>

      {/* Olay ve Onarım Listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {incidents.map((inc) => (
          <div
            key={inc.id}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>
                  {inc.status === 'resolved' ? '✅' : '⚙️'}
                </span>
                <span style={{ fontWeight: 'bold', color: 'white', fontSize: '14px' }}>{inc.source}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: inc.severity === 'critical' ? 'rgba(255, 77, 79, 0.2)' : 'rgba(246, 173, 85, 0.2)',
                    color: inc.severity === 'critical' ? '#ff4d4f' : '#f6ad55',
                    fontWeight: 'bold',
                  }}
                >
                  {inc.severity.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{inc.id} • {inc.detectedAt}</div>
            </div>

            <div style={{ fontSize: '13px', color: '#cbd5e1' }}>{inc.description}</div>

            <div
              style={{
                background: 'rgba(0,0,0,0.25)',
                borderRadius: '10px',
                padding: '10px 14px',
                borderLeft: '3px solid var(--accent-cyan)',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                🤖 AI Otonom Müdahalesi:
              </div>
              <div style={{ fontSize: '12px', color: 'white', marginTop: '2px' }}>{inc.aiDiagnosis}</div>
              {inc.healedAt && (
                <div style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 'bold', marginTop: '4px' }}>
                  ⚡ Çözüm Süresi: {inc.healedAt}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
