// ============================================================================
// 🧲 KORT TABLET BLE EŞLEŞTİRME & KALİBRASYON MOTORU (Adım 102)
// Sahada yönlendirmeli donanım kurulum sihirbazı: sol/sağ tabanlık + HRM,
// RSSI ölçer, pil voltaj göstergesi ve 5 sn baseline zero-kalibrasyonu.
// Bonded cihazlar tablet localStorage'a otomatik kaydedilir (1 dokunuşla
// anında yeniden bağlanma). Saf/deterministik — tarayıcıdaki BLE katmanı
// bu motoru besler; smoke testleri motoru doğrudan doğrular.
// ============================================================================

export type FieldDeviceKind = 'insole_left' | 'insole_right' | 'hrm';

export interface BatteryRange {
  minVolt: number;
  maxVolt: number;
}

export interface FieldDeviceProfile {
  kind: FieldDeviceKind;
  label: string;
  serviceUuid: string;
  charUuids: string[];
  namePatterns: string[];
  batteryRange: BatteryRange;
  lowBatteryVolt: number;
}

// ── Cihaz profilleri: sol/sağ tabanlık (ExtremeS) + Decathlon HRM ─────────────
export const FIELD_DEVICE_PROFILES: FieldDeviceProfile[] = [
  {
    kind: 'insole_left',
    label: 'Insole Sol (ExtremeS)',
    serviceUuid: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
    charUuids: ['beb5483e-36e1-4688-b7f5-ea07361b26a8', '00002a19-0000-1000-8000-00805f9b34fb'],
    namePatterns: ['ES-INS-LEFT', 'EXTREMES LEFT', 'INSOLE L', 'SOL TABAN'],
    batteryRange: { minVolt: 3.0, maxVolt: 4.2 },
    lowBatteryVolt: 3.4,
  },
  {
    kind: 'insole_right',
    label: 'Insole Sağ (ExtremeS)',
    serviceUuid: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
    charUuids: ['beb5483e-36e1-4688-b7f5-ea07361b26a8', '00002a19-0000-1000-8000-00805f9b34fb'],
    namePatterns: ['ES-INS-RIGHT', 'EXTREMES RIGHT', 'INSOLE R', 'SAG TABAN'],
    batteryRange: { minVolt: 3.0, maxVolt: 4.2 },
    lowBatteryVolt: 3.4,
  },
  {
    kind: 'hrm',
    label: 'Decathlon HRM',
    serviceUuid: '0000180d-0000-1000-8000-00805f9b34fb',
    charUuids: ['00002a37-0000-1000-8000-00805f9b34fb', '00002a19-0000-1000-8000-00805f9b34fb'],
    namePatterns: ['DECATHLON', 'GEONAUTE', 'HRM-', 'KALP HIZI'],
    batteryRange: { minVolt: 3.0, maxVolt: 4.2 },
    lowBatteryVolt: 3.5,
  },
];

export function fieldDeviceProfile(kind: FieldDeviceKind): FieldDeviceProfile {
  const found = FIELD_DEVICE_PROFILES.find((p) => p.kind === kind);
  if (!found) throw new Error(`Bilinmeyen saha cihazı: ${kind}`);
  return found;
}

// ── RSSI ölçer (dBm → kalite + 4 bar) ────────────────────────────────────────
export type RssiQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WEAK';

export const RSSI_THRESHOLDS = { excellent: -55, good: -70, fair: -80 } as const;
export const RSSI_BARS = 4;

export function rssiQuality(rssi: number): RssiQuality {
  if (rssi >= RSSI_THRESHOLDS.excellent) return 'EXCELLENT';
  if (rssi >= RSSI_THRESHOLDS.good) return 'GOOD';
  if (rssi >= RSSI_THRESHOLDS.fair) return 'FAIR';
  return 'WEAK';
}

export function rssiMeterLevel(rssi: number): number {
  const q = rssiQuality(rssi);
  return q === 'EXCELLENT' ? 1 : q === 'GOOD' ? 0.75 : q === 'FAIR' ? 0.5 : 0.25;
}

export function rssiBars(rssi: number): number {
  const level = rssiMeterLevel(rssi);
  return Math.max(1, Math.min(RSSI_BARS, Math.round(level * RSSI_BARS)));
}

