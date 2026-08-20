// ============================================================================
// 🎾 TENİS VURUŞ SINIFLANDIRICISI (Adım 35) — IMU + tabanlık birleşimi
// Girdi: açısal hızlar (ωx, ωy, ωz), ivme vektörü, topuk→önayak kuvvet zamanlaması
// Sınıflar: Forehand Topspin/Flat • Backhand 1H/2H • Serve • Overhead Smash • F/B Volley
// Çıktı: güven (0-1), kol savrulma hızı (km/h), kinetik zincir zamanlama skoru.
// Deterministik; LLM yok; sıfır bağımlılık (softmax için TinyTensor yeniden kullanılır).
// ============================================================================

import { TinyTensor, softmax } from '../ai/tinyTensor.ts';

export type TennisStrokeKind =
  | 'ForehandTopspin'
  | 'ForehandFlat'
  | 'Backhand1H'
  | 'Backhand2H'
  | 'Serve'
  | 'OverheadSmash'
  | 'ForehandVolley'
  | 'BackhandVolley';

export interface TennisImuSample {
  omegaX: number;      // rad/s — roll
  omegaY: number;      // rad/s — pitch (ön/arka vuruş yönü)
  omegaZ: number;      // rad/s — yaw (serve/smash dikey eksen)
  accelX: number;      // m/s² — mediolateral
  accelY: number;      // m/s² — ileri-geri
  accelZ: number;      // m/s² — dikey
  heelToToeMs: number; // topuk→önayak kuvvet geçişi (ms)
  armSpeedKmh?: number; // ölçülen kol savrulma hızı
  footDriveMs?: number; // ayak itiş başlangıcı (ms)
  racketReleaseMs?: number; // raket çıkışı (ms)
}

export interface TennisStrokeResult {
  label: TennisStrokeKind;
  confidence: number;      // 0-1 (softmax normalize)
  armSwingKmh: number;
  kineticChainScore: number; // 0-100
  chainTimingLagMs: number;  // raket çıkışı − ayak itişi
  evidence: string[];
}

/** İvme vektörü büyüklüğü. */
export function accelMagnitudeImu(f: Pick<TennisImuSample, 'accelX' | 'accelY' | 'accelZ'>): number {
  return Math.sqrt(f.accelX ** 2 + f.accelY ** 2 + f.accelZ ** 2);
}

/** Ölçülmediyse kol hızını ivmeden tahmin et (km/h). */
export function estimateArmSwingKmh(f: TennisImuSample): number {
  if (f.armSpeedKmh !== undefined && f.armSpeedKmh > 0) return Math.round(f.armSpeedKmh);
  return Math.round(accelMagnitudeImu(f) * 3.2 + 25);
}

/** Kinetik zincir: ayak itişi → raket çıkışı zamanlaması (0-100). */
export function kineticChainScore(lagMs: number): number {
  // ideal 40-90ms ayak→raket gecikmesi
  const ideal = 60;
  return Math.max(0, Math.min(100, Math.round(100 - Math.abs(lagMs - ideal) * 1.1)));
}

/** Racket-release − foot-drive gecikmesi (veri yoksa topuk→önayak'tan türet). */
export function chainTimingLagMs(f: TennisImuSample): number {
  if (f.footDriveMs !== undefined && f.racketReleaseMs !== undefined) return f.racketReleaseMs - f.footDriveMs;
  return Math.round(f.heelToToeMs * 0.7);
}

// ── Deterministik kural tabanlı sınıf puanları ────────────────────────────────
function rawScores(f: TennisImuSample): Record<TennisStrokeKind, number> {
  const am = accelMagnitudeImu(f);
  const wZ = Math.abs(f.omegaZ);
  const wY = f.omegaY;
  const h2t = f.heelToToeMs;
  const arm = estimateArmSwingKmh(f);
  const isFwd = wY > 0.5;        // pozitif pitch → ön vuruş
  const isBwd = wY < -0.5;       // negatif → arka vuruş
  const volleyLike = h2t < 100 && am < 14;
  const overheadLike = wZ > 8 && (am > 12 || f.accelZ > 12);
  const groundPenalty = wZ > 8 ? 6 : 0;           // aşırı yaw → overhead imzası (yer vuruşu ceza)
  const volleyPenalty = volleyLike ? 6 : 0;        // kısa temas + düşük ivme → volley (yer vuruşu ceza)

  return {
    // Spin yüksek → topspin; spin düşük + hızlı kol → flat
    ForehandTopspin: (isFwd ? 12 : 0) + Math.min(5, wZ) + (h2t >= 120 && h2t <= 180 ? 3 : 0) + (arm >= 90 && arm <= 120 ? 2 : 0) - groundPenalty - volleyPenalty,
    ForehandFlat: (isFwd ? 12 : 0) + Math.max(0, 6 - wZ * 1.5) + (h2t >= 100 && h2t <= 160 ? 3 : 0) + (arm >= 110 ? 2 : 0) - groundPenalty - volleyPenalty,
    // 1H: tek el → hızlı kol + rotasyon; 2H: çift el → stabil düşük kol (volley dışı)
    Backhand1H: (isBwd ? 12 : 0) + Math.max(0, 8 - wZ) + (arm >= 105 ? 4 : 0) + (h2t >= 130 ? 2 : 0) - groundPenalty - volleyPenalty,
    Backhand2H: (isBwd ? 12 : 0) + (arm >= 80 && arm < 100 ? 4 : 0) + (h2t >= 120 ? 2 : 0) + Math.max(0, 6 - wZ) - groundPenalty - volleyPenalty,
    // Overhead: yüksek yaw + dikey ivme
    Serve: overheadLike ? 14 + wZ : 0,
    OverheadSmash: overheadLike ? 12 + Math.max(0, f.accelZ - 10) * 1.5 : 0,
    // Volley: kısa temas + düşük ivme
    ForehandVolley: volleyLike && isFwd ? 14 : 0,
    BackhandVolley: volleyLike && isBwd ? 14 : 0,
  };
}

