// ============================================================================
// 📲 PWA PUSH BİLDİRİM & OFFLINE MOTORU (Faz 3)
// Service Worker üzerinden yeni rezervasyon, kritik tesis arızası ve mutfak
// geri sayımı bittiğinde tarayıcı/mobil push bildirimi tetikler. Notification
// API + postMessage köprüsü + localStorage kuyruk. Deterministik; Plan Z.
// ============================================================================

export type NotificationKind = 'rezervasyon' | 'kritik-ariza' | 'mutfak-hazir' | 'genel';

export interface PushNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  tag?: string;
  timestamp: string;
}

// Tarayıcı bildirim izni kontrolü
export async function ensureNotificationPermission(): Promise<'granted' | 'denied' | 'default'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}

// Service Worker'a push mesajı gönder (kayıtlı sw varsa)
export async function notifyServiceWorker(payload: PushNotification): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return false;
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({ type: 'LIKYA_PUSH', payload });
    return true;
  } catch {
    return false;
  }
}

// Tarayıcı yerel bildirimi (Notification API)
export function showBrowserNotification(n: PushNotification): boolean {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission !== 'granted') return false;
    new Notification(n.title, { body: n.body, tag: n.tag ?? n.kind });
    return true;
  } catch {
    return false;
  }
}

// Bildirim oluştur + izin varsa göster + kuyruğa al
export async function dispatchPush(kind: NotificationKind, title: string, body: string): Promise<PushNotification> {
  const notification: PushNotification = {
    id: `push_${Date.now().toString(36)}`,
    kind,
    title,
    body,
    timestamp: new Date().toISOString(),
  };

  // Kuyruk (offline → çevrimiçi senkron için)
  try {
    if (typeof window !== 'undefined') {
      const key = 'likya_push_queue_v1';
      const raw = window.localStorage.getItem(key);
      const list = raw ? (JSON.parse(raw) as unknown[]) : [];
      window.localStorage.setItem(key, JSON.stringify([...list.slice(-19), notification]));
    }
  } catch { /* ignore */ }

  const granted = await ensureNotificationPermission();
  if (granted === 'granted') {
    showBrowserNotification(notification);
    await notifyServiceWorker(notification);
  }
  return notification;
}

// Hazır tetikleyiciler
export function reservationPush(ref: string): Promise<PushNotification> {
  return dispatchPush('rezervasyon', '🏨 Yeni Rezervasyon', `Rezervasyon ${ref} oluşturuldu — onay için Daze-Reminder aktif.`);
}

export function criticalFacilityPush(zone: string): Promise<PushNotification> {
  return dispatchPush('kritik-ariza', '⚠️ Kritik Tesis Arızası', `${zone} bölgesinde kritik arıza — Sentinel bakım bileti açıldı.`);
}

export function kitchenReadyPush(item: string): Promise<PushNotification> {
  return dispatchPush('mutfak-hazir', '🍜 Mutfak Hazır!', `${item} siparişiniz hazır — 120s sayacı tamamlandı.`);
}

export function notificationEngineStatus(): string {
  return `PWA Bildirim [4 tür • Notification API + SW postMessage + offline kuyruk]`;
}
