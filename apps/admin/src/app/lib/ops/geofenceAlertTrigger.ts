// ============================================================================
// 🛡️ GEOFENCE VELİ ALARM TETİKLEYİCİ (Adım 06)
// dazeHubEventBus üzerinden GEOFENCE_EXIT / GEOFENCE_ENTER olaylarını dinler,
// veli için anlık sade dil bildirimi + WhatsApp deep-link payload üretir.
// /parent görünümünde simülasyon testi tetiklenebilir.
// ============================================================================

import { subscribe, emit, type DazeEvent } from './dazeHubEventBus';
import { SHARE_TEMPLATES } from './communicationSuite';

export interface ParentAlertPayload {
  childId: string;
  zone: string;
  event: 'EXIT' | 'ENTER';
  time: string;
  message: string;         // sade dil bildirimi
  whatsappUrl: string;     // deep-link payload
  urgent: boolean;
}

let lastPayload: ParentAlertPayload | null = null;

function nowTime(): string {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export function buildParentAlert(childId: string, zone: string, event: 'EXIT' | 'ENTER'): ParentAlertPayload {
  const time = nowTime();
  const message = event === 'EXIT'
    ? `🛡️ Güvenlik Bildirimi: Sporcunuz ${zone} alanından ayrıldı (Saat: ${time}).`
    : `✅ Güvenlik Bildirimi: Sporcunuz ${zone} alanına döndü (Saat: ${time}).`;
  return {
    childId,
    zone,
    event,
    time,
    message,
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(SHARE_TEMPLATES.safety(childId, event === 'EXIT' ? `${zone} alanından ayrıldı (${time})` : `${zone} alanına döndü (${time})`))}`,
    urgent: event === 'EXIT',
  };
}

// ---------------------------------------------------------------------------
// 1. Otomatik Event Bus dinleyicisi — GEOFENCE_EXIT/ENTER
// ---------------------------------------------------------------------------
let subscribed = false;

export function subscribeGeofenceAlerts(onAlert: (p: ParentAlertPayload) => void): () => void {
  const unsub1 = subscribe('GEOFENCE_EXIT', (e: DazeEvent) => {
    const p = buildParentAlert(String(e.payload.childId ?? 'Sporcu'), String(e.payload.zone ?? 'Güvenli'), 'EXIT');
    lastPayload = p;
    onAlert(p);
  });
  const unsub2 = subscribe('GEOFENCE_ENTER', (e: DazeEvent) => {
    const p = buildParentAlert(String(e.payload.childId ?? 'Sporcu'), String(e.payload.zone ?? 'Güvenli'), 'ENTER');
    lastPayload = p;
    onAlert(p);
  });
  subscribed = true;
  return () => { unsub1(); unsub2(); subscribed = false; };
}

// ---------------------------------------------------------------------------
// 2. Test / Simülasyon Tetikleyicisi (/parent görünümünde)
// ---------------------------------------------------------------------------
export function simulateGeofenceEvent(childId: string, zone: string, event: 'EXIT' | 'ENTER'): ParentAlertPayload {
  const p = buildParentAlert(childId, zone, event);
  lastPayload = p;
  emit(event === 'EXIT' ? 'GEOFENCE_EXIT' : 'GEOFENCE_ENTER', { childId, zone });
  return p;
}

export function getLastGeofenceAlert(): ParentAlertPayload | null {
  return lastPayload;
}

export function geofenceAlertStatus(): string {
  return `Geofence Veli Alarmı: dinleyici ${subscribed ? 'aktif' : 'beklemede'} • son: ${lastPayload ? `${lastPayload.event} ${lastPayload.zone}` : 'yok'}`;
}
