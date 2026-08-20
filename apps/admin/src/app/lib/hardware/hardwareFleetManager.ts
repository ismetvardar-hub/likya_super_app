// ============================================================================
// 🔧 DONANIM FİLO SAĞLIĞI & BATARYA TELEMETRİ YÖNETİCİSİ (Adım 116)
// Akademi yöneticileri için merkezi filo izleme: 50+ BLE cihazın pil şarj
// durumu (SoC), şarj döngüsü, firmware sürüm sapması ve sensör bozulma
// indeksleri. Bakım uyarıları + Canary → Akademi kademeli (stage-gated) OTA
// firmware rollout zamanlayıcısı. Saf/deterministik; sıfır bağımlılık.
// ============================================================================

export type FleetDeviceKind = 'insole' | 'hrm' | 'armband';

export const LOW_BATTERY_SOC = 15;
export const CRITICAL_BATTERY_SOC = 5;
export const MEMBRANE_DEGRADATION_WARN_PCT = 15;
export const SENSOR_DEGRADATION_CRITICAL = 0.8;
export const OTA_CANARY_FRACTION = 0.1;

export interface FleetDevice {
  deviceId: string;
  kind: FleetDeviceKind;
  setTag: string;                  // örn. "Insole Set #08"
  batterySoC: number;              // 0-100
  charging: boolean;
  chargingCycles: number;
  firmwareVersion: string;
  targetFirmwareVersion: string;
  membraneDegradationPct: number;  // FSR basınç membran aşınması
  degradationIndex: number;        // 0-1 genel sensör bozulma indeksi
  lastSeenAt: string;
}

export type FleetSeverity = 'info' | 'warning' | 'critical';

export interface FleetMaintenanceAlert {
  deviceId: string;
  setTag: string;
  severity: FleetSeverity;
  message: string;
}

export function classifyBatterySoc(soc: number, charging = false): 'critical' | 'low' | 'normal' {
  if (charging) return 'normal';
  if (soc <= CRITICAL_BATTERY_SOC) return 'critical';
  if (soc < LOW_BATTERY_SOC) return 'low';
  return 'normal';
}

// ── Bakım uyarı kuralları ────────────────────────────────────────────────────
export function fleetMaintenanceAlerts(devices: FleetDevice[]): FleetMaintenanceAlert[] {
  const alerts: FleetMaintenanceAlert[] = [];
  for (const d of devices) {
    const soc = classifyBatterySoc(d.batterySoC, d.charging);
    if (soc === 'critical') alerts.push({ deviceId: d.deviceId, setTag: d.setTag, severity: 'critical', message: `${d.setTag}: pil %${d.batterySoC} — kritik; hemen şarja al` });
    else if (soc === 'low') alerts.push({ deviceId: d.deviceId, setTag: d.setTag, severity: 'warning', message: `${d.setTag}: pil %${d.batterySoC} — şarj gerekli (eşik <%${LOW_BATTERY_SOC})` });
    if (d.membraneDegradationPct > MEMBRANE_DEGRADATION_WARN_PCT) {
      alerts.push({ deviceId: d.deviceId, setTag: d.setTag, severity: 'warning', message: `${d.setTag}: FSR pressure membrane degradation ${Math.round(d.membraneDegradationPct)}% (Recalibration recommended)` });
    }
    if (d.degradationIndex > SENSOR_DEGRADATION_CRITICAL) {
      alerts.push({ deviceId: d.deviceId, setTag: d.setTag, severity: 'critical', message: `${d.setTag}: sensör bozulma indeksi ${d.degradationIndex.toFixed(2)} — servis dışı bırakın` });
    }
    if (d.firmwareVersion !== d.targetFirmwareVersion) {
      alerts.push({ deviceId: d.deviceId, setTag: d.setTag, severity: 'info', message: `${d.setTag}: firmware ${d.firmwareVersion} → hedef ${d.targetFirmwareVersion} (OTA rollout bekliyor)` });
    }
  }
  return alerts;
}

// ── OTA rollout zamanlayıcı (Canary → Academy, stage gating) ─────────────────
export interface OtaRolloutPlan {
  stage: 'canary' | 'academy_rollout';
  deviceIds: string[];
  targetFirmwareVersion: string;
  gated: boolean;
  status: 'pending' | 'approved' | 'deployed' | 'failed';
}

export function buildOtaRolloutSchedule(devices: FleetDevice[]): { canary: OtaRolloutPlan; academy: OtaRolloutPlan } {
  const pending = devices.filter((d) => d.firmwareVersion !== d.targetFirmwareVersion);
  const canaryCount = Math.max(1, Math.ceil(pending.length * OTA_CANARY_FRACTION));
  const canaryIds = pending.slice(0, canaryCount).map((d) => d.deviceId);
  const academyIds = pending.slice(canaryCount).map((d) => d.deviceId);
  const target = pending[0]?.targetFirmwareVersion ?? '';
  return {
    canary: { stage: 'canary', deviceIds: canaryIds, targetFirmwareVersion: target, gated: false, status: 'pending' },
    academy: { stage: 'academy_rollout', deviceIds: academyIds, targetFirmwareVersion: target, gated: true, status: 'pending' },
  };
}

export function canApproveAcademyRollout(canaryHealth: { successRatePct: number }, minSuccessPct = 95): boolean {
  return canaryHealth.successRatePct >= minSuccessPct;
}

export function approveAcademyRollout(plan: OtaRolloutPlan, canaryHealth: { successRatePct: number }): OtaRolloutPlan {
  if (plan.stage !== 'academy_rollout') return plan;
  const approved = canApproveAcademyRollout(canaryHealth);
  return { ...plan, status: approved ? 'approved' : 'pending', gated: !approved };
}

// ── Filo özeti ────────────────────────────────────────────────────────────────
export interface FleetSummary {
  total: number;
  avgSocPct: number;
  lowBatteryCount: number;
  outOfDateFirmwareCount: number;
  degradedCount: number;
  healthyCount: number;
}

export function fleetSummary(devices: FleetDevice[]): FleetSummary {
  const n = devices.length;
  return {
    total: n,
    avgSocPct: n ? Math.round(devices.reduce((a, d) => a + d.batterySoC, 0) / n) : 0,
    lowBatteryCount: devices.filter((d) => classifyBatterySoc(d.batterySoC, d.charging) !== 'normal').length,
    outOfDateFirmwareCount: devices.filter((d) => d.firmwareVersion !== d.targetFirmwareVersion).length,
    degradedCount: devices.filter((d) => d.membraneDegradationPct > MEMBRANE_DEGRADATION_WARN_PCT || d.degradationIndex > SENSOR_DEGRADATION_CRITICAL).length,
    healthyCount: devices.filter((d) => d.membraneDegradationPct <= MEMBRANE_DEGRADATION_WARN_PCT && d.degradationIndex <= SENSOR_DEGRADATION_CRITICAL && d.firmwareVersion === d.targetFirmwareVersion).length,
  };
}

export function hardwareFleetStatus(): string {
  return `Donanım Filosu: SoC + şarj döngüsü + firmware drift + membran aşınması • OTA Canary→Akademi kademeli rollout`;
}

