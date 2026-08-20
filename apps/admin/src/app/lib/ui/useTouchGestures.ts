// ============================================================================
// 👆 DOKUNMATİK JEST MOTORU (Adım 70) — saha tabletleri için hazır
//  • Swipe sol/sağ → canlı drill sırasında hızlı sporcu değişimi
//  • Uzun basış → acil duraklatma / sakatlık işaretleme
//  • Pinch → 3D basınç ve geospatial kort yakınlaştırma
// Saf deterministik sınıflandırıcı (React hook: useTouchGestures).
// Sıfır bağımlılık; node-runnable.
// ============================================================================

export interface TouchPoint {
  x: number;
  y: number;
  tMs: number;
}

export interface GestureOptions {
  swipeThreshold?: number;   // piksel
  swipeAxisThreshold?: number; // dik eksen toleransı
  longPressMs?: number;
  pinchThresholdPct?: number;
}

export const DEFAULT_GESTURES: Required<GestureOptions> = {
  swipeThreshold: 50,
  swipeAxisThreshold: 40,
  longPressMs: 600,
  pinchThresholdPct: 0.1,
};

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;
export type PinchDirection = 'in' | 'out' | null;

/** Swipe sınıflandırıcı: yatay/dikey eşik kontrolü. */
export function detectSwipe(dx: number, dy: number, opts: GestureOptions = {}): SwipeDirection {
  const { swipeThreshold, swipeAxisThreshold } = { ...DEFAULT_GESTURES, ...opts };
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax < swipeThreshold && ay < swipeThreshold) return null;
  if (ax > ay && ay <= swipeAxisThreshold) return dx < 0 ? 'left' : 'right';
  if (ay > ax && ax <= swipeAxisThreshold) return dy < 0 ? 'up' : 'down';
  return null; // çapraz/belirsiz
}

/** Uzun basış tespiti: basış süresi eşik aşarsa true. */
export function detectLongPress(pressDurationMs: number, opts: GestureOptions = {}): boolean {
  const { longPressMs } = { ...DEFAULT_GESTURES, ...opts };
  return pressDurationMs >= longPressMs;
}

/** Pinch: başlangıç-bitiş parmak mesafesi oranına göre içe/dışa. */
export function detectPinch(startDistance: number, endDistance: number, opts: GestureOptions = {}): PinchDirection {
  const { pinchThresholdPct } = { ...DEFAULT_GESTURES, ...opts };
  if (startDistance <= 0) return null;
  const delta = (endDistance - startDistance) / startDistance;
  if (delta > pinchThresholdPct) return 'out';
  if (delta < -pinchThresholdPct) return 'in';
  return null;
}

export type RecognizedGesture =
  | { kind: 'swipe'; direction: SwipeDirection }
  | { kind: 'long-press' }
  | { kind: 'pinch'; direction: PinchDirection }
  | { kind: 'tap' }
  | null;

/** İki nokta arası tam jest tanıma (başlat + bitir). */
export function recognizeGesture(start: TouchPoint, end: TouchPoint, opts: GestureOptions = {}): RecognizedGesture {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const swipe = detectSwipe(dx, dy, opts);
  if (swipe) return { kind: 'swipe', direction: swipe };
  const pressMs = end.tMs - start.tMs;
  if (detectLongPress(pressMs, opts)) return { kind: 'long-press' };
  if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && pressMs < 350) return { kind: 'tap' };
  return null;
}

export function touchGesturesStatus(): string {
  return 'Jest Motoru: swipe(L/R/U/D) • uzun basış • pinch in/out • tap';
}
