// ============================================================================
// 🔗 BLE BAĞLANTI YÖNETİCİSİ (Adım 20)
// - gattserverdisconnected → exponential backoff ile oto-yeniden bağlanma
// - Paket kaybı / heartbeat watchdog: 1500 ms sessizlikte dropout bayrağı
// - Kapsam: gözlemlenebilir durum makinesi (test edilebilir, saf çekirdek)
// ============================================================================

export type BleLinkState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'dropout';

export const BACKOFF_BASE_MS = 400;
export const BACKOFF_MAX_MS = 8000;
export const WATCHDOG_TIMEOUT_MS = 1500;

export interface BleConnectionState {
  state: BleLinkState;
  attempt: number;
  backoffMs: number;
  lastPacketAt: number | null;
  droppedSince: number | null;   // epoch ms — dropout başlangıcı
  disconnectedAt: number | null;
}

export function initialState(): BleConnectionState {
  return { state: 'idle', attempt: 0, backoffMs: 0, lastPacketAt: null, droppedSince: null, disconnectedAt: null };
}

// ---------------------------------------------------------------------------
// 1. Üstel Geri Çekilme — bağlantı girişim aralığı
// ---------------------------------------------------------------------------
export function nextBackoff(attempt: number, base = BACKOFF_BASE_MS, max = BACKOFF_MAX_MS): number {
  return Math.min(max, base * Math.pow(2, Math.max(0, attempt - 1)));
}

export function onDisconnected(s: BleConnectionState, now = Date.now()): BleConnectionState {
  return { ...s, state: 'reconnecting', attempt: s.attempt + 1, backoffMs: nextBackoff(s.attempt + 1), disconnectedAt: now };
}

export function onConnectStart(s: BleConnectionState): BleConnectionState {
  return { ...s, state: 'connecting' };
}

export function onConnected(s: BleConnectionState, now = Date.now()): BleConnectionState {
  return { ...s, state: 'connected', attempt: 0, backoffMs: 0, lastPacketAt: now, droppedSince: null, disconnectedAt: null };
}

// ---------------------------------------------------------------------------
// 2. Heartbeat / Paket Kaybı Watchdog — 1500 ms
// ---------------------------------------------------------------------------
export function onPacket(s: BleConnectionState, now = Date.now()): BleConnectionState {
  return { ...s, state: 'connected', lastPacketAt: now, droppedSince: null };
}

export function evaluateWatchdog(s: BleConnectionState, now = Date.now()): BleConnectionState {
  if (s.state !== 'connected' || s.lastPacketAt === null) return s;
  const silent = now - s.lastPacketAt;
  if (silent > WATCHDOG_TIMEOUT_MS && s.droppedSince === null) {
    return { ...s, state: 'dropout', droppedSince: now };
  }
  return s;
}

// ---------------------------------------------------------------------------
// 3. Strateji — reconnect/retry tetikleme kararı
// ---------------------------------------------------------------------------
export function shouldRetryNow(s: BleConnectionState, now = Date.now()): boolean {
  if (s.state !== 'reconnecting' || s.disconnectedAt === null) return false;
  return now - s.disconnectedAt >= s.backoffMs;
}

export function bleConnectionStatus(s: BleConnectionState): string {
  return `BLE Bağlantı: ${s.state} • deneme ${s.attempt} • geri çekilme ${s.backoffMs}ms${s.droppedSince ? ` • DROPOUT ${now - s.droppedSince}ms` : ''}`;
}

const now = Date.now();
