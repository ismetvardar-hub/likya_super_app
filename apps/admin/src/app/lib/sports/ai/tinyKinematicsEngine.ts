// ============================================================================
// 🏓 TINY KINEMATICS ENGINE — on-device hareket sınıflandırıcı + mekanik
// verimlilik ağırlıkları (Harvard MLSys / Edge AI konsepti)
// 6 hareket: Forehand • Backhand • Serve • Volley • Sprint • JumpLanding
// LLM çağrısı yok, bağımlılık yok, <5ms inferans, tamamen deterministik
// ============================================================================
import { TinyTensor, matmul, addBias, softmax, KIN_MODEL } from './tinyTensor.ts';

export interface KinematicFeatures {
  gctMs: number;             // zemin temas süresi (150-300ms)
  heelPressure: number;      // topuk basınç (0-100)
  forefootPressure: number;  // önayak basınç (0-100)
  accelX: number;            // ivme vektörü bileşeni X (m/s²)
  accelY: number;            // ivme vektörü bileşeni Y (m/s²)
  accelZ: number;            // ivme vektörü bileşeni Z (m/s²)
  jerk: number;              // ivme değişim hızı
  angularVelocity: number;   // açısal hız (rad/s) — wrist IMU gyro
  velocityZ: number;         // dikey hız (m/s)
  lateralVelocity: number;   // yanal hız (m/s)
}

/** İvme vektörü büyüklüğü: √(ax²+ay²+az²) */
export function accelMagnitude(f: Pick<KinematicFeatures, 'accelX' | 'accelY' | 'accelZ'>): number {
  return Math.sqrt(f.accelX ** 2 + f.accelY ** 2 + f.accelZ ** 2);
}

/** Insole basınç farkı: önayak − topuk (−100..+100) */
export function pressureDifferential(f: Pick<KinematicFeatures, 'heelPressure' | 'forefootPressure'>): number {
  return f.forefootPressure - f.heelPressure;
}

/** Önayak / toplam basınç oranı (0-1) */
export function pressureRatio(f: Pick<KinematicFeatures, 'heelPressure' | 'forefootPressure'>): number {
  const total = f.heelPressure + f.forefootPressure;
  return total === 0 ? 0.5 : f.forefootPressure / total;
}

export interface ClassificationResult {
  label: (typeof KIN_MODEL.classes)[number];
  probs: number[];
  latencyMs: number;
  confidence: number;
}

export interface BiomechanicalFlags {
  highGct: boolean;            // temas > 250ms
  lowForefootDrive: boolean;   // basınç farkı < 20 puan
  heelStrikeDominant: boolean; // topuk > 60
  highAngularLoad: boolean;    // açısal hız > 12 rad/s
  highImpactLoad: boolean;     // ivme büyüklüğü > 15 m/s²
  asymmetricPressure: boolean; // fark < 15 puan (dengeli yük)
}

export function computeBiomechanicalFlags(f: KinematicFeatures): BiomechanicalFlags {
  const diff = pressureDifferential(f);
  return {
    highGct: f.gctMs > 250,
    lowForefootDrive: diff < 20,
    heelStrikeDominant: f.heelPressure > 60,
    highAngularLoad: Math.abs(f.angularVelocity) > 12,
    highImpactLoad: accelMagnitude(f) > 15,
    asymmetricPressure: Math.abs(diff) < 15,
  };
}

// ── 1. Özellik vektörü → 12 normalize öznitelik tensörü ─────────────────────
export function featuresToTensor(f: KinematicFeatures): TinyTensor {
  const am = accelMagnitude(f) / 30;      // ivme vektörü büyüklüğü (0-1)
  const jerkN = f.jerk / 300;
  const angVelN = f.angularVelocity / 12;
  const vzN = f.velocityZ / 5;
  const latVN = f.lateralVelocity / 5;
  const ratio = pressureRatio(f);
  const v = [
    f.gctMs / 300,
    f.heelPressure / 100,
    f.forefootPressure / 100,
    am,
    jerkN,
    angVelN,
    vzN,
    latVN,
    ratio,
    angVelN * vzN,          // angVelZ: serve (açısal × dikey)
    1 - jerkN,              // jerkLow: volley (düşük jerk)
    (f.heelPressure / 100) * (1 - ratio), // heelImpact: iniş şiddeti
  ];
  return new TinyTensor(v, [1, KIN_MODEL.inputDim]);
}

