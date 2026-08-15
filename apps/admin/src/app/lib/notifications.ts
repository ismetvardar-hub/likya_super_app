// ============================================================================
// 📲 LİKYA VIP BİLDİRİM HATTI — Telegram Bot & Discord Webhook (ücretsiz)
// Kritik arıza, ciro rekoru, hibe hatırlatması gibi olayları Patron'a iletir.
// Anahtarlar yapılandırılmazsa sessizce "hazır" döner (sistem aksamaz).
// ============================================================================

export interface NotifyResult {
  ok: boolean;
  channel: string;
  detail?: string;
}

// Telegram Bot API — bot token + chat id ile Patron'a anlık mesaj
export async function sendTelegramAlert(message: string): Promise<NotifyResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || '';
  const chatId = process.env.TELEGRAM_CHAT_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || '';
  if (!token || !chatId) {
    return { ok: false, channel: 'telegram', detail: 'Telegram Bot anahtarı/chat-id yapılandırılmadı (hazır)' };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, channel: 'telegram', detail: `Telegram HTTP ${res.status}: ${body.slice(0, 120)}` };
    }
    return { ok: true, channel: 'telegram', detail: 'gönderildi' };
  } catch (e) {
    return { ok: false, channel: 'telegram', detail: e instanceof Error ? e.message : 'ağ hatası' };
  }
}

// Discord Webhook — sunucu kanalına otomatik mesaj
export async function sendDiscordWebhook(message: string): Promise<NotifyResult> {
  const url = process.env.DISCORD_WEBHOOK_URL || process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || '';
  if (!url) {
    return { ok: false, channel: 'discord', detail: 'Discord webhook URL yapılandırılmadı (hazır)' };
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });
    return { ok: res.ok, channel: 'discord', detail: res.ok ? 'gönderildi' : `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, channel: 'discord', detail: e instanceof Error ? e.message : 'ağ hatası' };
  }
}

// Çok kanallı toplu bildirim — en az biri başarılıysa true
export async function sendVipAlert(message: string, channels: ('telegram' | 'discord')[] = ['telegram', 'discord']): Promise<NotifyResult[]> {
  const jobs = channels.map(async (ch) => (ch === 'telegram' ? sendTelegramAlert(message) : sendDiscordWebhook(message)));
  return Promise.all(jobs);
}
