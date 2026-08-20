'use client';

import React, { useState } from 'react';
import {
  SUPPORTED_CAMERA_ANGLES,
  CAMERA_ANGLE_LABELS,
  COURT_STANDARD,
  computeHomography,
  applyHomography,
  reprojectionError,
  validateCameraPlacement,
  cameraElevationDeg,
  type CameraAngle,
  type Point2D,
  type HomographyMatrix,
} from '../../app/lib/cv/cameraCalibrationEngine.ts';

// ============================================================================
// 🎥 KORT KAMERA KALİBRASYON GÖRÜNÜMÜ (Adım 126)
// 2-4 senkron kamera açısı için homography kalibratörü: piksel → kort (X,Y,Z)
// metre. Distorsiyon, yerleşim doğrulama bayrakları ve reprojeksiyon hatası
// (<2cm hedef) gösterir. Motor: cameraCalibrationEngine.ts
// ============================================================================

interface CameraSetup {
  angle: CameraAngle;
  position: { x: number; y: number; z: number };
  srcCorners: Point2D[];   // görüntü köşeleri (piksel)
  dstCorners: Point2D[];   // kort köşeleri (metre)
}

function courtCorners(): Point2D[] {
  const halfW = COURT_STANDARD.widthM / 2;
  return [
    { x: -halfW, y: 0 },
    { x: halfW, y: 0 },
    { x: halfW, y: COURT_STANDARD.lengthM },
    { x: -halfW, y: COURT_STANDARD.lengthM },
  ];
}

function buildCameras(): CameraSetup[] {
  const dst = courtCorners();
  return [
    { angle: 'baseline', position: { x: 0, y: -6, z: 3.5 }, srcCorners: [{ x: 140, y: 300 }, { x: 500, y: 300 }, { x: 560, y: 140 }, { x: 80, y: 140 }], dstCorners: dst },
    { angle: 'service', position: { x: 6, y: 4, z: 4.5 }, srcCorners: [{ x: 120, y: 310 }, { x: 520, y: 280 }, { x: 540, y: 130 }, { x: 100, y: 150 }], dstCorners: dst },
    { angle: 'overhead', position: { x: 0, y: 11, z: 9 }, srcCorners: [{ x: 150, y: 200 }, { x: 490, y: 200 }, { x: 490, y: 40 }, { x: 150, y: 40 }], dstCorners: dst },
  ];
}

export default function CourtCameraCalibrationView() {
  const [cameras] = useState<CameraSetup[]>(buildCameras);
  const [selected, setSelected] = useState<CameraAngle>('baseline');
  const cam = cameras.find((c) => c.angle === selected) ?? cameras[0];
  const H: HomographyMatrix = computeHomography(cam.srcCorners, cam.dstCorners);
  const err = reprojectionError(H, cam.srcCorners, cam.dstCorners);
  const placement = validateCameraPlacement({ position: cam.position, intrinsics: { fx: 900, fy: 900, cx: 320, cy: 180 } }, COURT_STANDARD);

  // SVG: kort + homography köşe projeksiyonu
  const project = (p: Point2D) => {
    const w = applyHomography(H, p);
    const sx = 20 + ((w.x + COURT_STANDARD.widthM / 2) / COURT_STANDARD.widthM) * 260;
    const sy = 20 + (w.y / COURT_STANDARD.lengthM) * 140;
    return { x: sx, y: sy };
  };
  const corners = cam.dstCorners.map(project);
  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#00f2fe', marginBottom: 8 }}>🎥 Çoklu Kamera Kort Kalibrasyonu</div>

      {/* Kamera seçimi */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {SUPPORTED_CAMERA_ANGLES.map((a) => (
          <button
            key={a}
            onClick={() => setSelected(a)}
            style={{ ...chip, borderColor: a === selected ? '#00f2fe' : '#334155', color: a === selected ? '#00f2fe' : '#94a3b8' }}
          >
            {CAMERA_ANGLE_LABELS[a]} · {cameraElevationDeg(cameras.find((c) => c.angle === a)!.position)}°
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        {/* Kort projeksiyonu */}
        <svg viewBox="0 0 300 180" width="300" style={{ background: 'radial-gradient(circle, #0f172a, #020617)', borderRadius: 10 }}>
          <rect x={20} y={20} width={260} height={140} fill="none" stroke="#10B981" strokeWidth={1.5} />
          <line x1={20} y1={90} x2={280} y2={90} stroke="#10B981" strokeWidth={1} strokeDasharray="4 3" />
          <line x1={150} y1={20} x2={150} y2={90} stroke="#10B981" strokeWidth={1} />
          <line x1={150} y1={90} x2={150} y2={160} stroke="#10B981" strokeWidth={1} />
          <polygon points={corners.map((c) => `${c.x},${c.y}`).join(' ')} fill="rgba(0,242,254,0.12)" stroke="#00f2fe" strokeWidth={1.5} />
          {corners.map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r={3} fill="#00f2fe" />
          ))}
          <circle cx={150} cy={80} r={4} fill="#F27A1A" />
          <text x={150} y={75} fill="#94a3b8" fontSize={8} textAnchor="middle">KAMERA ({cam.position.x},{cam.position.y},{cam.position.z}m)</text>
        </svg>

        {/* Kalibrasyon metrikleri */}
        <div style={{ flex: 1, minWidth: 200, fontSize: 9, color: '#94a3b8' }}>
          <div style={{ marginBottom: 4 }}>
            📐 Yükselme açısı: <b style={{ color: '#e2e8f0' }}>{placement.elevationDeg}°</b> · Kapsama: <b style={{ color: '#e2e8f0' }}>%{placement.coveragePct}</b>
          </div>
          <div style={{ marginBottom: 4 }}>
            ✅ Reprojeksiyon hatası: <b style={{ color: err < 0.02 ? '#10B981' : '#F43F5E' }}>{err}m {err < 0.02 ? '(< 2cm ✓)' : '(HEDEF > 2cm)'}</b>
          </div>
          <div style={{ marginBottom: 4 }}>
            🔧 Distorsiyon k1=0.02 · homography h11={H[0][0].toFixed(2)} h22={H[1][1].toFixed(2)}
          </div>
          {placement.flags.length > 0 ? (
            placement.flags.map((f, i) => <div key={i} style={{ color: '#F27A1A', marginBottom: 2 }}>⚠️ {f}</div>)
          ) : (
            <div style={{ color: '#10B981' }}>✔️ Yerleşim doğrulandı — flag yok</div>
          )}
        </div>
      </div>

      {/* Homography matrisi */}
      <div style={{ fontSize: 8, color: '#64748b' }}>
        <b style={{ color: '#8B5CF6' }}>H</b> = [
        {H.map((row, i) => (
          <span key={i}> [{row.map((v) => v.toFixed(3)).join(', ')}]{i < 2 ? ',' : ']'}</span>
        ))}
        ] — piksel (u,v) → kort (X,Y) metre
      </div>
    </div>
  );
}

const chip: React.CSSProperties = { fontSize: 9, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' };

