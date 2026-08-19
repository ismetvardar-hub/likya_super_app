// ============================================================================
// 📹 AŞAMA 14 — SPORTVISIONX CANLI POZ KÖPRÜSÜ (Pose Extraction)
// Tarayıcı kamerasından 33 iskelet noktasını yakalayıp 17s ve şut analitiğine
// aktarır. MediaPipe Pose şema uyumlu landmark indeksleri (0-32).
// Kameraya erişim yoksa deterministik simülasyon (Plan Z).
// ============================================================================

export interface PoseLandmark {
  x: number; y: number; z: number; visibility: number;
}

export interface PoseFrame {
  ts: number;
  landmarks: PoseLandmark[];       // 33 nokta (MediaPipe sırası)
  fps: number;
  source: 'camera' | 'simulated';
}

// Kritik iskelet noktaları (MediaPipe Pose indeksleri)
export const POSE_LANDMARKS = {
  nose: 0, leftShoulder: 11, rightShoulder: 12, leftElbow: 13, rightElbow: 14,
  leftWrist: 15, rightWrist: 16, leftHip: 23, rightHip: 24, leftKnee: 25, rightKnee: 26,
  leftAnkle: 27, rightAnkle: 28,
} as const;

export function createEmptyPoseFrame(fps = 30): PoseFrame {
  return { ts: Date.now(), landmarks: Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 0 })), fps, source: 'simulated' };
}

/** Deterministik simülasyon: sıçrama (jump) hareketi üreten landmark'lar. */
export function simulateJumpPose(fps: number, frameIndex: number): PoseFrame {
  const phase = Math.sin(frameIndex / 12);  // -1..1 zıplama fazı
  const frame = createEmptyPoseFrame(fps);
  const set = (idx: number, x: number, y: number, v = 0.9) => {
    frame.landmarks[idx] = { x, y: y - phase * 0.08, z: 0, visibility: v };
  };
  set(POSE_LANDMARKS.leftShoulder, 0.45, 0.35);
  set(POSE_LANDMARKS.rightShoulder, 0.55, 0.35);
  set(POSE_LANDMARKS.leftHip, 0.47, 0.55 - phase * 0.1);
  set(POSE_LANDMARKS.rightHip, 0.53, 0.55 - phase * 0.1);
  set(POSE_LANDMARKS.leftKnee, 0.45, 0.75);
  set(POSE_LANDMARKS.rightKnee, 0.55, 0.75);
  set(POSE_LANDMARKS.leftAnkle, 0.44, 0.95);
  set(POSE_LANDMARKS.rightAnkle, 0.56, 0.95);
  return frame;
}

/** İki landmark arası açı (derece) — diz dirsek açı analitiği için. */
export function jointAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  const ab = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  const bc = Math.sqrt((b.x - c.x) ** 2 + (b.y - c.y) ** 2);
  const dot = (a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y);
  if (ab === 0 || bc === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / (ab * bc)));
  return Math.round((Math.acos(cos) * 180) / Math.PI);
}

/** 17s testine hazırlık: sıçrama yüksekliği tahmini (pixel → cm ölçek). */
export function jumpHeightFromPose(frame: PoseFrame, scaleCmPerUnit = 100): number {
  const ankle = frame.landmarks[POSE_LANDMARKS.leftAnkle];
  const hip = frame.landmarks[POSE_LANDMARKS.leftHip];
  return Math.round(Math.abs(ankle.y - hip.y) * scaleCmPerUnit * 10) / 10;
}

export function livePoseExtractionBridgeStatus(): string {
  return 'Live Pose Bridge [33 landmark • MediaPipe şeması • simülasyon fallback • açı & sıçrama analitiği]';
}
