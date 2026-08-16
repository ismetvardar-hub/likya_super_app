// ============================================================================
// ✋ GESTURE TRACKER — Temassız Jest / El Algılama Eklentisi
// Kiosk ve spor analizleri için Ghost (kaydırma) ve Pinch (sıkıştırma)
// jestlerini 21 noktalı el landmark verisinden deterministik olarak algılar.
// ⚠️ KIRILMASIZ: bağımsız adaptör — mevcut vision/radar sistemlerini etkilemez.
// ============================================================================

/** 21 noktalı el landmark şemasındaki kritik indisler */
export const HAND_INDEX = { WRIST: 0, THUMB_TIP: 4, INDEX_TIP: 8, MIDDLE_MCP: 9, PINKY_MCP: 17 } as const;

export interface HandLandmark {
  x: number;
  y: number;
  z?: number;
}

export type GestureType = 'GHOST' | 'PINCH' | 'NONE';

export interface GestureOptions {
  /** Pinch: başparmak-işaret parmağı mesafe eşiği (normalleştirilmiş) */
  pinchThreshold?: number;
  /** Ghost: bilek yer değiştirme hassasiyeti */
  ghostSensitivity?: number;
}

export interface GestureResult {
  gesture: GestureType;
  confidence: number;
  pinchDistance: number;
  palmShift: number;
}

// İki landmark arasındaki Öklid mesafesi (normalleştirilmiş koordinatlarda)
export function landmarkDistance(a: HandLandmark, b: HandLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Tek karede jest tespiti (deterministik)
export function detectGesture(landmarks: HandLandmark[], opts: GestureOptions = {}): GestureResult {
  if (!landmarks || landmarks.length < 21) {
    return { gesture: 'NONE', confidence: 0, pinchDistance: 1, palmShift: 0 };
  }
  const pinchThreshold = opts.pinchThreshold ?? 0.08;
  const ghostSensitivity = opts.ghostSensitivity ?? 0.25;

  const pinch = landmarkDistance(landmarks[HAND_INDEX.THUMB_TIP], landmarks[HAND_INDEX.INDEX_TIP]);
  const palmShift = Math.abs(
    landmarks[HAND_INDEX.MIDDLE_MCP].y - landmarks[HAND_INDEX.WRIST].y,
  );

  if (pinch < pinchThreshold) {
    return { gesture: 'PINCH', confidence: 1 - pinch / pinchThreshold, pinchDistance: pinch, palmShift };
  }
  if (palmShift > ghostSensitivity) {
    return { gesture: 'GHOST', confidence: Math.min(1, palmShift / ghostSensitivity / 3), pinchDistance: pinch, palmShift };
  }
  return { gesture: 'NONE', confidence: 0, pinchDistance: pinch, palmShift };
}

export interface SequenceResult {
  gesture: GestureType;
  frames: number;
  /** Karelerin jest kararlılık oranı (0-1) */
  stability: number;
}

// Çok kareli jest takibi — ani geçişleri yumuşatır (majority voting)
export function trackHandSequence(frames: HandLandmark[][], opts: GestureOptions = {}): SequenceResult {
  if (!frames || frames.length === 0) return { gesture: 'NONE', frames: 0, stability: 0 };

  const counts: Record<GestureType, number> = { GHOST: 0, PINCH: 0, NONE: 0 };
  for (const frame of frames) {
    counts[detectGesture(frame, opts).gesture]++;
  }
  const total = frames.length;
  const gesture = (Object.keys(counts) as GestureType[]).reduce((best, g) =>
    counts[g] > counts[best] ? g : best,
  );
  return {
    gesture,
    frames: total,
    stability: counts[gesture] / total,
  };
}

// Eklenti durum rozeti
export function gestureTrackerStatus(): string {
  return `Gesture Tracker [Ghost: sürükleme • Pinch: seçim • 21 nokta MediaPipe uyumlu]`;
}
