// ============================================================================
// 🗺️ COURT GEO ENGINE — akıllı kort geospatial motoru (MapLibre GL konsepti)
// Saf SVG/geo matematik: ekvirektangular projeksiyon, çokgen geofence testleri,
// GEOFENCE_ENTER/EXIT geçiş takibi ve IoT donanım durum rozetleri.
// Bileşen: src/modules/facility/CourtGeospatialMap.tsx — bu motoru kullanır.
// Deterministik; sıfır bağımlılık; node-runnable (test edilebilir).
// ============================================================================

// ── Tesis sınırları (Likya bölgesi, yerel ölçek) ──────────────────────────────
export const FACILITY_BOUNDS = {
  minLng: 29.64,
  maxLng: 29.68,
  minLat: 36.19,
  maxLat: 36.23,
} as const;

export interface MapBounds {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

/** Ekvirektangular projeksiyon: lat/lng → SVG x/y. */
export function projectLngLatToMap(
  lat: number,
  lng: number,
  width = 1000,
  height = 600,
  bounds: MapBounds = FACILITY_BOUNDS,
): { x: number; y: number } {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * height;
  return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
}

// ── Tesis düzeni: Kort 1-8 + Spor Salonu + Soyunma Odaları ────────────────────
export type FacilityKind = 'court' | 'gym' | 'locker';

export interface FacilityItem {
  id: string;
  name: string;
  kind: FacilityKind;
  lat: number;
  lng: number;
  w: number; // SVG genişlik
  h: number; // SVG yükseklik
}

export const FACILITY_ITEMS: FacilityItem[] = [
  { id: 'c1', name: 'Kort 1', kind: 'court', lat: 36.221, lng: 29.651, w: 120, h: 70 },
  { id: 'c2', name: 'Kort 2', kind: 'court', lat: 36.221, lng: 29.6545, w: 120, h: 70 },
  { id: 'c3', name: 'Kort 3', kind: 'court', lat: 36.221, lng: 29.658, w: 120, h: 70 },
  { id: 'c4', name: 'Kort 4', kind: 'court', lat: 36.221, lng: 29.6615, w: 120, h: 70 },
  { id: 'c5', name: 'Kort 5', kind: 'court', lat: 36.2188, lng: 29.651, w: 120, h: 70 },
  { id: 'c6', name: 'Kort 6', kind: 'court', lat: 36.2188, lng: 29.6545, w: 120, h: 70 },
  { id: 'c7', name: 'Kort 7', kind: 'court', lat: 36.2188, lng: 29.658, w: 120, h: 70 },
  { id: 'c8', name: 'Kort 8', kind: 'court', lat: 36.2188, lng: 29.6615, w: 120, h: 70 },
  { id: 'gym', name: 'Spor Salonu', kind: 'gym', lat: 36.2165, lng: 29.66, w: 140, h: 80 },
  { id: 'lockers', name: 'Soyunma Odaları', kind: 'locker', lat: 36.216, lng: 29.649, w: 90, h: 60 },
];

/** Kort düzenini SVG boyutuna projekte eder (bileşen için). */
export function projectFacilityLayout(width = 1000, height = 600, bounds: MapBounds = FACILITY_BOUNDS): Array<FacilityItem & { x: number; y: number }> {
  return FACILITY_ITEMS.map((f) => ({ ...f, ...projectLngLatToMap(f.lat, f.lng, width, height, bounds) }));
}

// ── Geofence çokgen bölgeleri ─────────────────────────────────────────────────
export interface GeoZone {
  id: string;
  name: string;
  polygon: Array<[number, number]>; // [lat, lng] köşe listesi
}

export const COURT_ZONES: GeoZone[] = [
  {
    id: 'court-area',
    name: 'Kort Alanı',
    polygon: [
      [36.223, 29.6495], [36.223, 29.6635], [36.217, 29.6635], [36.217, 29.6495],
    ],
  },
  {
    id: 'facility',
    name: 'Tesis Çevresi',
    polygon: [
      [36.2255, 29.647], [36.2255, 29.666], [36.214, 29.666], [36.214, 29.647],
    ],
  },
];

/** Ray-casting nokta-çokgen testi (nokta bölge içinde mi?). */
export function pointInPolygon(lat: number, lng: number, polygon: Array<[number, number]>): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];
    const intersect = (lngI > lng) !== (lngJ > lng) && lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI;
    if (intersect) inside = !inside;
  }
  return inside;
}

