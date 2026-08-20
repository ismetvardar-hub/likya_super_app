// ============================================================================
// 🤖 TELEGRAM BOT WEBHOOK ADAPTÖRÜ (Adım 10)
// Acil koç alarmlarını Telegram MarkdownV2 formatına çevirip webhook ile
// dağıtır: Kırmızı-zon sakatlık riski, aşırı HR spike, sert deselerasyon.
// Mock-first: gerçek bot token yoksa payload üretilip konsola/loglanır.
// ============================================================================

export type CoachAlertKind = 'INJURY_RED_ZONE' | 'HR_SPIKE' | 'SEVERE_DECEL' | 'GEOFENCE';

export interface CoachAlert {
  kind: CoachAlertKind;
  athlete: string;
  value: string;
  threshold: string;
  detail: string;
  timestamp: string;
}

export function buildCoachAlert(kind: CoachAlertKind, athlete: string, value: string, threshold: string, detail: string): CoachAlert {
  return { kind, athlete, value, threshold, detail, timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) };
}

// ---------------------------------------------------------------------------
// 1. MarkdownV2 — Telegram özel karakterlerini escape et
// ---------------------------------------------------------------------------
export function tgEscape(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

export function formatTelegramAlert(alert: CoachAlert): string {
  const icon: Record<CoachAlertKind, string> = {
    INJURY_RED_ZONE: '🔴',
    HR_SPIKE: '❤️‍🔥',
    SEVERE_DECEL: '🛑',
    GEOFENCE: '🛡️',
  };
  const lines = [
    `${icon[alert.kind]} *ACİL ANTRENÖR ALARMI*`,
    ``,
    `🏃 Sporcu: ${tgEscape(alert.athlete)}`,
    `📈 Değer: ${tgEscape(alert.value)}`,
    `🎚️ Eşik: ${tgEscape(alert.threshold)}`,
    `📝 Detay: ${tgEscape(alert.detail)}`,
    `🕐 ${tgEscape(alert.timestamp)}`,
    `—`,
    `⚡ *ExtremeS Spor Bilimi*`,
  ];
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// 2. Webhook Dispatcher (mock-first)
// ---------------------------------------------------------------------------
export async function dispatchTelegramAlert(alert: CoachAlert, botToken?: string, chatId?: string): Promise<{ ok: boolean; payload: string; channel: 'telegram' | 'log' }> {
  const payload = formatTelegramAlert(alert);
  if (botToken && chatId) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: payload, parse_mode: 'MarkdownV2' }),
      });
      return { ok: res.ok, payload, channel: 'telegram' };
    } catch {
      return { ok: false, payload, channel: 'log' };
    }
  }
  // Demo: bot yoksa payload üretilir (smoke/log)
  return { ok: true, payload, channel: 'log' };
}

export function telegramAlertStatus(): string {
  return 'Telegram Adaptörü: MarkdownV2 • INJURY/HR/DECEL/GEOFENCE alarmları • webhook mock-first';
}
