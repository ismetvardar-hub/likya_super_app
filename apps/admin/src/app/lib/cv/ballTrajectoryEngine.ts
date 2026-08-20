// ============================================================================
// 🎾 TOP YÖRÜNGESİ & İÇERİ/DIŞARI ZIMBA YERİ TAHMİN MOTORU (Adım 127)
// Yüksek hızlı top uçuş & zıplama fiziği: video kareleri arasında top koordinat
// vektörlerini (x(t), y(t), z(t)) interpoler eder; tepe yüksekliği, zıplama
// koordinatları (X_bounce, Y_bounce) ve çarpma hızını (km/h) öngörür.
// Sonucu IN_COURT / OUT_OF_BOUNDS / FAULT_SERVICE / NET_TOUCH olarak sınıflar
// (milimetrik marj hassasiyeti). Saf/deterministik; sıfır bağımlılık.
// ============================================================================

export const GRAVITY_MPS2 = 9.81;
export const BALL_MARGIN_M = 0.002; // 2mm — çizgi avantajı marjı
export const NET_HEIGHT_M = 0.914;

export interface BallDetection {
  tMs: number;
  x: number; // metre (kort koordinatı, homography çıktısı)
  y: number;
  z: number;
}

export type ShotOutcome = 'IN_COURT' | 'OUT_OF_BOUNDS' | 'FAULT_SERVICE' | 'NET_TOUCH';

export interface BallTrajectory {
  apex: { heightM: number; tMs: number };
  landing: { x: number; y: number; tMs: number } | null;
  impactSpeedKmh: number;
  velocity: { vx: number; vy: number; vz: number };
}

export interface CourtBounds {
  lengthM: number;
  widthM: number;
  serviceLineY: number; // servis çizgisi mesafesi (net'ten)
}

export const COURT_BOUNDS_STANDARD: CourtBounds = { lengthM: 23.77, widthM: 8.23, serviceLineY: 6.4 };

export interface BallShotResult {
  outcome: ShotOutcome;
  bounce: { x: number; y: number; marginToLineM: number } | null;
  reason: string;
}

// ── İki tespit arası serbest düşüş fiziği ────────────────────────────────────
export function fitParabolicFlight(p0: BallDetection, p1: BallDetection): { velocity: { vx: number; vy: number; vz: number }; apex: { heightM: number; tMs: number }; landing: { x: number; y: number; tMs: number }; impactSpeedKmh: number } {
  const dt = Math.max(0.001, (p1.tMs - p0.tMs) / 1000);
  const vx = (p1.x - p0.x) / dt;
  const vy = (p1.y - p0.y) / dt;
  const vz = (p1.z - p0.z) / dt;

  // Tepe: v_z = 0 → t = vz/g
  const apexT = vz / GRAVITY_MPS2; // saniye (vz > 0 ise)
  const apexHeightM = apexT > 0 ? p0.z + vz * apexT - 0.5 * GRAVITY_MPS2 * apexT * apexT : p0.z;

  // Zıplama: z(t)=0 çözümü (pozitif kök)
  const disc = vz * vz + 2 * GRAVITY_MPS2 * p0.z;
  let landing: { x: number; y: number; tMs: number } | null = null;
  let impactSpeedKmh = 0;
  if (disc >= 0 && vz !== 0) {
    const tLand = (vz + Math.sqrt(disc)) / GRAVITY_MPS2;
    if (tLand > 0) {
      landing = {
        x: Math.round((p0.x + vx * tLand) * 1000) / 1000,
        y: Math.round((p0.y + vy * tLand) * 1000) / 1000,
        tMs: Math.round(p0.tMs + tLand * 1000),
      };
      const vzLand = vz - GRAVITY_MPS2 * tLand;
      impactSpeedKmh = Math.round(Math.sqrt(vx * vx + vy * vy + vzLand * vzLand) * 3.6 * 100) / 100;
    }
  }

  return {
    velocity: { vx: Math.round(vx * 100) / 100, vy: Math.round(vy * 100) / 100, vz: Math.round(vz * 100) / 100 },
    apex: { heightM: Math.round(apexHeightM * 1000) / 1000, tMs: Math.round(p0.tMs + Math.max(0, apexT) * 1000) },
    landing,
    impactSpeedKmh,
  };
}

