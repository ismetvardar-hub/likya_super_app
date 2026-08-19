// ============================================================================
// 📐 DAZE SENTINEL — ROBOFLOW SUPERVISION BÖLGE & ÇİZGİ ANALİZÖRÜ
// Python `supervision` mantığının TypeScript/Canvas uyarlaması:
//   • PolygonZone      : poligon alan içi aktif nesne sayısı + yoğunluk oranı
//   • LineZone         : çizgi geçiş yönü (In/Out) + anlık tetikleme kaydı
//   • DetectionsHeatmap: kamera karesinde nesne koordinatlarından termal ısı
// Deterministik; Plan Z güvenli; asla throw etmez.
// ============================================================================

export interface Point { x: number; y: number }
export interface DetectionBox { id: string; x: number; y: number; w: number; h: number; label: string; confidence: number }

// ── GEOMETRİ YARDIMCILARI ───────────────────────────────────────────────────
/** Noktanın poligon içinde olup olmadığı (ray-casting). */
export function pointInPolygon(p: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = (yi > p.y) !== (yj > p.y) && p.x < ((xj - xi) * (p.y - yi)) / ((yj - yi) || 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function polygonArea(polygon: Point[]): number {
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.abs(area / 2);
}

export function polygonCentroid(polygon: Point[]): Point {
  const cx = polygon.reduce((s, p) => s + p.x, 0) / polygon.length;
  const cy = polygon.reduce((s, p) => s + p.y, 0) / polygon.length;
  return { x: cx, y: cy };
}

// ── POLYGON ZONE ────────────────────────────────────────────────────────────
export interface PolygonZoneResult {
  zoneId: string;
  zoneName: string;
  activeCount: number;
  densityRatio: number;     // 0-1 (aktif / kapasite)
  capacity: number;
  centroid: Point;
  area: number;
  inside: DetectionBox[];
}

export function polygonZoneCount(zoneId: string, zoneName: string, polygon: Point[], detections: DetectionBox[], capacity = 8): PolygonZoneResult {
  const inside = detections.filter((d) => pointInPolygon({ x: d.x + d.w / 2, y: d.y + d.h / 2 }, polygon));
  return {
    zoneId, zoneName,
    activeCount: inside.length,
    densityRatio: capacity > 0 ? Math.round((Math.min(1, inside.length / capacity)) * 100) / 100 : 0,
    capacity, centroid: polygonCentroid(polygon), area: Math.round(polygonArea(polygon) * 10) / 10,
    inside,
  };
}

// ── LINE ZONE (çizgi geçişi In/Out) ─────────────────────────────────────────
export type CrossingDirection = 'IN' | 'OUT';

export interface LineZoneCrossing {
  boxId: string;
  direction: CrossingDirection;
  ts: string;
  triggered: boolean;       // eşiği aşan anlık tetikleme
}

export interface LineZoneState {
  zoneId: string;
  line: [Point, Point];
  crossings: LineZoneCrossing[];
  inCount: number;
  outCount: number;
}

export function lineSide(p: Point, a: Point, b: Point): number {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

/** Çizgiyi geçen nesneyi tespit et (öncesi/sonrası centroid konumundan). */
export function lineZoneTrack(
  state: LineZoneState,
  box: DetectionBox,
  prevCentroid: Point | null,
  now = new Date(),
): LineZoneCrossing | null {
  const cur: Point = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
  if (!prevCentroid) return null;
  const prevSide = lineSide(prevCentroid, state.line[0], state.line[1]);
  const curSide = lineSide(cur, state.line[0], state.line[1]);
  if (prevSide === 0 || curSide === 0 || Math.sign(prevSide) === Math.sign(curSide)) return null;

  const direction: CrossingDirection = curSide > 0 ? 'OUT' : 'IN';
  const crossing: LineZoneCrossing = { boxId: box.id, direction, ts: now.toISOString(), triggered: true };
  state.crossings = [...state.crossings.slice(-49), crossing];
  if (direction === 'IN') state.inCount++;
  else state.outCount++;
  return crossing;
}

// ── DETECTIONS HEATMAP (termal ısı haritası) ────────────────────────────────
export interface HeatmapCell { x: number; y: number; weight: number; count: number }

/** Kare ızgara (grid×grid) üzerinde nesne yoğunluğunu hesaplar. */
export function detectionsHeatmap(detections: DetectionBox[], grid = 8): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      const count = detections.filter((d) => {
        const cx = (d.x + d.w / 2) * grid;
        const cy = (d.y + d.h / 2) * grid;
        return Math.floor(cx) === gx && Math.floor(cy) === gy;
      }).length;
      cells.push({ x: gx, y: gy, weight: count > 0 ? Math.min(1, count / 3) : 0, count });
    }
  }
  return cells;
}

/** Isı hücresi → renk (termal skala: mavi→sarı→kırmızı). */
export function heatColor(weight: number): string {
  if (weight <= 0) return 'rgba(15,23,42,0.25)';
  if (weight < 0.34) return 'rgba(59,130,246,0.55)';
  if (weight < 0.67) return 'rgba(251,191,36,0.6)';
  return 'rgba(239,68,68,0.7)';
}

export function supervisionZonesEngineStatus(): string {
  return 'Supervision Zones [PolygonZone • LineZone In/Out • DetectionsHeatmap]';
}