// ── Pil voltaj göstergesi (LiPo 3.0–4.2V → %0–%100) ───────────────────────────
export function batteryVoltageGauge(voltage: number, range?: BatteryRange): number {
  const r = range ?? { minVolt: 3.0, maxVolt: 4.2 };
  const span = r.maxVolt - r.minVolt;
  const pct = span <= 0 ? 0 : ((voltage - r.minVolt) / span) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export type BatteryHealth = 'good' | 'low' | 'critical';

export function batteryHealth(voltage: number, lowBatteryVolt = 3.4): BatteryHealth {
  if (voltage <= 3.2) return 'critical';
  if (voltage <= lowBatteryVolt) return 'low';
  return 'good';
}

// ── Bonded cihazlar (tablet localStorage: 1 dokunuşla anında bağlanma) ───────
export const BONDED_DEVICES_KEY = 'likya_bonded_devices';

export interface BondedDevice {
  kind: FieldDeviceKind;
  label: string;
  deviceId: string;
  rssi: number;
  voltage: number;
  bondedAt: string;
}

export function bondDevice(kind: FieldDeviceKind, deviceId: string, opts: { rssi?: number; voltage?: number; bondedAt?: string } = {}): BondedDevice {
  const profile = fieldDeviceProfile(kind);
  return {
    kind,
    label: profile.label,
    deviceId,
    rssi: opts.rssi ?? -60,
    voltage: opts.voltage ?? profile.batteryRange.maxVolt,
    bondedAt: opts.bondedAt ?? new Date().toISOString(),
  };
}

export function serializeBondedDevices(devices: BondedDevice[]): string {
  return JSON.stringify(devices);
}

export function parseBondedDevices(json: string | null | undefined): BondedDevice[] {
  try {
    const arr = JSON.parse(json ?? '[]');
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (d): d is BondedDevice =>
        !!d && typeof d === 'object' && typeof d.kind === 'string' && typeof d.deviceId === 'string',
    );
  } catch {
    return [];
  }
}

export function upsertBondedDevice(list: BondedDevice[], device: BondedDevice): BondedDevice[] {
  const without = list.filter((d) => d.kind !== device.kind);
  return [...without, device];
}

// ── 5 sn baseline zero-kalibrasyonu (100Hz × 500 örnek) ──────────────────────
export const BASELINE_CALIBRATION_MS = 5000;
export const BASELINE_CALIBRATION_SAMPLE_RATE_HZ = 100;
export const BASELINE_CALIBRATION_SAMPLES = (BASELINE_CALIBRATION_MS / 1000) * BASELINE_CALIBRATION_SAMPLE_RATE_HZ;

export interface CalibrationResult {
  offset: number;
  mean: number;
  min: number;
  max: number;
  cv: number;
  stable: boolean;
  samples: number;
  note: string;
}

export function computeBaselineZero(samples: number[], nominalMs = BASELINE_CALIBRATION_MS): CalibrationResult {
  void nominalMs; // süre sadece dokümantasyon amaçlı (örnek sayısı süreyi belirler)
  const n = samples.length;
  const sum = samples.reduce((a, b) => a + b, 0);
  const mean = n ? sum / n : 0;
  const min = n ? Math.min(...samples) : 0;
  const max = n ? Math.max(...samples) : 0;
  const variance = n ? samples.reduce((a, b) => a + (b - mean) ** 2, 0) / n : 0;
  const std = Math.sqrt(variance);
  const cv = mean !== 0 ? (std / mean) * 100 : 0;
  // Zero-baseline kalibrasyonda ortalama ~0 olduğundan CV anlamsız;
  // mutlak standart sapma kullanılır (0.1 birim eşik = gürültüsüz bazal).
  const stable = n >= BASELINE_CALIBRATION_SAMPLES && std < 0.1;
  return {
    offset: Math.round(mean),
    mean: Math.round(mean * 100) / 100,
    min,
    max,
    cv: Math.round(cv * 100) / 100,
    stable,
    samples: n,
    note: stable
      ? 'Stabil — sıfır ofset güvenli, seans başlayabilir'
      : 'Değişken — sporcu sabit dursun, kalibrasyonu tekrarlayın',
  };
}

export function isBaselineStable(result: CalibrationResult): boolean {
  return result.stable && result.samples >= BASELINE_CALIBRATION_SAMPLES;
}

export function fieldPairingStatus(): string {
  return `Saha Eşleştirme: ${FIELD_DEVICE_PROFILES.length} cihaz (Sol/Sağ/HRM) • RSSI ${RSSI_BARS} bar • 5sn baseline`;
}
