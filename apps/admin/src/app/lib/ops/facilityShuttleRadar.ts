// ============================================================================
// 🚌 CANLI SERVİS & TESİS GÜVENLİK RADARI — Aivisiontech x MobilSporcu
// - Servis aracı anlık GPS simülasyonu (Likya Kampüs rotası) + ETA
// - Tesis içi güvenlik olay günlüğü: pazu bandı turnike geçişleri
//   ("Efe 14:02'de Pazu Bandı ile Ana Turnikeden Giriş Yaptı")
// - Mock-first: gerçek GPS donanımı bağlı değilse deterministik rota simülasyonu
// ============================================================================

import { onTapAccess } from '../hardware/smartArmbandEngine';

export interface GpsPoint { lat: number; lng: number; name: string; }

// Likya Kampüs servis rotası (kampüs merkezine doğru 8 durak)
export const SHUTTLE_ROUTE: GpsPoint[] = [
  { lat: 36.2897, lng: 30.3797, name: 'Lara Merkez' },
  { lat: 36.2836, lng: 30.3852, name: 'Antalya Bulvarı' },
  { lat: 36.2781, lng: 30.3908, name: 'Kampüs Güney Kapısı' },
  { lat: 36.2720, lng: 30.3954, name: 'Kampüs Orta Durak' },
  { lat: 36.2664, lng: 30.3989, name: 'Spor Kompleksi' },
  { lat: 36.2610, lng: 30.4021, name: 'Ana Turnike' },
];

export interface ShuttleStatus {
  vehicleId: string;
  driver: string;
  currentPoint: GpsPoint;
  nextStop: GpsPoint;
  progressPct: number;     // rota üzerindeki ilerleme 0-100
  etaMinutes: number;      // tahmini varış
  passengers: number;
  capacity: number;
}

export interface SecurityEvent {
  id: string;
  time: string;            // "14:02"
  athleteName: string;
  gate: string;
  message: string;         // tam bildirim metni
  bandStatus: string;
}

let shuttleTick = 0;
let securityLog: SecurityEvent[] = [];
let seq = 1;

function timeNow(): string {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

// ---------------------------------------------------------------------------
// 🚌 1. Servis Aracı GPS + ETA — rota üzerinde deterministik ilerleme
// ---------------------------------------------------------------------------
export function getShuttleStatus(): ShuttleStatus {
  const progress = (shuttleTick % 100);
  const segIndex = Math.min(ROUTE.length - 2, Math.floor((progress / 100) * (ROUTE.length - 1)));
  const frac = ((progress / 100) * (ROUTE.length - 1)) - segIndex;
  const a = ROUTE[segIndex];
  const b = ROUTE[segIndex + 1];
  const lat = a.lat + (b.lat - a.lat) * frac;
  const lng = a.lng + (b.lng - a.lng) * frac;

  // ETA: kalan durak sayısı × 4 dk + trafik faktörü
  const remainingStops = ROUTE.length - 1 - segIndex;
  const eta = Math.max(1, Math.round(remainingStops * 4 + (segIndex % 3) * 1.5));

  return {
    vehicleId: 'SRV-07',
    driver: 'Murat Bey',
    currentPoint: { lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)), name: `${a.name} → ${b.name}` },
    nextStop: b,
    progressPct: progress,
    etaMinutes: eta,
    passengers: 9 + (segIndex % 4),
    capacity: 14,
  };
}

export function advanceShuttle(steps = 12): ShuttleStatus {
  shuttleTick += steps;
  if (shuttleTick > 100) shuttleTick = 0;
  return getShuttleStatus();
}

// ---------------------------------------------------------------------------
// 🛡️ 2. Tesis İçi Güvenlik Bildirimi — pazu bandı turnike geçişi
// ---------------------------------------------------------------------------
export function recordGateEntry(athleteName: string, nfcTagId: string, gate = 'Ana Turnike', bandStatus?: string): SecurityEvent {
  const access = onTapAccess(nfcTagId);
  const time = timeNow();
  const evt: SecurityEvent = {
    id: `SEC-${String(seq++).padStart(3, '0')}`,
    time,
    athleteName,
    gate,
    bandStatus: bandStatus ?? access.allowed ? '✅ Bant doğrulandı' : '⛔ Bant RED',
    message: `${athleteName} ${time} itibarıyla Pazu Bandı ile ${gate} üzerinden ${access.allowed ? 'Giriş Yaptı' : 'Girişi REDDEDİLDİ'} (${access.reason.split('—')[0]?.trim() ?? access.reason})`,
  };
  securityLog.unshift(evt);
  if (securityLog.length > 12) securityLog.pop();
  return evt;
}

export function getSecurityLog(): SecurityEvent[] {
  return [...securityLog];
}

const ROUTE: GpsPoint[] = SHUTTLE_ROUTE;

export function facilityShuttleRadarStatus(): string {
  const s = getShuttleStatus();
  return `Servis SRV-07 • ${s.nextStop.name} ETA ${s.etaMinutes} dk • ${securityLog.length} güvenlik olayı`;
}
