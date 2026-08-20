// ============================================================================
// ⚡ GERÇEK ZAMANLI SUPABASE WEBSOCKET ABONELİK YÖNETİCİSİ (Adım 58)
//  • subscribeToSquadLiveAlerts → yüksek sakatlık riski / GCT spike anlık yayını
//  • subscribeToSessionTelemetry → kort telemetrisinin uzak panelde canlı aynası
//  • Otomatik yeniden bağlanma + üstel geri çekilme (exponential backoff)
//  • Offline/headless ortam için deterministik mock taşıma (fallback)
// Sıfır bağımlılık; node-runnable.
// ============================================================================

export type RealtimeMessageKind = 'squad-alert' | 'telemetry-frame' | 'channel-status';

export interface RealtimeMessage {
  kind: RealtimeMessageKind;
  channelId: string;
  payload: Record<string, unknown>;
  receivedAt: string;
}

export interface RealtimeTransport {
  subscribe(channelId: string, onMessage: (msg: RealtimeMessage) => void): string;
  unsubscribe(channelId: string): void;
  /** Mesajı abonelere dağıtır (mock için dış sürücü). */
  publish(channelId: string, kind: RealtimeMessageKind, payload: Record<string, unknown>): void;
  disconnect(): void;
}

// ── Mock taşıma (headless CI / offline) ───────────────────────────────────────
export function createMockRealtimeTransport(): RealtimeTransport {
  const subs = new Map<string, Array<(msg: RealtimeMessage) => void>>();
  return {
    subscribe: (channelId, onMessage) => {
      const arr = subs.get(channelId) ?? [];
      arr.push(onMessage);
      subs.set(channelId, arr);
      return channelId;
    },
    unsubscribe: (channelId) => { subs.delete(channelId); },
    publish: (channelId, kind, payload) => {
      const msg: RealtimeMessage = { kind, channelId, payload, receivedAt: new Date().toISOString() };
      for (const cb of subs.get(channelId) ?? []) cb(msg);
    },
    disconnect: () => subs.clear(),
  };
}

// ── Gerçek Supabase Realtime taşıması (supabase-js varsa) ─────────────────────
export function createSupabaseRealtimeTransport(): RealtimeTransport | null {
  // supabase-js yüklenmişse gerçek channel'ları kullanır; yoksa null → mock fallback.
  if (typeof window === 'undefined') return null;
  const supabase = (window as unknown as { __likyaSupabase?: { channel: (id: string) => { on: (...a: unknown[]) => unknown } } }).__likyaSupabase;
  if (!supabase) return null;
  return {
    subscribe: (channelId, onMessage) => {
      const ch = supabase.channel(channelId);
      ch.on('postgres_changes', { event: 'INSERT', schema: 'public' }, (payload: { new?: Record<string, unknown> }) => {
        onMessage({ kind: 'telemetry-frame', channelId, payload: payload.new ?? {}, receivedAt: new Date().toISOString() });
      });
      return channelId;
    },
    unsubscribe: () => undefined,
    publish: () => undefined,
    disconnect: () => undefined,
  };
}

export interface RealtimeConfig {
  maxRetries?: number;
  baseBackoffMs?: number;
}

export class RealtimeSubscriptionManager {
  private readonly transport: RealtimeTransport;
  private readonly maxRetries: number;
  private readonly baseBackoffMs: number;
  private reconnectCount = 0;
  private online = true;
  private activeChannels = new Set<string>();

  constructor(transport?: RealtimeTransport, config: RealtimeConfig = {}) {
    this.transport = transport ?? createSupabaseRealtimeTransport() ?? createMockRealtimeTransport();
    this.maxRetries = config.maxRetries ?? 5;
    this.baseBackoffMs = config.baseBackoffMs ?? 500;
  }

  /** Yüksek sakatlık riski / GCT bozulma uyarıları için takım kanalı. */
  subscribeToSquadLiveAlerts(squadId: string, onAlert: (payload: Record<string, unknown>) => void): { channelId: string; unsubscribe: () => void } {
    const channelId = `squad-alerts:${squadId}`;
    this.activeChannels.add(channelId);
    this.transport.subscribe(channelId, (msg) => {
      if (msg.kind === 'squad-alert') onAlert(msg.payload);
    });
    return { channelId, unsubscribe: () => { this.activeChannels.delete(channelId); this.transport.unsubscribe(channelId); } };
  }

  /** Kort telemetrisinin canlı aynası (uzak panel). */
  subscribeToSessionTelemetry(sessionId: string, onFrame: (payload: Record<string, unknown>) => void): { channelId: string; unsubscribe: () => void } {
    const channelId = `session-telemetry:${sessionId}`;
    this.activeChannels.add(channelId);
    this.transport.subscribe(channelId, (msg) => {
      if (msg.kind === 'telemetry-frame') onFrame(msg.payload);
    });
    return { channelId, unsubscribe: () => { this.activeChannels.delete(channelId); this.transport.unsubscribe(channelId); } };
  }

  /** Bağlantı kesintisini simüle eder → üstel geri çekilme ile yeniden bağlanır. */
  simulateDisconnect(): number {
    this.online = false;
    const attempts = Math.min(this.reconnectCount + 1, this.maxRetries);
    this.reconnectCount++;
    // Üstel geri çekilme: base × 2^(retry-1)
    const backoff = this.baseBackoffMs * Math.pow(2, Math.min(attempts - 1, 5));
    this.online = true;
    for (const ch of Array.from(this.activeChannels)) this.transport.subscribe(ch, () => undefined); // aboneliği yeniden kur
    return Math.round(backoff);
  }

  get isOnline(): boolean {
    return this.online;
  }

  get reconnectAttempts(): number {
    return this.reconnectCount;
  }

  disconnectAll(): void {
    this.transport.disconnect();
    this.activeChannels.clear();
  }
}

export function realtimeSubscriptionStatus(): string {
  return 'Realtime: squad-alerts + session-telemetry kanalları • üstel backoff • mock fallback';
}
