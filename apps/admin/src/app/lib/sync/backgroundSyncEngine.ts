// ============================================================================
// 🔄 ARKA PLAN SENKRONİZASYON MOTORU (Adım 50)
// • Tarayıcı `online` olaylarını + periyodik kalp atışını dinler
// • Sıradaki çevrimdışı kayıtları Supabase'e sıkıştırılmış batch'ler halinde basar
// • Çakışmaları zaman damgası tabanlı LWW (Last-Write-Wins) ile çözer
// • Senkron ilerleme olayları yayınlar (UI göstergesi)
// Deterministik; node testleri için setConnectivity() sürücüsü.
// ============================================================================

import { type OfflineStorageEngine, type PendingRecord } from '../storage/offlineStorageEngine.ts';

export interface SyncProgressEvent {
  phase: 'idle' | 'flushing' | 'done' | 'error';
  flushed: number;
  total: number;
  pct: number;
  batch: number;
}

export interface FlushResult {
  ok: boolean;
  conflictIds?: string[];      // LWW çözümü gerektiren kayıtlar
  remoteVersions?: Record<string, string>; // id → sunucu updatedAt
}

export type FlushHandler = (batch: PendingRecord[]) => Promise<FlushResult>;

/** Last-Write-Wins: yerel kayıt daha yeni ise kazanır (true = yerel). */
export function resolveLastWriteWins(localUpdatedAt: string, remoteUpdatedAt: string): boolean {
  return new Date(localUpdatedAt).getTime() >= new Date(remoteUpdatedAt).getTime();
}

export class BackgroundSyncEngine {
  private online = true;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners: Array<(e: SyncProgressEvent) => void> = [];
  private readonly storage: OfflineStorageEngine;
  private readonly flushHandler: FlushHandler;
  private readonly batchSize: number;
  private readonly heartbeatMs: number;

  constructor(
    storage: OfflineStorageEngine,
    flushHandler: FlushHandler,
    batchSize = 25,
    heartbeatMs = 30_000,
  ) {
    this.storage = storage;
    this.flushHandler = flushHandler;
    this.batchSize = batchSize;
    this.heartbeatMs = heartbeatMs;
  }

  /** Tarayıcı olaylarını + periyodik kalp atışını başlatır. */
  start(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
    this.timer = setInterval(() => { void this.flushBatches(); }, this.heartbeatMs);
  }

  stop(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** Test/CI sürücüsü: bağlantı durumunu simüle eder. */
  setConnectivity(online: boolean): void {
    this.online = online;
    if (online) void this.flushBatches();
  }

  get isOnline(): boolean {
    return this.online;
  }

  onProgress(cb: (e: SyncProgressEvent) => void): () => void {
    this.listeners.push(cb);
    return () => { this.listeners = this.listeners.filter((l) => l !== cb); };
  }

  private emit(e: SyncProgressEvent): void {
    for (const l of [...this.listeners]) l(e);
  }

  /**
   * Bekleyen kayıtları batch'ler halinde basar; başarısız batch'te
   * çakışma olmayanları acknowledge eder, çakışanları LWW ile çözer.
   */
  async flushBatches(batchSize = this.batchSize): Promise<SyncProgressEvent> {
    if (!this.online) {
      const e: SyncProgressEvent = { phase: 'idle', flushed: 0, total: 0, pct: 0, batch: 0 };
      this.emit(e);
      return e;
    }
    const total = await this.storage.countPending();
    if (total === 0) {
      const e: SyncProgressEvent = { phase: 'done', flushed: 0, total: 0, pct: 100, batch: 0 };
      this.emit(e);
      return e;
    }

    let flushed = 0;
    let batchIdx = 0;
    let lastPhase: SyncProgressEvent = { phase: 'flushing', flushed: 0, total, pct: 0, batch: 0 };

    while (flushed < total) {
      const batch = await this.storage.dequeuePending(batchSize);
      if (batch.length === 0) break;
      const result = await this.flushHandler(batch);

      if (!result.ok) {
        const ackIds = batch.filter((r) => !(result.conflictIds ?? []).includes(r.id)).map((r) => r.id);
        await this.storage.acknowledgePending(ackIds);
        // Çakışan kayıtlar: yerel daha yeni değilse sunucu sürümü kazanır (kuyruktan düşer)
        const conflictIds = result.conflictIds ?? [];
        const resolved = batch.filter((r) => {
          if (!conflictIds.includes(r.id)) return false;
          const remote = result.remoteVersions?.[r.id];
          return remote !== undefined && !resolveLastWriteWins(r.updatedAt, remote);
        });
        await this.storage.acknowledgePending(resolved.map((r) => r.id));
        lastPhase = { phase: 'error', flushed, total, pct: Math.round((flushed / total) * 100), batch: batchIdx };
        this.emit(lastPhase);
        break;
      }

      flushed += batch.length;
      batchIdx++;
      lastPhase = { phase: 'flushing', flushed, total, pct: Math.round((flushed / total) * 100), batch: batchIdx };
      this.emit(lastPhase);
    }

    if (lastPhase.phase !== 'error') {
      lastPhase = { phase: 'done', flushed, total, pct: 100, batch: batchIdx };
      this.emit(lastPhase);
    }
    return lastPhase;
  }

  private handleOnline = (): void => this.setConnectivity(true);
  private handleOffline = (): void => { this.online = false; };
}

export function backgroundSyncStatus(): string {
  return 'Arka Plan Sync: online olayları + kalp atışı • batch flush • LWW çakışma • ilerleme olayları';
}
