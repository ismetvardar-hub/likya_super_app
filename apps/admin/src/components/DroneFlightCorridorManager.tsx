'use client';

import React, { useState } from 'react';

interface FlightCorridor {
  id: string;
  name: string;
  altitudeBand: string;
  activeDrones: number;
  maxCapacity: number;
  safetyStatus: 'optimal' | 'rerouting' | 'congested';
  birdMigrationWarning: boolean;
}

export default function DroneFlightCorridorManager() {
  const [corridors, setCorridors] = useState<FlightCorridor[]>([
    {
      id: 'SKY-COR-01',
      name: 'Antalya Merkez ➔ Phaselis Amfi Tiyatro Hava Hattı 🛸',
      altitudeBand: '75m - 120m AGL',
      activeDrones: 3,
      maxCapacity: 8,
      safetyStatus: 'optimal',
      birdMigrationWarning: false,
    },
    {
      id: 'SKY-COR-02',
      name: 'Kaş / Kalkan Eko-Kampüs ➔ Patara Koruma Havzası 🐢',
      altitudeBand: '100m - 150m AGL',
      activeDrones: 2,
      maxCapacity: 6,
      safetyStatus: 'optimal',
      birdMigrationWarning: true,
    },
  ]);

  const optimizeFlightPaths = () => {
    alert('🛸 COO Vortex-Ops: Tüm aktif hava koridorları kuş göç rotaları ve rüzgar vektörlerine göre 3D Geo-Fence ile yeniden optimize edildi!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Başlık */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(15, 76, 129, 0.4))',
          border: '1px solid rgba(0, 242, 254, 0.4)',
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
            <span style={{ fontSize: '28px' }}>🛸</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
              OTONOM DRONE UÇUŞ KORİDORLARI & HAVA TRAFİK YÖNETİMİ (UTM)
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Bölgesel kampüsler arası kargo ve termal kurtarma dronlarını kuş göç yollarına duyarlı 3D sanal koridorlarda sevk eden hava radarı.
          </p>
        </div>

        <button
          onClick={optimizeFlightPaths}
          style={{
            background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(0, 242, 254, 0.35)',
          }}
        >
          🛸 Uçuş Rotalarını Optimize Et
        </button>
      </div>

      {/* Koridor Kartları */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {corridors.map((c) => (
          <div
            key={c.id}
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
                <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{c.id}</span>
                <span style={{ fontWeight: 'bold', color: 'white', fontSize: '15px' }}>{c.name}</span>
              </div>
              <span
                style={{
                  background: 'rgba(72, 187, 120, 0.2)',
                  color: 'var(--accent-green)',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                GÜVENLİ & AÇIK ✅
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>İrtifa Bandı</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'white', marginTop: '2px' }}>{c.altitudeBand}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Havadaki Aktif Dron</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-cyan)', marginTop: '2px' }}>{c.activeDrones} / {c.maxCapacity} Dron</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Kuş Göç Durumu</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: c.birdMigrationWarning ? 'var(--accent-orange)' : 'var(--accent-green)', marginTop: '2px' }}>
                  {c.birdMigrationWarning ? '⚠️ Hassas Bölge (Radar Aktif)' : 'Temiz Hava Sahası'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
