// ============================================================================
// 🧬 BLE TABANLIK & BİLGİSAYAR GÖRÜŞÜ GRF FÜZYON FİLTRESİ (Adım 129)
// Genişletilmiş Kalman Filtresi (EKF) + tamamlayıcı (complementary) füzyon:
// 100Hz BLE tabanlık basınç telemetrisini kamera iskelet kütle merkezi (CoM)
// ivmesiyle kaynaştırır. Görsel tıkanmayı (örn. ayak file arkasında) tabanlık
// basıncıyla azaltır, IMU açısal drift'ini görsel optik işaretlerle düzeltir.
// Çıktı: yüksek güvenli hibrit biyomekanik telemetri çerçeveleri.
// Saf/deterministik; sıfır bağımlılık.
// ============================================================================

export const GRAVITY_MPS2 = 9.81;
export const INSOLE_GRF_MAX_BW = 2.5;
export const VISION_OCCLUSION_MS = 150; // bu süre görünmezse vizyon birincil güvenini kaybeder

export interface InsoleFusionInput {
  tsMs: number;
  pressure: number; // 0-100 FSR ortalaması
  gctMs: number;
  imuGyroZ: number; // rad/s (düzlemsel açısal hız — drift'e maruz)
}

export interface VisionFusionInput {
  tsMs: number;
  comAccelZ: number; // m/s² (kamera CoM dikey ivmesi)
  comConfidence: number; // 0-1
  opticalYawDeg?: number; // görsel optik işaret yönü (drift düzeltmesi için)
}

export interface HybridTelemetryFrame {
  tsMs: number;
  grfBw: number; // vücut ağırlığı katı
  gctMs: number;
  source: 'fused' | 'insole_primary' | 'vision_primary';
  occlusionMs: number;
  imuYawDeg: number;
  imuDriftCorrected: boolean;
  ekf: { z: number; vz: number; covariance: number; converged: boolean };
}

// ── Birim dönüşümler ─────────────────────────────────────────────────────────
export function grfFromInsolePressure(pressure: number): number {
  const bw = (Math.max(0, Math.min(100, pressure)) / 100) * INSOLE_GRF_MAX_BW;
  return Math.round(bw * 1000) / 1000;
}

export function grfFromCoMAcceleration(accelZ: number, g = GRAVITY_MPS2): number {
  return Math.round(((accelZ + g) / g) * 1000) / 1000;
}

// ── Tamamlayıcı füzyon ağırlığı: tıkanma + güven + tabanlık kalitesi ────────
export function fusionWeight(comConfidence: number, occlusionMs: number, insoleQuality = 1): number {
  const occlusionFactor = Math.max(0, 1 - occlusionMs / VISION_OCCLUSION_MS);
  const confidenceFactor = Math.max(0, Math.min(1, comConfidence));
  const insoleFactor = Math.max(0.2, Math.min(1, insoleQuality));
  return Math.round(Math.max(0, Math.min(1, confidenceFactor * occlusionFactor * (1 - (1 - insoleFactor) * 0.5))) * 1000) / 1000;
}

// ── EKF (Z ekseni konum/hız) — 2 durum, skaler kovaryans ────────────────────
export class EkfZAxis {
  private z = 0;
  private vz = 0;
  private covariance = 1;
  private readonly q: number;
  private readonly r: number;
  private updates = 0;

  constructor(q = 0.01, r = 0.05) {
    this.q = q;
    this.r = r;
  }

  predict(accelZ: number, dtMs: number): void {
    const dt = Math.max(0, dtMs) / 1000;
    this.vz += accelZ * dt;
    this.z += this.vz * dt;
    this.covariance += this.q;
  }

  update(measuredZ: number | null): void {
    if (measuredZ === null) return; // görünmez çerçeve → yalnız tahmin
    const k = this.covariance / (this.covariance + this.r);
    this.z += k * (measuredZ - this.z);
    this.vz += k * (measuredZ - this.z) / Math.max(0.001, Math.abs(this.z) + 0.001);
    this.covariance *= 1 - k;
    this.updates++;
  }

