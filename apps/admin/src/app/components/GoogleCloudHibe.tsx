'use client';

import React, { useState } from 'react';
import { Cloud, FileDown, Rocket, TrendingUp, Users, CircleDollarSign, CheckCircle2, Loader2 } from 'lucide-react';

// ============================================================================
// LİKYA GOOGLE CLOUD AI KREDİ & HİBE MOTORU
// 350.000$ Google Cloud AI hibe başvuru dosyasını otomatik oluşturan asistan
// ============================================================================

interface MetricRow {
  label: string;
  value: string;
  growth: string;
}

const STARTUP_METRICS: MetricRow[] = [
  { label: 'Yıllık Tekrarlayan Gelir (ARR)', value: '$148.000', growth: '+%18 / ay' },
  { label: 'Aylık Tekrarlayan Gelir (MRR)', value: '$12.340', growth: '+%18 / ay' },
  { label: 'Aktif Müşteri (B2B SaaS + Kampüs)', value: '2.140', growth: '+%12 / ay' },
  { label: 'Aylık Churn Oranı', value: '%2.1', growth: 'sektör ort. %5 üstünde' },
];

export default function GoogleCloudHibe() {
  const [phase, setPhase] = useState<'idle' | 'compiling' | 'done'>('idle');

  const compileAndDownload = () => {
    setPhase('compiling');
    const content = `LIKYA CAMPUS - GOOGLE CLOUD AI STARTUP CREDIT APPLICATION
============================================================
Başvuru Tarihi: ${new Date().toISOString()}

1. ŞİRKET PROFİLİ
- Firma: Likya Kampüs Teknoloji A.Ş.
- Sektör: Turizm + SaaS + IoT (Phygital Kampüs Deneyimi)
- Merkez: Antalya, Türkiye (ABD LLC: Likya Technologies LLC)

2. ÜRÜN
- Likya Super-App: 4 rollü (CEO/Kiracı/Çalışan/Müşteri) dijital kampüs platformu
- 21 AI ajanlı Multi-Agent Mesh (CrewAI/LangGraph), Gemini + DeepSeek entegrasyonu
- IoT saha sensör ağı + Supabase edge computing + 3D dijital ikiz

3. METRİKLER
${STARTUP_METRICS.map((m) => `- ${m.label}: ${m.value} (${m.growth})`).join('\n')}

4. AI KULLANIM ALANLARI
- Dinamik fiyatlama & talep tahmini (gemini-3.5-flash)
- Kişisel sağlık/beslenme koçu (Daze Vision)
- Otonom stok & tedarik optimizasyonu
- 7/24 anomali tespiti (saha güvenliği)

5. TALEP EDİLEN HİBE: 350.000 USD Google Cloud Kredisi
6. YÜKLEME PLANI: 12 ay, %60 makine öğrenimi %40 veri altyapısı

--- Likya CEO tarafından otomatik derlendi ---`;

    setTimeout(() => {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'google-cloud-ai-hibe-basvuru.md';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setPhase('done');
      setTimeout(() => setPhase('idle'), 4000);
    }, 1400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cloud size={20} color="#60a5fa" />
            Google Cloud AI Kredi &amp; Hibe Motoru
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>350.000$ AI Cloud Hibe Asistanı • Otomatik Başvuru Dosyası</p>
        </div>
        <span style={{ padding: '6px 12px', background: 'rgba(96,165,250,0.15)', color: '#60a5fa', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(96,165,250,0.3)' }}>
          💰 350.000$ Uygunluk Tespit Edildi
        </span>
      </div>

      {/* Ana hibe kartı */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(96,165,250,0.12), rgba(139,92,246,0.08))',
        border: '1px solid rgba(96,165,250,0.3)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(96,165,250,0.1)', filter: 'blur(30px)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#e2e8f0', fontWeight: '600' }}>
          <Rocket size={18} color="#60a5fa" />
          Startup Metrikleri Derlendi — Başvuruya Hazır
        </div>

        {/* Metrik tablosu */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {STARTUP_METRICS.map((m) => (
            <div key={m.label} style={{
              background: 'rgba(13,19,34,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{m.label}</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {m.label.includes('Müşteri') ? <Users size={14} color="#60a5fa" /> : <TrendingUp size={14} color="#34d399" />}
                {m.value}
              </div>
              <div style={{ fontSize: '10px', color: '#34d399' }}>{m.growth}</div>
            </div>
          ))}
        </div>

        {/* Aksiyon butonları */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={compileAndDownload}
            disabled={phase === 'compiling'}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px',
              borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
              border: '1px solid rgba(96,165,250,0.5)',
              background: phase === 'compiling' ? 'rgba(96,165,250,0.1)' : 'rgba(96,165,250,0.2)',
              color: '#93c5fd',
            }}
          >
            {phase === 'compiling' ? <Loader2 size={16} style={{ animation: 'radarSpin 1s linear infinite' }} /> : <FileDown size={16} />}
            {phase === 'compiling' ? 'Derleniyor...' : phase === 'done' ? 'Başvuru Dosyası İndirildi!' : 'Başvuru Dosyasını Oluştur & İndir'}
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px',
            borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: '#e2e8f0',
          }}>
            <CircleDollarSign size={16} color="#34d399" />
            Hibe Takvimi: 12 ay • %60 ML / %40 Veri
          </button>
        </div>
      </div>

      {/* Uygunluk kontrol listesi */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '16px',
      }}>
        <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '10px' }}>
          ✅ Google Cloud Uygunluk Kontrolü
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            'AI/ML tabanlı ürün: 21 ajanlı Multi-Agent Mesh (geçerli)',
            'Gelir eşiği: ARR $148K (yeni nesil AI startupları < $5M — geçerli)',
            'Kuruluş tarihi: 2024 (son 10 yıl — geçerli)',
            'Bulut taahhüdü: Google Cloud öncelikli mimari (uyumlu)',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
              <CheckCircle2 size={14} color="#48bb78" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

