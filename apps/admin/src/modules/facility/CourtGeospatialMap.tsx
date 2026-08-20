'use client';

import React from 'react';
import {
  projectFacilityLayout,
  projectIotDevices,
  projectLngLatToMap,
  pointInPolygon,
  COURT_ZONES,
  iotStatusColor,
  type IotDevice,
} from '../../app/lib/facility/courtGeoEngine.ts';

// ============================================================================
// 🗺️ AKILLI KORT GEOSPATIAL HARİTA (MapLibre GL konsepti — vektör SVG)
// Koyu temalı çoklu kort düzeni (Kort 1-8, Spor Salonu, Soyunma Odaları),
// gerçek zamanlı geofence sınırları + aktif sporcu pinleri (GEOFENCE ENTER/EXIT),
// IoT durum göstergeleri (BLE hub, akıllı dolap kilitleri, kameralar).
// Saf motor: lib/facility/courtGeoEngine.ts
// ============================================================================

export interface AthletePin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  active?: boolean;
}

export interface CourtGeospatialMapProps {
  athletes?: AthletePin[];
  width?: number;
  height?: number;
  showIoT?: boolean;
}

const ZONE_COLORS: Record<string, string> = {
  'court-area': '#00f2fe',
  facility: '#8B5CF6',
};

export default function CourtGeospatialMap({ athletes = [], width = 1000, height = 600, showIoT = true }: CourtGeospatialMapProps) {
  const courts = projectFacilityLayout(width, height);
  const iot = showIoT ? projectIotDevices(width, height) : [];
  const zonePoints = (zoneId: string) =>
    COURT_ZONES.find((z) => z.id === zoneId)?.polygon.map(([lat, lng]) => {
      const p = projectLngLatToMap(lat, lng, width, height);
      return `${p.x},${p.y}`;
    }) ?? [];

  return (
    <div style={{ width: '100%', background: 'radial-gradient(circle at 50% 0%, #0f172a, #020617)', borderRadius: 16, padding: 10, border: '1px solid rgba(0,242,254,0.15)' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" role="img" aria-label="Akıllı Kort Geospatial Haritası">
        {/* Geofence bölgeleri */}
        {COURT_ZONES.map((z) => (
          <polygon
            key={z.id}
            points={zonePoints(z.id).join(' ')}
            fill={ZONE_COLORS[z.id] ?? '#8B5CF6'}
            fillOpacity={0.06}
            stroke={ZONE_COLORS[z.id] ?? '#8B5CF6'}
            strokeOpacity={0.5}
            strokeWidth={1.5}
            strokeDasharray="6 4"
          >
            <title>{z.name} geofence</title>
          </polygon>
        ))}

        {/* Tesis düzeni: Kortlar + Spor Salonu + Soyunma */}
        {courts.map((c) => (
          <g key={c.id}>
            <rect
              x={c.x - c.w / 2}
              y={c.y - c.h / 2}
              width={c.w}
              height={c.h}
              rx={6}
              fill={c.kind === 'court' ? 'rgba(0,242,254,0.08)' : c.kind === 'gym' ? 'rgba(139,92,246,0.1)' : 'rgba(16,185,129,0.1)'}
              stroke={c.kind === 'court' ? 'rgba(0,242,254,0.5)' : c.kind === 'gym' ? 'rgba(139,92,246,0.5)' : 'rgba(16,185,129,0.5)'}
              strokeWidth={1}
            />
            {c.kind === 'court' && <line x1={c.x} y1={c.y - c.h / 2} x2={c.x} y2={c.y + c.h / 2} stroke="rgba(0,242,254,0.25)" strokeWidth={0.8} />}
            <text x={c.x} y={c.y + 3} textAnchor="middle" fontSize={9} fontWeight={700} fill={c.kind === 'court' ? '#a5f3fc' : c.kind === 'gym' ? '#ddd6fe' : '#a7f3d0'}>
              {c.name}
            </text>
          </g>
        ))}

        {/* IoT donanım göstergeleri */}
        {iot.map((d: IotDevice & { x: number; y: number }) => (
          <g key={d.id}>
            <circle cx={d.x} cy={d.y} r={5} fill={iotStatusColor(d.status)} fillOpacity={0.35} />
            <circle cx={d.x} cy={d.y} r={2.5} fill={iotStatusColor(d.status)} />
            <text x={d.x + 7} y={d.y + 3} fontSize={7.5} fill="#94a3b8">{d.name}</text>
          </g>
        ))}

        {/* Aktif sporcu pinleri */}
        {athletes.map((a) => {
          const p = projectLngLatToMap(a.lat, a.lng, width, height);
          const inZone = COURT_ZONES.some((z) => pointInPolygon(a.lat, a.lng, z.polygon));
          const color = a.active ? (inZone ? '#10B981' : '#F43F5E') : '#64748b';
          return (
            <g key={a.id}>
              <circle cx={p.x} cy={p.y} r={6} fill={color} fillOpacity={0.3} />
              <circle cx={p.x} cy={p.y} r={3.5} fill={color}>
                <title>{`${a.name} — ${inZone ? 'GEOFENCE_ENTER (bölge içinde)' : 'GEOFENCE_EXIT (dışarıda)'}`}</title>
              </circle>
              <text x={p.x + 8} y={p.y + 3.5} fontSize={9} fontWeight={800} fill={inZone ? '#a7f3d0' : '#fecaca'}>{a.name}</text>
            </g>
          );
        })}
      </svg>

      {/* Lejant */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8, fontSize: 9, color: '#94a3b8' }}>
        <span><span style={{ color: '#00f2fe' }}>◻</span> Kort</span>
        <span><span style={{ color: '#8B5CF6' }}>◻</span> Spor Salonu</span>
        <span><span style={{ color: '#10B981' }}>●</span> Bölge içi sporcu</span>
        <span><span style={{ color: '#F43F5E' }}>●</span> Bölge dışı (EXIT)</span>
        <span><span style={{ color: '#10B981' }}>◎</span> IoT online</span>
        <span><span style={{ color: '#F27A1A' }}>◎</span> IoT uyarı</span>
        <span><span style={{ color: '#F43F5E' }}>◎</span> IoT offline</span>
      </div>
    </div>
  );
}
