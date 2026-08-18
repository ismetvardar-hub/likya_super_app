import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, Row } from '../../core/database/database.module';
import { GpxParser } from './gpx.parser';
import { CreateSosDto, NearbyPoisQuery, UploadGpxDto } from './dto/trail.dto';

export interface TrailPoi extends Row {
  id: string;
  name: string;
  category: string;
  description: string;
  distance_m: number;
}

export interface TrackRow extends Row {
  id: string;
  title: string;
  difficulty: string;
  distance_km: number;
  created_at: string;
}

export interface PointRow extends Row {
  seq: number;
  lat: number;
  lon: number;
  ele: number;
}

/** Likya Yolu & Doğa modülü — GPS/Harita (PostGIS). */
@Injectable()
export class TrailService {
  constructor(
    private readonly db: DatabaseService,
    private readonly parser: GpxParser,
  ) {}

  /** POI yakınlık sorgusu: ST_DWithin + ST_DistanceSphere (metre). */
  async nearbyPois(query: NearbyPoisQuery): Promise<TrailPoi[]> {
    const radius = query.radius ?? 5000;
    return this.db.query<TrailPoi>(
      `SELECT id, name, category, description,
              ST_DistanceSphere(geom, ST_SetSRID(ST_MakePoint($2, $1), 4326)) AS distance_m
         FROM trail_pois
        WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint($2, $1), 4326), $3)
        ORDER BY distance_m ASC
        LIMIT 50`,
      [query.lat, query.lng, radius],
    );
  }

  /** GPX yükle: parse → track + iz noktalarını PostGIS'e yaz. */
  async uploadGpx(dto: UploadGpxDto, userId: string) {
    const parsed = this.parser.parse(dto.gpx_xml);
    const difficulty = dto.difficulty ?? 'orta';

    const tracks = await this.db.query<TrackRow>(
      `INSERT INTO gpx_tracks (title, difficulty, distance_km, gpx_xml, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, title, difficulty, distance_km, created_at`,
      [parsed.title, difficulty, parsed.distanceKm, dto.gpx_xml, userId],
    );
    const trackId = String(tracks[0].id);

    // Toplu nokta yazımı (tek sorguda VALUES listesi)
    const values: string[] = [];
    const params: unknown[] = [trackId];
    parsed.points.forEach((p, i) => {
      const base = i * 4 + 2;
      values.push(`($1, $${base}, ST_SetSRID(ST_MakePoint($${base + 1}, $${base + 2}), 4326), $${base + 3})`);
      params.push(i, p.lon, p.lat, p.ele);
    });
    await this.db.query(
      `INSERT INTO gpx_track_points (track_id, seq, geom, ele) VALUES ${values.join(', ')}`,
      params,
    );

    return { ...tracks[0], id: trackId, points: parsed.points.length };
  }

  /** Track + GeoJSON FeatureCollection olarak noktalar. */
  async getTrack(id: string) {
    const tracks = await this.db.query<TrackRow>('SELECT id, title, difficulty, distance_km, created_at FROM gpx_tracks WHERE id = $1', [id]);
    if (tracks.length === 0) throw new NotFoundException('Parkur bulunamadı');

    const points = await this.db.query<PointRow>(
      `SELECT seq, ST_Y(geom) AS lat, ST_X(geom) AS lon, ele
         FROM gpx_track_points WHERE track_id = $1 ORDER BY seq ASC`,
      [id],
    );

    return {
      track: tracks[0],
      geojson: {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            properties: { name: tracks[0].title, distance_km: tracks[0].distance_km },
            geometry: {
              type: 'LineString' as const,
              coordinates: points.map((p) => [p.lon, p.lat]),
            },
          },
        ],
      },
    };
  }

  /** Acil durum SOS: koordinat + mesaj → status open. */
  async createSos(userId: string, dto: CreateSosDto) {
    const rows = await this.db.query<Row>(
      `INSERT INTO sos_alerts (user_id, geom, message)
       VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4)
       RETURNING id, status, created_at`,
      [userId, dto.lng, dto.lat, dto.message],
    );
    return { ...rows[0], ack: 'Likya arama-kurtarma ekibine iletildi' };
  }
}
