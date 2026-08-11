'use client';

import React, { useState } from 'react';
import { Car, Zap, Droplets, WashingMachine, Shield, CreditCard, Bell, MapPin } from 'lucide-react';

// ============================================================================
// LİKYA SMART CARAVAN & PARK - KULLANDIKÇA ÖDE & KONAKLAMA SİSTEMİ
// Akıllı plaka tanıma, IoT sayaçları, mobil cüzdan entegrasyonu
// ============================================================================

interface Caravan {
  id: string;
  plate: string;
  owner: string;
  subscription: '6ay' | '1yil' | 'none';
  status: 'parked' | 'out' | 'overnight';
  lastEntry: string;
}

interface ServiceUsage {
  id: string;
  name: string;
  icon: string;
  unit: string;
  rate: number;
  used: number;
  cost: number;
}

export default function SmartCaravanPark() {
  const [caravans, setCaravans] = useState<Caravan[]>([
    { id: '1', plate: '34 ABC 123', owner: 'Ahmet Yılmaz', subscription: '1yil', status: 'parked', lastEntry: '10:30' },
    { id: '2', plate: '06 DEF 456', owner: 'Ayşe Kaya', subscription: '6ay', status: 'overnight', lastEntry: '09:15' },
    { id: '3', plate: '35 GHI 789', owner: 'Mehmet Demir', subscription: 'none', status: 'parked', lastEntry: '11:00' },
  ]);

  const [services, setServices] = useState<ServiceUsage[]>([
    { id: '1', name: 'Elektrik (kWh)', icon: '⚡', unit: 'kWh', rate: 4.5, used: 12.5, cost: 56.25 },
    { id: '2', name: 'Temiz Su (Litre)', icon: '💧', unit: 'L', rate: 0.15, used: 80, cost: 12.00 },
    { id: '3', name: 'Çamaşır Yıkama', icon: '🧺', unit: 'adet', rate: 25, used: 2, cost: 50.00 },
    { id: '4', name: 'Gri Su Deşarjı', icon: '🚿', unit: 'L', rate: 0.10, used: 60, cost: 6.00 },
  ]);

  const [walletBalance, setWalletBalance] = useState(250.00);
  const [notifications, setNotifications] = useState<string[]>([
    '🚗 Plaka tanındı: 34 ABC 123 giriş yaptı. Hoş geldin Ahmet!',
    '💡 Elektrik pedestalı aktifleştirildi: 34 ABC 123',
  ]);

  const [selectedCaravan, setSelectedCaravan] = useState<Caravan | null>(null);

  // Konaklama tarifesi
  const overnightRate = (caravan: Caravan) => caravan.subscription !== 'none' ? 15 : 25;

  // Kullandıkça öde: servis kullanımı
  const useService = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    // Bakiye kontrolü
    if (walletBalance < service.rate) {
      setNotifications((prev) => [
        '💬 "Harika bir gün! Karavan çamaşırhanesini kullanabilmek için cüzdanınıza bakiye yüklemeyi unutmayın. İyi tatiller!"',
        ...prev,
      ]);
      return;
    }

    // Servisi kullan
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, used: s.used + 1, cost: s.cost + s.rate } : s))
    );
    setWalletBalance((prev) => prev - service.rate);

    setNotifications((prev) => [
      `✅ ${service.name} kullanıldı: ${service.rate} ₺ cüzdandan düşüldü`,
      ...prev,
    ]);
  };

  // Konaklama bildirimi
  const startOvernight = (caravanId: string) => {
    const caravan = caravans.find((c) => c.id === caravanId);
    if (!caravan) return;

    const rate = overnightRate(caravan);
    const rateTL = rate * 35; // 1$ = 35 TL (örnek kur)

    setCaravans((prev) =>
      prev.map((c) => (c.id === caravanId ? { ...c, status: 'overnight' } : c))
    );
    setWalletBalance((prev) => prev - rateTL);

    setNotifications((prev) => [
      `🏕️ ${caravan.plate} konaklama başladı! ${rate}$/gece (${rateTL} TL) cüzdandan düşüldü`,
      ...prev,
    ]);
  };

  const formatTL = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Car size={20} color="#00f2fe" />
            Smart Caravan & Park — Kullandıkça Öde
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Akıllı plaka tanıma • IoT sayaçları • Mobil cüzdan</p>
        </div>
        <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
          💰 Cüzdan: {formatTL(walletBalance)} ₺
        </div>
      </div>

      {/* Karavan Listesi */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🚐 Karavanlar & Abonelikler</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {caravans.map((c) => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{c.plate} • {c.owner}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Giriş: {c.lastEntry} • Abonelik: {c.subscription === '1yil' ? '1 Yıl' : c.subscription === '6ay' ? '6 Ay' : 'Yok'}</div>
                <div style={{ fontSize: '11px', color: c.status === 'overnight' ? '#fbbf24' : '#34d399', marginTop: '4px' }}>
                  {c.status === 'parked' ? '🅿️ Parkta' : c.status === 'overnight' ? '🏕️ Konaklıyor' : '🚗 Dışarıda'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.3)' }}>
                  {overnightRate(c)}$/gece
                </span>
                {c.status !== 'overnight' && (
                  <button onClick={() => startOvernight(c.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0f4c81, #00f2fe)', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                    🏕️ Konakla
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kullandıkça Öde Servisleri */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>⚡ Kullandıkça Öde (Pay-As-You-Go) Servisleri</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {services.map((s) => (
            <div key={s.id} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{s.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Kullanım: {s.used} {s.unit} • Maliyet: {formatTL(s.cost)} ₺</div>
              <div style={{ fontSize: '11px', color: '#00f2fe', marginTop: '4px' }}>Birim: {formatTL(s.rate)} ₺</div>
              <button onClick={() => useService(s.id)} style={{ marginTop: '8px', width: '100%', padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                Kullan ({formatTL(s.rate)} ₺)
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Güvenlik & Kurallar */}
      <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#34d399', marginBottom: '12px' }}>🛡️ Güvenlik & Algoritma Kuralları</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
          <div>• 🚗 Plaka tanıma + bariyer otomasyonu + 7/24 IP kamera</div>
          <div>• 💰 Bakiye kontrolü: Servisler çalıştırılmadan önce minimum bakiye kontrol edilir</div>
          <div>• 🚨 Kaçak konaklama engeli: Sensörler + akıllı şebeke elektrik kullanım artışı tespiti</div>
          <div>• 💱 Döviz/TL çevrimi: $ bazlı ücretler TCOB efektif satış kuru üzerinden TL'ye çevrilir</div>
        </div>
      </div>

      {/* Bildirimler */}
      <div style={{ padding: '16px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🔔 Likya Hub Bildirimleri</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((n, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#cbd5e1', padding: '8px', background: 'rgba(15,23,42,0.6)', borderRadius: '8px' }}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
