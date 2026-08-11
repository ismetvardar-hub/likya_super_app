'use client';

import React, { useState } from 'react';

interface VisionScanResult {
  id: string;
  category: 'flora_botany' | 'hardware_defect' | 'epigraphy_ocr';
  targetName: string;
  confidence: number;
  aiAnalysis: string;
  timestamp: string;
  badge: string;
}

export default function AiVisionSentryScanner() {
  const [scans, setScans] = useState<VisionScanResult[]>([
    {
      id: 'VS-501',
      category: 'flora_botany',
      targetName: 'Likya Orkidesi (Ophrys lycia) 🌸',
      confidence: 99.2,
      aiAnalysis: 'Toros Dağları endemik türü tespit edildi. Kırmızı Liste (CR) koruma statüsünde. GPS koordinatı kayıt altına alındı.',
      timestamp: '14:52:10',
      badge: 'ENDEMİK BİTKİ KORUMA 🌿',
    },
    {
      id: 'VS-502',
      category: 'hardware_defect',
      targetName: '3D Baskılı Kargo Rover Şasi Bağlantısı 🛠️',
      confidence: 96.8,
      aiAnalysis: 'Kenar AI lehim ve katman analizi yaptı: Mikroskobik gerilme çatlağı saptandı. Parça geri dönüşüme ayrıldı.',
      timestamp: '14:45:00',
      badge: 'KENAR AI KALİTE KONTROL 🔍',
    },
    {
      id: 'VS-503',
      category: 'epigraphy_ocr',
      targetName: 'Likya Dili Mezar Yazıtı (Eski Yunanca & Likyaca) 📜',
      confidence: 94.5,
      aiAnalysis: 'OCR çevirisi tamamlandı: "Bu anıtı Likyalı Kherei ailesi adına dikmiştir." Dijital Miras Kasasına aktarıldı.',
      timestamp: '14:30:15',
      badge: 'EPİGRAFİ ÇEVİRİ MERKEZİ 🏛️',
    },
  ]);

  const [isScanning, setIsScanning] = useState(false);

  const simulateLiveVisionScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const newScan: VisionScanResult = {
        id: `VS-${Math.floor(500 + Math.random() * 200)}`,
        category: 'flora_botany',
        targetName: 'Sedir Ağacı (Cedrus libani) Genç Fidan 🌲',
        confidence: 98.6,
        aiAnalysis: 'Hatıra Ormanı sektör 2 bölgesinde sağlıklı sürgün gelişimi tespit edildi. Güneşlenme oranı optimal.',
        timestamp: new Date().toLocaleTimeString('tr-TR'),
        badge: 'ORMAN SAĞLIĞI İZLEME 🌲',
      };
      setScans([newScan, ...scans]);
      setIsScanning(false);
      alert('👁️ Kenar AI Görüntü Sentrisi yeni canlı nesne analizini tamamladı ve sisteme işledi!');
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Başlık */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(15, 76, 129, 0.4))',
          border: '1px solid rgba(0, 242, 254, 0.4)',
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
            <span style={{ fontSize: '28px' }}>👁️</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
              OTONOM ÇOK MODLU AI GÖRÜNTÜ SENTRİSİ & BİYOLOJİK ÇEŞİTLİLİK
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            40ms sıfır gecikmeli cihaz üstü Edge AI: Endemik flora takibi, donanım kusur tespiti ve antik epigrafi OCR taraması.
          </p>
        </div>

        <button
          onClick={simulateLiveVisionScan}
          disabled={isScanning}
          style={{
            background: isScanning ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: isScanning ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 18px rgba(0, 242, 254, 0.35)',
          }}
        >
          {isScanning ? '⏳ AI Nesneyi Analiz Ediyor...' : '📸 Canlı Kamera Taraması Başlat'}
        </button>
      </div>

      {/* Tarama Kartları */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {scans.map((s) => (
          <div
            key={s.id}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '18px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{s.id}</span>
                <span style={{ fontWeight: 'bold', color: 'white', fontSize: '15px' }}>{s.targetName}</span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(0, 242, 254, 0.15)',
                    color: 'var(--accent-cyan)',
                    fontWeight: 'bold',
                  }}
                >
                  {s.badge}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Güven Skoru: <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>%{s.confidence}</span> • {s.timestamp}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                color: '#cbd5e1',
                borderLeft: '3px solid var(--accent-cyan)',
              }}
            >
              🤖 <strong>AI Teşhis & Sınıflandırma:</strong> {s.aiAnalysis}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
