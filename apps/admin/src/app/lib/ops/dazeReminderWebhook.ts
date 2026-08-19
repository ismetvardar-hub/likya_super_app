// ============================================================================
// 🔔 AŞAMA 11 — DAZE-REMINDER WHATSAPP WEBHOOK KÖPRÜSÜ
// Sipariş hazır olduğunda WhatsApp Cloud API veya Chatwoot üzerinden müşteriye
// otomatik çağrı; 2 dk sonra termal koruma bayrağını kaldırır (DAZE_REMINDER).
// Anahtar yoksa PWA push + sandbox log (asla çökme — Plan Z).
// ============================================================================

import { triggerDazeReminder, handleDazeOverdue, issueDazeGiftCoupon } from './dazeReminderEngine';

export interface ReminderWebhookRequest {
  orderId: string;
  item: string;
  customerPhone?: string;
  channel: 'whatsapp' | 'chatwoot' | 'push';
}

export interface ReminderWebhookResponse {
  ok: boolean;
  orderId: string;
  channel: string;
  deliveredVia: string;
  thermalGuardClearedAt: string | null;
  giftCoupon?: string;
  message: string;
}

/** Sipariş hazır → müşteriye iletişim kanalı üzerinden bildirim. */
export async function handleReadyReminderWebhook(req: ReminderWebhookRequest): Promise<ReminderWebhookResponse> {
  const result = await triggerDazeReminder(req.orderId, req.item, req.customerPhone);

  // 2 dk sonra termal koruma bayrağını kaldır + gecikme ikram kuponu
  let thermalGuardClearedAt: string | null = null;
  let giftCoupon: string | undefined;
  if (req.channel === 'whatsapp' && req.customerPhone) {
    setTimeout(() => {
      const overdue = handleDazeOverdue(req.orderId);
      thermalGuardClearedAt = overdue.event.timestamp;
      giftCoupon = overdue.coupon.code;
    }, 120_000);
  }

  return {
    ok: true,
    orderId: req.orderId,
    channel: req.channel,
    deliveredVia: result.channel === 'whatsapp' ? 'WhatsApp Cloud API' : result.channel === 'push' ? 'PWA Push (fallback)' : 'Chatwoot',
    thermalGuardClearedAt,
    giftCoupon,
    message: `${req.item} hazır — ${result.detail}`,
  };
}

export function dazeReminderWebhookStatus(): string {
  return 'Daze-Reminder Webhook [WhatsApp/Cloud • Chatwoot • PWA push • 2dk termal koruma + Daze-Gift]';
}
