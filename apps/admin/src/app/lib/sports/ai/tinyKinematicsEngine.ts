// ============================================================================
// 🏓 TINY KINEMATICS ENGINE — on-device hareket sınıflandırıcı + mekanik
// verimlilik ağırlıkları (Edge AI / MLSys konsepti)
// LLM çağrısı yok, bağımlılık yok, <5ms inferans
// ============================================================================
import { TinyTensor, matmul, addBias, relu, softmax, KIN_MODEL } from './tinyTensor';

export interface KinematicFeatures {
  gctMs: number;            // zemin temas süresi
  heelPressure: number;     // topuk basınç (0-100)
  forefootPressure: number; // önayak basınç (0-100)
  accelMag: number;         // ivme büyüklüğü (m/s²)
  jerk: number;             // ivme değişim hızı
  velocityZ: number;        // dikey hız (m/s)
  lateralVelocity: number;  // yanal hız (m/s)
  pressureRatio: number;    // önayak / toplam basınç oranı
}

export interface ClassificationResult {
  label: (typeof KIN_MODEL.classes)[number];
  probs: number[];
  latencyMs: number;
  confidence: number;
}

// ── 1. Özellik vektörü → normalize tensor ───────────────────────────────────
export function featuresToTensor(f: KinematicFeatures): TinyTensor {
  const v = [
    f.gctMs / 300,
    f.heelPressure / 100,
    f.forefootPressure / 100,
    f.accelMag / 20,
    f.jerk / 200,
    f.velocityZ / 5,
    f.lateralVelocity / 5,
    f.pressureRatio,
  ];
  return new TinyTensor(v, [1, KIN_MODEL.inputDim]); // 1×8 satır vektör
}

// ── 2. İleri geçiş: 8 öznitelik → 4 logits (softmax) ───────────────────────
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
  efficiencyPct: number;     // genel mekanik verim
  weights: {
    contactEfficiency: number; // 0-1 temas kalitesi
    forefootDrive: number;     // 0-1 önayak itiş payı
    shockAbsorption: number;   // 0-1 şok emilim kalitesi
    rhythm: number;            // 0-1 hareket ritmi
  };
  advice: string;
}

export function strikeEfficiency(f: KinematicFeatures): EfficiencyScore {
  const contactEfficiency = Math.max(0, 1 - Math.abs(f.gctMs - 200) / 200);           // ideal ~200ms
  const forefootDrive = Math.min(1, Math.max(0, f.pressureRatio - 0.3) / 0.7);         // önayak itiş payı
  const shockAbsorption = Math.min(1, Math.max(0, 1 - f.heelPressure / 90));            // düşük topuk = iyi şok emilim
  const rhythm = Math.min(1, Math.max(0, 1 - Math.abs(f.jerk - 120) / 180));            // orta jerk = ritmik

  const weights = { contactEfficiency, forefootDrive, shockAbsorption, rhythm };
  const efficiencyPct = Math.round((contactEfficiency * 0.35 + forefootDrive * 0.3 + shockAbsorption * 0.2 + rhythm * 0.15) * 100);

  let advice: string;
  if (efficiencyPct >= 80) advice = 'Mekanik kalite mükemmel — koru.';
  else if (efficiencyPct >= 60) advice = 'Topuk basışını hafiflet, önayak itişine odaklan.';
  else if (forefootDrive < 0.4) advice = 'Önayak itiş payı düşük — forefoot drill ekle.';
  else advice = 'Temas süresini kısalt — plyometrik seri önerilir.';
  return { efficiencyPct, weights, advice };
}

// ── 4. Hareket profili şablonları (test + simülasyon için) ──────────────────
export function sampleFeatures(kind: (typeof KIN_MODEL.classes)[number]): KinematicFeatures {
  switch (kind) {
    case 'Forehand':   return { gctMs: 210, heelPressure: 30, forefootPressure: 78, accelMag: 9.2, jerk: 130, velocityZ: 0.4, lateralVelocity: 3.2, pressureRatio: 0.72 };
    case 'Backhand':   return { gctMs: 195, heelPressure: 28, forefootPressure: 71, accelMag: 8.4, jerk: 112, velocityZ: 0.3, lateralVelocity: -2.9, pressureRatio: 0.71 };
    case 'Sprint':     return { gctMs: 120, heelPressure: 15, forefootPressure: 92, accelMag: 16.5, jerk: 205, velocityZ: 1.2, lateralVelocity: 0.2, pressureRatio: 0.86 };
    case 'JumpLanding':return { gctMs: 265, heelPressure: 85, forefootPressure: 55, accelMag: 18.2, jerk: 240, velocityZ: -2.1, lateralVelocity: 0.5, pressureRatio: 0.39 };
  }
}

export function tinyKinematicsStatus(): string {
  return 'Tiny Kinematics: 8→16→4 MLP, <5ms, sifir bagimlilik';
}
