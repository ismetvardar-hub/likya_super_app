// ============================================================================
// 📴 OFFLINE-FIRST DEPOLAMA MOTORU (Adım 49) — IndexedDB + bellek yedeği
// Telemetri çerçeveleri, bekleyen drill gönderimleri ve büyüme günlüklerini
// kort Wi-Fi/hücresel yokken yerel olarak saklar. Yazma-öncesi işlem kuyruğu:
// pending_sync_queue (write-ahead). Node/test ortamında bellek yedeği kullanılır.
// ============================================================================

export interface StorageBackend {
  getItem<T>(store: string, key: string): Promise<T | null>;
  setItem<T>(store: string, key: string, value: T): Promise<void>;
  removeItem(store: string, key: string): Promise<void>;
  getAll<T>(store: string): Promise<T[]>;
  clear(store: string): Promise<void>;
}

// ── Bellek yedeği (test/CI, IndexedDB olmayan ortamlar) ───────────────────────
export function createMemoryStorageBackend(): StorageBackend {
  const stores = new Map<string, Map<string, unknown>>();
  const storeMap = (store: string) => {
    let m = stores.get(store);
    if (!m) { m = new Map(); stores.set(store, m); }
    return m;
  };
  return {
    async getItem<T>(store, key) { return (storeMap(store).get(key) as T) ?? null; },
    async setItem(store, key, value) { storeMap(store).set(key, value); },
    async removeItem(store, key) { storeMap(store).delete(key); },
    async getAll<T>(store) { return Array.from(storeMap(store).values()) as T[]; },
    async clear(store) { storeMap(store).clear(); },
  };
}

