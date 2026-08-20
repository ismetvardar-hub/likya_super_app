// ============================================================================
// 🛰️ SAHA HATA TELEMETRİSİ & ÇEVRİMDIŞI ÇÖKME RAPORLAYICI (Adım 105)
// Sıfır-bağımlılık istemci hata + Web Bluetooth GATT kopuşu + IndexedDB kota
// hatası kaydedicisi. Çökme dökümleri çevrimdışı sınırlı kuyrukta saklanır;
// ağ geri geldiğinde otomatik flush edilir. Saf/deterministik motor — test
// ve tarayıcı ortamlarında aynı davranış.
// ============================================================================

export type CrashKind = 'unhandled' | 'gatt_disconnect' | 'indexeddb_quota' | 'network' | 'runtime';

export const CRASH_QUEUE_KEY = 'likya_crash_queue';
export const MAX_CRASH_QUEUE = 200;

// ── Hata sınıflandırma (GATT / kota / ağ / runtime / unhandled) ──────────────
export function classifyCrashKind(error: unknown): CrashKind {
  const msg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const lower = msg.toLowerCase();
  if (lower.includes('quotaexceeded') || lower.includes('quota exceeded') || lower.includes('storage quota') || lower.includes('quota')) return 'indexeddb_quota';
  if (lower.includes('gatt') || lower.includes('gattserver') || lower.includes('bluetooth') || lower.includes('device disconnected') || lower.includes('gatt operation failed')) return 'gatt_disconnect';
  if (lower.includes('networkerror') || lower.includes('failed to fetch') || lower.includes('network request') || lower.includes('load failed')) return 'network';
  if (error instanceof Error && error.name === 'Error') return 'runtime';
  return 'unhandled';
}

// ── Çökme dökümü serileştirme ─────────────────────────────────────────────────
export interface CrashDump {
  id: string;
  kind: CrashKind;
  ts: string;
  message: string;
  stack: string;
  url: string;
  context: Record<string, unknown>;
  replayAttempts: number;
}

let crashSeq = 0;

export function serializeCrashDump(error: unknown, context: Record<string, unknown> = {}, url = ''): CrashDump {
  const err = error instanceof Error ? error : new Error(String(error));
  crashSeq++;
  return {
    id: `crash_${Date.now().toString(36)}_${crashSeq.toString(36)}`,
    kind: classifyCrashKind(error),
    ts: new Date().toISOString(),
    message: err.message || String(error),
    stack: err.stack ?? err.message,
    url,
    context: { ...context },
    replayAttempts: 0,
  };
}

export function deserializeCrashDump(json: string): CrashDump | null {
  try {
    const d = JSON.parse(json);
    if (!d || typeof d !== 'object' || typeof d.id !== 'string' || typeof d.kind !== 'string') return null;
    return d as CrashDump;
  } catch {
    return null;
  }
}

// ── Depolama yedeği (bellek + localStorage uyumlu) ────────────────────────────
export interface CrashStorageBackend {
  getAll(): CrashDump[];
  save(list: CrashDump[]): void;
}

export function createMemoryCrashStorage(): CrashStorageBackend {
  let list: CrashDump[] = [];
  return {
    getAll: () => [...list],
    save: (next: CrashDump[]) => {
      list = [...next];
    },
  };
}

export function createLocalStorageCrashStorage(): CrashStorageBackend {
  if (typeof localStorage === 'undefined') return createMemoryCrashStorage();
  return {
    getAll: () => {
      try {
        const raw = localStorage.getItem(CRASH_QUEUE_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? (arr as CrashDump[]) : [];
      } catch {
        return [];
      }
    },
    save: (list: CrashDump[]) => {
      try {
        localStorage.setItem(CRASH_QUEUE_KEY, JSON.stringify(list));
      } catch {
        // kota hatası → sessiz geç (dökümler bellek kuyruğunda kalır)
      }
    },
  };
}

// ── Saha çökme raporlayıcı (sınırlı kuyruk + ağ geri gelince flush) ───────────
export interface FlushResult {
  flushed: number;
  failed: number;
  pending: number;
}

export class FieldCrashReporter {
  private readonly storage: CrashStorageBackend;
  private readonly maxQueue: number;
  private readonly networkDetector: () => boolean;
  private queue: CrashDump[];

  constructor(storage?: CrashStorageBackend, maxQueue = MAX_CRASH_QUEUE, networkDetector?: () => boolean) {
    this.storage = storage ?? createMemoryCrashStorage();
    this.maxQueue = Math.max(1, maxQueue);
    this.networkDetector = networkDetector ?? (() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
    this.queue = this.storage.getAll();
  }

  capture(error: unknown, context: Record<string, unknown> = {}, url?: string): CrashDump {
    const currentUrl = url ?? (typeof location !== 'undefined' ? location.href : '');
    const dump = serializeCrashDump(error, context, currentUrl);
    this.queue.push(dump);
    if (this.queue.length > this.maxQueue) {
      this.queue = this.queue.slice(-this.maxQueue); // en yeni dökümler korunur
    }
    this.persist();
    return dump;
  }

  queueLength(): number {
    return this.queue.length;
  }

  replayQueue(): CrashDump[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
    this.persist();
  }

  flush(send: (dump: CrashDump) => Promise<boolean>, online?: boolean): Promise<FlushResult> {
    return (async () => {
      const isOnline = online ?? this.networkDetector();
      if (!isOnline) return { flushed: 0, failed: 0, pending: this.queue.length };
      let flushed = 0;
      let failed = 0;
      const remaining: CrashDump[] = [];
      for (const dump of this.queue) {
        dump.replayAttempts += 1;
        try {
          const ok = await send(dump);
          if (ok) {
            flushed++;
          } else {
            failed++;
            remaining.push(dump);
          }
        } catch {
          failed++;
          remaining.push(dump);
        }
      }
      this.queue = remaining;
      this.persist();
      return { flushed, failed, pending: this.queue.length };
    })();
  }

  private persist(): void {
    this.storage.save(this.queue);
  }
}

// ── Tarayıcı kurulumu (localStorage kalıcılığı ile) ───────────────────────────
export function createFieldCrashReporter(): FieldCrashReporter {
  return new FieldCrashReporter(createLocalStorageCrashStorage());
}

export function fieldCrashReporterStatus(): string {
  return `Saha Crash: ${MAX_CRASH_QUEUE} döküm sınırı • GATT/kota/ağ sınıflandırma • çevrimdışı kuyruk + ağ dönünce flush`;
}
