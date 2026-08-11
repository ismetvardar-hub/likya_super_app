'use client';

import React, { useState } from 'react';

interface Subsidiary {
  id: string;
  name: string;
  code: string;
  icon: string;
  leadAgent: string;
  agentRole: string;
  monthlyRevenue: string;
  activeWorkforce: string;
  healthScore: number;
  status: 'optimal' | 'busy' | 'alert';
  description: string;
  kpis: { label: string; value: string }[];
}

export default function HoldingCompanyMatrix() {
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([
    {
      id: 'sub-1',
      name: 'Likya Fintek & Cüzdan A.Ş.',
      code: 'LKY-FIN',
      icon: '💎',
      leadAgent: 'CFO Ajanı (Aura-Fin)',
      agentRole: 'Hazine & Likya Coin Borsa Yönetimi',
      monthlyRevenue: '₺340,000',
      activeWorkforce: '1,428 Aktif Cüzdan',
      healthScore: 99.4,
      status: 'optimal',
      description: 'P2P mikro ödemeler, akıllı bilet transferleri ve karbon kredisi tokenizasyon motoru.',
      kpis: [
        { label: 'Likya Coin Hacmi', value: '840,000 LKY' },
        { label: 'Likidite Rezervi', value: '₺1.2M' },
        { label: 'İşlem Güvenliği', value: '%100 W3C DID' },
      ],
    },
    {
      id: 'sub-2',
      name: 'Likya Lojistik & Havacılık A.Ş.',
      code: 'LKY-LOG',
      icon: '🛸',
      leadAgent: 'COO Ajanı (Vortex-Ops)',
      agentRole: 'Otonom Rover & SAR Dron Filosu',
      monthlyRevenue: '₺185,000',
      activeWorkforce: '6 Otonom Rover, 4 Kargo Dronu',
      healthScore: 97.8,
      status: 'optimal',
      description: 'Binalar ve açık hava amfi sahneleri arası temassız otonom kargo ve FLIR termal kurtarma.',
      kpis: [
        { label: 'Aktif Teslimatlar', value: '14 Paket/saat' },
        { label: 'Ortalama Varış', value: '4.2 Dakika' },
        { label: 'Filo Bataryası', value: '%93 Ortalama' },
      ],
    },
    {
      id: 'sub-3',
      name: 'Likya Enerji & Mikro-Şebeke A.Ş.',
      code: 'LKY-NRG',
      icon: '☀️',
      leadAgent: 'CTO Ajanı (Helios-Tech)',
      agentRole: 'Güneş Santrali (GES) & Batarya Depolama',
      monthlyRevenue: '₺95,000 (Tasarruf)',
      activeWorkforce: '142.8 kW Canlı GES',
      healthScore: 98.9,
      status: 'optimal',
      description: 'Kampüs ve açık hava tesislerinin %100 yenilenebilir güneş enerjisiyle beslenmesi.',
      kpis: [
        { label: 'Günlük Üretim', value: '980 kWh' },
        { label: 'Karbon Tasarrufu', value: '2.4 Ton CO₂/ay' },
        { label: 'Şebeke Bağımsızlığı', value: '%88.5' },
      ],
    },
    {
      id: 'sub-4',
      name: 'Likya Gıda & Döngüsel Tarım A.Ş.',
      code: 'LKY-AGR',
      icon: '🫒',
      leadAgent: 'CSO Ajanı (Gaia-Eco)',
      agentRole: 'Biyogaz, Kompost & Askıda Yemek',
      monthlyRevenue: '₺120,000',
      activeWorkforce: '3,400 kg Gıda Kurtarma',
      healthScore: 96.5,
      status: 'optimal',
      description: 'Organik atıkların fermantasyonu, gübre üretimi ve sıfır atık restoran zinciri.',
      kpis: [
        { label: 'Kompost Reaktörü', value: '58.4°C Aktif' },
        { label: 'Kurtarılan Yemek', value: '450 Porsiyon/hafta' },
        { label: 'Depozito Ambalaj İadesi', value: '%94 Başarı' },
      ],
    },
    {
      id: 'sub-5',
      name: 'Likya Kültür & Sanat A.Ş.',
      code: 'LKY-CLT',
      icon: '🎭',
      leadAgent: 'CMO Ajanı (Lyra-Creative)',
      agentRole: 'Antik Kent Rehberi, Canlı Konserler & AR',
      monthlyRevenue: '₺260,000',
      activeWorkforce: '12 Sahne, 4 Amfi Tiyatro',
      healthScore: 99.1,
      status: 'optimal',
      description: 'Akdeniz kültürel mirası, AR navigasyon vizörleri ve 3D dinamik biletleme.',
      kpis: [
        { label: 'Satılan Biletler', value: '1,250 Bilet' },
        { label: 'Sesli Rehber Dinleme', value: '3,890 Saat' },
        { label: 'Hatıra Ormanı Fidan', value: '520 Dikim' },
      ],
    },
  ]);

  const [selectedSub, setSelectedSub] = useState<Subsidiary | null>(subsidiaries[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Holding Başlığı */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.4), rgba(224, 122, 95, 0.2))',
          border: '1px solid rgba(0, 242, 254, 0.3)',
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
            <span style={{ fontSize: '28px' }}>🏛️</span>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
              LİKYA HOLDİNG — C-SUITE OTONOM AJAN MATRİSİ
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            5 Bağlı Şirket, 6 C-Level Yapay Zeka Ajanı ve Kendi Kendini Yöneten Otonom Ekosistem
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Toplam Holding Hacmi</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-green)' }}>₺1,000,000+</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Holding Sağlık İndeksi</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>%98.4</div>
          </div>
        </div>
      </div>

      {/* Şirket Kartları Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {subsidiaries.map((sub) => {
          const isSelected = selectedSub?.id === sub.id;
          return (
            <div
              key={sub.id}
              onClick={() => setSelectedSub(sub)}
              style={{
                background: isSelected ? 'rgba(0, 242, 254, 0.08)' : 'var(--card-bg)',
                border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '26px' }}>{sub.icon}</span>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white' }}>{sub.name}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--accent-orange)', fontWeight: '600' }}>{sub.code}</span>
                  </div>
                </div>
                <span
                  style={{
                    background: 'rgba(72, 187, 120, 0.15)',
                    color: 'var(--accent-green)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  %{sub.healthScore}
                </span>
              </div>

              <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>👤 {sub.leadAgent}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{sub.agentRole}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Hacim / Gelir:</span>
                <span style={{ fontWeight: 'bold', color: 'white' }}>{sub.monthlyRevenue}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>İş Gücü / Filo:</span>
                <span style={{ fontWeight: '600', color: 'white' }}>{sub.activeWorkforce}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seçili Şirket Detay Paneli */}
      {selectedSub && (
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                {selectedSub.icon} {selectedSub.name} — Otonom Ajan Raporu
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                {selectedSub.description}
              </p>
            </div>
            <button
              style={{
                background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
              onClick={() => alert(`${selectedSub.leadAgent} direktifi aldı ve alt ajanlara görev dağıtımı yaptı.`)}
            >
              ⚡ {selectedSub.leadAgent}'a Talimat Ver
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {selectedSub.kpis.map((kpi, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{kpi.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginTop: '4px' }}>{kpi.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
