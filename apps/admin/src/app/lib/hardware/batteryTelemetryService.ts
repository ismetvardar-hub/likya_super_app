// ============================================================================
// 🔋 BLE PİL TELEMETRİ SERVİSİ (Adım 21)
// Standart Battery Service (0x180F) + Battery Level (0x2A19) okuyucu.
// Düşük pil uyarısı (< %15) + güç durumu rozetleri.
// ============================================================================

export const BATTERY_SERVICE_UUID = 0x180f;
export const BATTERY_LEVEL_UUID = 0x2a19;
export const LOW_BATTERY_THRESHOLD = 15;

export type PowerStatus = 'critical' | 'low' | 'normal' | 'charging';

export interface BatteryState {
  percent: number;
  status: PowerStatus;
  badge: string;
  emoji: string;
}

// ---------------------------------------------------------------------------
// 1. Pil Değeri Parse (0x2A19: tek byte 0-100)
// ---------------------------------------------------------------------------
export function parseBatteryLevel(view: DataView, offset = 0): number {
  const raw = view.getUint8(offset);
  return Math.max(0, Math.min(100, raw));
}

// ---------------------------------------------------------------------------
// 2. Güç Durumu Sınıflandırıcı
// ---------------------------------------------------------------------------
export function classifyPower(percent: number, charging = false): PowerStatus {
  if (charging) return 'charging';
  if (percent <= 5) return 'critical';
  if (percent < LOW_BATTERY_THRESHOLD) return 'low';
  return 'normal';
}

export function powerBadge(percent: number, charging = false): BatteryState {
  const status = classifyPower(percent, charging);
  const badge: Record<PowerStatus, string> = {
    critical: '🔴 Kritik Pil',
    low: '🟡 Düşük Pil',
    normal: '🟢 Pil İyi',
    charging: '⚡ Şarj Oluyor',
  };
  const emoji: Record<PowerStatus, string> = {
    critical: '🪫',
    low: '🔋',
    normal: '🔋',
    charging: '⚡',
  };
  return { percent, status, badge: badge[status], emoji: emoji[status] };
}

// ---------------------------------------------------------------------------
// 3. Tarayıcı Okuyucu (Web Bluetooth)
// ---------------------------------------------------------------------------
export async function readBatteryLevel(server: any): Promise<number | null> {
  try {
    const service = await server.getPrimaryService(BATTERY_SERVICE_UUID);
    const char = await service.getCharacteristic(BATTERY_LEVEL_UUID);
    const value = await char.readValue();
    return parseBatteryLevel(value);
  } catch {
    return null; // cihaz pil servisi sunmuyor
  }
}

export function batteryTelemetryStatus(percent: number | null, charging = false): string {
  if (percent === null) return 'Pil servisi yok (0x180F)';
  const b = powerBadge(percent, charging);
  return `${b.emoji} %${percent} — ${b.badge}${b.status === 'low' || b.status === 'critical' ? ` (eşik <%${LOW_BATTERY_THRESHOLD})` : ''}`;
}
