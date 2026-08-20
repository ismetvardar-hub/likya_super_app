// ============================================================================
// 📊 100Hz TELEMETRİ TAMPON & KORT STRES MONİTÖRÜ (Adım 103)
// Yüksek tempolu rallilerde gerçek zamanlı paket kaybı (>%2 uyarı) ve jitter
// takibi. Client-side ring-buffer bellek üst sınırı 50MB: 2 saatlik maçta
// tablet tarayıcısı çökmesin diye en eski çerçeveler otomatik düşürülür.
// Saf/deterministik — node ortamında birebir doğrulanabilir.
// ============================================================================

export const MAX_BUFFER_MEMORY_BYTES = 50 * 1024 * 1024;
export const PACKET_LOSS_WARN_PCT = 2;
export const PACKET_LOSS_CRITICAL_PCT = 6;
export const NOMINAL_100HZ_INTERVAL_MS = 10;
export const LOSS_WINDOW = 100;
export const JITTER_WINDOW = 200;

// ── Sınırlı ring-buffer (bellek üst sınırı byte cinsinden) ────────────────────
export interface RingBufferStats {
  size: number;
  memoryBytes: number;
  capacityBytes: number;
  dropped: number;
}

export class RingBuffer<T> {
  private readonly items: T[] = [];
  private readonly byteOf: (item: T) => number;
  private readonly maxBytes: number;
  private dropped = 0;
  private memory = 0;

  constructor(maxBytes: number, byteOf: (item: T) => number) {
    this.maxBytes = Math.max(1, Math.floor(maxBytes));
    this.byteOf = byteOf;
  }

  push(item: T): RingBufferStats {
    const bytes = Math.max(0, this.byteOf(item));
    // Yer aç: en eski çerçeveleri düşür (FIFO)
    while (this.memory + bytes > this.maxBytes && this.items.length > 0) {
      this.memory -= Math.max(0, this.byteOf(this.items[0]));
      this.items.shift();
      this.dropped++;
    }
    if (this.memory + bytes <= this.maxBytes) {
      this.items.push(item);
      this.memory += bytes;
    } else {
      this.dropped++; // tek başına bile sığmıyor → at
    }
    return this.stats();
  }

  stats(): RingBufferStats {
    return { size: this.items.length, memoryBytes: this.memory, capacityBytes: this.maxBytes, dropped: this.dropped };
  }

  entries(): T[] {
    return [...this.items];
  }
}

// ── Paket kaybı takibi (kayan pencere, sıra boşluğu = kayıp) ───────────────────
interface LossEntry {
  seq: number;
  missed: number;
  tsMs: number;
}

export class PacketLossTracker {
  private readonly window: number;
  private readonly entries: LossEntry[] = [];
  private received = 0;
  private missed = 0;
  private lastSeq = 0;
  private started = false;

  constructor(window = LOSS_WINDOW) {
    this.window = Math.max(1, window);
  }

  record(seq: number, tsMs?: number): void {
    if (this.started && seq <= this.lastSeq) return; // sıra dışı / tekrar → yok say
    const gap = this.started ? Math.max(0, seq - this.lastSeq - 1) : 0; // ilk paket kayıp sayılmaz
    this.started = true;
    this.lastSeq = seq;
    this.entries.push({ seq, missed: gap, tsMs: tsMs ?? 0 });
    this.received++;
    this.missed += gap;
    while (this.entries.length > this.window) {
      const oldest = this.entries.shift();
      if (oldest) {
        this.received--;
        this.missed -= oldest.missed;
      }
    }
  }

  lossPct(): number {
    const total = this.received + this.missed;
    return total === 0 ? 0 : (this.missed / total) * 100;
  }

  hasWarning(): boolean {
    return this.lossPct() > PACKET_LOSS_WARN_PCT;
  }

  reset(): void {
    this.entries.length = 0;
    this.received = 0;
    this.missed = 0;
    this.lastSeq = 0;
    this.started = false;
  }
}

// ── Jitter takibi (100Hz nominal 10ms'den ortalama sapma) ─────────────────────
export class JitterTracker {
  private readonly window: number;
  private lastTs: number | null = null;
  private intervals: number[] = [];

  constructor(window = JITTER_WINDOW) {
    this.window = Math.max(1, window);
  }

  record(tsMs: number): void {
    if (this.lastTs !== null && tsMs >= this.lastTs) {
      this.intervals.push(tsMs - this.lastTs);
      if (this.intervals.length > this.window) this.intervals.shift();
    }
    this.lastTs = tsMs;
  }