  state(): { z: number; vz: number; covariance: number; converged: boolean; updates: number } {
    const converged = this.covariance < 0.02 && this.updates >= 5; // steady-state ~0.018
    return {
      z: Math.round(this.z * 1000) / 1000,
      vz: Math.round(this.vz * 1000) / 1000,
      covariance: Math.round(this.covariance * 100000) / 100000,
      converged,
      updates: this.updates,
    };
  }
}

// ── IMU drift düzeltmesi (görsel optik işaret) ───────────────────────────────
export function correctImuDrift(imuYawDeg: number, opticalYawDeg: number, confidence: number): { correctedDeg: number; driftCorrectionDeg: number } {
  const correction = Math.round((opticalYawDeg - imuYawDeg) * confidence * 100) / 100;
  return { correctedDeg: Math.round((imuYawDeg + correction) * 100) / 100, driftCorrectionDeg: correction };
}

export interface FusionState {
  lastCameraTs: number | null;
  lastInsoleTs: number | null;
  occlusionMs: number;
  lastImuYaw: number;
}

export class SensorVisionFusionEngine {
  private readonly ekf: EkfZAxis;
  private lastCameraTs: number | null = null;
  private lastInsoleTs: number | null = null;
  private occlusionMs = 0;
  private imuYaw = 0;
  private driftCorrections = 0;

  constructor(ekf = new EkfZAxis()) {
    this.ekf = ekf;
  }

  // ── Hibrit çerçeve üret: tabanlık + (varsa) kamera ─────────────────────────
  fuse(insole: InsoleFusionInput, vision?: VisionFusionInput): HybridTelemetryFrame {
    this.lastInsoleTs = insole.tsMs;
    if (vision) {
      const dtMs = this.lastCameraTs !== null ? insole.tsMs - this.lastCameraTs : 10;
      this.ekf.predict(vision.comAccelZ, Math.max(1, dtMs));
      // Ölçüm güncellemesi: tabanlık GRF → z konum ölçütü (basitleştirilmiş)
      this.ekf.update(grfFromInsolePressure(insole.pressure) * 0.5);
      this.lastCameraTs = vision.tsMs;
      this.occlusionMs = 0;
    } else {
      this.occlusionMs = this.lastCameraTs !== null ? insole.tsMs - this.lastCameraTs : 0;
    }

    const visionAvailable = !!vision && vision.comConfidence > 0.15 && this.occlusionMs < VISION_OCCLUSION_MS;
    const alpha = visionAvailable && vision ? fusionWeight(vision.comConfidence, this.occlusionMs) : 0;
    const insoleGrf = grfFromInsolePressure(insole.pressure);
    const visionGrf = visionAvailable && vision ? grfFromCoMAcceleration(vision.comAccelZ) : insoleGrf;
    const grfBw = visionAvailable && vision
      ? Math.round((alpha * visionGrf + (1 - alpha) * insoleGrf) * 1000) / 1000
      : insoleGrf;

    // IMU drift düzeltmesi
    let imuDriftCorrected = false;
    if (vision?.opticalYawDeg !== undefined) {
      const corrected = correctImuDrift(this.imuYaw, vision.opticalYawDeg, vision.comConfidence);
      this.imuYaw = corrected.correctedDeg;
      if (Math.abs(corrected.driftCorrectionDeg) > 0.01) {
        imuDriftCorrected = true;
        this.driftCorrections++;
      }
    }

    const source: HybridTelemetryFrame['source'] = visionAvailable && vision ? 'fused' : this.occlusionMs > 0 ? 'insole_primary' : 'vision_primary';
    return {
      tsMs: insole.tsMs,
      grfBw,
      gctMs: insole.gctMs,
      source,
      occlusionMs: this.occlusionMs,
      imuYawDeg: Math.round(this.imuYaw * 100) / 100,
      imuDriftCorrected,
      ekf: this.ekf.state(),
    };
  }

  driftCorrectionCount(): number {
    return this.driftCorrections;
  }

  state(): FusionState {
    return { lastCameraTs: this.lastCameraTs, lastInsoleTs: this.lastInsoleTs, occlusionMs: this.occlusionMs, lastImuYaw: this.imuYaw };
  }
}

export function sensorVisionFusionStatus(): string {
  return `Füzyon: 100Hz tabanlık + kamera CoM • EKF(2 durum) + complementary • tıkanma >${VISION_OCCLUSION_MS}ms → tabanlık birincil`;
}

