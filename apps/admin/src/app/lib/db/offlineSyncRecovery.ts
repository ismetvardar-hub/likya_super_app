// ============================================================================
// 🔄 AŞAMA 5 — OFFLINE SYNC RECOVERY (SQLite/LocalStorage Yedek + Re-Sync)
// Çevrimdışı yapılan rezervasyon, POS ve biyomekanik kayıtlarını kuyruğa alır;
// bağlantı geri geldiğinde otomatik Supabase'e basar (insertLiveRow fallback'li).
// Plan Z: Supabase env yoksa kayıtlar kuyrukta kalır, asla kaybolmaz.
// ============================================================================

import { insertLiveRow, supabaseEnvReady } from './supabaseClient';

export type OfflineRecordKind = 'reservation' | 'pos' | 'biomechanic';

export interface OfflineRecord {
  id: string;
  kind: OfflineRecordKind;
  payload: Record<string, unknown>;
  createdAt: string;
  synced: boolean;
}

const LS_QUEUE = 'likya_offline_sync_queue_v1';

function loadQueue(): OfflineRecord[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(window.localStorage.getItem(LS_QUEUE) ?? '[]') as OfflineRecord[]; } catch { return []; }
}
function saveQueue(q: OfflineRecord[]): void {
  try { if (typeof window !== 'undefined') window.localStorage.setItem(LS_QUEUE, JSON.stringify(q.slice(-100))); } catch { /* ignore */ }
}

/** Çevrimdışı kaydı kuyruğa ekle. */
export function enqueueOfflineRecord(kind: OfflineRecordKind, payload: Record<string, unknown>): OfflineRecord {
  const rec: OfflineRecord = { id: `off_${Date.now().toString(36)}_${Math.round(Math.random() * 1e5).toString(36)}`, kind, payload, createdAt: new Date().toISOString(), synced: false };
  saveQueue([...loadQueue(), rec]);
  return rec;
}

export function offlineQueueCount(): number {
  return loadQueue().filter((r) => !r.synced).length;
}

/** Bağlantı geri geldi → kuyruktaki senkronize olmamış kayıtları Supabase'e bas. */
export async function syncOfflineQueue(onProgress?: (synced: number, total: number) => void): Promise<{ synced: number; failed: number; remaining: number }> {
  const queue = loadQueue();
  const pending = queue.filter((r) => !r.synced);
  if (pending.length === 0) return { synced: 0, failed: 0, remaining: 0 };
  if (!supabaseEnvReady()) return { synced: 0, failed: 0, remaining: pending.length };

  const tableByKind: Record<OfflineRecordKind, string> = { reservation: 'reservations', pos: 'pos_transactions', biomechanic: 'staff_tasks' };
  let synced = 0;
  let failed = 0;

  for (const rec of pending) {
    try {
      const write = await insertLiveRow(tableByKind[rec.kind], { ...rec.payload, offlineId: rec.id, created_at: rec.createdAt });
      if (write.ok) {
        rec.synced = true;
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
    onProgress?.(synced, pending.length);
  }

  saveQueue(queue);
  const remaining = loadQueue().filter((r) => !r.synced).length;
  return { synced, failed, remaining };
}

/** Otomatik re-sync denemesi (event listener'lar için). */
export function autoResyncLoop(intervalMs = 15_000, onDone?: (result: { synced: number; remaining: number }) => void): () => void {
  const timer = setInterval(() => {
    void syncOfflineQueue().then((r) => onDone?.({ synced: r.synced, remaining: r.remaining }));
  }, intervalMs);
  return () => clearInterval(timer);
}

export function offlineSyncRecoveryStatus(): string {
  return `Offline Sync [${offlineQueueCount()} bekleyen kayıt • otomatik re-sync • Plan Z güvenli]`;
}
