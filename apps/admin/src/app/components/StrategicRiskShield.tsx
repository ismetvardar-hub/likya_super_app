'use client';

import React, { useState } from 'react';
import { Shield, AlertTriangle, Wifi, Building2, Users, Send, Clock, Award, MessageSquare, Star } from 'lucide-react';

// ============================================================================
// LİKYA STRATEJİK RİSK KALKANI & KRİTİK GÖREV YÖNETİMİ
// Bürokrasi/KVKK Shield + Offline Mimari + Esnaf İkna + Görev Dağıtımı
// ============================================================================

interface CriticalTask {
  id: string;
  title: string;
  department: string;
  employee: string;
  criticality: 'critical' | 'high' | 'medium';
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  successScore: number;
  bonus: number;
}

interface RiskShield {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'active' | 'monitoring' | 'planned';
}

export default function StrategicRiskShield() {
  const [shields, setShields] = useState<RiskShield[]>([
    { id: '1', name: 'Modüler/Taşınabilir Mimari', icon: '🏗️', description: 'Geodesic kubbe + cıvatalı hafif çelik + Tiny House formatı — OGM/İmar riski sıfırlanır', status: 'active' },
    { id: '2', name: 'KVKK Anonimleştirme Kalkanı', icon: '🛡️', description: 'Elektrik analizi anonim: "A-4 Blokta beklenmeyen güç çekişi" — kişi ifşa edilmez', status: 'active' },
    { id: '3', name: 'IoT Offline Queue & IP67', icon: '📶', description: 'Pedestal dahili bellek son 1.000 işlemi saklar, internet gelince senkronize olur', status: 'active' },
    { id: '4', name: 'Wearable Bridge (BLE)', icon: '⌚', description: 'Apple/Garmin bağımsız — her BLE göğüs bandı ve akıllı saat ile çalışır', status: 'monitoring' },
    { id: '5', name: 'Kademeli Peşin Kira Modeli', icon: '🏪', description: 'İlk yıl başarıya bağlı teminatlı kira, 3 ay ciro verisi sonrası peşin kira', status: 'planned' },
    { id: '6', name: 'Biyometrik Dijital Kubbe', icon: '🌌', description: 'Geodesic membran kubbe — performans verilerini gökyüzüne yansıtan deneyim merkezi', status: 'planned' },
  ]);

  const [tasks, setTasks] = useState<CriticalTask[]>([
    { id: '1', title: 'A-4 Blokta beklenmeyen güç çekişi tespiti — teknik kontrol', department: 'Altyapı', employee: 'Ali Şahin', criticality: 'critical', deadline: '2 saat', status: 'in_progress', successScore: 0, bonus: 500 },
    { id: '2', title: 'Pedestal IP67 muhafaza zırhı montajı', department: 'IoT', employee: 'Mehmet Demir', criticality: 'high', deadline: '1 gün', status: 'pending', successScore: 0, bonus: 300 },
    { id: '3', title: 'KVKK açık rıza paneli güncellemesi', department: 'Hukuk', employee: 'Zeynep Kaya', criticality: 'critical', deadline: '4 saat', status: 'pending', successScore: 0, bonus: 400 },
    { id: '4', title: 'BLE wearable bridge entegrasyon testi', department: 'Yazılım', employee: 'Can Yılmaz', criticality: 'medium', deadline: '2 gün', status: 'pending', successScore: 0, bonus: 200 },
  ]);

  const [notifications, setNotifications] = useState<string[]>([
    '📨 Ali Şahin\'e kritik görev atandı: "A-4 Blokta beklenmeyen güç çekişi" (Kritiklik: 🔴 Kritik, Süre: 2 saat)',
  ]);

  const assignTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'in_progress' } : t))
    );

    setNotifications((prev) => [
      `📨 ${task.employee}'e görev atandı: "${task.title}" (Kritiklik: ${task.criticality === 'critical' ? '🔴 Kritik' : task.criticality === 'high' ? '🟠 Yüksek' : '🟡 Orta'}, Süre: ${task.deadline})`,
      ...prev,
    ]);
  };

  const completeTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const score = Math.floor(80 + Math.random() * 20); // 80-100 başarı puanı

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'completed', successScore: score } : t))
    );

    setNotifications((prev) => [
      `✅ ${task.employee} görevi tamamladı: "${task.title}" — Başarı Puanı: ${score}/100, Prim: ${task.bonus} ₺ 🏆`,
      ...prev,
    ]);
  };

  const getCriticalityColor = (c: CriticalTask['criticality']) => {
    switch (c) {
      case 'critical': return '#f87171';
      case 'high': return '#fbbf24';
      case 'medium': return '#00f2fe';
    }
  };

  const getCriticalityLabel = (c: CriticalTask['criticality']) => {
    switch (c) {
      case 'critical': return '🔴 Kritik';
      case 'high': return '🟠 Yüksek';
      case 'medium': return '🟡 Orta';
    }
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="#34d399" />
            Stratejik Risk Kalkanı & Kritik Görev Yönetimi
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Bürokrasi • KVKK • IoT • Esnaf İkna • Biyometrik Kubbe</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
            🛡️ {shields.filter((s) => s.status === 'active').length} Aktif Kalkan
          </div>
          <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>
            📋 {tasks.filter((t) => t.status !== 'completed').length} Aktif Görev
          </div>
        </div>
      </div>

      {/* Risk Kalkanları */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🛡️ Risk Kalkanları</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {shields.map((s) => (
            <div key={s.id} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '24px' }}>{s.icon}</div>
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: s.status === 'active' ? 'rgba(52,211,153,0.2)' : s.status === 'monitoring' ? 'rgba(0,242,254,0.2)' : 'rgba(148,163,184,0.2)', color: s.status === 'active' ? '#34d399' : s.status === 'monitoring' ? '#00f2fe' : '#94a3b8', border: `1px solid ${s.status === 'active' ? 'rgba(52,211,153,0.3)' : s.status === 'monitoring' ? 'rgba(0,242,254,0.3)' : 'rgba(148,163,184,0.3)'}` }}>
                  {s.status === 'active' ? '✅ Aktif' : s.status === 'monitoring' ? '📡 İzleniyor' : '📋 Planlandı'}
                </span>
              </div>
              <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9', marginTop: '8px' }}>{s.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{s.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Kritik Görev Yönetimi */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>📋 Kritik Görev Yönetimi (Departman Bazlı)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tasks.map((t) => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: `1px solid ${getCriticalityColor(t.criticality)}`, borderRadius: '10px', padding: '12px 16px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{t.title}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  🏢 {t.department} • 👤 {t.employee} • ⏰ {t.deadline}
                </div>
                <div style={{ fontSize: '11px', color: getCriticalityColor(t.criticality), marginTop: '4px' }}>
                  {getCriticalityLabel(t.criticality)} • 🏆 Prim: {t.bonus} ₺
                </div>
                {t.status === 'completed' && (
                  <div style={{ fontSize: '11px', color: '#34d399', marginTop: '4px' }}>
                    ⭐ Başarı Puanı: {t.successScore}/100
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: t.status === 'completed' ? 'rgba(52,211,153,0.2)' : t.status === 'in_progress' ? 'rgba(0,242,254,0.2)' : 'rgba(148,163,184,0.2)', color: t.status === 'completed' ? '#34d399' : t.status === 'in_progress' ? '#00f2fe' : '#94a3b8', border: `1px solid ${t.status === 'completed' ? 'rgba(52,211,153,0.3)' : t.status === 'in_progress' ? 'rgba(0,242,254,0.3)' : 'rgba(148,163,184,0.3)'}` }}>
                  {t.status === 'completed' ? '✅ Tamamlandı' : t.status === 'in_progress' ? '🔄 Devam Ediyor' : '⏳ Bekliyor'}
                </span>
                {t.status === 'pending' && (
                  <button onClick={() => assignTask(t.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0f4c81, #00f2fe)', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                    <Send size={12} style={{ display: 'inline', marginRight: '4px' }} /> Görevlendir
                  </button>
                )}
                {t.status === 'in_progress' && (
                  <button onClick={() => completeTask(t.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10B981, #48bb78)', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
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
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>📨 Departman Bildirimleri</h3>
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
