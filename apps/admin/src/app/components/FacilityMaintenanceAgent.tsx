'use client';

import React, { useState } from 'react';
import { Wrench, Activity, Zap, Lightbulb, Camera, Thermometer, AlertTriangle, CheckCircle2, Send } from 'lucide-react';

// ============================================================================
// LİKYA TESİS BAKIM & ARIZA AJANI (Facility & Maintenance)
// IoT turnikeler, sensörler, aydınlatma, enerji altyapısı sağlık izleme
// Kestirimci bakım (predictive maintenance) + otonom iş emri atama
// ============================================================================

interface Asset {
  id: string;
  name: string;
  type: 'turnstile' | 'sensor' | 'lighting' | 'energy' | 'camera';
  icon: string;
  location: string;
  health: number; // 0-100
  status: 'healthy' | 'warning' | 'critical';
  lastCheck: string;
  predictiveRisk: number; // % risk
}

interface WorkOrder {
  id: string;
  title: string;
  asset: string;
  priority: 'critical' | 'high' | 'medium';
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed';
  estimatedTime: string;
}

export default function FacilityMaintenanceAgent() {
  const [assets, setAssets] = useState<Asset[]>([
    { id: '1', name: 'Turnike A-01', type: 'turnstile', icon: '🚪', location: 'Ana Giriş', health: 92, status: 'healthy', lastCheck: '12:30', predictiveRisk: 15 },
    { id: '2', name: 'Turnike B-03', type: 'turnstile', icon: '🚪', location: 'Havuz Girişi', health: 68, status: 'warning', lastCheck: '12:28', predictiveRisk: 45 },
    { id: '3', name: 'Elektrik Pedestal P-12', type: 'energy', icon: '⚡', location: 'Karavan Parkı', health: 55, status: 'warning', lastCheck: '12:25', predictiveRisk: 60 },
    { id: '4', name: 'Aydınlatma L-08', type: 'lighting', icon: '💡', location: 'Çadır Alanı', health: 40, status: 'critical', lastCheck: '12:20', predictiveRisk: 75 },
    { id: '5', name: 'Kamera K-04', type: 'camera', icon: '📹', location: 'Spor Kompleksi', health: 88, status: 'healthy', lastCheck: '12:22', predictiveRisk: 20 },
    { id: '6', name: 'Sıcaklık Sensörü S-02', type: 'sensor', icon: '🌡️', location: 'Havuz', health: 95, status: 'healthy', lastCheck: '12:29', predictiveRisk: 10 },
  ]);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    { id: '1', title: 'Aydınlatma L-08 arızası — LED değişimi', asset: 'Aydınlatma L-08', priority: 'critical', assignedTo: 'Ali Şahin', status: 'in_progress', estimatedTime: '1 saat' },
    { id: '2', title: 'Elektrik Pedestal P-12 kestirimci bakım', asset: 'Elektrik Pedestal P-12', priority: 'high', assignedTo: 'Mehmet Demir', status: 'pending', estimatedTime: '2 saat' },
    { id: '3', title: 'Turnike B-03 sensör kalibrasyonu', asset: 'Turnike B-03', priority: 'medium', assignedTo: 'Can Yılmaz', status: 'pending', estimatedTime: '30 dk' },
  ]);

  const [notifications, setNotifications] = useState<string[]>([
    '⚠️ Aydınlatma L-08 arıza tespit edildi (sağlık: %40) — kestirimci bakım riski %75',
    '📨 Ali Şahin\'e kritik iş emri atandı: "Aydınlatma L-08 LED değişimi"',
  ]);

  const getStatusColor = (a: Asset) => {
    if (a.status === 'critical') return '#f87171';
    if (a.status === 'warning') return '#fbbf24';
    return '#34d399';
  };

  const getPriorityColor = (p: WorkOrder['priority']) => {
    switch (p) {
      case 'critical': return '#f87171';
      case 'high': return '#fbbf24';
      case 'medium': return '#00f2fe';
    }
  };

  const assignWorkOrder = (orderId: string) => {
    const order = workOrders.find((o) => o.id === orderId);
    if (!order) return;

    setWorkOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'in_progress' } : o))
    );

    setNotifications((prev) => [
      `📨 ${order.assignedTo}'e iş emri atandı: "${order.title}" (Öncelik: ${order.priority === 'critical' ? '🔴 Kritik' : order.priority === 'high' ? '🟠 Yüksek' : '🟡 Orta'})`,
      ...prev,
    ]);
  };

  const completeWorkOrder = (orderId: string) => {
    const order = workOrders.find((o) => o.id === orderId);
    if (!order) return;

    setWorkOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o))
    );

    setNotifications((prev) => [
      `✅ ${order.assignedTo} iş emrini tamamladı: "${order.title}"`,
      ...prev,
    ]);
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={20} color="#fbbf24" />
            Tesis Bakım & Arıza Ajanı (Facility & Maintenance)
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>IoT izleme • Kestirimci bakım • Otonom iş emri atama</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
            ✅ {assets.filter((a) => a.status === 'healthy').length} Sağlıklı
          </div>
          <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>
            ⚠️ {assets.filter((a) => a.status === 'warning').length} Uyarı
          </div>
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#f87171', fontWeight: '600' }}>
            🔴 {assets.filter((a) => a.status === 'critical').length} Kritik
          </div>
        </div>
      </div>

      {/* Varlık Sağlık Durumu */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🏗️ Tesis Varlık Sağlık Durumu (30-35 Dönüm)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {assets.map((a) => (
            <div key={a.id} style={{ background: 'rgba(30,41,59,0.6)', border: `1px solid ${getStatusColor(a)}`, borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '24px' }}>{a.icon}</div>
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', color: getStatusColor(a), border: `1px solid ${getStatusColor(a)}` }}>
                  {a.status === 'healthy' ? '✅ Sağlıklı' : a.status === 'warning' ? '⚠️ Uyarı' : '🔴 Kritik'}
                </span>
              </div>
              <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9', marginTop: '8px' }}>{a.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>📍 {a.location} • Son: {a.lastCheck}</div>
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>Sağlık</span>
                  <span style={{ color: getStatusColor(a), fontWeight: '600' }}>%{a.health}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${a.health}%`, height: '100%', background: getStatusColor(a), borderRadius: '3px' }}></div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: a.predictiveRisk > 50 ? '#f87171' : '#94a3b8', marginTop: '8px' }}>
                🔮 Kestirimci Risk: %{a.predictiveRisk}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Otonom İş Emirleri */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>📋 Otonom İş Emirleri (Crew Ataması)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {workOrders.map((o) => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: `1px solid ${getPriorityColor(o.priority)}`, borderRadius: '10px', padding: '12px 16px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{o.title}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  🏗️ {o.asset} • 👤 {o.assignedTo} • ⏰ {o.estimatedTime}
                </div>
                <div style={{ fontSize: '11px', color: getPriorityColor(o.priority), marginTop: '4px' }}>
                  {o.priority === 'critical' ? '🔴 Kritik' : o.priority === 'high' ? '🟠 Yüksek' : '🟡 Orta'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: o.status === 'completed' ? 'rgba(52,211,153,0.2)' : o.status === 'in_progress' ? 'rgba(0,242,254,0.2)' : 'rgba(148,163,184,0.2)', color: o.status === 'completed' ? '#34d399' : o.status === 'in_progress' ? '#00f2fe' : '#94a3b8', border: `1px solid ${o.status === 'completed' ? 'rgba(52,211,153,0.3)' : o.status === 'in_progress' ? 'rgba(0,242,254,0.3)' : 'rgba(148,163,184,0.3)'}` }}>
                  {o.status === 'completed' ? '✅ Tamamlandı' : o.status === 'in_progress' ? '🔄 Devam Ediyor' : '⏳ Bekliyor'}
                </span>
                {o.status === 'pending' && (
                  <button onClick={() => assignWorkOrder(o.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0f4c81, #00f2fe)', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                    <Send size={12} style={{ display: 'inline', marginRight: '4px' }} /> Atama
                  </button>
                )}
                {o.status === 'in_progress' && (
                  <button onClick={() => completeWorkOrder(o.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10B981, #48bb78)', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                    ✓ Tamamla
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bildirimler */}
      <div style={{ padding: '16px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🔔 Bakım & Arıza Bildirimleri</h3>
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
