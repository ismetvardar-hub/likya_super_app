import { Injectable, BadRequestException } from '@nestjs/common';

export interface GpxPoint {
  lat: number;
  lon: number;
  ele: number;
}

export interface ParsedTrack {
  title: string;
  points: GpxPoint[];
  distanceKm: number;
}

/** Haversine: iki koordinat arası metre. */
export function haversineM(a: GpxPoint, b: GpxPoint): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * GPX (XML) ayrıştırıcı — harici bağımlılık yok.
 * `<trkpt lat=".." lon=".."><ele>..</ele></trkpt>` bloklarını regex ile çıkarır.
 */
@Injectable()
export class GpxParser {
  parse(gpxXml: string): ParsedTrack {
    const points: GpxPoint[] = [];
    const trkptRe = /<trkpt\s+lat="([-\d.]+)"\s+lon="([-\d.]+)"[^>]*>(?:(?!<\/trkpt>)[\s\S])*?<\/trkpt>/g;
    let m: RegExpExecArray | null;
    while ((m = trkptRe.exec(gpxXml)) !== null) {
      const lat = Number(m[1]);
      const lon = Number(m[2]);
      if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
        const eleMatch = /<ele>\s*([-\d.]+)\s*<\/ele>/.exec(m[0]);
        points.push({ lat, lon, ele: eleMatch ? Number(eleMatch[1]) : 0 });
      }
    }

    if (points.length < 2) {
      throw new BadRequestException('GPX dosyasında en az 2 geçerli trkpt noktası olmalı');
    }

    let distanceM = 0;
    for (let i = 1; i < points.length; i++) distanceM += haversineM(points[i - 1], points[i]);

    const nameMatch = /<name>\s*([^<]+?)\s*<\/name>/.exec(gpxXml);
    return {
      title: nameMatch ? nameMatch[1].trim() : 'Likya Yolu Parkuru',
      points,
      distanceKm: Math.round((distanceM / 1000) * 10) / 10,
    };
  }
}