  jitterMs(nominalMs = NOMINAL_100HZ_INTERVAL_MS): number {
    if (this.intervals.length === 0) return 0;
    const totalDev = this.intervals.reduce((acc, iv) => acc + Math.abs(iv - nominalMs), 0);
    return Math.round((totalDev / this.intervals.length) * 100) / 100;
  }
}

// ── Çift 100Hz akışlı kort stres monitörü ─────────────────────────────────────
export type TelemetryStreamId = 'insole_left' | 'insole_right';

export interface TelemetryPacket {
  streamId: TelemetryStreamId;
  seq: number;
  tsMs: number;
  sizeBytes: number;
}

export type StressStatus = 'healthy' | 'warning' | 'critical';

export interface StressSample {
  packetLossPct: number;
  jitterMs: number;
  bufferMemoryMB: number;
  bufferUsagePct: number;
  status: StressStatus;
  warnings: string[];
}

export function buildTelemetryPacket(streamId: TelemetryStreamId, seq: number, tsMs: number, sizeBytes = 64): TelemetryPacket {
  return { streamId, seq, tsMs, sizeBytes };
}

export class CourtTelemetryStressMonitor {
  private readonly buffer: RingBuffer<TelemetryPacket>;
  private readonly trackers = new Map<TelemetryStreamId, PacketLossTracker>();
  private readonly jitters = new Map<TelemetryStreamId, JitterTracker>();

  constructor(maxBytes = MAX_BUFFER_MEMORY_BYTES) {
    this.buffer = new RingBuffer<TelemetryPacket>(maxBytes, (p) => p.sizeBytes);
    this.trackers.set('insole_left', new PacketLossTracker());
    this.trackers.set('insole_right', new PacketLossTracker());
    this.jitters.set('insole_left', new JitterTracker());
    this.jitters.set('insole_right', new JitterTracker());
  }

  ingest(packet: TelemetryPacket): StressSample {
    this.trackers.get(packet.streamId)?.record(packet.seq, packet.tsMs);
    this.jitters.get(packet.streamId)?.record(packet.tsMs);
    this.buffer.push(packet);
    return this.sample();
  }

  lossPct(streamId: TelemetryStreamId): number {
    return this.trackers.get(streamId)?.lossPct() ?? 0;
  }

  jitterMs(streamId: TelemetryStreamId): number {
    return this.jitters.get(streamId)?.jitterMs() ?? 0;
  }

  memoryBytes(): number {
    return this.buffer.stats().memoryBytes;
  }

  droppedFrames(): number {
    return this.buffer.stats().dropped;
  }

  streamStatus(streamId: TelemetryStreamId): 'healthy' | 'warning' | 'critical' {
    const loss = this.lossPct(streamId);
    if (loss > PACKET_LOSS_CRITICAL_PCT) return 'critical';
    if (loss > PACKET_LOSS_WARN_PCT) return 'warning';
    return 'healthy';
  }

  sample(): StressSample {
    const lossLeft = this.lossPct('insole_left');
    const lossRight = this.lossPct('insole_right');
    const loss = Math.max(lossLeft, lossRight);
    const jitter = Math.max(this.jitterMs('insole_left'), this.jitterMs('insole_right'));
    const stats = this.buffer.stats();
    const memoryMB = Math.round((stats.memoryBytes / (1024 * 1024)) * 100) / 100;
    const usagePct = Math.round((stats.memoryBytes / stats.capacityBytes) * 1000) / 10;

    const warnings: string[] = [];
    if (loss > PACKET_LOSS_WARN_PCT) warnings.push(`Paket kaybı %${loss.toFixed(1)} > %${PACKET_LOSS_WARN_PCT} (ralli kalitesi düşük)`);
    if (stats.dropped > 0) warnings.push(`${stats.dropped} çerçeve bellek sınırı nedeniyle düşürüldü (50MB ring-buffer)`);
    if (usagePct > 90) warnings.push(`Ring-buffer %${usagePct} dolu`);

    let status: StressStatus = 'healthy';
    if (loss > PACKET_LOSS_CRITICAL_PCT) status = 'critical'; // kritik = yüksek kayıp (tam buffer tasarım gereği değil)
    else if (loss > PACKET_LOSS_WARN_PCT || stats.dropped > 0 || usagePct > 90) status = 'warning';

    return {
      packetLossPct: Math.round(loss * 100) / 100,
      jitterMs: jitter,
      bufferMemoryMB: memoryMB,
      bufferUsagePct: usagePct,
      status,
      warnings,
    };
  }
}

export function courtTelemetryStatus(): string {
  return `Kort Stres: 50MB ring-buffer • 2×100Hz • paket kaybı uyarı >%${PACKET_LOSS_WARN_PCT} • jitter takibi`;
}
