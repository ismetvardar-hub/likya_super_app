'use client';

import React, { useState } from 'react';

// GES İnverter Durumları
const INITIAL_INVERTERS = [
  { id: 'INV-01', name: 'İnverter 1', power: '48.2 kW', temp: '42°C', status: 'Normal' },
  { id: 'INV-02', name: 'İnverter 2', power: '51.4 kW', temp: '44°C', status: 'Normal' },
  { id: 'INV-03', name: 'İnverter 3', power: '12.8 kW', temp: '51°C', status: 'Uyarı' },
  { id: 'INV-04', name: 'İnverter 4', power: '30.5 kW', temp: '39°C', status: 'Normal' },
];

// Akıllı Dolaplar
const INITIAL_LOCKERS = Array.from({ length: 12 }, (_, i) => ({
  id: `LKR-${String(i + 1).padStart(2, '0')}`,
  status: i % 3 === 0 ? 'Boş' : 'Dolu',
}));

// Karavan Parkı Elektrik Sayaçları
const INITIAL_METERS = Array.from({ length: 12 }, (_, i) => ({
  id: `A-${String(i + 1).padStart(2, '0')}`,
  consumption: (2.4 + (i * 0.7) % 5).toFixed(1),
  alarm: i === 7, // A-08 aşırı akım alarmı
}));

// Arıza Kayıtları
const INITIAL_FAULTS = [
  { id: 'ARZ-001', title: 'İnverter 3 Sıcaklık Yüksek', zone: 'Eco-Tech Center', status: 'Açık', priority: 'Yüksek' },
  { id: 'ARZ-002', title: 'Smart Locker #04 Kapı Sensörü Arızası', zone: 'Ticari Alan', status: 'Açık', priority: 'Normal' },
  { id: 'ARZ-003', title: 'Parsel A-08 Aşırı Akım Alarmı', zone: 'Karavan Parkı', status: 'İşlemde', priority: 'Yüksek' },
];

