// ============================================================================
// 🔔 BİLDİRİM MERKEZİ (Adım 04-05) — in-app kuyruk + Web Push kaydı
// - In-app: Alerts/Badges/Milestones kuyruğu (dazeHubEventBus olaylarından)
// - Web Push: service worker kaydı + push subscribe (VAPID public key)
// - Milestone üretimi: adım 61/71'deki gamification ile beslenecek
// ============================================================================

export type NotificationKind = 'alert' | 'badge' | 'milestone' | 'info';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  detail: string;
  emoji: string;
  at: string;
  read: boolean;
}

let queue: AppNotification[] = [];
let seq = 1;

function now(): string {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ---------------------------------------------------------------------------
// 1. In-app Bildirim Kuyruğu
// ---------------------------------------------------------------------------
export function pushNotification(kind: NotificationKind, title: string, detail: string, emoji: string): AppNotification {
  const n: AppNotification = { id: `NTF-${String(seq++).padStart(3, '0')}`, kind, title, detail, emoji, at: now(), read: false };
  queue.unshift(n);
  if (queue.length > 20) queue.pop();
  return n;
}

export function getNotifications(): AppNotification[] {
  return [...queue];
}

export function markRead(id: string): void {
  const n = queue.find((x) => x.id === id);
  if (n) n.read = true;
}

export function clearNotifications(): void {
  queue = [];
}

export function unreadCount(): number {
  return queue.filter((n) => !n.read).length;
}

// ---------------------------------------------------------------------------
// 2. Web Push — service worker kaydı + abonelik
// ---------------------------------------------------------------------------
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch {
    return null;
  }
}

export async function subscribeToPush(vapidPublicKey?: string): Promise<{ ok: boolean; subscribed: boolean; message: string }> {
  const reg = await registerServiceWorker();
  if (!reg) return { ok: false, subscribed: false, message: 'Service Worker desteklenmiyor (https gerekli)' };
  try {
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      if (!vapidPublicKey) {
        // Demo modu: gerçek VAPID yok — VAPID key env'den gelir
        const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';
        if (!key) return { ok: true, subscribed: false, message: 'VAPID anahtarı tanımlı değil — push hazır (key eklendiğinde aktif olur)' };
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      }
    }
    return { ok: true, subscribed: true, message: sub ? '✅ Push bildirimleri aktif' : 'Push aboneliği bekleniyor' };
  } catch (e) {
    return { ok: false, subscribed: false, message: `Push hatası: ${(e as Error).message.slice(0, 50)}` };
  }
}

// ---------------------------------------------------------------------------
// 3. Milestone/Badge yardımcıları
// ---------------------------------------------------------------------------
export function milestoneNotification(athlete: string, badge: string): AppNotification {
  return pushNotification('milestone', `🏅 Yeni Başarı: ${badge}`, `${athlete} bu seviyeyi hak etti!`, '🎉');
}

export function notificationCenterStatus(): string {
  return `Bildirim Merkezi: ${queue.length} bildirim • ${unreadCount()} okunmamış • push ${'serviceWorker' in (typeof navigator !== 'undefined' ? navigator : {}) ? 'hazır' : 'yok'}`;
}