// ── IndexedDB yedeği (tarayıcıda; yoksa null → bellek yedeğine düşer) ────────
export function createIndexedDbStorageBackend(dbName = 'likya_offline_store'): StorageBackend | null {
  if (typeof indexedDB === 'undefined') return null;
  const open = (): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        for (const store of ['telemetry_frames', 'growth_logs', 'pending_drills', 'pending_sync_queue']) {
          if (!db.objectStoreNames.contains(store)) db.createObjectStore(store);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  return {
    async getItem(store, key) {
      try {
        const db = await open();
        const v = await new Promise<unknown>((res, rej) => {
          const tx = db.transaction(store, 'readonly');
          const r = tx.objectStore(store).get(key);
          r.onsuccess = () => res(r.result ?? null);
          r.onerror = () => rej(r.error);
        });
        db.close();
        return v as never;
      } catch { return null; }
    },
    async setItem(store, key, value) {
      try {
        const db = await open();
        await new Promise<void>((res, rej) => {
          const tx = db.transaction(store, 'readwrite');
          tx.objectStore(store).put(value, key);
          tx.oncomplete = () => res();
          tx.onerror = () => rej(tx.error);
        });
        db.close();
      } catch { /* kalıcılık hatası kuyruğu bozmaz */ }
    },
    async removeItem(store, key) {
      try {
        const db = await open();
        await new Promise<void>((res, rej) => {
          const tx = db.transaction(store, 'readwrite');
          tx.objectStore(store).delete(key);
          tx.oncomplete = () => res();
          tx.onerror = () => rej(tx.error);
        });
        db.close();
      } catch { /* ignore */ }
    },
    async getAll(store) {
      try {
        const db = await open();
        const v = await new Promise<unknown[]>((res, rej) => {
          const tx = db.transaction(store, 'readonly');
          const r = tx.objectStore(store).getAll();
          r.onsuccess = () => res((r.result as unknown[]) ?? []);
          r.onerror = () => rej(r.error);
        });
        db.close();
        return v as never;
      } catch { return []; }
    },
    async clear(store) {
      try {
        const db = await open();
        await new Promise<void>((res, rej) => {
          const tx = db.transaction(store, 'readwrite');
          tx.objectStore(store).clear();
          tx.oncomplete = () => res();
          tx.onerror = () => rej(tx.error);
        });
        db.close();
      } catch { /* ignore */ }
    },
  };
}

// ── Pending kayıt tipleri ─────────────────────────────────────────────────────
export type PendingKind = 'telemetry' | 'drill' | 'growth' | 'session';

export interface PendingRecord<T = unknown> {
  id: string;
  kind: PendingKind;
  payload: T;
  createdAt: string;
  updatedAt: string; // LWW karşılaştırma damgası
  synced: boolean;
}

export interface TelemetryFrameRecord {
  sessionId: string;
  timestampMs: number;
  hr?: number;
  gctMs?: number;
  rsi?: number;
  toePressure?: number;
  heelPressure?: number;
  armVelocity?: number;
  loadingRate?: number;
}

// ── Depolama motoru ───────────────────────────────────────────────────────────
export class OfflineStorageEngine {
  private seq = 0;
  private readonly backend: StorageBackend;
  private readonly queueStore: string;
  private readonly telemetryStore: string;
  private readonly growthStore: string;

  constructor(
    backend: StorageBackend,
    queueStore = 'pending_sync_queue',
    telemetryStore = 'telemetry_frames',
    growthStore = 'growth_logs',
  ) {
    this.backend = backend;
    this.queueStore = queueStore;
    this.telemetryStore = telemetryStore;
    this.growthStore = growthStore;
  }

  /** Yazma-öncesi kaydı kuyruğa ekler. */
  async enqueuePending(kind: PendingKind, payload: unknown): Promise<PendingRecord> {
    const now = new Date().toISOString();
    const rec: PendingRecord = { id: `p_${Date.now().toString(36)}_${this.seq++}`, kind, payload, createdAt: now, updatedAt: now, synced: false };
    await this.backend.setItem(this.queueStore, rec.id, rec);
    return rec;
  }

  /** Kuyruktaki bekleyen kayıtları (yaş sırasıyla) getirir. */
  async peekPending(): Promise<PendingRecord[]> {
    const all = await this.backend.getAll<PendingRecord>(this.queueStore);
    return all.filter((r) => !r.synced).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  /** En eski N bekleyen kaydı kuyruktan çıkarır (dequeue). */
  async dequeuePending(count: number): Promise<PendingRecord[]> {
    const pending = await this.peekPending();
    const batch = pending.slice(0, count);
    for (const r of batch) await this.backend.removeItem(this.queueStore, r.id);
    return batch;
  }

  /** Acknowledge edilen kaydı senkron işaretler (başarısız flush sonrası tekrar deneme). */
  async acknowledgePending(ids: string[]): Promise<void> {
    const all = await this.backend.getAll<PendingRecord>(this.queueStore);
    for (const r of all) {
      if (ids.includes(r.id)) {
        r.synced = true;
        await this.backend.setItem(this.queueStore, r.id, r);
      }
    }
  }

  async countPending(): Promise<number> {
    return (await this.peekPending()).length;
  }

  async clearPending(): Promise<void> {
    await this.backend.clear(this.queueStore);
  }

  // ── Telemetri çerçeveleri ───────────────────────────────────────────────────
  async putTelemetry(frame: TelemetryFrameRecord): Promise<void> {
    await this.backend.setItem(this.telemetryStore, `${frame.sessionId}:${frame.timestampMs}`, frame);
  }

  async getTelemetry(sessionId: string): Promise<TelemetryFrameRecord[]> {
    const all = await this.backend.getAll<TelemetryFrameRecord>(this.telemetryStore);
    return all.filter((f) => f.sessionId === sessionId).sort((a, b) => a.timestampMs - b.timestampMs);
  }

  // ── Büyüme günlükleri ───────────────────────────────────────────────────────
  async putGrowthLog(athleteId: string, recordedDate: string, data: Record<string, unknown>): Promise<void> {
    await this.backend.setItem(this.growthStore, `${athleteId}:${recordedDate}`, { athleteId, recordedDate, ...data });
  }

  async getGrowthLogs(athleteId: string): Promise<Array<Record<string, unknown>>> {
    const all = await this.backend.getAll<Record<string, unknown>>(this.growthStore);
    return all.filter((r) => r.athleteId === athleteId);
  }
}

/** Motorun arkasındaki yedeği otomatik seçer (IndexedDB varsa onu, yoksa bellek). */
export function createOfflineStorageEngine(): OfflineStorageEngine {
  return new OfflineStorageEngine(createIndexedDbStorageBackend() ?? createMemoryStorageBackend());
}

export function offlineStorageStatus(): string {
  return 'Offline Depolama: telemetri/growth/pending_drills + pending_sync_queue (write-ahead)';
}

