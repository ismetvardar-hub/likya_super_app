'use client';

import React, { useState } from 'react';
import {
  computeKinematics,
  interpolateFrame,
  clampFrameIndex,
  playheadAt,
  playheadBounds,
  type TwinFrame,
} from '../../app/lib/three/digitalTwinReplayEngine.ts';

// ============================================================================
// 🦿 BİYOMEKANİK KİNETİK DİJİTAL İKİZ 3D REPLAY (Adım 113)
// 100Hz çift tabanlık + IMU verisinden alt ekstremite kinematiğini prosedürel
// SVG 3D izdüşümüyle yeniden kurar: ayak vuruş açısı, diz fleksiyon yörüngesi,
// zemin temas vektörü. Kare süpürme (scrub) + 360° kamera dönüşü destekler.
// Motor: digitalTwinReplayEngine.ts (Three.js/WebGL renderı aynı motoru kullanır)
// ============================================================================

export interface KineticDigitalTwinReplayProps {
  frames?: TwinFrame[];
}

export function defaultTwinFrames(count = 60): TwinFrame[] {
  return Array.from({ length: count }, (_, i) => ({
    tsMs: i * 10,
    insoleLeft: { toePct: 50 + Math.round(10 * Math.sin(i / 6)), heelPct: 55 + Math.round(8 * Math.cos(i / 5)), gctMs: 220 + (i % 20) },
    insoleRight: { toePct: 45 + Math.round(10 * Math.sin(i / 6 + 0.5)), heelPct: 60 + Math.round(8 * Math.cos(i / 5 + 0.3)), gctMs: 215 + (i % 18) },
    imu: { x: Math.round(20 * Math.sin(i / 4)) / 10, y: Math.round(15 * Math.cos(i / 5)) / 10, z: Math.round(8 * Math.sin(i / 3)) / 10 },
  }));
}

export default function KineticDigitalTwinReplay({ frames }: KineticDigitalTwinReplayProps) {
  const twin = frames ?? defaultTwinFrames();
  const bounds = playheadBounds(twin.length);
  const [index, setIndex] = useState(0);
  const [yawDeg, setYawDeg] = useState(0);

  const clamped = clampFrameIndex(index, twin.length);
  const current = interpolateFrame(twin, clamped * 10);
  const kin = computeKinematics(current);
  const playhead = playheadAt(twin.length, index);

  // Prosedürel iskelet geometrisi (sagital düzlem)
  const hip = { x: 150, y: 60 };
  const thighLen = 42;
  const shankLen = 42;
  const flexRad = (kin.kneeFlexionDeg * Math.PI) / 180;
  const knee = { x: hip.x - Math.sin(flexRad / 2) * thighLen * 0.6, y: hip.y + Math.cos(flexRad / 2) * thighLen };
  const ankle = { x: knee.x - Math.sin(flexRad / 2) * shankLen * 0.5, y: knee.y + shankLen * 0.95 };
  const strikeRad = (kin.footStrikeAngleDeg * Math.PI) / 180;
  const toe = { x: ankle.x + 42 * Math.cos(strikeRad), y: ankle.y - 42 * Math.sin(strikeRad) };
  const yawRad = (yawDeg * Math.PI) / 180;
  const project = (p: { x: number; y: number }) => {
    const cx = (p.x - 150) * Math.cos(yawRad) + 150;
    const cy = p.y * (0.7 + 0.3 * Math.cos(yawRad));
    return { x: Math.round(cx * 10) / 10, y: Math.round(cy * 10) / 10 };
  };
  const H = project(hip);
  const K = project(knee);
  const A = project(ankle);
  const T = project(toe);
  const impLen = 30 * Math.abs(kin.groundImpactVector.y || 0.5);

  return (
    <div style={{ width: '100%', background: 'radial-gradient(circle, #0f172a, #020617)', borderRadius: 14, padding: 10 }}>
      <svg viewBox="0 0 300 260" width="100%" role="img" aria-label="Kinetik dijital ikiz 3D replay">
        {/* Zemin */}
        <line x1={20} y1={215} x2={280} y2={215} stroke="#1e293b" strokeWidth={2} />
        {/* Dikey referans */}
        <line x1={150} y1={20} x2={150} y2={215} stroke="#0f172a" strokeWidth={1} />
        {/* Alt ekstremite iskeleti */}
        <polyline points={`${H.x},${H.y} ${K.x},${K.y} ${A.x},${A.y} ${T.x},${T.y}`} fill="none" stroke="#00f2fe" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
        {/* Eklem noktaları */}
        <circle cx={H.x} cy={H.y} r={4} fill="#8B5CF6" />
        <circle cx={K.x} cy={K.y} r={4} fill="#10B981" />
        <circle cx={A.x} cy={A.y} r={4} fill="#F27A1A" />
        {/* Zemin temas vektörü */}
        <line x1={A.x} y1={A.y} x2={A.x} y2={A.y - impLen} stroke={kin.groundImpactVector.y > 0 ? '#F43F5E' : '#10B981'} strokeWidth={3} markerEnd="url(#arrow)" />
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 z" fill="#F43F5E" />
          </marker>
        </defs>
        {/* Kinematik etiketleri */}
        <text x={20} y={24} fill="#94a3b8" fontSize={10}>Ayak vuruş açısı: {kin.footStrikeAngleDeg}°</text>
        <text x={20} y={40} fill="#94a3b8" fontSize={10}>Diz fleksiyon: {kin.kneeFlexionDeg}°</text>
        <text x={20} y={56} fill="#94a3b8" fontSize={10}>Faz: {kin.phase === 'stance' ? '🟢 duruş' : '🟡 sallanma'} · Yük: %{kin.totalLoadPct}</text>
      </svg>

      {/* Kontroller: kare süpürme + 360° kamera */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 6, fontSize: 10, color: '#94a3b8' }}>
        <label style={{ flex: 1, minWidth: 140 }}>
          🎞 Kare {playhead.index}/{twin.length - 1} ({Math.round(bounds.durationMs)}ms):
          <input type="range" min={0} max={twin.length - 1} value={index} onChange={(e) => setIndex(Number(e.target.value))} style={{ width: '100%' }} />
        </label>
        <label style={{ flex: 1, minWidth: 140 }}>
          📷 Kamera {yawDeg}°:
          <input type="range" min={-60} max={60} value={yawDeg} onChange={(e) => setYawDeg(Number(e.target.value))} style={{ width: '100%' }} />
        </label>
        <span style={{ fontSize: 8, color: '#64748b' }}>GCT {current.insoleLeft.gctMs}ms · IMU ({current.imu.x},{current.imu.y},{current.imu.z})</span>
      </div>
    </div>
  );
}
