'use client';

import React, { useState } from 'react';
import { Bot, Cloud, Droplets, Utensils, Waves, Sparkles, Wind, Thermometer } from 'lucide-react';

// ============================================================================
// LİKYA SMART DESTINATION ENGINE - GELECEK VİZYONU
// Otonom Teslimat + Dijital İkiz + Biyometrik Nutrition + Akıllı Havuz
// ============================================================================

interface DeliveryRobot {
  id: string;
  name: string;
  status: 'delivering' | 'idle' | 'charging';
  destination: string;
  payload: string;
  battery: number;
}

interface PoolStatus {
  temperature: number;
  ph: number;
  chlorine: number;
  occupancy: number;
  capacity: number;
  status: 'ideal' | 'warning';
}

interface NutritionOrder {
  id: string;
  athlete: string;
  fatigue: number;
  hydration: number;
  recommended: string;
  status: 'sent' | 'preparing' | 'ready';
}

export default function SmartDestinationEngine() {
  const [robots, setRobots] = useState<DeliveryRobot[]>([
    { id: '1', name: 'Kurye-01', status: 'delivering', destination: 'Karavan Parkı A-12', payload: '🥩 Kasap Siparişi', battery: 82 },
    { id: '2', name: 'Kurye-02', status: 'idle', destination: '—', payload: '—', battery: 95 },
    { id: '3', name: 'Kurye-03', status: 'charging', destination: 'Şarj İstasyonu', payload: '—', battery: 45 },
  ]);

  const [pool, setPool] = useState<PoolStatus>({
    temperature: 27.5,
    ph: 7.2,
    chlorine: 1.2,
    occupancy: 40,
    capacity: 100,
    status: 'ideal',
  });

  const [nutritionOrders, setNutritionOrders] = useState<NutritionOrder[]>([
    { id: '1', athlete: 'Ahmet Yılmaz', fatigue: 72, hydration: 65, recommended: '350ml Elektrolitli Taze Meyve Suyu + High-Protein Somon Kasesi', status: 'preparing' },
    { id: '2', athlete: 'Ayşe Kaya', fatigue: 45, hydration: 80, recommended: '500ml Su + Muzlu Protein Smoothie', status: 'sent' },
  ]);

  const [notifications, setNotifications] = useState<string[]>([
    '🤖 Kurye-01: 🥩 Kasap siparişi Karavan Parkı A-12\'ye teslim ediliyor!',
    '🌡️ Havuz: Klor seviyesi ideal (1.2 ppm), doluluk %40',
  ]);

  const dispatchRobot = (robotId: string) => {
    const robot = robots.find((r) => r.id === robotId);
    if (!robot || robot.status !== 'idle') return;

    setRobots((prev) =>
      prev.map((r) => (r.id === robotId ? { ...r, status: 'delivering', destination: 'Çadır Alanı B-04', payload: '🧺 Manav Siparişi' } : r))
    );

    setNotifications((prev) => [
      `🤖 ${robot.name}: 🧺 Manav siparişi Çadır Alanı B-04'e teslim ediliyor!`,
      ...prev,
    ]);
  };

  const sendNutritionOrder = (orderId: string) => {
    const order = nutritionOrders.find((o) => o.id === orderId);
    if (!order) return;

    setNutritionOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'ready' } : o))
    );

    setNotifications((prev) => [
      `🍽️ ${order.athlete} için "${order.recommended}" hazır! Restoran teslimata hazır.`,
      ...prev,
    ]);
  };

  const getRobotColor = (status: DeliveryRobot['status']) => {
    switch (status) {
      case 'delivering': return '#00f2fe';
      case 'idle': return '#34d399';
      case 'charging': return '#fbbf24';
    }
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#a78bfa" />
            Smart Destination Engine — Gelecek Vizyonu
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Otonom Teslimat • Dijital İkiz • Biyometrik Nutrition • Akıllı Havuz</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#00f2fe', fontWeight: '600' }}>
            🤖 {robots.filter((r) => r.status === 'delivering').length} Aktif Kurye
          </div>
          <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
            🌡️ Havuz: {pool.temperature}°C
          </div>
        </div>
      </div>

      {/* Otonom Teslimat Robotları */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🤖 Otonom Teslimat Robotları (Kara Kuryeleri)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {robots.map((r) => (
            <div key={r.id} style={{ background: 'rgba(30,41,59,0.6)', border: `1px solid ${getRobotColor(r.status)}`, borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '24px' }}>🤖</div>
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', color: getRobotColor(r.status), border: `1px solid ${getRobotColor(r.status)}` }}>
                  {r.status === 'delivering' ? '🚚 Teslim Ediyor' : r.status === 'idle' ? '✅ Boşta' : '🔋 Şarjda'}
                </span>
              </div>
              <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9', marginTop: '8px' }}>{r.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>📍 {r.destination}</div>
              <div style={{ fontSize: '11px', color: '#00f2fe', marginTop: '4px' }}>{r.payload}</div>
              <div style={{ fontSize: '11px', color: '#fbbf24', marginTop: '4px' }}>🔋 Pil: %{r.battery}</div>
              {r.status === 'idle' && (
                <button onClick={() => dispatchRobot(r.id)} style={{ marginTop: '8px', width: '100%', padding: '8px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0f4c81, #00f2fe)', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                  🚚 Görevlendir
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Akıllı Havuz & Aquapark */}
      <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.2)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#00f2fe', marginBottom: '12px' }}>🌊 Akıllı Havuz & Aquapark Hijyen/Kapasite Modülü</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px' }}>🌡️</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#00f2fe' }}>{pool.temperature}°C</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Su Sıcaklığı</div>
          </div>
          <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px' }}>🧪</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#34d399' }}>{pool.ph}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>pH Seviyesi</div>
          </div>
          <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px' }}>💧</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#34d399' }}>{pool.chlorine} ppm</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Klor Seviyesi</div>
          </div>
          <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px' }}>👥</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#fbbf24' }}>%{pool.occupancy}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Doluluk ({pool.capacity} kişi)</div>
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#34d399', marginTop: '12px' }}>
          ✅ "Havuzumuz şu an ideal sıcaklık ve hijyende, doluluk oranı %{pool.occupancy}" — IoT sensörleri canlı ölçüyor
        </div>
      </div>

      {/* Biyometrik Nutrition */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🍽️ Biyometrik Sağlık & Nutrition (AI Mutfak)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {nutritionOrders.map((o) => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{o.athlete}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Yorgunluk: %{o.fatigue} • Hidrasyon: %{o.hydration}</div>
                <div style={{ fontSize: '11px', color: '#a78bfa', marginTop: '4px' }}>🍽️ {o.recommended}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: o.status === 'ready' ? 'rgba(52,211,153,0.2)' : o.status === 'preparing' ? 'rgba(251,191,36,0.2)' : 'rgba(0,242,254,0.2)', color: o.status === 'ready' ? '#34d399' : o.status === 'preparing' ? '#fbbf24' : '#00f2fe', border: `1px solid ${o.status === 'ready' ? 'rgba(52,211,153,0.3)' : o.status === 'preparing' ? 'rgba(251,191,36,0.3)' : 'rgba(0,242,254,0.3)'}` }}>
                  {o.status === 'ready' ? '✅ Hazır' : o.status === 'preparing' ? '🍳 Hazırlanıyor' : '📨 Gönderildi'}
                </span>
                {o.status !== 'ready' && (
                  <button onClick={() => sendNutritionOrder(o.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #6d28d9, #a78bfa)', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                    ✓ Hazırla
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bildirimler */}
      <div style={{ padding: '16px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🔔 Smart Destination Engine Bildirimleri</h3>
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
