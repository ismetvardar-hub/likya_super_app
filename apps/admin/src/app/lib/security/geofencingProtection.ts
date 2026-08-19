// ============================================================================
// 🛡️ GEOFENCING ALAN GÜVENLİĞİ & ÇOCUK KORUMA KALKANI
// - Tesis güvenli bölgeleri (Kortlar, Kafe, Park) — BLE/beacon bazlı konum
// - Güvenli alan dışı çıkış (Otopark / Dış Kapı BLE taraması) anlık tespiti
// - Resepsiyon + veli ExtremeS ekranına acil uyarı (GEOFENCE_ALERT)
// - Mock-first: BLE altyapısı yoksa deterministik konum simülasyonu
// ============================================================================

export type SafeZone = 'Kortlar' | 'Kafe' | 'Park' | 'Havuz';
export type ExitPoint = 'Otopark' | 'Dış Kapı' | 'Servis Durağı';

export interface SafeArea {
  id: string;
  zone: SafeZone;
  bleBeaconId: string;
  perimeterM: number;
}

export interface GeofenceAlert {
  id: string;
  childId: string;
  zone: SafeZone;
  exitPoint: ExitPoint;
  severity: 'DANGER' | 'WARNING';
  message: string;        // veli + resepsiyon uyarısı
  at: string;
  cleared: boolean;
}

export const SAFE_AREAS: SafeArea[] = [
  { id: 'SA-1', zone: 'Kortlar', bleBeaconId: 'BLE-COURT-1', perimeterM: 120 },
  { id: 'SA-2', zone: 'Kafe', bleBeaconId: 'BLE-CAFE-1', perimeterM: 60 },
  { id: 'SA-3', zone: 'Park', bleBeaconId: 'BLE-PARK-1', perimeterM: 200 },
  { id: 'SA-4', zone: 'Havuz', bleBeaconId: 'BLE-POOL-1', perimeterM: 40 },
];

let alerts: GeofenceAlert[] = [];
let seq = 1;

function now(): string {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ---------------------------------------------------------------------------
// 1. BLE Tarama — sporcu hangi bölgede? Güvenli alan kontrolü
// ---------------------------------------------------------------------------
export function scanChildLocation(childId: string, beaconId: string, exitPoint: ExitPoint | null = null): { safe: boolean; zone?: SafeZone; alert?: GeofenceAlert } {
  const area = SAFE_AREAS.find((a) => a.bleBeaconId === beaconId);
  if (area) return { safe: true, zone: area.zone };

  // Güvenli beacon yok + çıkış noktası tarandı → ALARM
  const alert: GeofenceAlert = {
    id: `GF-${String(seq++).padStart(3, '0')}`,
    childId,
    zone: 'Kortlar',
    exitPoint: exitPoint ?? 'Dış Kapı',
    severity: 'DANGER',
    message: `🚨 GEOFENCE_ALERT: ${childId} güvenli alan Dışında — ${exitPoint ?? 'Dış Kapı'} BLE taramasında algılandı!`,
    at: now(),
    cleared: false,
  };
  alerts.unshift(alert);
  if (alerts.length > 12) alerts.pop();
  return { safe: false, alert };
}

// ---------------------------------------------------------------------------
// 2. Uyarı Temizleme (Resepsiyon aksiyonu)
// ---------------------------------------------------------------------------
export function clearGeofenceAlert(alertId: string): GeofenceAlert | undefined {
  const a = alerts.find((x) => x.id === alertId);
  if (a) { a.cleared = true; a.message += ' ✅ Çocuk güvenli alana geri döndü'; }
  return a ? { ...a } : undefined;
}

export function getGeofenceAlerts(): GeofenceAlert[] {
  return [...alerts];
}

export function geofencingStatus(): string {
  const active = alerts.filter((a) => !a.cleared).length;
  return `Geofencing Kalkan: ${SAFE_AREAS.length} güvenli bölge • ${active} aktif alarm`;
}