// ── 2. İleri geçiş: 12 öznitelik → 6 logits (softmax) ───────────────────────
export function forwardKinematics(f: KinematicFeatures): ClassificationResult {
  const t0 = performance.now();
  const x = featuresToTensor(f);
  const W = TinyTensor.fromFlat(KIN_MODEL.W.flat());
  W.shape = [KIN_MODEL.inputDim, KIN_MODEL.outputDim];
  const logits = addBias(matmul(x, W), [...KIN_MODEL.b]);
  const probs = softmax(logits).data;
  const maxIdx = probs.indexOf(Math.max(...probs));
  return {
    label: KIN_MODEL.classes[maxIdx],
    probs,
    latencyMs: Math.max(0.01, performance.now() - t0),
    confidence: probs[maxIdx],
  };
}

// ── 3. Grev mekanik verimlilik ağırlıkları (LLM'siz, kural bazlı) ───────────
export interface EfficiencyScore {
  efficiencyPct: number;     // genel mekanik verim (0-100)
  weights: {
    contactEfficiency: number; // 0-1 temas kalitesi (GCT ideal ~200ms)
    forefootDrive: number;     // 0-1 önayak itiş payı (basınç farkı)
    angularControl: number;    // 0-1 açısal kontrol (aşırı spin/whiplash cezası)
    rhythm: number;            // 0-1 hareket ritmi (orta jerk)
  };
  advice: string;
}

export function strikeEfficiency(f: KinematicFeatures): EfficiencyScore {
  const contactEfficiency = Math.max(0, 1 - Math.abs(f.gctMs - 200) / 200);
  const diff = pressureDifferential(f);                       // −100..+100
  const forefootDrive = Math.min(1, Math.max(0, diff + 30) / 110); // +30..+80 → 0..1
  const angularControl = Math.min(1, Math.max(0, 1 - Math.abs(f.angularVelocity - 6) / 16));
  const rhythm = Math.min(1, Math.max(0, 1 - Math.abs(f.jerk - 130) / 220));

  const weights = { contactEfficiency, forefootDrive, angularControl, rhythm };
  const efficiencyPct = Math.round((contactEfficiency * 0.35 + forefootDrive * 0.3 + angularControl * 0.2 + rhythm * 0.15) * 100);

  let advice: string;
  if (efficiencyPct >= 80) advice = 'Mekanik kalite mükemmel — koru.';
  else if (forefootDrive < 0.4) advice = 'Önayak itiş payı düşük — forefoot drill ekle.';
  else if (angularControl < 0.5) advice = 'Açısal yük yüksek — bilek kontrolüne odaklan.';
  else if (contactEfficiency < 0.5) advice = 'Temas süresini kısalt — plyometrik seri önerilir.';
  else advice = 'Ritmi iyileştir — tempo drill uygula.';
  return { efficiencyPct, weights, advice };
}

// ── 4. Hareket profili şablonları (test + simülasyon için) ──────────────────
export function sampleFeatures(kind: (typeof KIN_MODEL.classes)[number]): KinematicFeatures {
  switch (kind) {
    case 'Forehand':    return { gctMs: 210, heelPressure: 30, forefootPressure: 78, accelX: 8.0, accelY: 3.0, accelZ: 3.0, jerk: 130, angularVelocity: 8, velocityZ: 0.4, lateralVelocity: 3.2 };
    case 'Backhand':    return { gctMs: 195, heelPressure: 28, forefootPressure: 71, accelX: -7.5, accelY: 2.5, accelZ: 3.0, jerk: 112, angularVelocity: -7, velocityZ: 0.3, lateralVelocity: -2.9 };
    case 'Serve':       return { gctMs: 210, heelPressure: 40, forefootPressure: 65, accelX: 10.0, accelY: 4.0, accelZ: 6.0, jerk: 180, angularVelocity: 14, velocityZ: 1.8, lateralVelocity: 1.2 };
    case 'Volley':      return { gctMs: 210, heelPressure: 35, forefootPressure: 60, accelX: 5.5, accelY: 2.0, accelZ: 1.5, jerk: 70, angularVelocity: 5, velocityZ: 0.2, lateralVelocity: 1.5 };
    case 'Sprint':      return { gctMs: 120, heelPressure: 15, forefootPressure: 92, accelX: 15.0, accelY: 4.0, accelZ: 5.5, jerk: 205, angularVelocity: 2, velocityZ: 1.2, lateralVelocity: 0.2 };
    case 'JumpLanding': return { gctMs: 265, heelPressure: 85, forefootPressure: 55, accelX: 16.0, accelY: 5.0, accelZ: 7.5, jerk: 240, angularVelocity: 3, velocityZ: -2.1, lateralVelocity: 0.5 };
  }
}

