// ============================================================================
// 🌍 GLOBAL ÇOK-BÖLGELİ EDGE TELEMETRİ REPLİKATÖRÜ (Adım 148)
// Aktif-aktif / çok-bölgeli edge veritabanı replikasyon yönlendiricisi: 100Hz
// canlı kort telemetrisini coğrafi olarak en yakın edge erişim noktasına (FRA1,
// IST1, DUB1) yönlendirir. Çapraz bölge replikasyon gecikmesi ve paket sıralaması
// Conflict-Free Replicated Data Types (CRDT — LWW register) ile çözülür.
// Saf/deterministik; sıfır bağımlılık.
// ============================================================================

export type EdgeRegion = 'FRA1' | 'IST1' | 'DUB1';
export const EDGE_REGIONS: EdgeRegion[] = ['FRA1', 'IST1', 'DUB1'];

export interface TelemetryPacket {
  streamId: string; // seans + tabanlık
  seq: number;
  tsMs: number;
  payload: Record<string, number>;
}

export const EDGE_REGION_COORDS: Record<EdgeRegion, { lat: number; lng: number }> = {
  FRA1: { lat: 50.11, lng: 8.68 },
  IST1: { lat: 41.01, lng: 28.98 },
  DUB1: { lat: 25.2, lng: 55.27 },
};

// ── Haversine mesafe (km) ────────────────────────────────────────────────────
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

export function nearestEdgeRegion(lat: number, lng: number): EdgeRegion {
  let nearest: EdgeRegion = EDGE_REGIONS[0];
  let minKm = Infinity;
  for (const region of EDGE_REGIONS) {
    const { lat: rl, lng: rlg } = EDGE_REGION_COORDS[region];
    const km = haversineKm(lat, lng, rl, rlg);
    if (km < minKm) {
      minKm = km;
      nearest = region;
    }
  }
  return nearest;
}

export function replicationLatencyMs(from: EdgeRegion, to: EdgeRegion): number {
  const a = EDGE_REGION_COORDS[from];
  const b = EDGE_REGION_COORDS[to];
  const km = haversineKm(a.lat, a.lng, b.lat, b.lng);
  return Math.max(0, Math.round(km / 200)); // ~200 km/ms fiber yaklaşımı
}

// ── CRDT: LWW (Last-Writer-Wins) register — anahtar başına tek değer ─────────
export interface LwwEntry {
  value: Record<string, number>;
  tsMs: number;
  nodeId: string;
}

export class CrLwwRegister {
  private readonly entries = new Map<string, LwwEntry>();

  set(key: string, value: Record<string, number>, tsMs: number, nodeId: string): void {
    const existing = this.entries.get(key);
    if (!existing || tsMs > existing.tsMs || (tsMs === existing.tsMs && nodeId > existing.nodeId)) {
      this.entries.set(key, { value: { ...value }, tsMs, nodeId });
    }
  }

  get(key: string): LwwEntry | null {
    return this.entries.get(key) ?? null;
  }

  entriesCount(): number {
    return this.entries.size;
  }

  snapshot(): Map<string, LwwEntry> {
    return new Map(this.entries);
  }
}

// ── Telemetri CRDT deposu (anahtar = streamId:seq) ───────────────────────────
export class TelemetryCrdtStore {
  private readonly register = new CrLwwRegister();
  private readonly nodeId: string;

  constructor(nodeId = 'edge') {
    this.nodeId = nodeId;
  }

  apply(packet: TelemetryPacket, nodeId = this.nodeId): void {
    this.register.set(`${packet.streamId}:${packet.seq}`, packet.payload, packet.tsMs, nodeId);
  }

  get(streamId: string, seq: number): LwwEntry | null {
    return this.register.get(`${streamId}:${seq}`);
  }

  packetCount(): number {
    return this.register.entriesCount();
  }

  // Birleştirme: diğer depoyla LWW union (çakışmalar tsMs ile çözülür)
  merge(other: TelemetryCrdtStore): void {
    for (const [key, entry] of Array.from(other.register.snapshot().entries())) {
      const existing = this.register.get(key);
      if (!existing || entry.tsMs > existing.tsMs || (entry.tsMs === existing.tsMs && entry.nodeId > existing.nodeId)) {
        this.register.set(key, entry.value, entry.tsMs, entry.nodeId);
      }
    }
  }

  // Sıralı paket listesi (tsMs'ye göre) + sıra dışı tespiti
  orderedPackets(): { sorted: { streamId: string; seq: number; tsMs: number }[]; outOfOrder: number } {
    const all = Array.from(this.register.snapshot().entries()).map(([key, entry]) => {
      const [streamId, seqStr] = key.split(':');
      return { streamId, seq: Number(seqStr), tsMs: entry.tsMs };
    });
    const sorted = [...all].sort((a, b) => a.tsMs - b.tsMs || a.seq - b.seq);
    let outOfOrder = 0;
    let lastSeq = -1;
    for (const p of sorted) {
      if (p.seq < lastSeq) outOfOrder++;
      lastSeq = p.seq;
    }
    return { sorted, outOfOrder };
  }
}

// ── Edge telemetri replikatörü ───────────────────────────────────────────────
export class EdgeTelemetryReplicator {
  private readonly regionStores = new Map<EdgeRegion, TelemetryCrdtStore>();
  private readonly packets = new Map<string, TelemetryPacket>(); // key streamId:seq

  constructor() {
    for (const region of EDGE_REGIONS) this.regionStores.set(region, new TelemetryCrdtStore(`edge-${region}`));
  }

  ingest(packet: TelemetryPacket, region: EdgeRegion): void {
    this.regionStores.get(region)?.apply(packet, `edge-${region}`);
    this.packets.set(`${packet.streamId}:${packet.seq}`, packet);
  }

  routeToNearest(packet: TelemetryPacket, lat: number, lng: number): EdgeRegion {
    const region = nearestEdgeRegion(lat, lng);
    this.ingest(packet, region);
    return region;
  }

  // Aktif-aktif: paketi tüm bölgelere yay (LWW çakışmaları çözer)
  replicateToAll(packet: TelemetryPacket, sourceRegion: EdgeRegion): void {
    for (const region of EDGE_REGIONS) {
      this.regionStores.get(region)?.apply(packet, `edge-${sourceRegion}`);
    }
    this.packets.set(`${packet.streamId}:${packet.seq}`, packet);
  }

  regionCount(region: EdgeRegion): number {
    return this.regionStores.get(region)?.packetCount() ?? 0;
  }

  // Tutarlılık: tüm bölgeler aynı paket sayısına ulaşmalı
  consistencyCheck(): { totalPackets: number; regions: Record<EdgeRegion, number>; maxDivergence: number; consistent: boolean } {
    const regions = { FRA1: this.regionCount('FRA1'), IST1: this.regionCount('IST1'), DUB1: this.regionCount('DUB1') };
    const totalPackets = this.packets.size;
    const maxDivergence = Math.max(...Object.values(regions)) - Math.min(...Object.values(regions));
    return { totalPackets, regions, maxDivergence, consistent: maxDivergence === 0 };
  }

  resolveConflicts(): { merged: number; canonical: TelemetryCrdtStore } {
    const canonical = new TelemetryCrdtStore('canonical');
    for (const store of Array.from(this.regionStores.values())) canonical.merge(store);
    return { merged: canonical.packetCount(), canonical };
  }
}

export function edgeReplicatorStatus(): string {
  return `Edge Repl.: ${EDGE_REGIONS.join('/')} • haversine yönlendirme • CRDT LWW + merge + sıralama`;
}

