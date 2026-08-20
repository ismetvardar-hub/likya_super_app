// ============================================================================
// 🎞️ AĞIR ÇEKİM BİYOMEKANİK VİDEO OYNATICI MOTORU (Adım 79)
// Oynatma hızları: 0.1× • 0.25× • 0.5× • 1.0× — kare kare ilerleme (33ms/30fps)
// Canvas overlay kinematik açı ölçümü: diz fleksiyon açısı, raket savrulma çizgisi.
// Deterministik; sıfır bağımlılık; node-runnable.
// ============================================================================

export const PLAYBACK_SPEEDS = [0.1, 0.25, 0.5, 1.0] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];
export const FRAME_DURATION_MS = 33.33; // 30fps

export function frameIndexAt(timeMs: number, fps = 30): number {
  // Önce çarp → tam sayı hassasiyeti (float hatasız)
  return Math.floor((timeMs * fps) / 1000);
}

/** Kare adımlama: currentTime ± kare süresi (negatif sınırda durur). */
export function stepFrames(currentTimeMs: number, steps: number, fps = 30, maxDurationMs = 60_000): number {
  const frameMs = 1000 / fps;
  const next = currentTimeMs + steps * frameMs;
  return Math.max(0, Math.min(maxDurationMs, next));
}

/** Oynatma hızı listesine göre oynatılmış zaman ilerlemesi. */
export function advancePlayback(currentTimeMs: number, speed: PlaybackSpeed, realDeltaMs: number, maxDurationMs = 60_000): number {
  return Math.max(0, Math.min(maxDurationMs, currentTimeMs + realDeltaMs * speed));
}

// ── Kinematik açı geometrisi ───────────────────────────────────────────────────
export interface Point2D { x: number; y: number; }

function dot(ax: number, ay: number, bx: number, by: number): number {
  return ax * bx + ay * by;
}

/** Üç nokta arası açı (b köşe noktası): vektör ba ile bc arası. */
export function jointAngle(a: Point2D, b: Point2D, c: Point2D): number {
  const abx = a.x - b.x, aby = a.y - b.y;
  const cbx = c.x - b.x, cby = c.y - b.y;
  const magAb = Math.hypot(abx, aby);
  const magCb = Math.hypot(cbx, cby);
  if (magAb === 0 || magCb === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot(abx, aby, cbx, cby) / (magAb * magCb)));
  return Number((Math.acos(cos) * (180 / Math.PI)).toFixed(1));
}

/** İki noktadan geçen çizginin yatayla açısı (derece). */
export function lineAngle(a: Point2D, b: Point2D): number {
  return Number((Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI)).toFixed(1));
}

/** Raket savrulma çizgisi: başlangıç noktası + açı + uzunluk → bitiş noktası. */
export function racketSwingLine(start: Point2D, angleDeg: number, length: number): { start: Point2D; end: Point2D; angleDeg: number } {
  const rad = (angleDeg * Math.PI) / 180;
  const end: Point2D = { x: Number((start.x + Math.cos(rad) * length).toFixed(1)), y: Number((start.y + Math.sin(rad) * length).toFixed(1)) };
  return { start, end, angleDeg };
}

export function videoPlayerStatus(): string {
  return 'Video Oynatıcı: 0.1×-1.0× • 33ms kare adım • diz açısı + savrulma çizgisi';
}
