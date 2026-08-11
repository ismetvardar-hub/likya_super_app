'use client';

import React, { useState } from 'react';

interface TicketsTabProps {
  qrHash: string;
  qrCountdown: number;
}

export default function TicketsTab({ qrHash, qrCountdown }: TicketsTabProps) {
  const [tickets, setTickets] = useState([
    { id: 'ev0', name: 'Olympos Gençlik Stand-Up & Akustik', venue: 'Merkez Amfitiyatro', seat: 'Koltuk: A-14', time: 'Bu Akşam 20:30' }
  ]);

  const upcomingEvents = [
    { id: 'ev1', name: 'Sedir Ormanı Akustik Konseri 🎸', time: 'Bu Akşam 21:00', price: 250, seat: 'Koltuk: C-08', icon: '🎸' },
    { id: 'ev2', name: 'Yıldızlar Altında Açık Hava Sineması 🎬', time: 'Yarın 21:30', price: 150, seat: 'Koltuk: B-12 (Mısır Dahil)', icon: '🍿' },
  ];

  return (
    <>
      {/* Dinamik QR Kartı */}
      <div style={{ background: '#ffffff', borderRadius: '24px', padding: '20px', textAlign: 'center', color: '#0f172a', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
        <div style={{ fontSize: '10px', color: '#0f4c81', fontWeight: '900', letterSpacing: '0.6px' }}>LİKYA DİNAMİK TOTP GEÇİŞ KİMLİĞİ</div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>Ahmet Y. • Katılımcı / Misafir</div>

        <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '150px', height: '150px', background: '#0f172a', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#00f2fe', fontSize: '64px' }}>
            📲
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b', marginTop: '8px' }}>{qrHash}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e07a5f', display: 'inline-block' }}></span>
          <span style={{ fontSize: '11px', color: '#e07a5f', fontWeight: 'bold' }}>Yenileniyor: {qrCountdown} saniye</span>
        </div>

        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px' }}>
          🚗 Otopark Bariyeri • 🎟️ Amfitiyatro Turnikesi • 🎾 Kort Girişi
        </div>
      </div>

      {/* Amfitiyatro Canlı Etkinlik Biletleri */}
      <div style={{ background: 'linear-gradient(135deg, rgba(236, 201, 75, 0.15), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(236, 201, 75, 0.3)', borderRadius: '16px', padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ecc94b' }}>🎭 Amfitiyatro Canlı Etkinlikler</div>
          <span style={{ background: 'rgba(236, 201, 75, 0.2)', color: '#ecc94b', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '6px' }}>Doğal Akustik Sahne 🌲</span>
        </div>
        <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '4px' }}>
          Yıldızların altında açık hava konserleri, sinema geceleri ve söyleşiler.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
          {upcomingEvents.map((ev) => (
            <div key={ev.id} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '24px' }}>{ev.icon}</span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{ev.name}</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>{ev.time} • ₺{ev.price}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setTickets(prev => [...prev, { id: ev.id, name: ev.name, venue: 'Merkez Amfitiyatro', seat: ev.seat, time: ev.time }]);
                  alert(`🎟️ "${ev.name}" biletiniz satın alındı ve QR turnike kimliğinize tanımlandı!`);
                }}
                style={{ background: '#ecc94b', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Bilet Al (₺{ev.price})
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Aktif Biletler */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '14px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ecc94b', marginBottom: '8px' }}>🎟️ Aktif Etkinlik Biletlerim ({tickets.length})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tickets.map((t) => (
            <div key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{t.name}</div>
              <div style={{ fontSize: '10px', color: '#00f2fe', marginTop: '2px' }}>{t.venue} • {t.seat} • {t.time}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
