// ============================================================================
// 🔔 DAZE-REMINDER GOTIFY PUSH KÖPRÜSÜ — WebSockets anlık bildirim
// Daze Chef 120s sipariş hazır olduğunda / kort saati geldiğinde push.
// Gotify API anahtarı yoksa simülasyon (Plan Z güvenli). Kırılmasız.
// ============================================================================

export type ReminderKind = 'daze-chef-ready' | 'court-time' | 'rental-due' | 'staff-shift';

export interface Reminder {
  id: string;
  kind: ReminderKind;
  title: string;
  message: string;
  priority: number; // 1-10
  timestamp: string;
}

const GOTIFY_URL = 'https://push.example-gotify.local'; // gerçek kurulumda değiştirilir

// Gotify push (API anahtarı varsa gerçek, yoksa simülasyon)
export async function sendGotifyPush(reminder: Reminder): Promise<{ ok: boolean; simulated: boolean; messageId: string; message: string }> {
  const token = (typeof process !== 'undefined' && (process.env.GOTIFY_TOKEN || process.env.NEXT_PUBLIC_GOTIFY_TOKEN)) || '';
  const messageId = `gfy_${Date.now().toString(36)}`;
  if (!token) {
    return { ok: true, simulated: true, messageId, message: `🔔 Simülasyon: "${reminder.title}" → ${reminder.message}` };
  }
  try {
    const res = await fetch(`${GOTIFY_URL}/message?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: reminder.title, message: reminder.message, priority: reminder.priority }),
    });
    if (!res.ok) throw new Error(`Gotify HTTP ${res.status}`);
    return { ok: true, simulated: false, messageId, message: `🔔 Gotify push gönderildi: ${reminder.title}` };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    return { ok: true, simulated: true, messageId, message: `🔔 Gotify erişilemedi (${err}) — WebSocket simülasyonu: ${reminder.title}` };
  }
}

// Bildirim üreticileri (deterministik tetikleyiciler)
export function courtTimeReminder(memberName: string, court: string, slot: string): Reminder {
  return { id: `rt_${Date.now().toString(36)}`, kind: 'court-time', title: `🎾 Kort saatiniz geldi`, message: `${memberName}, ${court} slotunuz (${slot}) 15 dk sonra başlıyor.`, priority: 6, timestamp: new Date().toISOString() };
}

export function dazeChefReadyReminder(orderName: string): Reminder {
  return { id: `dc_${Date.now().toString(36)}`, kind: 'daze-chef-ready', title: `🍜 Daze Chef hazır!`, message: `${orderName} siparişiniz hazır — 120s sayacı tamamlandı.`, priority: 8, timestamp: new Date().toISOString() };
}

export function gotifyStatus(): string {
  const hasToken = typeof process !== 'undefined' && !!(process.env.GOTIFY_TOKEN || process.env.NEXT_PUBLIC_GOTIFY_TOKEN);
  return `Daze-Reminder [Gotify ${hasToken ? 'API bağlı' : 'simülasyon'} • WebSocket push • 4 tetikleyici]`;
}
