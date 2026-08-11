'use client';

import React, { useState } from 'react';
import { Scale, Heart, Leaf, TrendingUp, AlertTriangle, CheckCircle2, Send } from 'lucide-react';

// ============================================================================
// LİKYA YENİ DEPARTMAN AJANLARI
// LegalRisk + GuestExperience + EnergySustainability + VendorPerformance
// ============================================================================

interface LegalAlert {
  id: string;
  title: string;
  type: 'contract' | 'kvkk' | 'gdpr';
  severity: 'critical' | 'high' | 'medium';
  status: 'active' | 'resolved';
}

interface GuestFeedback {
  id: string;
  guest: string;
  rating: number;
  comment: string;
  action: string;
  status: 'pending' | 'resolved';
}

interface EnergyZone {
  id: string;
  zone: string;
  consumption: number;
  solarProduction: number;
  status: 'optimized' | 'warning';
}

interface Vendor {
  id: string;
  name: string;
  revenue: number;
  avgRevenue: number;
  performance: number;
  status: 'good' | 'warning' | 'critical';
}

export default function DepartmentAgents() {
  const [activeTab, setActiveTab] = useState<'legal' | 'guest' | 'energy' | 'vendor'>('legal');

  const [legalAlerts, setLegalAlerts] = useState<LegalAlert[]>([
    { id: 'L-01', title: 'Kiracı sözleşmesi bitimine 30 gün kaldı — Kasap Dükkanı', type: 'contract', severity: 'high', status: 'active' },
    { id: 'L-02', title: 'Kamera K-04 kişisel veri ihlali riski — KVKK denetimi gerekli', type: 'kvkk', severity: 'critical', status: 'active' },
    { id: 'L-03', title: 'GDPR uyumluluk kontrolü — Avrupa ziyaretçi verisi', type: 'gdpr', severity: 'medium', status: 'active' },
  ]);

  const [guestFeedbacks, setGuestFeedbacks] = useState<GuestFeedback[]>([
    { id: 'G-01', guest: 'Ahmet Y.', rating: 2, comment: 'Turnikede 10 dakika bekledim, çok kötü', action: 'Dijital kahve ikramı tanımlandı ☕', status: 'pending' },
    { id: 'G-02', guest: 'Ayşe K.', rating: 5, comment: 'Harika bir deneyim, kesinlikle tekrar geleceğim!', action: 'Teşekkür puanı +50', status: 'resolved' },
  ]);

  const [energyZones, setEnergyZones] = useState<EnergyZone[]>([
    { id: 'E-01', zone: 'Karavan Parkı', consumption: 45, solarProduction: 60, status: 'optimized' },
    { id: 'E-02', zone: 'Çadır Alanı', consumption: 30, solarProduction: 55, status: 'optimized' },
    { id: 'E-03', zone: 'Aydınlatma Hatları', consumption: 70, solarProduction: 40, status: 'warning' },
  ]);

  const [vendors, setVendors] = useState<Vendor[]>([
    { id: 'V-01', name: 'Likya Kasap', revenue: 12500, avgRevenue: 15000, performance: 83, status: 'good' },
    { id: 'V-02', name: 'Likya Manav', revenue: 6800, avgRevenue: 15000, performance: 45, status: 'critical' },
    { id: 'V-03', name: 'Likya Kafe', revenue: 15600, avgRevenue: 15000, performance: 104, status: 'good' },
  ]);

  const [notifications, setNotifications] = useState<string[]>([
    '⚖️ LegalRiskAgent: Kiracı sözleşmesi bitimine 30 gün kaldı — Kasap Dükkanı',
    '💬 GuestExperienceAgent: Ahmet Y. 2 yıldız verdi — dijital kahve ikramı tanımlandı',
  ]);

  const resolveLegal = (id: string) => {
    setLegalAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'resolved' } : a)));
    setNotifications((prev) => [`✅ LegalRiskAgent: ${id} çözüldü`, ...prev]);
  };

  const resolveFeedback = (id: string) => {
    setGuestFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'resolved' } : f)));
    setNotifications((prev) => [`✅ GuestExperienceAgent: ${id} müşteri memnuniyeti sağlandı`, ...prev]);
  };

  const optimizeEnergy = (id: string) => {
    setEnergyZones((prev) => prev.map((z) => (z.id === id ? { ...z, consumption: Math.floor(z.consumption * 0.7), status: 'optimized' } : z)));
    setNotifications((prev) => [`🌱 EnergySustainabilityAgent: ${id} aydınlatma %30 düşürüldü`, ...prev]);
  };

  const recommendVendor = (id: string) => {
    setNotifications((prev) => [`📈 VendorPerformanceAgent: ${id} için AI pazarlama tavsiyesi gönderildi`, ...prev]);
  };

  const getSeverityColor = (s: LegalAlert['severity']) => {
    switch (s) {
      case 'critical': return '#f87171';
      case 'high': return '#fbbf24';
      case 'medium': return '#00f2fe';
    }
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={20} color="#a78bfa" />
            Yeni Departman Ajanları
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>LegalRisk • GuestExperience • EnergySustainability • VendorPerformance</p>
        </div>
      </div>

      {/* Tab Anahtarı */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('legal')} style={{ padding: '10px 16px', borderRadius: '10px', border: activeTab === 'legal' ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.15)', background: activeTab === 'legal' ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.05)', color: activeTab === 'legal' ? '#a78bfa' : '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          ⚖️ LegalRisk
        </button>
        <button onClick={() => setActiveTab('guest')} style={{ padding: '10px 16px', borderRadius: '10px', border: activeTab === 'guest' ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.15)', background: activeTab === 'guest' ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.05)', color: activeTab === 'guest' ? '#fbbf24' : '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          💬 GuestExperience
        </button>
        <button onClick={() => setActiveTab('energy')} style={{ padding: '10px 16px', borderRadius: '10px', border: activeTab === 'energy' ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.15)', background: activeTab === 'energy' ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.05)', color: activeTab === 'energy' ? '#34d399' : '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          🌱 EnergySustainability
        </button>
        <button onClick={() => setActiveTab('vendor')} style={{ padding: '10px 16px', borderRadius: '10px', border: activeTab === 'vendor' ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.15)', background: activeTab === 'vendor' ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.05)', color: activeTab === 'vendor' ? '#00f2fe' : '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          📈 VendorPerformance
        </button>
      </div>

      {/* LegalRisk */}
      {activeTab === 'legal' && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>⚖️ LegalRiskAgent — Hukuk, Sözleşme & Kişisel Veri</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {legalAlerts.map((a) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: `1px solid ${getSeverityColor(a.severity)}`, borderRadius: '10px', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{a.title}</div>
                  <div style={{ fontSize: '11px', color: getSeverityColor(a.severity), marginTop: '4px' }}>
                    {a.type === 'contract' ? '📄 Sözleşme' : a.type === 'kvkk' ? '🛡️ KVKK' : '🌍 GDPR'} • {a.severity === 'critical' ? '🔴 Kritik' : a.severity === 'high' ? '🟠 Yüksek' : '🟡 Orta'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: a.status === 'resolved' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)', color: a.status === 'resolved' ? '#34d399' : '#fbbf24', border: `1px solid ${a.status === 'resolved' ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}` }}>
                    {a.status === 'resolved' ? '✅ Çözüldü' : '⏳ Aktif'}
                  </span>
                  {a.status === 'active' && (
                    <button onClick={() => resolveLegal(a.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #6d28d9, #a78bfa)', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                      ✓ Çöz
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GuestExperience */}
      {activeTab === 'guest' && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>💬 GuestExperienceAgent — Müşteri İlişkileri & Şikayet</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {guestFeedbacks.map((f) => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{f.guest} • {'⭐'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{f.comment}</div>
                  <div style={{ fontSize: '11px', color: '#fbbf24', marginTop: '4px' }}>🎁 {f.action}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: f.status === 'resolved' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)', color: f.status === 'resolved' ? '#34d399' : '#fbbf24', border: `1px solid ${f.status === 'resolved' ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}` }}>
                    {f.status === 'resolved' ? '✅ Çözüldü' : '⏳ Bekliyor'}
                  </span>
                  {f.status === 'pending' && (
                    <button onClick={() => resolveFeedback(f.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #d97706, #fbbf24)', color: '#000', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                      ✓ Çöz
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EnergySustainability */}
      {activeTab === 'energy' && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🌱 EnergySustainabilityAgent — Yeşil Enerji & Karbon</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {energyZones.map((z) => (
              <div key={z.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{z.zone}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    ⚡ Tüketim: %{z.consumption} • ☀️ Güneş Üretimi: %{z.solarProduction}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: z.status === 'optimized' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)', color: z.status === 'optimized' ? '#34d399' : '#fbbf24', border: `1px solid ${z.status === 'optimized' ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}` }}>
                    {z.status === 'optimized' ? '✅ Optimize' : '⚠️ Uyarı'}
                  </span>
                  {z.status === 'warning' && (
                    <button onClick={() => optimizeEnergy(z.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10B981, #48bb78)', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                      🌱 %30 Düşür
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VendorPerformance */}
      {activeTab === 'vendor' && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>📈 VendorPerformanceAgent — Kiracı Performans & Rekabet</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {vendors.map((v) => (
              <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{v.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    💰 Ciro: {v.revenue.toLocaleString('tr-TR')} ₺ • Ortalama: {v.avgRevenue.toLocaleString('tr-TR')} ₺
                  </div>
                  <div style={{ fontSize: '11px', color: v.performance < 50 ? '#f87171' : '#34d399', marginTop: '4px' }}>
                    📊 Performans: %{v.performance}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: v.status === 'critical' ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)', color: v.status === 'critical' ? '#f87171' : '#34d399', border: `1px solid ${v.status === 'critical' ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.3)'}` }}>
                    {v.status === 'critical' ? '🔴 Kritik' : '✅ İyi'}
                  </span>
                  {v.status === 'critical' && (
                    <button onClick={() => recommendVendor(v.name)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0f4c81, #00f2fe)', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                      📈 AI Tavsiye
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bildirimler */}
      <div style={{ padding: '16px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🔔 Departman Ajan Bildirimleri</h3>
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
