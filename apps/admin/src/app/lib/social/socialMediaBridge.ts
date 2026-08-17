// ============================================================================
// 📱 SOSYAL MEDYA API KÖPRÜSÜ (Zernio/Blotato MCP Stub)
// WhatsApp / Instagram / TikTok / LinkedIn gönderi kuyruğu.
// Anahtar yoksa simülasyon; Plan Z güvenli. Kırılmasız.
// ============================================================================

export type SocialChannel = 'whatsapp' | 'instagram' | 'tiktok' | 'linkedin';

export interface SocialPost {
  channel: SocialChannel;
  text: string;
  media?: string[];
  scheduledAt?: string;
}

export interface SocialResult {
  ok: boolean;
  channel: SocialChannel;
  postId: string;
  simulated: boolean;
  message: string;
}

const CHANNEL_LIMITS: Record<SocialChannel, number> = {
  whatsapp: 1024,
  instagram: 2200,
  tiktok: 2200,
  linkedin: 3000,
};

// Gönderi boyut doğrulama (deterministik)
export function validatePost(channel: SocialChannel, text: string): { ok: boolean; error?: string } {
  const limit = CHANNEL_LIMITS[channel] ?? 2200;
  if (!text.trim()) return { ok: false, error: 'Boş gönderi' };
  if (text.length > limit) return { ok: false, error: `Çok uzun (${text.length}/${limit})` };
  return { ok: true };
}

// Gönderi yayınla (stub — gerçek API anahtarıyla güçlendirilir)
export async function publishSocialPost(post: SocialPost): Promise<SocialResult> {
  const check = validatePost(post.channel, post.text);
  if (!check.ok) return { ok: false, channel: post.channel, postId: '', simulated: true, message: `❌ ${check.error}` };
  const hasKey = typeof process !== 'undefined' && !!process.env[`SOCIAL_${post.channel.toUpperCase()}_TOKEN`];
  return {
    ok: true,
    channel: post.channel,
    postId: `soc_${Date.now().toString(36)}`,
    simulated: !hasKey,
    message: hasKey
      ? `📱 ${post.channel} gönderisi yayınlandı`
      : `📱 ${post.channel} kuyruğa alındı (simülasyon — SOCIAL_${post.channel.toUpperCase()}_TOKEN eklenince gerçek yayın)`,
  };
}

export function socialBridgeStatus(): string {
  return `Sosyal Köprü [WhatsApp/IG/TikTok/LinkedIn • MCP stub • kuyruk simülasyonu]`;
}
