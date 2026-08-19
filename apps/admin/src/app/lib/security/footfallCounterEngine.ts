// ============================================================================
// 👣 DAZE SENTINEL — FOOTFALL COUNTER & OCCUPANCY ENGINE
// Çift yönlü sanal geçiş çizgisi (LineZone) ile IN/OUT kişi sayımı + anlık net
// doluluk (Current Occupancy). Doluluk %85'i aştığında dazeMarketMakerEngine'e
// talep artış sinyali gönderir. Deterministik; Plan Z güvenli.
// ============================================================================

import { lineSide, type Point, type LineZoneState } from './supervisionZonesEngine';
import { quoteProduct } from '../ops/dazeMarketMakerEngine';
import { emit } from '../ops/dazeHubEventBus';

export interface ZoneOccupancy {
  zoneId: string;
  zoneName: string;
  capacity: number;
  current: number;          // aktif içerideki
  occupancyPct: number;     // 0-100
  over85: boolean;          // talep sinyali tetiklendi mi
  inToday: number;
  outToday: number;
}

export interface FootfallConfig {
  zoneId: string;
  zoneName: string;
  capacity: number;
  line: [Point, Point];
}

/** LineZone üzerinden çift yönlü geçiş tespiti + doluluk güncelleme. */
export function countFootfall(cfg: FootfallConfig, state: LineZoneState, crossing: { boxId: string; direction: 'IN' | 'OUT'; prev: Point; cur: Point }): ZoneOccupancy & { crossingDetected: boolean } {
  const prevSide = lineSide(crossing.prev, cfg.line[0], cfg.line[1]);
  const curSide = lineSide(crossing.cur, cfg.line[0], cfg.line[1]);
  const detected = prevSide !== 0 && curSide !== 0 && Math.sign(prevSide) !== Math.sign(curSide);

  let current = state.inCount - state.outCount;
  let inToday = state.inCount;
  let outToday = state.outCount;
  if (detected) {
    if (crossing.direction === 'IN') { inToday++; current++; } else { outToday++; current = Math.max(0, current - 1); }
  }

  const occupancyPct = cfg.capacity > 0 ? Math.round((Math.min(current, cfg.capacity) / cfg.capacity) * 100) : 0;
  const over85 = occupancyPct > 85;

  if (over85) {
    // Doluluk %85 → dazeMarketMakerEngine'e talep artış sinyali (fiyat prim senaryosu)
    void quoteProduct({ productClass: cfg.zoneName.includes('Kort') ? 'kort' : cfg.zoneName.includes('Glamping') ? 'glamping' : 'restoran', symbol: cfg.zoneId, name: cfg.zoneName, basePrice: 100, occupancy: occupancyPct / 100, stockRisk: 0.6, demandVelocity: 18 });
    emit('ORDER_PLACED', { orderId: `OCC-${cfg.zoneId}-${Date.now().toString(36)}`, item: `${cfg.zoneName} talep artışı`, amount: 1, source: 'footfall-engine' });
  }

  return {
    zoneId: cfg.zoneId,
    zoneName: cfg.zoneName,
    capacity: cfg.capacity,
    current,
    occupancyPct,
    over85,
    inToday,
    outToday,
    crossingDetected: detected,
  };
}

/** Doluluk istatistiği (saf hesaplama — geçişsiz). */
export function occupancySnapshot(zoneId: string, zoneName: string, capacity: number, current: number): ZoneOccupancy {
  const occupancyPct = capacity > 0 ? Math.round((Math.min(current, capacity) / capacity) * 100) : 0;
  return { zoneId, zoneName, capacity, current, occupancyPct, over85: occupancyPct > 85, inToday: current, outToday: 0 };
}

export function footfallCounterEngineStatus(): string {
  return 'Footfall & Doluluk [LineZone IN/OUT • net doluluk • %85 → market maker talep sinyali]';
}