export function tinyKinematicsStatus(): string {
  return `Tiny Kinematics: ${KIN_MODEL.classes.length} sinif, 12 oznitelik, <5ms, sifir bagimlilik`;
}


// ── 5. AKIŞ SINIFLANDIRMA — zamansal yumuşatma + güven eşiği (on-device) ────
export interface StreamClassifyOptions {
  windowSize?: number;    // pencere boyutu (örnek sayısı)
  minConfidence?: number; // kabul eşiği (0-1)
}

export interface StreamClassification {
  label: (typeof KIN_MODEL.classes)[number] | 'Belirsiz';
  smoothedLabel: (typeof KIN_MODEL.classes)[number] | 'Belirsiz';
  confidence: number;            // pencere içi çoğunluk oranı
  votes: Record<string, number>;
  rawLabels: (typeof KIN_MODEL.classes)[number][];
}

/**
 * Örnek akışını sınıflandırır; pencere içi çoğunluk oyu ile "flicker" önlenir.
 * Çoğunluk oranı eşiğin altındaysa sonuç 'Belirsiz' — kararsız hareket reddi.
 */
export function classifyStream(samples: KinematicFeatures[], opts: StreamClassifyOptions = {}): StreamClassification {
  const windowSize = Math.max(1, opts.windowSize ?? 5);
  const minConfidence = opts.minConfidence ?? 0.35;
  const rawLabels = samples.map((f) => forwardKinematics(f).label);
  const window = rawLabels.slice(-windowSize);

  const votes: Record<string, number> = {};
  for (const l of window) votes[l] = (votes[l] ?? 0) + 1;
  const entries = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  const top = entries[0];
  const smoothedLabel = top ? (top[0] as StreamClassification['smoothedLabel']) : 'Belirsiz';
  const confidence = top ? top[1] / window.length : 0;
  const label: StreamClassification['label'] = confidence >= minConfidence ? smoothedLabel : 'Belirsiz';
  return { label, smoothedLabel, confidence, votes, rawLabels };
}

export interface ConfidenceResult {
  label: (typeof KIN_MODEL.classes)[number] | 'Belirsiz';
  confidence: number;
  accepted: boolean;
}

/** Tek örneğin güveni eşiğin altındaysa 'Belirsiz' olarak reddeder. */
export function confidentPrediction(f: KinematicFeatures, minConfidence = 0.4): ConfidenceResult {
  const r = forwardKinematics(f);
  const accepted = r.confidence >= minConfidence;
  return { label: accepted ? r.label : 'Belirsiz', confidence: r.confidence, accepted };
}

// ── 6. KALİBRASYON — min-max normalizasyon (donanım verisi için) ─────────────
export interface NormalizationRange { min: number; max: number; }

/** Ham sensör değerlerini 0-1 aralığına ölçekler (cihaz kalibrasyonu). */
export function normalizeFeatures(
  f: KinematicFeatures,
  ranges: Record<keyof KinematicFeatures, NormalizationRange>,
): KinematicFeatures {
  const clamp01 = (v: number, r: NormalizationRange) =>
    Math.max(0, Math.min(1, (v - r.min) / Math.max(1e-6, r.max - r.min)));
  return {
    gctMs: clamp01(f.gctMs, ranges.gctMs),
    heelPressure: clamp01(f.heelPressure, ranges.heelPressure),
    forefootPressure: clamp01(f.forefootPressure, ranges.forefootPressure),
    accelX: clamp01(f.accelX, ranges.accelX),
    accelY: clamp01(f.accelY, ranges.accelY),
    accelZ: clamp01(f.accelZ, ranges.accelZ),
    jerk: clamp01(f.jerk, ranges.jerk),
    angularVelocity: clamp01(f.angularVelocity, ranges.angularVelocity),
    velocityZ: clamp01(f.velocityZ, ranges.velocityZ),
    lateralVelocity: clamp01(f.lateralVelocity, ranges.lateralVelocity),
  };
}

/** Saha donanımı için varsayılan kalibrasyon aralıkları. */
export const DEFAULT_CALIBRATION_RANGES: Record<keyof KinematicFeatures, NormalizationRange> = {
  gctMs: { min: 100, max: 320 },
  heelPressure: { min: 0, max: 100 },
  forefootPressure: { min: 0, max: 100 },
  accelX: { min: -20, max: 20 },
  accelY: { min: -20, max: 20 },
  accelZ: { min: -20, max: 20 },
  jerk: { min: 0, max: 400 },
  angularVelocity: { min: -20, max: 20 },
  velocityZ: { min: -3, max: 3 },
  lateralVelocity: { min: -5, max: 5 },
};

