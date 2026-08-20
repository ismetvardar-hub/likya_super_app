// ============================================================================
// 🧍 2D/3D ATLET İSKELET POZ & EKLEM AÇISI TAHMİN MOTORU (Adım 128)
// Standart 17-keypoint COCO/MediaPipe vücut poz işaretleri alır ve anlık
// kinematik eklem açıları hesaplar: Dirsek Ekstansiyon Açısı, Omuz-Kalça
// Kinetik Ayırımı (X-Factor) ve Temas Anında Diz Fleksiyonu. Ayrıca hazırlık-
// vuruş kinetik gecikme süresini (ayak yere basış ↔ raket teması) tespit eder.
// Saf/deterministik; sıfır bağımlılık.
// ============================================================================

export const COCO_17_NAMES = [
  'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
  'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
] as const;

export type CocoKeypointName = (typeof COCO_17_NAMES)[number];

export const COCO_17_INDEX: Record<CocoKeypointName, number> = Object.fromEntries(
  COCO_17_NAMES.map((name, i) => [name, i]),
) as Record<CocoKeypointName, number>;

export interface PoseKeypoint {
  x: number;
  y: number;
  confidence: number; // 0-1
}

export interface PoseFrame {
  tMs: number;
  keypoints: PoseKeypoint[]; // 17 eleman (COCO sırası)
  contact?: boolean; // raket-top teması
  footPlant?: boolean; // ayak yere basış anı
}

// ── 3 noktadan eklem açısı (b köşesinde, derece) ─────────────────────────────
export function jointAngleDeg(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }): number {
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  if (mag1 < 1e-9 || mag2 < 1e-9) return 0;
  const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Math.round((Math.acos(cos) * 180) / Math.PI * 10) / 10;
}

export function keypoint(frame: PoseFrame, name: CocoKeypointName): PoseKeypoint {
  const idx = COCO_17_INDEX[name];
  return frame.keypoints[idx] ?? { x: 0, y: 0, confidence: 0 };
}

// ── Elbow Extension Angle (omuz-dirsek-bilek) ────────────────────────────────
export function elbowExtensionAngleDeg(frame: PoseFrame, side: 'left' | 'right'): number {
  const shoulder = keypoint(frame, side === 'left' ? 'left_shoulder' : 'right_shoulder');
  const elbow = keypoint(frame, side === 'left' ? 'left_elbow' : 'right_elbow');
  const wrist = keypoint(frame, side === 'left' ? 'left_wrist' : 'right_wrist');
  return jointAngleDeg(shoulder, elbow, wrist);
}

// ── Knee Flexion at Impact (kalça-diz-ayak bileği) ───────────────────────────
export function kneeFlexionAtImpactDeg(frame: PoseFrame, side: 'left' | 'right'): number {
  const hip = keypoint(frame, side === 'left' ? 'left_hip' : 'right_hip');
  const knee = keypoint(frame, side === 'left' ? 'left_knee' : 'right_knee');
  const ankle = keypoint(frame, side === 'left' ? 'left_ankle' : 'right_ankle');
  return jointAngleDeg(hip, knee, ankle);
}

// ── Shoulder-Hip Kinetic Separation (X-Factor) ───────────────────────────────
export function xFactorSeparationDeg(frame: PoseFrame): number {
  const ls = keypoint(frame, 'left_shoulder');
  const rs = keypoint(frame, 'right_shoulder');
  const lh = keypoint(frame, 'left_hip');
  const rh = keypoint(frame, 'right_hip');
  const shoulderAngle = Math.atan2(ls.y - rs.y, ls.x - rs.x) * (180 / Math.PI);
  const hipAngle = Math.atan2(lh.y - rh.y, lh.x - rh.x) * (180 / Math.PI);
  let diff = Math.abs(shoulderAngle - hipAngle);
  if (diff > 180) diff = 360 - diff;
  return Math.round(diff * 10) / 10;
}

// ── Hazırlık→Vuruş kinetik gecikmesi (ayak basışı → raket teması) ────────────
export interface KineticLagResult {
  footPlantTMs: number | null;
  contactTMs: number | null;
  lagMs: number | null;
  detected: boolean;
}

export function kineticLagFromFrames(frames: PoseFrame[]): KineticLagResult {
  let footPlantTMs: number | null = null;
  let contactTMs: number | null = null;
  for (const f of frames) {
    if (footPlantTMs === null && f.footPlant) footPlantTMs = f.tMs;
    if (contactTMs === null && f.contact) contactTMs = f.tMs;
    if (footPlantTMs !== null && contactTMs !== null) break;
  }
  if (footPlantTMs !== null && contactTMs !== null && contactTMs >= footPlantTMs) {
    return { footPlantTMs, contactTMs, lagMs: contactTMs - footPlantTMs, detected: true };
  }
  return { footPlantTMs, contactTMs, lagMs: null, detected: false };
}

export function kineticLagMs(footPlantTMs: number, contactTMs: number): number {
  return Math.max(0, contactTMs - footPlantTMs);
}

// ── Vücut merkezi (CoM) — kalça ortalaması yaklaşımı ─────────────────────────
export function centerOfMass(frame: PoseFrame): { x: number; y: number; confidence: number } {
  const lh = keypoint(frame, 'left_hip');
  const rh = keypoint(frame, 'right_hip');
  return {
    x: (lh.x + rh.x) / 2,
    y: (lh.y + rh.y) / 2,
    confidence: (lh.confidence + rh.confidence) / 2,
  };
}

export function poseEstimationStatus(): string {
  return `Poz: 17-keypoint COCO • dirsek ekstansiyon + X-Factor + diz fleksiyon • kinetik lag (ayak→temas)`;
}
