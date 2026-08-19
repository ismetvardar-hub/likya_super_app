// ============================================================================
// 🏆 SPORTVISIONX LIVE PERFORMANCE HUB — 6 bölgeli canlı ekran motoru
// Kinetik • Biyomekanik • Fizyolojik • Kıyas • Koordinasyon • Yorgunluk
// - Canlı süre/zamanlayıcı, sporcu ve maç bilgisi
// - Mevcut sensör motorlarından beslenir (telemetri + spor bilimi + tabanlık)
// - Mock-first: donanım bağlı değilse deterministik canlı simülasyon
// ============================================================================

export interface LiveHubAthlete {
  name: string;
  date: string;
  time: string;
  sessionType: string;
  coach: string;
}

export interface LiveHubKinetic {
  speedKmh: number;
  topSpeedKmh: number;
  accelerationMps2: number;
  jumpCm: number;
  flightMs: number;
}

export interface LiveHubInsole {
  forefootPct: number;
  heelPct: number;
}

export interface LiveHubPhysiology {
  heartRate: number;
  heartZone: string;
  avgHeartRate: number;
  energyPct: number;
  hrvRmssd: number;
}

export interface LiveHubComparison {
  gctMs: number;
  gctTargetMs: number;
  rsi: number;
  rsiClass: string;
}

export interface LiveHubCoordination {
  armSpeedKmh: number;
  racketAngleDeg: number;
  shots: number;
  serves: number;
  forehands: number;
}

export interface LiveHubFatigue {
  injuryRisk: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK';
  riskSafe: boolean;
  performanceDropPct: number;
  gctLengthenPct: number;
}

export interface LivePerformanceHubSnapshot {
  athlete: LiveHubAthlete;
  elapsed: { h: string; m: string; s: string };
  kinetic: LiveHubKinetic;
  insole: LiveHubInsole;
  physiology: LiveHubPhysiology;
  comparison: LiveHubComparison;
  coordination: LiveHubCoordination;
  fatigue: LiveHubFatigue;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// 1. Canlı Hub Anlık Görüntüsü (deterministik simülasyon)
// ---------------------------------------------------------------------------
let tick = 0;

export function generateLiveHubSnapshot(seed = 0): LivePerformanceHubSnapshot {
  tick += 1;
  const s = tick + seed;

  // Maç süresi 00:42:15 (her tick +3 sn simüle)
  const totalSec = 2535 + tick * 3;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;

  return {
    athlete: { name: 'Arda G.', date: new Date().toLocaleDateString('tr-TR'), time: '18:30', sessionType: 'Tenis Maçı (3 Set)', coach: 'Caner B.' },
    elapsed: { h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(sec).padStart(2, '0') },
    kinetic: {
      speedKmh: Number((18 + (s % 7) * 1.4).toFixed(1)),       // 18-27
      topSpeedKmh: Number((21 + (s % 6) * 1.5).toFixed(1)),
      accelerationMps2: Number((4.6 + (s % 5) * 0.6).toFixed(1)), // 4.6-7.0
      jumpCm: Number((32 + (s % 8) * 2).toFixed(1)),             // 32-46
      flightMs: 370 + (s % 9) * 10,                               // 370-450
    },
    insole: { forefootPct: 74 + (s % 7) * 2, heelPct: 26 - (s % 6) },
    physiology: {
      heartRate: 158 + (s % 8) * 3,
      heartZone: 'Zon 4',
      avgHeartRate: 158 + (s % 6),
      energyPct: Math.max(55, 90 - (s % 12)),
      hrvRmssd: 37 + (s % 5),
    },
    comparison: {
      gctMs: 182 + (s % 7) * 4,     // 182-206
      gctTargetMs: 200,
      rsi: Number((1.9 + (s % 6) * 0.12).toFixed(2)),  // 1.9-2.5
      rsiClass: 'Elit',
    },
    coordination: {
      armSpeedKmh: 90 + (s % 8) * 2,
      racketAngleDeg: 116 + (s % 6) * 2,
      shots: 130 + (s % 13),
      serves: 18 + (s % 5),
      forehands: 62 + (s % 9),
    },
    fatigue: {
      injuryRisk: (s % 6) === 0 ? 'ORTA' : 'DÜŞÜK',
      riskSafe: (s % 6) !== 0,
      performanceDropPct: 2 + (s % 5),
      gctLengthenPct: 8 + (s % 7),
    },
    timestamp: Date.now(),
  };
}

export function livePerformanceHubStatus(): string {
  return 'SportVisionX Live Hub: 6 bölge • süre • sporcu • canlı risk hazır';
}
