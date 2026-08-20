// ============================================================================
// 🦿 BİYOMEKANİK KİNETİK DİJİTAL İKİZ 3D REPLAY MOTORU (Adım 113)
// 100Hz çift tabanlık basınç vektörleri + IMU rotasyonel hızlarını alır ve
// alt ekstremite kinematik hareketini prosedürel olarak yeniden kurar: ayak
// vuruş açısı, diz fleksiyon yörüngesi, zemin temas vektörü. Vuruş replay'inde
// kare süpürme (scrub) + 360° kamera dönüşü için çerçeve sınırları ve lineer
// interpolasyon sağlar. Saf/deterministik — render katmanı (SVG/Three.js)
// bu motorun çıktısını tüketir.
// ============================================================================

export const TWIN_TIMELINE_HZ = 100;

export interface InsoleChannel {
  toePct: number;
  heelPct: number;
  gctMs: number;
}

export interface ImuRotVel {
  x: number; // rad/s
  y: number;
  z: number;
}

export interface TwinFrame {
  tsMs: number;
  insoleLeft: InsoleChannel;
  insoleRight: InsoleChannel;
  imu: ImuRotVel;
}

export interface GroundImpactVector {
  x: number;
  y: number;
  z: number;
}

export type TwinPhase = 'stance' | 'swing';

export interface LowerLimbKinematics {
  footStrikeAngleDeg: number;
  kneeFlexionDeg: number;
  groundImpactVector: GroundImpactVector;
  phase: TwinPhase;
  totalLoadPct: number;
}

// ── Çerçeve indeksi & sınırlar ───────────────────────────────────────────────
export function frameIndexAt(tsMs: number, timelineStartMs: number, hz = TWIN_TIMELINE_HZ): number {
  const offset = Math.max(0, tsMs - timelineStartMs);
  return Math.floor(offset / (1000 / hz));
}

export function clampFrameIndex(index: number, frameCount: number): number {
  return Math.max(0, Math.min(frameCount - 1, index));
}

export function playheadBounds(frameCount: number, hz = TWIN_TIMELINE_HZ): { startMs: number; durationMs: number; endMs: number } {
  const durationMs = Math.max(0, (frameCount - 1) * (1000 / hz));
  return { startMs: 0, durationMs, endMs: durationMs };
}

export interface PlayheadState {
  index: number;
  tsMs: number;
  valid: boolean;
}

export function playheadAt(frameCount: number, index: number, timelineStartMs = 0, hz = TWIN_TIMELINE_HZ): PlayheadState {
  const bounds = playheadBounds(frameCount, hz);
  const clamped = clampFrameIndex(index, frameCount);
  const tsMs = timelineStartMs + clamped * (1000 / hz);
  return { index: clamped, tsMs, valid: index >= 0 && index < frameCount && frameCount > 0 };
}

// ── Lineer interpolasyon (iki çerçeve arası) ─────────────────────────────────
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function interpolateFrame(frames: TwinFrame[], tMs: number, timelineStartMs = 0): TwinFrame {
  if (frames.length === 0) throw new Error('İkiz çerçeve yok');
  const stepMs = 1000 / TWIN_TIMELINE_HZ;
  const rawIndex = (tMs - timelineStartMs) / stepMs;
  const clampedIndex = clampFrameIndex(Math.round(rawIndex), frames.length);
  // Sınır dışı → doğrudan uç çerçeve
  if (rawIndex <= 0) return frames[0];
  if (rawIndex >= frames.length - 1) return frames[frames.length - 1];
  const i0 = Math.floor(rawIndex);
  const t = rawIndex - i0;
  const a = frames[i0];
  const b = frames[i0 + 1];
  return {
    tsMs: tMs,
    insoleLeft: {
      toePct: Math.round(lerp(a.insoleLeft.toePct, b.insoleLeft.toePct, t) * 100) / 100,
      heelPct: Math.round(lerp(a.insoleLeft.heelPct, b.insoleLeft.heelPct, t) * 100) / 100,
      gctMs: Math.round(lerp(a.insoleLeft.gctMs, b.insoleLeft.gctMs, t) * 100) / 100,
    },
    insoleRight: {
      toePct: Math.round(lerp(a.insoleRight.toePct, b.insoleRight.toePct, t) * 100) / 100,
      heelPct: Math.round(lerp(a.insoleRight.heelPct, b.insoleRight.heelPct, t) * 100) / 100,
      gctMs: Math.round(lerp(a.insoleRight.gctMs, b.insoleRight.gctMs, t) * 100) / 100,
    },
    imu: {
      x: Math.round(lerp(a.imu.x, b.imu.x, t) * 100) / 100,
      y: Math.round(lerp(a.imu.y, b.imu.y, t) * 100) / 100,
      z: Math.round(lerp(a.imu.z, b.imu.z, t) * 100) / 100,
    },
  };
}

// ── Alt ekstremite kinematik yeniden yapılandırma ────────────────────────────
export function computeKinematics(frame: TwinFrame): LowerLimbKinematics {
  const totalLoadPct = Math.round(((frame.insoleLeft.toePct + frame.insoleLeft.heelPct + frame.insoleRight.toePct + frame.insoleRight.heelPct) / 4) * 100) / 100;
  // Ayak vuruş açısı: topuk baskısı arttıkça yükselir (topuk-vuruş); IMU rotVelX eklenir
  const heelDominance = frame.insoleRight.heelPct - frame.insoleRight.toePct;
  const footStrikeAngleDeg = Math.max(0, Math.min(45, Math.round(10 + heelDominance * 0.2 + frame.imu.x * 8)));
  // Diz fleksiyon: yük + IMU rotVelY (sallanma fazı) ile artar
  const kneeFlexionDeg = Math.max(20, Math.min(120, Math.round(35 + totalLoadPct * 0.25 + Math.abs(frame.imu.y) * 10)));
  // Zemin temas vektörü: IMU rotasyonel hız normalize + basınç büyüklüğü
  const mag = Math.sqrt(frame.imu.x ** 2 + frame.imu.y ** 2 + frame.imu.z ** 2);
  const impact: GroundImpactVector = mag > 0.001
    ? {
        x: Math.round((frame.imu.x / mag) * 100) / 100,
        y: Math.round((frame.imu.y / mag) * 100) / 100,
        z: Math.round((frame.imu.z / mag) * 100) / 100,
      }
    : { x: 0, y: 1, z: 0 };
  return {
    footStrikeAngleDeg,
    kneeFlexionDeg,
    groundImpactVector: impact,
    phase: totalLoadPct < 20 ? 'swing' : 'stance',
    totalLoadPct,
  };
}

export function digitalTwinStatus(): string {
  return `Dijital İkiz: 100Hz çift tabanlık + IMU → ayak açısı/diz fleksiyon/zemin vektörü • scrub + 360° kamera`;
}