export function interpolateBallPath(detections: BallDetection[], hz = 120): BallDetection[] {
  if (detections.length < 2) return [...detections];
  const stepMs = 1000 / hz;
  const out: BallDetection[] = [];
  for (let i = 0; i < detections.length - 1; i++) {
    const a = detections[i];
    const b = detections[i + 1];
    const span = b.tMs - a.tMs;
    const steps = Math.max(1, Math.floor(span / stepMs));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      out.push({
        tMs: a.tMs + s * stepMs,
        x: Math.round((a.x + (b.x - a.x) * t) * 1000) / 1000,
        y: Math.round((a.y + (b.y - a.y) * t) * 1000) / 1000,
        z: Math.round((a.z + (b.z - a.z) * t) * 1000) / 1000,
      });
    }
  }
  out.push(detections[detections.length - 1]);
  return out;
}

// ── Milimetrik marj ile içeri/dışarı kararı ──────────────────────────────────
export function classifyShot(trajectory: BallTrajectory, bounds: CourtBounds, phase: 'rally' | 'serve' = 'rally', netY = 0): BallShotResult {
  if (!trajectory.landing) {
    return { outcome: 'NET_TOUCH', bounce: null, reason: 'Zıplama noktası yok — top fileye takıldı' };
  }
  const { x, y } = trajectory.landing;
  const marginToLineM = Math.min(
    Math.abs(y - 0),
    Math.abs(y - bounds.lengthM),
    Math.abs(x + bounds.widthM / 2),
    Math.abs(x - bounds.widthM / 2),
  );

  const halfW = bounds.widthM / 2;
  const inLength = y >= -BALL_MARGIN_M && y <= bounds.lengthM + BALL_MARGIN_M;
  const inWidth = x >= -halfW - BALL_MARGIN_M && x <= halfW + BALL_MARGIN_M;

  if (phase === 'serve') {
    const inServiceBox = y >= -BALL_MARGIN_M && y <= bounds.serviceLineY + BALL_MARGIN_M && Math.abs(x) <= halfW / 2 + BALL_MARGIN_M;
    if (inLength && inWidth && inServiceBox) {
      return { outcome: 'IN_COURT', bounce: { x, y, marginToLineM }, reason: 'Servis kutusuna zıpladı — geçerli servis' };
    }
    return { outcome: 'FAULT_SERVICE', bounce: { x, y, marginToLineM }, reason: 'Servis zıplaması servis kutusu dışında (marj ±2mm)' };
  }

  if (!inLength || !inWidth) {
    return { outcome: 'OUT_OF_BOUNDS', bounce: { x, y, marginToLineM }, reason: `Zıplama çizgi dışında (marj ${marginToLineM}m)` };
  }
  // Fileye temas: top net çizgisi üzerinde, net yüksekliğine çok yakın
  if (trajectory.apex.heightM < NET_HEIGHT_M + 0.05 && Math.abs(y - netY) < 1.0) {
    return { outcome: 'NET_TOUCH', bounce: { x, y, marginToLineM }, reason: 'Top net yüksekliğinin altında file bölgesinden geçti' };
  }
  return { outcome: 'IN_COURT', bounce: { x, y, marginToLineM }, reason: `İçeride zıplama (marj ${marginToLineM}m) — geçerli vuruş` };
}

export function ballTrajectoryStatus(): string {
  return `Top Yörüngesi: parabolik uçuş • tepe/zıplama/çarpma hızı • IN/OUT/FAULT/NET marj ±${BALL_MARGIN_M * 1000}mm`;
}
