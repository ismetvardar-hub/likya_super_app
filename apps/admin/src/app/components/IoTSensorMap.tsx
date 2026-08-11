'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Users, AlertTriangle, RefreshCw, Radio } from 'lucide-react';

// ============================================================================
// LİKYA IoT SENSÖR & CANLI PARK ISI HARİTASI (HEATMAP)
// Faz 2 Modül 2: occupancy_plans ve sensör verilerini canlı dinler
// ============================================================================

interface ZoneData {
  id: string;
  parcel_name: string;
  current_occupancy: number;
  max_capacity: number;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  last_updated: string;
}

export default function IoTSensorMap() {
  const [zones, setZones] = useState<ZoneData[]>([
    { id: '1', parcel_name: 'Ana Giriş Meydanı', current_occupancy: 120, max_capacity: 200, status: 'OPTIMAL', last_updated: 'Şimdi' },
    { id: '2', parcel_name: 'Restoran & Gıda Alanı', current_occupancy: 85, max_capacity: 90, status: 'CRITICAL', last_updated: 'Şimdi' },
    { id: '3', parcel_name: 'Etkinlik & Gösteri Meydanı', current_occupancy: 310, max_capacity: 500, status: 'OPTIMAL', last_updated: 'Şimdi' },
    { id: '4', parcel_name: 'Otopark & Turnikeler', current_occupancy: 140, max_capacity: 150, status: 'WARNING', last_updated: 'Şimdi' },
  ]);

  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Supabase Realtime aboneliği (opsiyonel - supabase-js kuruluysa)
  useEffect(() => {
    let channel: any = null;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseAnonKey) {
        // Dinamik import ile supabase-js yükle (kuruluysa)
        import('@supabase/supabase-js').then(({ createClient }) => {
          const supabase = createClient(supabaseUrl, supabaseAnonKey);
          channel = supabase
            .channel('schema-db-changes')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'occupancy_plans' },
              (payload: any) => {
                if (payload.new) {
                  const newZone = payload.new as any;
                  setZones((prev) =>
                    prev.map((z) =>
                      z.id === newZone.id
                        ? {
                            ...z,
                            current_occupancy: newZone.current_occupancy,
                            status:
                              newZone.current_occupancy / z.max_capacity > 0.9
                                ? 'CRITICAL'
                                : newZone.current_occupancy / z.max_capacity > 0.75
                                ? 'WARNING'
                                : 'OPTIMAL',
                            last_updated: new Date().toLocaleTimeString('tr-TR'),
                          }
                        : z
                    )
                  );
                }
              }
            )
            .subscribe((status: string) => {
              if (status === 'SUBSCRIBED') {
                setIsConnected(true);
              }
            });
        }).catch(() => {
          // supabase-js kurulu değil - yerel veri modu
          setIsConnected(false);
        });
      }
    } catch (e) {
      setIsConnected(false);
    }

    return () => {
      if (channel) {
        try { channel.unsubscribe(); } catch (e) { /* ignore */ }
      }
    };
  }, []);

  // Simülasyon: Rastgele IoT Sensör Verisi Akışı
  const triggerSensorSim = () => {
    setZones((prev) =>
      prev.map((zone) => {
        const delta = Math.floor(Math.random() * 11) - 5; // -5 ile +5 arası değişim
        const nextOcc = Math.max(0, Math.min(zone.max_capacity, zone.current_occupancy + delta));
        const ratio = nextOcc / zone.max_capacity;
        return {
          ...zone,
          current_occupancy: nextOcc,
          status: ratio >= 0.9 ? 'CRITICAL' : ratio >= 0.75 ? 'WARNING' : 'OPTIMAL',
          last_updated: new Date().toLocaleTimeString('tr-TR'),
        };
      })
    );
  };

  const getStatusBadge = (status: ZoneData['status']) => {
    switch (status) {
      case 'CRITICAL':
        return <span style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> Kritik Yoğunluk</span>;
      case 'WARNING':
        return <span style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={12} /> Yüksek Doluluk</span>;
      default:
        return <span style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> Normal</span>;
    }
  };

  const getHeatmapColor = (status: ZoneData['status']) => {
    switch (status) {
      case 'CRITICAL': return 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(127,29,29,0.4))';
      case 'WARNING': return 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(120,53,15,0.4))';
      default: return 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(19,78,74,0.3))';
    }
  };

  const getBorderColor = (status: ZoneData['status']) => {
    switch (status) {
      case 'CRITICAL': return 'rgba(239,68,68,0.5)';
      case 'WARNING': return 'rgba(245,158,11,0.5)';
      default: return 'rgba(16,185,129,0.4)';
    }
  };

  const getBarColor = (status: ZoneData['status']) => {
    switch (status) {
      case 'CRITICAL': return '#ef4444';
      case 'WARNING': return '#f59e0b';
      default: return '#10b981';
    }
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={20} color="#818cf8" style={{ animation: 'pulse 1s infinite' }} />
              IoT Sensör & Canlı Park Isı Haritası (Heatmap)
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>30-35 Dönüm Kampüs Anlık Yoğunluk ve Turnike Akışı</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(30,41,59,0.8)', padding: '6px 12px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: isConnected ? '#34d399' : '#fbbf24', animation: isConnected ? 'pulse 1s infinite' : 'none' }}></span>
              <span style={{ color: '#cbd5e1' }}>{isConnected ? 'Realtime Bağlı' : 'Yerel Veri Modu'}</span>
            </div>

            <button
              onClick={triggerSensorSim}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#4f46e5', color: '#fff', fontSize: '12px', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s', fontWeight: '500', cursor: 'pointer', border: 'none' }}
            >
              <RefreshCw size={14} /> Sensör Tetikle
            </button>
          </div>
        </div>
      </div>

      {/* Grid Zone Map */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {zones.map((zone) => {
          const ratio = Math.round((zone.current_occupancy / zone.max_capacity) * 100);
          return (
            <div
              key={zone.id}
              style={{ background: getHeatmapColor(zone.status), border: `1px solid ${getBorderColor(zone.status)}`, borderRadius: '12px', padding: '20px', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontWeight: '600', fontSize: '15px', color: '#f1f5f9' }}>{zone.parcel_name}</h3>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Son Güncelleme: {zone.last_updated}</p>
                </div>
                {getStatusBadge(zone.status)}
              </div>

              {/* Doluluk Sayacı */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '12px 0' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#fff' }}>
                  {zone.current_occupancy} <span style={{ fontSize: '13px', fontWeight: '400', color: '#94a3b8' }}>/ {zone.max_capacity} kişi</span>
                </span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#e2e8f0' }}>%{ratio}</span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', background: 'rgba(15,23,42,0.8)', height: '10px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(51,65,85,0.5)' }}>
                <div
                  style={{ height: '100%', background: getBarColor(zone.status), transition: 'width 0.5s', width: `${Math.min(100, ratio)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
