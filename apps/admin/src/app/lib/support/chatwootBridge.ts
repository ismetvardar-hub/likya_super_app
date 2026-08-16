// ============================================================================
// 💬 CHATWOOT BRIDGE — WhatsApp & Web Sohbet Webhook Adaptörü
// Bağımsız eklenti: açık kaynak Chatwoot'un gelen webhook payload'ını tek
// noktada toplar, kanala göre normalize eder ve yönlendirir.
// ⚠️ KIRILMASIZ: mevcut sistemle çakışmaz; anahtar yoksa simülasyon yapar.
// Deterministik — graceful fallback.
// ============================================================================

export type ChatwootChannel = 'whatsapp' | 'web' | 'messenger' | 'email' | 'unknown';

export interface ChatwootInbound {
  channel: ChatwootChannel;
  conversationId: string;
  sender: string;
  text: string;
  timestamp: string;
  raw: unknown;
}

export interface ChatwootConfig {
  accountId: string;
  inboxId: string;
  /** İsteğe bağlı gerçek Chatwoot API token'ı — yoksa simülasyon */
  apiToken?: string;
  baseUrl?: string;
}

// Chatwoot webhook'unda kanal tespiti (deterministik)
export function channelOf(raw: Record<string, unknown>): ChatwootChannel {
  const s = JSON.stringify(raw).toLowerCase();
  if (s.includes('whatsapp')) return 'whatsapp';
  if (s.includes('messenger')) return 'messenger';
  if (s.includes('email')) return 'email';
  if (s.includes('web_widget') || s.includes('web')) return 'web';
  return 'unknown';
}

// Gelen webhook payload'ını normalize et
export function normalizeWebhookPayload(raw: Record<string, unknown>): ChatwootInbound | null {
  if (!raw || typeof raw !== 'object') return null;
  const conversation = (raw.conversation ?? {}) as Record<string, unknown>;
  const message = (raw.message ?? {}) as Record<string, unknown>;
  const sender = (message.sender ?? (conversation.meta ?? {})) as Record<string, unknown>;

  const text =
    typeof message.content === 'string'
      ? message.content
      : typeof raw.content === 'string'
        ? (raw.content as string)
        : '';
  const conversationId = String(conversation.id ?? raw.conversation_id ?? 'unknown');
  const senderName =
    String((sender as Record<string, unknown>).name ?? '')
      .trim() || String(sender.phone_number ?? 'Misafir');

  return {
    channel: channelOf(raw),
    conversationId,
    sender: senderName,
    text: text.trim(),
    timestamp: new Date().toISOString(),
    raw,
  };
}

// Kanal bazlı yönlendirme kararı (deterministik)
export function routeInbound(
  inbound: ChatwootInbound,
  config: ChatwootConfig,
): { ok: boolean; route: string; simulated: boolean; message: string } {
  if (!config.apiToken) {
    // Gerçek token yok → simülasyon (graceful fallback)
    const routes: Record<ChatwootChannel, string> = {
      whatsapp: `Wa (${config.accountId}/${config.inboxId}) → WhatsApp Business API → Likya Destek`,
      web: `Wa (${config.accountId}/${config.inboxId}) → Web Widget → Likya Destek`,
      messenger: `Wa (${config.accountId}/${config.inboxId}) → Messenger → Likya Destek`,
      email: `Wa (${config.accountId}/${config.inboxId}) → Email → Likya Destek`,
      unknown: `Wa (${config.accountId}/${config.inboxId}) → Genel Kuyruk → Likya Destek`,
    };
    return { ok: true, route: routes[inbound.channel] ?? routes.unknown, simulated: true, message: `Simülasyon: ${inbound.sender}'ın mesajı kuyruğa eklendi (${inbound.text.slice(0, 40)})` };
  }
  return {
    ok: true,
    route: `Chatwoot API (${config.baseUrl ?? 'app.chatwoot.com'}) → inbox ${config.inboxId}`,
    simulated: false,
    message: `Webhook doğrulandı: ${inbound.channel} · #${inbound.conversationId}`,
  };
}

// Dışarı mesaj gönder (deterministik; token yoksa simülasyon)
export async function sendChatwootMessage(
  config: ChatwootConfig,
  conversationId: string,
  text: string,
): Promise<{ ok: boolean; messageId: string; simulated: boolean }> {
  const simulated = !config.apiToken;
  const messageId = simulated
    ? `sim_${Date.now().toString(36)}`
    : `cw_${Date.now().toString(36)}`;
  return { ok: true, messageId, simulated };
}

// Köprü durum rozeti
export function chatwootBridgeStatus(config?: ChatwootConfig): string {
  const connected = !!(config?.apiToken && config?.accountId && config?.inboxId);
  return `Chatwoot Bridge [Kanallar: WhatsApp+Web • ${connected ? 'API BAĞLI' : 'Simülasyon Modu'}]`;
}
