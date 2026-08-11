'use client';

import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock, RefreshCw, Server, Shield, Zap } from 'lucide-react';

// ============================================================================
// LİKYA LOGLAMA & İZLEME PANELİ (Admin Monitoring)
// Ödeme, webhook, scheduler ve sistem sağlığı izleme
// ============================================================================

interface LogEntry {
  id: string;
  service: 'payment' | 'webhook' | 'scheduler' | 'system';
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  time: string;
}

interface ServiceHealth {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  latency: string;
  lastCheck: string;
}

export default function MonitoringPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', service: 'payment', level: 'success', message: 'PreAuth başarılı: 666,67 TL bloke edildi (EVENT-3x3)', time: '12:30:15' },
    { id: '2', service: 'webhook', level: 'info', message: 'Webhook alındı: payment_success (paymentId: 12345)', time: '12:30:16' },
    { id: '3', service: 'scheduler', level: 'info', message: 'Cron çalıştı: auto_capture taraması başladı', time: '12:35:00' },
    { id: '4', service: 'payment', level: 'warning', message: 'Capture gecikmesi: paymentId 12346 2. denemede başarılı', time: '12:35:02' },
    { id: '5', service: 'webhook', level: 'error', message: 'Webhook imza doğrulama başarısız (paymentId: 12347)', time: '12:36:10' },
    { id: '6', service: 'system', level: 'success', message: 'Sistem sağlıklı: tüm servisler çevrimiçi', time: '12:37:00' },
  ]);

  const [services, setServices] = useState<ServiceHealth[]>([
    { name: 'payment-service', status: 'online', latency: '45ms', lastCheck: '12:37:00' },
    { name: 'event-scheduler', status: 'online', latency: '30ms', lastCheck: '12:35:00' },
    { name: 'iyzico-webhook', status: 'degraded', latency: '120ms', lastCheck: '12:36:10' },
    { name: 'supabase-realtime', status: 'online', latency: '25ms', lastCheck: '12:37:00' },
  ]);

  const [filter, setFilter] = useState<'all' | 'payment' | 'webhook' | 'scheduler' | 'system'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshLogs = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLogs((prev) => [
        { id: String(Date.now()), service: 'system', level: 'info', message: 'Loglar yenilendi', time: new Date().toLocaleTimeString('tr-TR') },
        ...prev,
      ]);
      setIsRefreshing(false);
    }, 1000);
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return '#34d399';
      case 'warning': return '#fbbf24';
      case 'error': return '#f87171';
      default: return '#94a3b8';
    }
  };

  const getServiceIcon = (service: LogEntry['service']) => {
    switch (service) {
      case 'payment': return '💳';
      case 'webhook': return '🔗';
      case 'scheduler': return '⏰';
      default: return '⚙️';
    }
  };

  const getStatusColor = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'online': return '#34d399';
      case 'degraded': return '#fbbf24';
      case 'offline': return '#f87171';
    }
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter((l) => l.service === filter);

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#34d399" />
            Loglama & İzleme Paneli
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Ödeme, Webhook, Scheduler ve Sistem Sağlığı İzleme</p>
        </div>
        <button
          onClick={refreshLogs}
          disabled={isRefreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', cursor: isRefreshing ? 'not-allowed' : 'pointer', border: 'none', background: isRefreshing ? 'rgba(52,211,153,0.5)' : '#10b981', color: '#fff' }}
        >
          {isRefreshing ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Yenileniyor...</> : <><RefreshCw size={16} /> Logları Yenile</>}
        </button>
      </div>

      {/* Service Health */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🖥️ Servis Sağlığı</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {services.map((s) => (
            <div key={s.name} style={{ background: 'rgba(30,41,59,0.6)', border: `1px solid ${getStatusColor(s.status)}`, borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#f1f5f9', fontFamily: 'monospace' }}>{s.name}</span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: getStatusColor(s.status), animation: s.status === 'online' ? 'pulse 1s infinite' : 'none' }}></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                <span>Gecikme: <strong style={{ color: '#e2e8f0' }}>{s.latency}</strong></span>
                <span>Son: {s.lastCheck}</span>
              </div>
              <div style={{ fontSize: '11px', color: getStatusColor(s.status), marginTop: '8px', fontWeight: '600' }}>
                {s.status === 'online' ? '🟢 Çevrimiçi' : s.status === 'degraded' ? '🟡 Yavaş' : '🔴 Çevrimdışı'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Filters */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(['all', 'payment', 'webhook', 'scheduler', 'system'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: filter === f ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.15)', background: filter === f ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.05)', color: filter === f ? '#00f2fe' : '#94a3b8', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
          >
            {f === 'all' ? 'Tümü' : f === 'payment' ? '💳 Ödeme' : f === 'webhook' ? '🔗 Webhook' : f === 'scheduler' ? '⏰ Scheduler' : '⚙️ Sistem'}
          </button>
        ))}
      </div>

      {/* Logs */}
      <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', fontFamily: 'monospace', fontSize: '12px', color: '#cbd5e1' }}>
        <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Canlı Log Akışı
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filteredLogs.map((log) => (
            <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px', background: 'rgba(15,23,42,0.6)', borderRadius: '8px', borderLeft: `3px solid ${getLevelColor(log.level)}` }}>
              <span style={{ fontSize: '14px' }}>{getServiceIcon(log.service)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#e2e8f0' }}>{log.message}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{log.service} • {log.time}</div>
              </div>
              <span style={{ fontSize: '10px', color: getLevelColor(log.level), fontWeight: '600' }}>
                {log.level === 'success' ? '✓' : log.level === 'warning' ? '⚠' : log.level === 'error' ? '✗' : 'ℹ'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
