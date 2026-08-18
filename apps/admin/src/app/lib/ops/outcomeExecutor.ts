// ============================================================================
// ⚡ OUTCOME-DRIVEN CEO KOMUT İCRASI (SuperCool Felsefesi)
// Patronun tek cümlelik talimatı ("Şu müşteriye rezervasyon aç ve personeli
// görevlendir") ayrıştırılır ve TEK AKIŞTA:
//   1. bookingWriter        → rezervasyon kaydı (parcels/sports_facilities)
//   2. dazeHubEventBus      → personel görevi (STAFF_TASK_DISPATCHED) + mutfak fişi (ORDER_PLACED)
//   3. notificationEngine   → PWA bildirimi (rezervasyon + mutfak hazır)
// zinciri çalıştırılır. Plan Z: herhangi bir halka çökse bile akış raporlanır.
// ============================================================================

import { persistBooking, type BookingConfirmation } from './bookingWriter';
import { orderPlaced, staffTaskDispatched, kitchenTimerTick, dazeReminderTriggered } from './dazeHubEventBus';
import { reservationPush, kitchenReadyPush, type PushNotification } from '../pwa/notificationEngine';

export interface OutcomeStep {
  step: string;
  status: 'ok' | 'skipped' | 'failed';
  detail: string;
}

export interface OutcomeExecution {
  ok: boolean;
  intent: 'rezervasyon+personel' | 'rezervasyon' | 'personel' | 'mutfak' | 'bilinmeyen';
  steps: OutcomeStep[];
  references: { booking?: string; orderId?: string; taskId?: string; notification?: string };
  message: string;
}

// ── AYRIŞTIRMA ──────────────────────────────────────────────────────────────
export interface ParsedOutcome {
  hasBooking: boolean;
  hasStaff: boolean;
  hasKitchen: boolean;
  customer: string;
  staff: string;
  item: string;
  resource: string | null;
  amount: number;
}

const TR_NAME = /([A-ZÇĞİÖŞÜ][a-zçğıöşüü]+(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşüü]+)?)/;

export function parseOutcomeCommand(raw: string): ParsedOutcome {
  const text = raw.toLowerCase();
  const nameMatch = raw.match(TR_NAME);

  const resource = (['karavan', 'glamping', 'tenis', 'basketbol', 'futbol', 'parsel', 'saha', 'restoran', 'rezervasyon'] as const)
    .find((r) => text.includes(r)) ?? null;

  const amountMatch = text.match(/(\d+)\s*(tl|₺|lira|kişi|kişilik|kisi)/);
  const amount = amountMatch ? Number(amountMatch[1]) : 240;

  return {
    hasBooking: /rezervasyon|masa|kayıt aç|ayırt|yatır|book|reserve|onayla/.test(text),
    hasStaff: /görevlendir|personel|görev ver|görevlendirme|servise ver|personeli/.test(text),
    hasKitchen: /mutfak|sipariş|fiş|chef|hazırla|yemek/.test(text),
    customer: nameMatch ? nameMatch[1] : 'Misafir',
    staff: /([A-ZÇĞİÖŞÜ][a-zçğıöşüü]+)\s*(?:görevlendir|personel)/.test(raw)
      ? (raw.match(/([A-ZÇĞİÖŞÜ][a-zçğıöşüü]+)\s*(?:görevlendir|personel)/)?.[1] ?? 'Murat')
      : 'Murat (Servis)',
    item: /((?:akdeniz|levrek|köfte|izgara|salata|pizza|makarna|çorba|menemen|kebap|balık|tavuk)[a-zçğıöşüü ]*)/i.exec(raw)?.[1]?.trim() ?? 'Günün Menüsü',
    resource,
    amount,
  };
}

export function detectOutcomeCommand(raw: string): boolean {
  const p = parseOutcomeCommand(raw);
  return p.hasBooking || p.hasStaff || p.hasKitchen;
}