export default function StaffIoTTelemetryPanel() {
  const [inverters, setInverters] = useState(INITIAL_INVERTERS);
  const [lockers, setLockers] = useState(INITIAL_LOCKERS);
  const [meters, setMeters] = useState(INITIAL_METERS);
  const [faults, setFaults] = useState(INITIAL_FAULTS);
  const [showFaultForm, setShowFaultForm] = useState(false);
  const [newFault, setNewFault] = useState({ title: '', zone: '', priority: 'Normal' });

  const openLocker = (lockerId: string) => {
    setLockers(lockers.map(l => l.id === lockerId ? { ...l, status: 'Boş' } : l));
    alert(`🔓 Smart Locker ${lockerId} uzaktan açıldı!`);
  };

  const resetMeterAlarm = (meterId: string) => {
    setMeters(meters.map(m => m.id === meterId ? { ...m, alarm: false } : m));
    alert(`⚡ ${meterId} parseli aşırı akım alarmı sıfırlandı.`);
  };

  const addFault = () => {
    if (!newFault.title.trim()) return;
    setFaults([{ id: `ARZ-${String(faults.length + 1).padStart(3, '0')}`, title: newFault.title, zone: newFault.zone || 'Belirtilmedi', status: 'Açık', priority: newFault.priority }, ...faults]);
    setNewFault({ title: '', zone: '', priority: 'Normal' });
    setShowFaultForm(false);
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case 'Yüksek': return { bg: 'rgba(224, 122, 95, 0.2)', color: '#e07a5f' };
      case 'Normal': return { bg: 'rgba(236, 201, 75, 0.2)', color: '#ecc94b' };
      default: return { bg: 'rgba(72, 187, 120, 0.2)', color: '#48bb78' };
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#070b14', color: '#f8fafc', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* ÜST BAŞLIK */}
      <header
        style={{
          background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.7), rgba(236, 201, 75, 0.2))',
          border: '1px solid rgba(236, 201, 75, 0.3)',
          borderRadius: '24px',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🟡</span>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px', color: '#fff' }}>
                SAHA OPERASYON & IoT TELEMETRİ PANELİ
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>
                GES İnverter • Su Arıtma • Akıllı Dolaplar • Elektrik Sayaçları • Arıza Kaydı
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ padding: '8px 14px', background: 'rgba(72, 187, 120, 0.15)', color: '#48bb78', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            🟢 Sistem Çevrimiçi
          </span>
          <span style={{ padding: '8px 14px', background: 'rgba(224, 122, 95, 0.15)', color: '#e07a5f', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            🚨 {faults.filter(f => f.status === 'Açık').length} Açık Arıza
          </span>
        </div>
      </header>

      {/* ☀️ GES GÜNEŞ ENERJİSİ İNVERTER DURUMLARI */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ecc94b' }}>
              ☀️ GES GÜNEŞ ENERJİSİ İNVERTER DURUMLARI
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>450 kWp Canopi GES • Canlı üretim ve sıcaklık telemetrisi</p>
          </div>
          <span style={{ padding: '6px 12px', background: 'rgba(72, 187, 120, 0.15)', color: '#48bb78', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
            Toplam: 142.9 kW
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {inverters.map((inv) => {
            const isNormal = inv.status === 'Normal';
            return (
              <div key={inv.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${isNormal ? 'rgba(72, 187, 120, 0.3)' : 'rgba(224, 122, 95, 0.4)'}`, borderRadius: '14px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{inv.name}</span>
                  <span style={{ padding: '3px 8px', background: isNormal ? 'rgba(72, 187, 120, 0.2)' : 'rgba(224, 122, 95, 0.2)', color: isNormal ? '#48bb78' : '#e07a5f', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>
                    {inv.status}
                  </span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: isNormal ? '#48bb78' : '#e07a5f', marginTop: '8px' }}>{inv.power}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>🌡️ Sıcaklık: {inv.temp}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🚰 SU ARITMA & DEBİ TAKİBİ */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#00f2fe', marginBottom: '16px' }}>
          🚰 SU ARITMA & DEBİ TAKİBİ
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>TANK DOLULUK</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#00f2fe', marginTop: '6px' }}>%84</div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '8px' }}>
              <div style={{ width: '84%', height: '100%', background: 'linear-gradient(90deg, #00f2fe, #10b981)', borderRadius: '4px' }}></div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>pH DEĞERİ</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#48bb78', marginTop: '6px' }}>7.2</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>İdeal Aralık: 6.5 - 8.5</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>KLOR SEVİYESİ</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#48bb78', marginTop: '6px' }}>Normal</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>0.5 ppm • Güvenli</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>GÜNLÜK ARITILAN SU</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#9f7aea', marginTop: '6px' }}>18,500 L</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Gri Su Geri Dönüşümü</div>
          </div>
        </div>
      </div>

      {/* 📦 BLUETOOTH AKILLI DOLAPLAR */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#9f7aea' }}>
              📦 BLUETOOTH AKILLI DOLAPLAR (Smart Locker)
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>12 dolap • Dolu/Boş durumu ve uzaktan acil açma</p>
          </div>
          <span style={{ padding: '6px 12px', background: 'rgba(159, 122, 234, 0.15)', color: '#9f7aea', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
            {lockers.filter(l => l.status === 'Dolu').length}/12 Dolu
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {lockers.map((locker) => {
            const isFull = locker.status === 'Dolu';
            return (
              <div key={locker.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${isFull ? 'rgba(0, 242, 254, 0.3)' : 'rgba(72, 187, 120, 0.3)'}`, borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{locker.id}</div>
                <div style={{ fontSize: '11px', color: isFull ? '#00f2fe' : '#48bb78', fontWeight: 'bold', marginTop: '4px' }}>
                  {isFull ? '🔒 Dolu' : '🔓 Boş'}
                </div>
                {isFull && (
                  <button
                    onClick={() => openLocker(locker.id)}
                    style={{ marginTop: '8px', width: '100%', background: 'rgba(224, 122, 95, 0.2)', border: '1px solid #e07a5f', color: '#e07a5f', padding: '6px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    🚨 Acil Aç
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ⚡ KARAVAN PARKI ELEKTRİK SAYAÇLARI */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#e07a5f' }}>
              ⚡ KARAVAN PARKI ELEKTRİK SAYAÇLARI
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Parsel A-01'den A-12'ye anlık kWh tüketimi ve aşırı akım alarmı</p>
          </div>
          <span style={{ padding: '6px 12px', background: 'rgba(224, 122, 95, 0.15)', color: '#e07a5f', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
            {meters.filter(m => m.alarm).length} Aşırı Akım Alarmı
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {meters.map((meter) => (
            <div key={meter.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${meter.alarm ? 'rgba(224, 122, 95, 0.5)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>Parsel {meter.id}</span>
                {meter.alarm && <span style={{ fontSize: '14px' }}>🚨</span>}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: meter.alarm ? '#e07a5f' : '#00f2fe', marginTop: '4px' }}>{meter.consumption} kWh</div>
              {meter.alarm && (
                <button
                  onClick={() => resetMeterAlarm(meter.id)}
                  style={{ marginTop: '6px', width: '100%', background: 'rgba(224, 122, 95, 0.2)', border: '1px solid #e07a5f', color: '#e07a5f', padding: '5px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🔄 Alarmı Sıfırla
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 🚨 ACİL MÜDAHALE & ARIZA KAYDI */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
              🚨 ACİL MÜDAHALE & ARIZA KAYITLARI
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Sahadaki arızaları kaydedin ve takip edin</p>
          </div>
          <button
            onClick={() => setShowFaultForm(!showFaultForm)}
            style={{ background: 'linear-gradient(135deg, #e07a5f, #ecc94b)', border: 'none', color: '#000', padding: '10px 16px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
          >
            ➕ Yeni Arıza Kaydı
          </button>
        </div>

        {showFaultForm && (
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="Arıza Başlığı (örn: GES Panel Tozlanması)"
              value={newFault.title}
              onChange={(e) => setNewFault({ ...newFault, title: e.target.value })}
              style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}
            />
            <input
              type="text"
              placeholder="Bölge (örn: Eco-Tech Center)"
              value={newFault.zone}
              onChange={(e) => setNewFault({ ...newFault, zone: e.target.value })}
              style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Normal', 'Yüksek', 'Kritik'].map((p) => (
                <button
                  key={p}
                  onClick={() => setNewFault({ ...newFault, priority: p })}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: newFault.priority === p ? '1px solid #ecc94b' : '1px solid rgba(255,255,255,0.1)',
                    background: newFault.priority === p ? 'rgba(236, 201, 75, 0.2)' : 'rgba(255,255,255,0.02)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={addFault}
              style={{ background: '#e07a5f', border: 'none', color: '#fff', padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
            >
              💾 Arızayı Kaydet
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {faults.map((fault) => {
            const pc = priorityColor(fault.priority);
            return (
              <div key={fault.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{fault.title}</span>
                    <span style={{ padding: '3px 8px', background: pc.bg, color: pc.color, borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>{fault.priority}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{fault.id} • 📍 {fault.zone}</div>
                </div>
                <span style={{ padding: '5px 10px', background: fault.status === 'Açık' ? 'rgba(224, 122, 95, 0.15)' : 'rgba(236, 201, 75, 0.15)', color: fault.status === 'Açık' ? '#e07a5f' : '#ecc94b', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>
                  {fault.status === 'Açık' ? '🔴 Açık' : '🟡 İşlemde'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
