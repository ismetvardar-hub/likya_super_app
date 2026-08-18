// ============================================================================
// 🔔 DAZE-REMINDER ENGINE (17. Modül) — Gerçek İletişim Hikayesi
// Mutfak 120s sayacı bittiğinde müşteriye WhatsApp/Push tetikleyicisi atar.
// 2 dakika aşımında termal koruma bayrağı + otomatik Daze-Gift ikram kuponu.
// Graceful: WhatsApp API anahtarı yoksa push + sandbox log (asla çökme).
// ============================================================================

import { dazeReminderTriggered, emit, type DazeEvent } from './dazeHubEventBus';
import { dispatchPush } from '../pwa/notificationEngine';
import { insertLiveRow } from '../db/supabaseClient';

export interface DazeGiftCoupon {
  code: string;
  orderId: string;
  reason: 'termal-koruma' | 'olagan';
  discount: number; // TL
  issuedAt: string;
  used: boolean;
}

const LS_COUPONS = 'likya_daze_gift_coupons_v1';

function loadCoupons(): DazeGiftCoupon[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(window.localStorage.getItem(LS_COUPONS) ?? '[]') as DazeGiftCoupon[]; } catch { return []; }
}
function saveCoupons(c: DazeGiftCoupon[]): void {
  try { if (typeof window !== 'undefined') window.localStorage.setItem(LS_COUPONS, JSON.stringify(c.slice(-20))); } catch { /* ignore */ }
}

export function issueDazeGiftCoupon(orderId: string, reason: 'termal-koruma' | 'olagan' = 'termal-koruma'): DazeGiftCoupon {
  const coupon: DazeGiftCoupon = {
    code: `DG-${Date.now().toString(36).toUpperCase().slice(-4)}-${orderId.replace('O-', '')}`,
    orderId,
    reason,
    discount: reason === 'termal-koruma' ? 50 : 25,
    issuedAt: new Date().toISOString(),
    used: false,
  };
  saveCoupons([coupon, ...loadCoupons()]);

  // Canlı DB'ye yazmayı dene (coupons tablosu) — env yoksa localStorage fallback
  void insertLiveRow('coupons', {
    code: coupon.code,
    discount: coupon.discount,
    valid_until: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    created_at: coupon.issuedAt,
  }).catch(() => undefined);

  return coupon;
}

export function redeemDazeGiftCoupon(code: string): DazeGiftCoupon | null {
  const coupons = loadCoupons();
  const idx = coupons.findIndex((c) => c.code === code && !c.used);
  if (idx === -1) return null;
  coupons[idx] = { ...coupons[idx], used: true };
  saveCoupons(coupons);
  return coupons[idx];
}

/** 120s sayacı bitti → müşteriye WhatsApp (varsa) + Push bildirimi. */
export async function triggerDazeReminder(orderId: string, item: string, customerPhone?: string): Promise<{ channel: string; detail: string }> {
  // 1) Event Bus'a olayı işle
  dazeReminderTriggered(orderId, 0, false);

  // 2) WhatsApp — WHATSAPP_API_TOKEN varsa gerçek çağrı, yoksa sandbox log
  const waToken = process.env.WHATSAPP_API_TOKEN;
  let channel = 'push';
  let detail = '';
  if (waToken && customerPhone) {
    try {
      const res = await fetch('https://graph.facebook.com/v19.0/me/messages', {
        method: 'POST',
        headers: { Authorization: `Bearer ${waToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: customerPhone,
          type: 'text',
          text: { body: `🟢 ${item} hazır! ${orderId} — Likya Daze ekibi sizi bekliyor.` },
        }),
      });
      if (res.ok) { channel = 'whatsapp'; detail = `WhatsApp iletildi (${customerPhone})`; }
      else { channel = 'push'; detail = 'WhatsApp çağrısı reddedildi → PWA push hattına düşüldü'; }
    } catch {
      channel = 'push'; detail = 'WhatsApp erişilemedi → PWA push (Plan Z)';
    }
  } else {
    detail = customerPhone ? 'WhatsApp anahtarı yok → sandbox log + PWA push' : 'WhatsApp anahtarı/müşteri numarası yok → PWA push';
  }

  // 3) PWA push (her durumda)
  await dispatchPush('mutfak-hazir', `🍽️ ${item} hazır!`, `${orderId} — Daze-Reminder müşteriye ulaştırıldı.`);

  return { channel, detail };
}

/** 2 dakika aşımı → termal koruma bayrağı + otomatik Daze-Gift ikram kuponu. */
export function handleDazeOverdue(orderId: string): { coupon: DazeGiftCoupon; event: DazeEvent } {
  dazeReminderTriggered(orderId, 2, true); // thermalGuard = true
  const coupon = issueDazeGiftCoupon(orderId, 'termal-koruma');
  const event = emit('DAZE_REMINDER_TRIGGERED', {
    orderId, overdueMin: 2, thermalGuard: true, source: 'daze-reminder', giftCoupon: coupon.code,
  });
  return { coupon, event };
}

/** Demo: 120s sonra reminder, +120s sonra termal koruma simülasyonu. */
export function scheduleDazeReminderDemo(orderId: string, item: string, customerPhone?: string): { timer: ReturnType<typeof setTimeout>; giftTimer: ReturnType<typeof setTimeout> } {
  const timer = setTimeout(() => { void triggerDazeReminder(orderId, item, customerPhone); }, 120_000);
  const giftTimer = setTimeout(() => { handleDazeOverdue(orderId); }, 240_000);
  return { timer, giftTimer };
}

export function dazeReminderEngineStatus(): string {
  return `Daze-Reminder Motoru [120s tetikleyici • termal koruma ${loadCoupons().length} Daze-Gift kuponu]`;
}
