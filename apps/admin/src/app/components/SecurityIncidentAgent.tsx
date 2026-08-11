'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Siren,
  Camera,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  Zap,
  Activity,
  Radio
} from 'lucide-react';

interface Incident {
  id: string;
  type: 'İzinsiz Geçiş' | 'Bölge Yoğunluk Aşımı' | 'Acil Durum / Panik' | 'Kayıp Eşya / Çocuk';
  zone: string;
  severity: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  assignedGuard: string;
  status: 'ALGILANDI' | 'EKİP_YÖNLENDİRİLDİ' | 'ÇÖZÜLDÜ';
  detectedAt: string;
}

export default function SecurityIncidentAgent() {
  const [isScanning, setIsScanning] = useState(false);
  const [panicMode, setPanicMode] = useState(false);

  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'SEC-801',
      type: 'İzinsiz Geçiş',
      zone: 'Otopark & Turnikeler (Turnike #4)',
      severity: 'YÜKSEK',
      assignedGuard: 'Ahmet Yılmaz (Güvenlik Kaptan)',
      status: 'EKİP_YÖNLENDİRİLDİ',
      detectedAt: '12:04'
    },
    {
      id: 'SEC-802',
      type: 'Bölge Yoğunluk Aşımı',
      zone: 'Etkinlik & Gösteri Meydanı',
      severity: 'ORTA',
      assignedGuard: 'Mustafa Demir (Saha Devriye)',
      status: 'ALGILANDI',
      detectedAt: '12:18'
    }
  ]);

  const [logs, setLogs] = useState<string[]>([
    '[SecurityAgent] 24 AI Destekli Güvenlik Kamerası ve Turnike Akışı Dinleniyor.',
    '[Otonom Sinyal] Turnike #4 geçersiz bilet zorlaması algılandı. Kamera K-02 kilitlendi.'
  ]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('tr-TR');
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 7)]);
  };

  // Otonom Güvenlik ve Kamera Taraması
  const runSecurityScan = async () => {
    setIsScanning(true);
    addLog('🛡️ [SecurityAgent] Park geneli AI görüntü işleme ve turnike güvenlik taraması başlatıldı...');

    await new Promise((r) => setTimeout(r, 800));

    addLog('✅ [SecurityScan PASS] Turnike #4 izinsiz geçiş teşebbüsü engellendi. Saha ekibi doğruladı.');

    setIncidents((prev) =>
      prev.map((inc) => (inc.id === 'SEC-801' ? { ...inc, status: 'ÇÖZÜLDÜ' } : inc))
    );

    setIsScanning(false);
  };

  // Acil Durum / Tahliye Protokolünü Tetikle
  const togglePanicMode = () => {
    const nextState = !panicMode;
    setPanicMode(nextState);

    if (nextState) {
      addLog('🚨 [ACİL DURUM PROTOKOLÜ] TÜM TURNİKELER SERBEST GEÇİŞE AÇILDI. TAHLİYE SİNYALİ YAYINLANIYOR!');
    } else {
      addLog('🟢 [ACİL DURUM İPTAL] Park güvenlik protokolü standart moda döndürüldü.');
    }
  };

  const resolveIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: 'ÇÖZÜLDÜ' } : inc))
    );
    addLog(`✅ [Saha Onayı] ${id} kodlu güvenlik olayı çözüme kavuşturuldu.`);
  };

  const getSeverityBadge = (severity: Incident['severity']) => {
    switch (severity) {
      case 'KRİTİK':
        return <span style={{ background: '#dc2626', color: '#fff', fontWeight: 'bold', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', animation: 'pulse 1s infinite' }}>KRİTİK</span>;
      case 'YÜKSEK':
        return <span style={{ background: 'rgba(244,63,94,0.2)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.3)', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>YÜKSEK</span>;
      case 'ORTA':
        return <span style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>ORTA</span>;
      default:
        return <span style={{ background: '#334155', color: '#cbd5e1', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>DÜŞÜK</span>;
    }
  };

  return (
    <div style={{
      border: `1px solid ${panicMode ? '#e11d48' : '#1e293b'}`,
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      marginTop: '16px',
      background: panicMode ? 'rgba(136,19,55,0.8)' : '#0f172a',
      transition: 'all 0.3s ease',
      boxShadow: panicMode ? '0 0 0 4px rgba(225,29,72,0.3)' : '0 20px 40px rgba(0,0,0,0.4)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color={panicMode ? '#fb7185' : '#f43f5e'} style={{ animation: panicMode ? 'bounce 1s infinite' : 'none' }} />
            Güvenlik & Olay Yönetimi (Security & Incident) Ajanı
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
            Turnike İhlal Algılama, Kameralı Olay Tespiti ve Otonom Acil Durum Protokolü
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={runSecurityScan}
            disabled={isScanning || panicMode}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', fontSize: '12px', fontWeight: 'bold', padding: '8px 12px', borderRadius: '12px', cursor: isScanning || panicMode ? 'not-allowed' : 'pointer' }}
          >
            {isScanning ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite', color: '#818cf8' }} /> : <Zap size={16} color="#fbbf24" />}
            Güvenlik Taraması
          </button>

          <button
            onClick={togglePanicMode}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', background: panicMode ? '#059669' : '#dc2626', color: '#fff', boxShadow: panicMode ? '0 4px 12px rgba(5,150,105,0.5)' : '0 4px 12px rgba(220,38,38,0.5)' }}
          >
            <Siren size={16} style={{ animation: 'pulse 1s infinite' }} />
            {panicMode ? 'Acil Durumu Kapat' : 'Acil Durum / Tahliye'}
          </button>
        </div>
      </div>

      {/* Güvenlik Durumu Göstergesi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(2,6,23,0.8)', border: '1px solid #1e293b', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px' }}>
            <ShieldCheck size={24} color="#34d399" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Turnike Güvenlik Durumu</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f1f5f9', marginTop: '2px' }}>
              {panicMode ? 'SERBEST GEÇİŞ (TAHLİYE)' : 'TAM GÜVENLİ (24 Turnike Aktif)'}
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(2,6,23,0.8)', border: '1px solid #1e293b', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px' }}>
            <Camera size={24} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>AI Kamera Akışı</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f1f5f9', marginTop: '2px' }}>24 / 24 Kamera Canlı İzlemede</div>
          </div>
        </div>

        <div style={{ background: 'rgba(2,6,23,0.8)', border: '1px solid #1e293b', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px' }}>
            <Radio size={24} color="#fb7185" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Devriye Güvenlik Ekipleri</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f1f5f9', marginTop: '2px' }}>6 Personel Sahada Aktif</div>
          </div>
        </div>
      </div>

      {/* Aktif Olaylar (Incidents) Listesi */}
      <div style={{ background: 'rgba(2,6,23,0.6)', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertOctagon size={14} color="#fb7185" /> Aktif Güvenlik İhlalleri & Olaylar
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {incidents.map((inc) => (
            <div key={inc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '12px', background: 'rgba(15,23,42,0.9)', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#e2e8f0' }}>{inc.id}</span>
                  <span style={{ color: '#fda4af', fontWeight: '600' }}>— {inc.type}</span>
                  {getSeverityBadge(inc.severity)}
                </div>
                <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>{inc.zone}</p>
                <div style={{ fontSize: '11px', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span>Atanan Ekip: {inc.assignedGuard}</span>
                  <span>• SAAT: {inc.detectedAt}</span>
                </div>
              </div>

              <div>
                {inc.status === 'ÇÖZÜLDÜ' ? (
                  <span style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', fontSize: '11px', padding: '4px 12px', borderRadius: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Çözüldü
                  </span>
                ) : (
                  <button
                    onClick={() => resolveIncident(inc.id)}
                    style={{ background: '#059669', color: '#fff', fontSize: '11px', fontWeight: '600', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', border: 'none' }}
                  >
                    Olayı Kapat
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canlı Log Akışı */}
      <div style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', fontFamily: 'monospace', fontSize: '12px', color: '#cbd5e1' }}>
        <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={14} color="#34d399" /> Canlı Güvenlik Log Akışı
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {logs.map((log, index) => (
            <div key={index} style={{ lineHeight: '1.5', borderBottom: '1px solid rgba(30,41,59,0.4)', paddingBottom: '4px' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