export interface ZoneMembership {
  zoneId: string;
  zoneName: string;
  inside: boolean;
}

/** Sporcunun hangi bölgelerde olduğunu döndürür. */
export function locateAthlete(lat: number, lng: number, zones: GeoZone[] = COURT_ZONES): ZoneMembership[] {
  return zones.map((z) => ({ zoneId: z.id, zoneName: z.name, inside: pointInPolygon(lat, lng, z.polygon) }));
}

export type GeofenceEventKind = 'ENTER' | 'EXIT' | null;

export interface GeofenceTransition {
  athleteId: string;
  zoneId: string;
  event: GeofenceEventKind;
}

/** Geofence geçiş takibi: bölge durum değişimlerinde ENTER/EXIT üretir. */
export class GeofenceTracker {
  private state = new Map<string, string>(); // athleteId → zoneId

  check(athleteId: string, lat: number, lng: number, zones: GeoZone[] = COURT_ZONES): GeofenceTransition {
    const previous = this.state.get(athleteId);
    const memberships = locateAthlete(lat, lng, zones);
    const inside = memberships.filter((m) => m.inside).sort((a, b) => a.zoneId.localeCompare(b.zoneId));
    // En spesifik (alfabetik ilk) bölgeyi seç
    const current = inside.length > 0 ? inside[0].zoneId : 'outside';

    let event: GeofenceEventKind = null;
    if (previous === undefined) {
      this.state.set(athleteId, current);
    } else if (previous === 'outside' && current !== 'outside') {
      event = 'ENTER';
      this.state.set(athleteId, current);
    } else if (previous !== 'outside' && current === 'outside') {
      event = 'EXIT';
      this.state.set(athleteId, current);
    } else if (previous !== current) {
      event = 'ENTER'; // bölge değişimi
      this.state.set(athleteId, current);
    }
    return { athleteId, zoneId: current, event };
  }

  reset(): void {
    this.state.clear();
  }
}

// ── IoT donanım durumları ─────────────────────────────────────────────────────
export type IotStatus = 'online' | 'offline' | 'warning';
export type IotKind = 'ble-hub' | 'locker-lock' | 'camera';

export interface IotDevice {
  id: string;
  kind: IotKind;
  name: string;
  lat: number;
  lng: number;
  status: IotStatus;
}

export function iotStatusColor(status: IotStatus): string {
  switch (status) {
    case 'online': return '#10B981';
    case 'warning': return '#F27A1A';
    default: return '#F43F5E';
  }
}

export const IOT_DEVICES: IotDevice[] = [
  { id: 'ble-1', kind: 'ble-hub', name: 'BLE Hub A', lat: 36.222, lng: 29.653, status: 'online' },
  { id: 'ble-2', kind: 'ble-hub', name: 'BLE Hub B', lat: 36.222, lng: 29.66, status: 'online' },
  { id: 'locker-1', kind: 'locker-lock', name: 'Akıllı Dolap 1', lat: 36.216, lng: 29.6495, status: 'online' },
  { id: 'locker-2', kind: 'locker-lock', name: 'Akıllı Dolap 2', lat: 36.2161, lng: 29.6493, status: 'warning' },
  { id: 'cam-1', kind: 'camera', name: 'Kamera 1', lat: 36.2225, lng: 29.657, status: 'online' },
  { id: 'cam-2', kind: 'camera', name: 'Kamera 2', lat: 36.217, lng: 29.655, status: 'offline' },
];

export function projectIotDevices(width = 1000, height = 600, bounds: MapBounds = FACILITY_BOUNDS): Array<IotDevice & { x: number; y: number }> {
  return IOT_DEVICES.map((d) => ({ ...d, ...projectLngLatToMap(d.lat, d.lng, width, height, bounds) }));
}

export function courtGeoStatus(): string {
  return `Court Geo: ${FACILITY_ITEMS.length} tesis • ${COURT_ZONES.length} geofence • ${IOT_DEVICES.length} IoT cihaz`;
}

