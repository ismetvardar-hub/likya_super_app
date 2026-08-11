'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, MapPin, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

// ============================================================================
// LİKYA 3D PARK TWIN & SPATIAL NAVIGATION
// Faz 3: 30-35 dönümlük kampüsün 3D dijital ikizi (Three.js/Canvas)
// IoT sensör verilerini derinlikli olarak haritalandırır
// ============================================================================

interface ParkZone {
  id: string;
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  color: string;
  occupancy: number; // 0-100
  type: 'giris' | 'restoran' | 'etkinlik' | 'otopark' | 'karavan' | 'spor';
}

export default function Park3DTwin() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zones, setZones] = useState<ParkZone[]>([
    { id: '1', name: 'Ana Giriş Meydanı', x: 0, z: 0, width: 60, depth: 40, color: '#00f2fe', occupancy: 60, type: 'giris' },
    { id: '2', name: 'Restoran & Gıda Alanı', x: 80, z: 0, width: 50, depth: 35, color: '#f59e0b', occupancy: 90, type: 'restoran' },
    { id: '3', name: 'Etkinlik & Gösteri Meydanı', x: 0, z: 80, width: 70, depth: 50, color: '#a78bfa', occupancy: 62, type: 'etkinlik' },
    { id: '4', name: 'Otopark & Turnikeler', x: -80, z: 0, width: 55, depth: 40, color: '#fbbf24', occupancy: 93, type: 'otopark' },
    { id: '5', name: 'Karavan & Tiny House', x: 80, z: 80, width: 60, depth: 45, color: '#34d399', occupancy: 75, type: 'karavan' },
    { id: '6', name: 'Spor Kompleksi', x: -80, z: 80, width: 50, depth: 40, color: '#f87171', occupancy: 45, type: 'spor' },
  ]);

  const [selectedZone, setSelectedZone] = useState<ParkZone | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // 3D Canvas çizimi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Arka plan
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Izgara (zemin)
    ctx.strokeStyle = 'rgba(51,65,85,0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Merkez noktası
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = 2.5 * zoom;

    // Bölgeleri çiz (izometrik 3D görünüm)
    zones.forEach((zone) => {
      const px = cx + zone.x * scale;
      const py = cy + zone.z * scale * 0.5;

      // Bölge kutusu (3D izometrik)
      const w = zone.width * scale;
      const h = zone.depth * scale * 0.5;

      // Doluluk rengi
      const occ = zone.occupancy;
      const baseColor = zone.color;
      const alpha = occ > 85 ? 0.9 : occ > 70 ? 0.7 : 0.5;

      // Üst yüzey
      ctx.fillStyle = baseColor;
      ctx.globalAlpha = alpha;
      ctx.fillRect(px - w / 2, py - h / 2, w, h);

      // Kenarlık
      ctx.globalAlpha = 1;
      ctx.strokeStyle = occ > 85 ? '#ef4444' : occ > 70 ? '#f59e0b' : '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(px - w / 2, py - h / 2, w, h);

      // Bölge adı
      ctx.fillStyle = '#fff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(zone.name, px, py - h / 2 - 6);

      // Doluluk yüzdesi
      ctx.fillStyle = occ > 85 ? '#f87171' : occ > 70 ? '#fbbf24' : '#34d399';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`%${occ}`, px, py + h / 2 + 14);
    });

    // Seçili bölge vurgusu
    if (selectedZone) {
      const px = cx + selectedZone.x * scale;
      const py = cy + selectedZone.z * scale * 0.5;
      const w = selectedZone.width * scale;
      const h = selectedZone.depth * scale * 0.5;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(px - w / 2 - 4, py - h / 2 - 4, w + 8, h + 8);
      ctx.setLineDash([]);
    }

    ctx.globalAlpha = 1;
  }, [zones, selectedZone, zoom, rotation]);

  // Bölge tıklama (basit koordinat kontrolü)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = 2.5 * zoom;

    // En yakın bölgeyi bul
    let closest: ParkZone | null = null;
    let minDist = Infinity;
    zones.forEach((zone) => {
      const px = cx + zone.x * scale;
      const py = cy + zone.z * scale * 0.5;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closest = zone;
      }
    });
    if (closest && minDist < 60) {
      setSelectedZone(closest);
    }
  };

  const getTypeLabel = (type: ParkZone['type']) => {
    switch (type) {
      case 'giris': return '🚪 Giriş';
      case 'restoran': return '🍽️ Restoran';
      case 'etkinlik': return '🎭 Etkinlik';
      case 'otopark': return '🅿️ Otopark';
      case 'karavan': return '🚐 Karavan';
      case 'spor': return '🏟️ Spor';
    }
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box size={20} color="#00f2fe" />
            3D Park Twin & Spatial Navigation
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>30-35 Dönüm Kampüs Dijital İkizi • IoT Sensör Verileri</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))} style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
            <ZoomOut size={14} />
          </button>
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.2))} style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
            <ZoomIn size={14} />
          </button>
          <button onClick={() => setRotation((r) => r + 15)} style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onClick={handleCanvasClick}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'pointer' }}
        />
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15,23,42,0.8)', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', color: '#94a3b8' }}>
          <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> Bölgeye tıklayın
        </div>
      </div>

      {/* Seçili Bölge Detayı */}
      {selectedZone && (
        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(30,41,59,0.6)', border: `1px solid ${selectedZone.color}`, borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#f1f5f9' }}>{selectedZone.name}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{getTypeLabel(selectedZone.type)}</div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: selectedZone.occupancy > 85 ? '#f87171' : selectedZone.occupancy > 70 ? '#fbbf24' : '#34d399' }}>
              %{selectedZone.occupancy} Doluluk
            </div>
          </div>
          <div style={{ width: '100%', background: 'rgba(15,23,42,0.8)', height: '8px', borderRadius: '20px', overflow: 'hidden', marginTop: '12px' }}>
            <div style={{ height: '100%', background: selectedZone.occupancy > 85 ? '#ef4444' : selectedZone.occupancy > 70 ? '#f59e0b' : '#10b981', width: `${selectedZone.occupancy}%` }}></div>
          </div>
        </div>
      )}

      {/* Bölge Listesi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginTop: '16px' }}>
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => setSelectedZone(zone)}
            style={{
              padding: '10px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
              background: selectedZone?.id === zone.id ? 'rgba(30,41,59,0.8)' : 'rgba(15,23,42,0.6)',
              border: `1px solid ${selectedZone?.id === zone.id ? zone.color : '#1e293b'}`,
              color: '#e2e8f0',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '600' }}>{zone.name}</div>
            <div style={{ fontSize: '11px', color: zone.occupancy > 85 ? '#f87171' : zone.occupancy > 70 ? '#fbbf24' : '#34d399', marginTop: '4px' }}>
              %{zone.occupancy} Doluluk
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
