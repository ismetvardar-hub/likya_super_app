// ============================================================================
// 🎥 ÇOKLU KAMERA RTSP/WEBRTC GÖRÜNTÜ ALMA & KALİBRATÖR (Adım 126)
// Kort kurulumları için extrinsic/intrinsic geometri kalibratörü: 2-4 senkron
// kamera açısı (Baseline / Service / High-Angle Overhead). Homography projeksiyon
// matrisleri 2D piksel (u,v) koordinatlarını gerçek 3D kort koordinatlarına
// (X,Y,Z) metre cinsinden eşler. Distorsiyon katsayıları + yerleşim doğrulaması.
// Saf/deterministik; sıfır bağımlılık (DLT + Gaussian eliminasyon).
// ============================================================================

export type CameraAngle = 'baseline' | 'service' | 'overhead';

export const CAMERA_ANGLE_LABELS: Record<CameraAngle, string> = {
  baseline: 'Baseline Cam',
  service: 'Service Cam',
  overhead: 'High-Angle Overhead',
};

export const SUPPORTED_CAMERA_ANGLES: CameraAngle[] = ['baseline', 'service', 'overhead'];
export const RIG_MIN_CAMERAS = 2;
export const RIG_MAX_CAMERAS = 4;
export const COURT_STANDARD = { lengthM: 23.77, widthM: 8.23, netHeightM: 0.914 };

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export type HomographyMatrix = [number[], number[], number[]];

export interface CameraIntrinsics {
  fx: number;
  fy: number;
  cx: number;
  cy: number;
}

export interface CameraDistortion {
  k1: number;
  k2: number;
  p1: number;
  p2: number;
}

export interface CameraPlacementCheck {
  valid: boolean;
  elevationDeg: number;
  coveragePct: number;
  flags: string[];
}

export interface CameraCalibration {
  id: string;
  angle: CameraAngle;
  intrinsics: CameraIntrinsics;
  distortion: CameraDistortion;
  position: Point3D; // metre (kort merkezi orijin)
  homography: HomographyMatrix; // piksel → kort düzlemi (Z=0)
  validation: CameraPlacementCheck;
}

// ── 8x8 lineer sistem çözücü (Gaussian eliminasyon, kısmi pivot) ─────────────
export function solveLinear8(A: number[][], b: number[]): number[] {
  const n = 8;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    // kısmi pivot
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    [M[col], M[pivot]] = [M[pivot], M[col]];
    const pv = M[col][col];
    if (Math.abs(pv) < 1e-12) return Array.from({ length: n }, () => 0);
    for (let c = col; c <= n; c++) M[col][c] /= pv;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col];
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map((row) => row[n]);
}

// ── DLT homography: 4+ nokta eşleşmesi → 3x3 matris (h22=1 ölçek sabitli) ────
export function computeHomography(src: Point2D[], dst: Point2D[]): HomographyMatrix {
  if (src.length < 4 || dst.length < 4) throw new Error('Homography için en az 4 nokta eşleşmesi gerekir');
  const A: number[][] = [];
  const b: number[] = [];
  const count = Math.min(4, src.length);
  for (let i = 0; i < count; i++) {
    const { x: u, y: v } = src[i];
    const { x: X, y: Y } = dst[i];
    A.push([u, v, 1, 0, 0, 0, -X * u, -X * v]);
    b.push(X);
    A.push([0, 0, 0, u, v, 1, -Y * u, -Y * v]);
    b.push(Y);
  }
  const h = solveLinear8(A, b);
  return [
    [h[0], h[1], h[2]],
    [h[3], h[4], h[5]],
    [h[6], h[7], 1],
  ];
}

// ── Homography uygulama: piksel (u,v) → kort (X,Y) ───────────────────────────
export function applyHomography(H: HomographyMatrix, point: Point2D): Point2D {
  const u = point.x;
  const v = point.y;
  const w = H[2][0] * u + H[2][1] * v + H[2][2];
  if (Math.abs(w) < 1e-9) return { x: 0, y: 0 };
  const X = (H[0][0] * u + H[0][1] * v + H[0][2]) / w;
  const Y = (H[1][0] * u + H[1][1] * v + H[1][2]) / w;
  return { x: Math.round(X * 10000) / 10000, y: Math.round(Y * 10000) / 10000 };
}

export function reprojectionError(H: HomographyMatrix, src: Point2D[], dst: Point2D[]): number {
  if (src.length === 0) return 0;
  const total = src.reduce((acc, p, i) => {
    const proj = applyHomography(H, p);
    const d = Math.sqrt((proj.x - dst[i].x) ** 2 + (proj.y - dst[i].y) ** 2);
    return acc + d;
  }, 0);
  return Math.round((total / src.length) * 10000) / 10000; // metre
}

export function projectToCourt(H: HomographyMatrix, point: Point2D, courtZ = 0): Point3D {
  const p = applyHomography(H, point);
  return { x: p.x, y: p.y, z: courtZ };
}

// ── Distorsiyon düzeltme (radyal + tanjantiyal) ──────────────────────────────
export function undistortPoint(point: Point2D, d: CameraDistortion): Point2D {
  const x = point.x;
  const y = point.y;
  const r2 = x * x + y * y;
  const radial = 1 + d.k1 * r2 + d.k2 * r2 * r2;
  const xUndist = x * radial + 2 * d.p1 * x * y + d.p2 * (r2 + 2 * x * x);
  const yUndist = y * radial + d.p2 * 2 * x * y + d.p1 * (r2 + 2 * y * y);
  return { x: Math.round(xUndist * 10000) / 10000, y: Math.round(yUndist * 10000) / 10000 };
}

// ── Kamera yerleşim doğrulaması (yükselme açısı + kapsama) ───────────────────
export function cameraElevationDeg(position: Point3D, courtCenter: Point3D = { x: 0, y: 0, z: 0 }): number {
  const dist = Math.sqrt((position.x - courtCenter.x) ** 2 + (position.y - courtCenter.y) ** 2);
  if (dist < 1e-6) return 90;
  return Math.round(Math.atan2(position.z, dist) * (180 / Math.PI) * 10) / 10;
}

export function validateCameraPlacement(camera: { position: Point3D; intrinsics: CameraIntrinsics }, courtMeters: { lengthM: number; widthM: number }): CameraPlacementCheck {
  const flags: string[] = [];
  const elevationDeg = cameraElevationDeg(camera.position);
  if (elevationDeg < 15) flags.push(`yükselme açısı ${elevationDeg}° çok alçak — çizgi görünürlüğü riskli`);
  if (elevationDeg > 80) flags.push(`yükselme açısı ${elevationDeg}° neredeyse dikey — derinlik algısı zayıf`);
  // Basit kapsama: görüş alanı kort dikdörtgenini örtmeli
  const fovX = 2 * Math.atan2(courtMeters.widthM / 2, Math.max(1, camera.position.z || 3));
  const coveragePct = Math.max(0, Math.min(100, Math.round((1 - Math.abs(90 - elevationDeg) / 90) * 100)));
  if (fovX < 0.9) flags.push('yatay FOV dar — kenar kortun dışında kalabilir');
  return { valid: flags.length === 0, elevationDeg, coveragePct, flags };
}

export function cameraCalibrationStatus(): string {
  return `Kamera Kalibrasyon: ${SUPPORTED_CAMERA_ANGLES.length} açı • DLT homography (u,v)→(X,Y,Z)m • distorsiyon + yerleşim doğrulaması`;
}

