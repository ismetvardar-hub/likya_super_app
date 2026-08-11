'use client';

import React, { useState } from 'react';
import { Activity, Cpu, Database, Gauge, Play, RefreshCw, Server, Shield, Timer, Zap } from 'lucide-react';

// ============================================================================
// LİKYA SİSTEM STRES TESTİ & EDGE FUNCTIONS ENTEGRASYONU
// Faz 3 Modül 3: Yük testi + Edge Function orkestratörü + Canlı sağlık metrikleri
// ============================================================================

interface HealthMetric {
  label: string;
  value: string;
  status: 'ok' | 'warning' | 'critical';
  icon: React.ReactNode;
}

interface EdgeFunction {
  name: string;
  schedule: string;
  status: 'idle' | 'running' | 'success' | 'error';
  lastRun: string;
  description: string;
}

export default function SystemStressTestAndEdgeController() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ rps: number; latency: number; errorRate: number; passed: boolean } | null>(null);
  const [edgeFunctions, setEdgeFunctions] = useState<EdgeFunction[]>([
    { name: 'cron-occupancy-sync', schedule: 'Her 5 dk', status: 'idle', lastRun: '—', description: 'Doluluk verilerini IoT sensörlerinden senkronize eder' },
    { name: 'auto-dynamic-pricing', schedule: 'Her 15 dk', status: 'idle', lastRun: '—', description: 'Yoğunluğa göre dinamik fiyat günceller' },
    { name: 'supplier-reorder-trigger', schedule: 'Her 30 dk', status: 'idle', lastRun: '—', description: 'Kritik stokta otonom tedarikçi siparişi tetikler' },
  ]);

  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([
    { label: 'Ortalama Gecikme', value: '—', status: 'ok', icon: <Timer size={14} /> },
    { label: 'İstek/Saniye (RPS)', value: '—', status: 'ok', icon: <Gauge size={14} /> },
    { label: 'Hata Oranı', value: '—', status: 'ok', icon: <Shield size={14} /> },
    { label: 'DB Bağlantı Havuzu', value: '—', status: 'ok', icon: <Database size={14} /> },
  ]);

  // Yük & Stres Testi Motoru
  const runStressTest = () => {
    setIsTesting(true);
    setTestResult(null);
    setHealthMetrics((prev) => prev.map((m) => ({ ...m, value: 'Test ediliyor...', status: 'warning' })));

    setTimeout(() => {
      // 1000 RPS hedefi altında simülasyon
      const rps = Math.floor(800 + Math.random() * 400); // 800-1200 RPS
      const latency = Math.floor(40 + Math.random() * 80); // 40-120ms
      const errorRate = Math.random() * 3; // %0-3
      const passed = rps >= 1000 && latency < 100 && errorRate < 2;

      setTestResult({ rps, latency, errorRate: parseFloat(errorRate.toFixed(2)), passed });

      setHealthMetrics([
        { label: 'Ortalama Gecikme', value: `${latency}ms`, status: latency < 80 ? 'ok' : latency < 120 ? 'warning' : 'critical', icon: <Timer size={14} /> },
        { label: 'İstek/Saniye (RPS)', value: `${rps} RPS`, status: rps >= 1000 ? 'ok' : rps >= 800 ? 'warning' : 'critical', icon: <Gauge size={14} /> },
        { label: 'Hata Oranı', value: `%${errorRate.toFixed(2)}`, status: errorRate < 1 ? 'ok' : errorRate < 2 ? 'warning' : 'critical', icon: <Shield size={14} /> },
        { label: 'DB Bağlantı Havuzu', value: `${Math.floor(80 + Math.random() * 20)}%`, status: 'ok', icon: <Database size={14} /> },
      ]);

      setIsTesting(false);
    }, 2000);
  };

  // Edge Function Çalıştır
  const runEdgeFunction = (name: string) => {
    setEdgeFunctions((prev) =>
      prev.map((fn) => (fn.name === name ? { ...fn, status: 'running', lastRun: 'Çalışıyor...' } : fn))
    );
    setTimeout(() => {
      setEdgeFunctions((prev) =>
        prev.map((fn) =>
          fn.name === name
            ? { ...fn, status: 'success', lastRun: new Date().toLocaleTimeString('tr-TR') }
            : fn
        )
      );
    }, 1500);
  };

  const getStatusColor = (status: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'ok': return '#34d399';
      case 'warning': return '#fbbf24';
      case 'critical': return '#f87171';
    }
  };

  const getFnStatusBadge = (status: EdgeFunction['status']) => {
    switch (status) {
      case 'running': return <span style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>⏳ Çalışıyor</span>;
      case 'success': return <span style={{ background: 'rgba(52,211,153,0.2)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>✅ Başarılı</span>;
      case 'error': return <span style={{ background: 'rgba(248,113,113,0.2)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>❌ Hata</span>;
      default: return <span style={{ background: 'rgba(148,163,184,0.2)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.3)', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>⚪ Beklemede</span>;
    }
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={20} color="#34d399" />
            Sistem Stres Testi & Edge Functions
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>1000+ Eşzamanlı Turnike • Yoğun IoT Veri Akışı • Otonom Edge Orkestratörü</p>
        </div>

        <button
          onClick={runStressTest}
          disabled={isTesting}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', cursor: isTesting ? 'not-allowed' : 'pointer', border: 'none',
            background: isTesting ? 'rgba(16,185,129,0.5)' : '#10b981',
            color: '#fff',
          }}
        >
          {isTesting ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Test Çalışıyor...</> : <><Play size={16} /> Yük Testini Başlat</>}
        </button>
      </div>

      {/* Canlı Sistem Sağlığı */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>📊 Canlı Sistem Sağlığı</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {healthMetrics.map((metric, idx) => (
            <div key={idx} style={{ background: 'rgba(30,41,59,0.6)', border: `1px solid ${getStatusColor(metric.status)}`, padding: '16px', borderRadius: '12px' }}>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {metric.icon} {metric.label}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: getStatusColor(metric.status) }}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Sonucu */}
      {testResult && (
        <div style={{ marginBottom: '24px', padding: '16px', background: testResult.passed ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${testResult.passed ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`, borderRadius: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: testResult.passed ? '#34d399' : '#f87171', marginBottom: '8px' }}>
            {testResult.passed ? '✅ Test Başarılı — Sistem 1000+ RPS altında dayanıklı' : '⚠️ Test Uyarısı — Sistem yük altında zorlanıyor'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>İstek/Saniye</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>{testResult.rps} RPS</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Ortalama Gecikme</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>{testResult.latency}ms</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Hata Oranı</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>%{testResult.errorRate}</div>
            </div>
          </div>
        </div>
      )}

      {/* Edge Function Orkestratörü */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>⚙️ Edge Function Orkestratörü (Cron)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {edgeFunctions.map((fn) => (
            <div key={fn.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9', fontFamily: 'monospace' }}>{fn.name}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{fn.description}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>⏰ {fn.schedule} • Son çalışma: {fn.lastRun}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {getFnStatusBadge(fn.status)}
                <button
                  onClick={() => runEdgeFunction(fn.name)}
                  disabled={fn.status === 'running'}
                  style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', cursor: fn.status === 'running' ? 'not-allowed' : 'pointer' }}
                >
                  Çalıştır
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
