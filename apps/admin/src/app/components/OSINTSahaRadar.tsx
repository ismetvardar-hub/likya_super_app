'use client';

import React, { useState } from 'react';
import { Radar, Camera, Wind, AlertTriangle, MapPin, ShieldCheck, Droplets, Sun, Radio } from 'lucide-react';

// ============================================================================
// LİKYA OSINT SAHA RADARI & ÇEVRE GÜVENLİĞİ
// Açık kaynak harita katmanı, canlı kamera beslemeleri, rüzgar/hava durumu
// ve tek tıkla SAR (Arama-Kurtarma) alarm butonu
// ============================================================================

interface CameraFeed {
  id: string;
  name: string;
  zone: string;
  status: 'canlı' | 'düşük sinyal' | 'offline';
  color: string;
}

const CAMERAS: CameraFeed[] = [
  { id: 'CAM-01', name: 'Giriş Kapısı', zone: 'Kuzey', status: 'canlı', color: '#48bb78' },
  { id: 'CAM-02', name: 'Padel Kortları', zone: 'Doğu', status: 'canlı', color: '#48bb78' },
  { id: 'CAM-03', name: 'Karavan Park', zone: 'Güney', status: 'düşük sinyal', color: '#f59e0b' },
  { id: 'CAM-04', name: 'Sahil Şeridi', zone: 'Batı', status: 'canlı', color: '#48bb78' },
  { id: 'CAM-05', name: 'Termal Havuz', zone: 'Merkez', status: 'offline', color: '#f87171' },
];

export default function OSINTSahaRadar() {
  const [sarActive, setSarActive] = useState(false);
  const [droneActive, setDroneActive] = useState(false);

  const triggerSar = () => {
    setSarActive(true);
    setTimeout(() => setSarActive(false), 5000);
  };

  const toggleDrone = () => {
    setDroneActive(!droneActive);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radar size={20} color="#f87171" />
            OSINT &amp; Saha Radarı
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Açık Kaynak İstihbaratı • Çevre Güvenliği • Acil Müdahale</p>
        </div>
        <span style={{ padding: '6px 12px', background: 'rgba(72,187,120,0.15)', color: '#48bb78', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
          🛰️ 4/5 Kamera Çevrimiçi
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'start' }}>
        {/* Radar / Harita Katmanı */}
        <div style={{
          position: 'relative',
          background: 'radial-gradient(circle at center, rgba(0,242,254,0.08), rgba(13,19,34,0.9) 70%)',
          border: '1px solid rgba(0,242,254,0.2)',
          borderRadius: '16px',
          minHeight: '340px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Radar halkaları */}
          {[38, 76, 114, 152].map((r) => (
            <div key={r} style={{
              position: 'absolute', width: `${r * 2}px`, height: `${r * 2}px`, borderRadius: '50%',
              border: '1px solid rgba(0,242,254,0.15)',
            }} />
          ))}
          {/* Radar tarama çizgisi */}
          <div style={{
            position: 'absolute', inset: '0', borderRadius: '16px',
            background: 'conic-gradient(from 0deg, rgba(0,242,254,0.12), transparent 18%)',
            animation: 'radarSpin 4s linear infinite',
          }} />
          {/* Merkez nokta */}
          <div style={{ position: 'absolute', width: '10px', height: '10px', borderRadius: '50%', background: '#00f2fe', boxShadow: '0 0 14px #00f2fe' }} />
          {/* İşaretlenmiş bölgeler */}
          <div style={{ position: 'absolute', top: '18%', left: '22%', fontSize: '10px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} /> Kuzey Kapısı
          </div>
          <div style={{ position: 'absolute', top: '60%', right: '14%', fontSize: '10px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} /> Karavan Park
          </div>
          <div style={{ position: 'absolute', bottom: '16%', left: '34%', fontSize: '10px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} /> Sahil Şeridi
          </div>
          <div style={{ position: 'absolute', bottom: '12px', left: '16px', fontSize: '10px', color: '#64748b' }}>
            Katman: OpenStreetMap + OSINT sosyal izleme • 3 uydu taraması aktif
          </div>
        </div>
        {/* Sağ kolon: hava durumu + SAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Hava Durumu */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: '14px',
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '10px' }}>
              🌦️ Çevre Koşulları
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,242,254,0.06)', padding: '10px', borderRadius: '10px' }}>
                <Wind size={16} color="#00f2fe" />
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Rüzgar</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>18 km/s KD</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245,158,11,0.06)', padding: '10px', borderRadius: '10px' }}>
                <Sun size={16} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Sıcaklık</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>31°C</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(96,165,250,0.06)', padding: '10px', borderRadius: '10px' }}>
                <Droplets size={16} color="#60a5fa" />
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Nem</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>%64</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(72,187,120,0.06)', padding: '10px', borderRadius: '10px' }}>
                <ShieldCheck size={16} color="#48bb78" />
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>UV İndeksi</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>6.8 Yüksek</div>
                </div>
              </div>
            </div>
          </div>

          {/* Aksiyon Butonları Grubu */}
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            {/* SAR Alarm Butonu */}
            <button
              onClick={triggerSar}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '16px 12px', borderRadius: '14px', cursor: 'pointer',
                border: sarActive ? '1px solid #f87171' : '1px solid rgba(248,113,113,0.4)',
                background: sarActive ? 'rgba(248,113,113,0.25)' : 'rgba(248,113,113,0.08)',
                color: '#f87171', fontSize: '13px', fontWeight: 'bold',
                boxShadow: sarActive ? '0 0 30px rgba(248,113,113,0.4)' : 'none',
                transition: 'all 0.3s',
              }}
            >
              <AlertTriangle size={18} />
              {sarActive ? 'SAR AKTİF' : 'SAR Alarmı'}
            </button>

            {/* Dron Filosu Canlı Takip Butonu */}
            <button
              onClick={toggleDrone}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '16px 12px', borderRadius: '14px', cursor: 'pointer',
                border: droneActive ? '1px solid #00f2fe' : '1px solid rgba(0, 242, 254, 0.4)',
                background: droneActive ? 'rgba(0, 242, 254, 0.25)' : 'rgba(0, 242, 254, 0.08)',
                color: '#00f2fe', fontSize: '13px', fontWeight: 'bold',
                boxShadow: droneActive ? '0 0 30px rgba(0, 242, 254, 0.4)' : 'none',
                transition: 'all 0.3s',
              }}
            >
              <Radio size={18} />
              Dron Filosu Canlı Takip
            </button>
          </div>

          {/* Bildirimler */}
          {sarActive && (
            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', fontSize: '11px', color: '#fca5a5' }}>
              📡 Acil durum protokolü başlatıldı: GPS konumları paylaşıldı, kamera kayıtları kilitlendi, jandarma/sahil güvenlik hattına bildirim gönderildi.
            </div>
          )}

          {droneActive && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(0, 242, 254, 0.1)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              fontSize: '11px',
              color: '#00f2fe',
              boxShadow: '0 0 15px rgba(0, 242, 254, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500'
            }}>
              <span>🛸</span>
              <span>3 Kurtarma Dronu Havada — Termal Tarama Aktif (%94 Kapsama)</span>
            </div>
          )}
        </div>
      </div>

      {/* Kamera Beslemeleri */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {CAMERAS.map((cam) => (
          <div key={cam.id} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Camera size={16} color={cam.color} />
              <span style={{ fontSize: '9px', color: cam.color, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cam.status}</span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>{cam.name}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{cam.id} • {cam.zone}</div>
          </div>
        ))}
      </div>
    </div>
  );
}