// ── Sınıflandırma ──────────────────────────────────────────────────────────────
export function classifyTennisStroke(f: TennisImuSample): TennisStrokeResult {
  const scores = rawScores(f);
  const order = Object.keys(scores) as TennisStrokeKind[];
  const logits = order.map((k) => scores[k]);
  const probs = softmax(new TinyTensor(logits, [1, logits.length])).data;
  const bestIdx = probs.indexOf(Math.max(...probs));
  const label = order[bestIdx];
  const lag = chainTimingLagMs(f);
  const armSwingKmh = estimateArmSwingKmh(f);

  // Hâlâ tüm puanlar sıfırsa belirsiz imza
  const evidence: string[] = [
    `ωz ${f.omegaZ.toFixed(1)} rad/s · am ${accelMagnitudeImu(f).toFixed(1)} m/s²`,
    `topuk→önayak ${f.heelToToeMs}ms`,
    `kol ${armSwingKmh} km/h · zincir lag ${lag}ms`,
  ];

  return {
    label,
    confidence: Number(probs[bestIdx].toFixed(3)),
    armSwingKmh,
    kineticChainScore: kineticChainScore(lag),
    chainTimingLagMs: lag,
    evidence,
  };
}

// ── Test / simülasyon örnekleri ────────────────────────────────────────────────
export function sampleTennisStroke(kind: TennisStrokeKind): TennisImuSample {
  switch (kind) {
    case 'ForehandTopspin': return { omegaX: 2, omegaY: 8, omegaZ: 6, accelX: 6, accelY: 8, accelZ: 5, heelToToeMs: 150, armSpeedKmh: 118, footDriveMs: 0, racketReleaseMs: 55 };
    case 'ForehandFlat': return { omegaX: 1.5, omegaY: 7, omegaZ: 2.5, accelX: 5, accelY: 9, accelZ: 4, heelToToeMs: 130, armSpeedKmh: 124, footDriveMs: 0, racketReleaseMs: 60 };
    case 'Backhand1H': return { omegaX: -2, omegaY: -7, omegaZ: 3, accelX: -6, accelY: 7, accelZ: 5, heelToToeMs: 145, armSpeedKmh: 112, footDriveMs: 0, racketReleaseMs: 50 };
    case 'Backhand2H': return { omegaX: -1.5, omegaY: -6, omegaZ: 2, accelX: -5, accelY: 6, accelZ: 4, heelToToeMs: 140, armSpeedKmh: 92, footDriveMs: 0, racketReleaseMs: 65 };
    case 'Serve': return { omegaX: 3, omegaY: 4, omegaZ: 12, accelX: 2, accelY: 6, accelZ: 14, heelToToeMs: 175, armSpeedKmh: 178, footDriveMs: 0, racketReleaseMs: 70 };
    case 'OverheadSmash': return { omegaX: 2, omegaY: 3, omegaZ: 10, accelX: 1, accelY: 5, accelZ: 19, heelToToeMs: 160, armSpeedKmh: 165, footDriveMs: 0, racketReleaseMs: 55 };
    case 'ForehandVolley': return { omegaX: 1, omegaY: 4, omegaZ: 1.5, accelX: 4, accelY: 5, accelZ: 2, heelToToeMs: 70, armSpeedKmh: 58, footDriveMs: 0, racketReleaseMs: 30 };
    case 'BackhandVolley': return { omegaX: -1, omegaY: -4, omegaZ: 1.5, accelX: -4, accelY: 5, accelZ: 2, heelToToeMs: 75, armSpeedKmh: 55, footDriveMs: 0, racketReleaseMs: 35 };
  }
}

export function tennisStrokeClassifierStatus(): string {
  return 'Tenis Vuruş: 8 sınıf (TS/Flat/1H/2H/Serve/Smash/Volley) • güven+km/h+kinetik zincir';
}

