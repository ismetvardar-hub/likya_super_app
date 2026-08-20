'use client';

import React, { useState } from 'react';
import { footMeshConfig, pressureToCss, type FootMeshConfig } from '../../app/lib/three/footPressureShader.ts';

// ============================================================================
// 🦶 ETKİLEŞİMLİ 3D AYAK BASINÇ ISISI HARİTASI (Adım 65)
// Prosedürel ayak tabanı geometrisi + basınç → termal renk (Mavi→Yeşil→Kırmızı).
// Orbit döndürme, zoom ve kesit inceleme kontrolleri (SVG 3D izdüşüm — bağımlılıksız).
// Gerçek Three.js/WebGL renderı için lib/three/footPressureShader.ts hazırdır.
// ============================================================================

export interface FootPressureHeatmap3DProps {
  pressureGrid: number[][]; // [satır][sütun] 0-100
  size?: number;
}

export default function FootPressureHeatmap3D({ pressureGrid, size = 360 }: FootPressureHeatmap3DProps) {
  const cfg: FootMeshConfig = footMeshConfig();
  const [rotation, setRotation] = useState(0);   // derece (orbit)
  const [zoom, setZoom] = useState(1);
  const rows = pressureGrid.length;
  const cols = pressureGrid[0]?.length ?? 0;
  const cellW = (cfg.width * zoom) / cols;
  const cellH = (cfg.length * zoom) / rows;

  // Ortografik izdüşüm: her hücre yüksekliği basınç ile kabarır, döndürme ile x kayar
  const transform = (x: number, y: number, pressure: number): { x: number; y: number } => {
    const rad = (rotation * Math.PI) / 180;
    const height = (pressure / 100) * cfg.depthScale * 1.6;
    const depthOffset = height * 0.55;
    const shift = (x - cfg.width / 2) * Math.sin(rad) * 0.6;
    return { x: x * zoom - depthOffset * Math.cos(rad), y: y * zoom - depthOffset * Math.sin(rad) + shift * 0.3 };
  };

  return (
    <div style={{ width: '100%', maxWidth: size, background: 'radial-gradient(circle, #0f172a, #020617)', borderRadius: 14, padding: 10 }}>
      <svg viewBox={`0 0 ${cfg.width * 1.6} ${cfg.length * 1.35}`} width="100%" role="img" aria-label="3D ayak basınç ısı haritası">
        {Array.from({ length: rows }, (_, y) =>
          Array.from({ length: cols }, (_, x) => {
            const p = pressureGrid[y][x];
            const pt = transform(x * cellW, y * cellH, p);
            return (
              <rect
                key={`${x}-${y}`}
                x={pt.x}
                y={pt.y}
                width={cellW * 0.92}
                height={cellH * 0.92}
                rx={1.5}
                fill={pressureToCss(p)}
                opacity={0.75 + (p / 100) * 0.25}
              >
                <title>{`Basınç %${p}`}</title>
              </rect>
            );
          }),
        )}
      </svg>

      {/* Kontroller: orbit döndürme + zoom + kesit */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 8, fontSize: 10, color: '#94a3b8' }}>
        <label>🔄 Orbit: <input type="range" min={-30} max={30} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} style={{ width: 90 }} /></label>
        <label>🔍 Zoom: <input type="range" min={0.7} max={1.4} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ width: 90 }} /></label>
        <span style={{ fontSize: 9 }}>Kesit: izgara {cols}×{rows} · maks {Math.max(...pressureGrid.flat())}%</span>
      </div>
    </div>
  );
}
