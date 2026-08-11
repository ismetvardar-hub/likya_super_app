'use client';

import React, { useState } from 'react';

interface MapPin {
  id: string;
  name: string;
  type: 'drone' | 'rover' | 'solar' | 'water' | 'amphi' | 'hiker';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  status: string;
  details: string;
}

export default function Valley3DMap() {
  const [pins, setPins] = useState<MapPin[]>([
    { id: 'p1', name: 'SAR Kurtarma Dronu #01', type: 'drone', x: 62, y: 28, status: 'Uçuşta (85m İrtifa)', details: 'FLIR Termal Kamera Aktif • Likya Yolu Sektör 4' },
    { id: 'p2', name: 'Otonom Kargo Rover #1', type: 'rover', x: 38, y: 64, status: 'Seyir Halinde (4.2 km/s)', details: 'Yemekhane ➔ Kütüphane Teslimat' },
    { id: 'p3', name: 'Güneş Santrali (GES Hub)', type: 'solar', x: 80, y: 75, status: '142.8 kW Canlı Üretim', details: 'Mikro-Şebeke %93.4 Doluluk' },
    { id: 'p4', name: 'Akıllı Su Sebili #1', type: 'water', x: 45, y: 48, status: '9.5°C Doğal Kaynak', details: '28,400 PET Şişe Kurtarıldı' },
    { id: 'p5', name: 'Merkez Amfi Tiyatro Sahnesi', type: 'amphi', x: 25, y: 35, status: 'Konser Hazırlığı', details: '68.2 dB Akustik Seviye' },
    { id: 'p6', name: 'Dağ Yürüyüşçü Grubu (Mesh #3)', type: 'hiker', x: 72, y: 20, status: 'BLE Mesh Bağlı', details: '8 Doğa Gönüllüsü • Phaselis Parkuru' },
  ]);

  const [selectedPin, setSelectedPin] = useState<MapPin | null>(pins[0]);

  const getPinColor = (type: MapPin['type']) => {
    switch (type) {
      case 'drone': return '#ff4d4f';
      case 'rover': return '#00f2fe';
      case 'solar': return '#f6ad55';
      case 'water': return '#38b6ff';
      case 'amphi': return '#9f7aea';
      case 'hiker': return '#48bb78';
    }
  };

  const getPinIcon = (type: MapPin['type']) => {
    switch (type) {
      case 'drone': return '🛸';
      case 'rover': return '🤖';
      case 'solar': return '☀️';
      case 'water': return '🚰';
      case 'amphi': return '🏛️';
      case 'hiker': return '🚶';
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
      {/* 3D Topografik Harita Kanvası */}
      <div
        style={{
          background: 'linear-gradient(145deg, #091325, #050a14)',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          borderRadius: '24px',
          height: '460px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 60px rgba(0, 242, 254, 0.1)',
        }}
      >
        {/* Topografik Izgara & Eşyükselti Eğrileri */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(ellipse at 70% 30%, rgba(15, 76, 129, 0.4) 0%, transparent 60%),
              radial-gradient(ellipse at 30% 70%, rgba(224, 122, 95, 0.2) 0%, transparent 60%),
              linear-gradient(rgba(0, 242, 254, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 242, 254, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 100% 100%, 30px 30px, 30px 30px',
          }}
        />

        {/* Harita Başlığı HUD */}
        <div style={{ position: 'absolute', top: '16px', left: '20px', zIndex: 10 }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold', letterSpacing: '1.2px' }}>
            TOPOGRAPHIC SATELLITE HUD
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: 'white' }}>
            Likya Vadisi & Olympos Sektörü Canlı Harita 🗺️
          </div>
        </div>

        {/* Canlı Pinler */}
        {pins.map((pin) => {
          const isSelected = selectedPin?.id === pin.id;
          const color = getPinColor(pin.type);
          return (
            <div
              key={pin.id}
              onClick={() => setSelectedPin(pin)}
              style={{
                position: 'absolute',
                top: `${pin.y}%`,
                left: `${pin.x}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: isSelected ? 20 : 5,
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: isSelected ? '46px' : '36px',
                  height: isSelected ? '46px' : '36px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0.8) 100%)`,
                  border: `2px solid ${color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isSelected ? '22px' : '16px',
                  boxShadow: `0 0 ${isSelected ? '24px' : '10px'} ${color}`,
                  animation: isSelected ? 'pulse 1.5s infinite' : 'none',
                }}
              >
                {getPinIcon(pin.type)}
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  background: 'rgba(0,0,0,0.8)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#fff',
                  marginTop: '4px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {pin.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sağ Bilgi Paneli */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
            🛰️ Seçili Varlık Telemetrisi
          </h3>
          {selectedPin ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Varlık Adı</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'white', marginTop: '2px' }}>{selectedPin.name}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Canlı Durum</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: getPinColor(selectedPin.type), marginTop: '2px' }}>{selectedPin.status}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Detaylar</div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>{selectedPin.details}</div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Harita üzerinden bir nokta seçin.</div>
          )}
        </div>

        <button
          onClick={() => alert(`"${selectedPin?.name}" için anlık telemetri ve canlı video akışı bağlandı.`)}
          style={{
            marginTop: '16px',
            background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
            border: 'none',
            color: 'white',
            padding: '12px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          📹 Canlı Telemetriyi Kilitle
        </button>
      </div>
    </div>
  );
}