// ── ORKESTRATÖR ─────────────────────────────────────────────────────────────
export async function executeOutcomeCommand(raw: string): Promise<OutcomeExecution> {
  const parsed = parseOutcomeCommand(raw);
  const steps: OutcomeStep[] = [];
  const references: OutcomeExecution['references'] = {};

  const intent: OutcomeExecution['intent'] =
    parsed.hasBooking && parsed.hasStaff ? 'rezervasyon+personel'
    : parsed.hasBooking ? 'rezervasyon'
    : parsed.hasStaff ? 'personel'
    : parsed.hasKitchen ? 'mutfak'
    : 'bilinmeyen';

  // 1) REZERVASYON KAYDI (bookingWriter → parcels/sports_facilities)
  if (parsed.hasBooking) {
    try {
      const booking: BookingConfirmation = await persistBooking(raw);
      references.booking = booking.referenceCode || '—';
      steps.push({
        step: 'Rezervasyon kaydı',
        status: booking.ok ? 'ok' : 'failed',
        detail: `${booking.referenceCode || 'kod yok'} • ${booking.table} • ${booking.guests} kişi (${booking.simulated ? 'mock' : 'canlı'})`,
      });

      // 2) EVENT BUS: sipariş fişi + mutfak sayacı
      const orderId = `O-${Date.now().toString(36).slice(-4).toUpperCase()}`;
      references.orderId = orderId;
      orderPlaced(orderId, parsed.item || (booking.resource ?? 'Saha'), parsed.amount);
      kitchenTimerTick(orderId, 120);
      steps.push({ step: 'Mutfak fişi + 120s sayaç', status: 'ok', detail: `${orderId} • ${parsed.item}` });

      // 3) EVENT BUS: personel görevi
      if (parsed.hasStaff) {
        const taskId = `T-${Date.now().toString(36).slice(-4).toUpperCase()}`;
        references.taskId = taskId;
        staffTaskDispatched(taskId, parsed.staff, Math.round(parsed.amount * 0.1), 10);
        steps.push({ step: 'Personel görevlendirme', status: 'ok', detail: `${taskId} • ${parsed.staff} • ₺${Math.round(parsed.amount * 0.1)} • 10 puan` });
      }

      // 4) BİLDİRİM ZİNCİRİ (PWA)
      const notif: PushNotification = await reservationPush(booking.referenceCode || orderId);
      references.notification = notif.title;
      steps.push({ step: 'PWA bildirimi', status: 'ok', detail: notif.title });
      void kitchenReadyPush(parsed.item);
    } catch (err) {
      steps.push({ step: 'Rezervasyon kaydı', status: 'failed', detail: (err as Error).message });
    }
  }

  // SADECE PERSONEL KOMUTU
  if (!parsed.hasBooking && parsed.hasStaff) {
    const taskId = `T-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    references.taskId = taskId;
    staffTaskDispatched(taskId, parsed.staff, 35, 10);
    steps.push({ step: 'Personel görevlendirme', status: 'ok', detail: `${taskId} • ${parsed.staff} • ₺35 • 10 puan` });
  }

  // SADECE MUTFAK KOMUTU
  if (!parsed.hasBooking && parsed.hasKitchen) {
    const orderId = `O-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    references.orderId = orderId;
    orderPlaced(orderId, parsed.item, parsed.amount);
    kitchenTimerTick(orderId, 120);
    dazeReminderTriggered(orderId, 0, false);
    steps.push({ step: 'Mutfak fişi + sayaç', status: 'ok', detail: `${orderId} • ${parsed.item} • 120s` });
  }

  const ok = steps.some((s) => s.status === 'ok') && steps.every((s) => s.status !== 'failed');
  return {
    ok,
    intent,
    steps,
    references,
    message: ok
      ? `⚡ Outcome zinciri tamamlandı (${steps.length} halka) — müşteriye ve personele bilgi iletildi.`
      : '⚠️ Outcome zinciri kısmen tamamlandı — hatalı halkaları kontrol edin.',
  };
}

export function outcomeExecutorStatus(): string {
  return 'Outcome-Driven İcra Motoru [bookingWriter → dazeHubEventBus → notificationEngine]';
}

