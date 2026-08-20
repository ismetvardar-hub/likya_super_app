// ============================================================================
// 📲 İLETİŞİM SÜİTİ (Adım 02-03) — WhatsApp + Native Web Share fallback
// - WhatsApp: önceden formatlı sade dil şablonları (wa.me)
// - Native Web Share API: navigator.share → fallback (WhatsApp / kopyala)
// - Şablonlar: performans karnesi, sakatlık uyarısı, maç daveti, kupon
// ============================================================================

export type ShareChannel = 'whatsapp' | 'web-share' | 'clipboard';

// ---------------------------------------------------------------------------
// 1. WhatsApp Sade Dil Şablonları
// ---------------------------------------------------------------------------
export const SHARE_TEMPLATES = {
  report: (athlete: string, scorePct: number, advice: string) =>
    `🏆 *${athlete} — Bugünkü Antrenman Karnesi*\n📊 Patlayıcılık Skoru: %${scorePct}\n💡 Antrenör: "${advice.slice(0, 90)}..."\n\n⚡ ExtremeS Spor Bilimi Sistemi`,
  safety: (child: string, status: string) =>
    `🛡️ *Güvenlik Bildirimi* — ${child}\n📍 Durum: ${status}\n\nHerhangi bir sorun için resepsiyonla iletişime geçin. ⚡ ExtremeS`,
  match: (court: string, time: string, level: string) =>
    `🎾 *Maç Daveti!*\n📍 Kort: ${court}\n⏰ Saat: ${time}\n🎚️ Seviye: ${level}\n\nTek tıkla katıl! ⚡ ExtremeS`,
  coupon: (code: string, reward: string, until: string) =>
    `🎟️ *Daze Ödül Kuponun Hazır!*\n🍹 ${reward} — Kod: ${code}\n📅 Geçerli: ${until}\n\nKafede kullanabilirsin. ⚡ ExtremeS`,
  milestone: (athlete: string, badge: string) =>
    `🎉 *Tebrikler ${athlete}!*\n🏅 Yeni Başarı: ${badge}\n\nBu seviyeyi hak ettin! ⚡ ExtremeS`,
} as const;

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// ---------------------------------------------------------------------------
// 2. Native Web Share API + fallback
// ---------------------------------------------------------------------------
export function webShareSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export async function shareText(text: string, opts?: { title?: string }): Promise<{ channel: ShareChannel; ok: boolean }> {
  if (webShareSupported()) {
    try {
      await navigator.share({ title: opts?.title ?? 'ExtremeS', text });
      return { channel: 'web-share', ok: true };
    } catch {
      // kullanıcı iptal etti — fallback'e düşme, sessiz
      return { channel: 'web-share', ok: false };
    }
  }
  // Fallback: WhatsApp yeni sekme
  window.open(whatsappShareUrl(text), '_blank');
  return { channel: 'whatsapp', ok: true };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function communicationSuiteStatus(): string {
  return `İletişim Süiti: ${Object.keys(SHARE_TEMPLATES).length} şablon • ${webShareSupported() ? 'Web Share' : 'WA fallback'} • kopyala hazır`;
}
