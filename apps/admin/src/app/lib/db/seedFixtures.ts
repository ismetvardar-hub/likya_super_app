// ============================================================================
// 🌱 DETERMİNİSTİK SEED FİKSTÜRLERİ (Adım 48) — offline CI & geliştirme verisi
// Junior/Pro sporcu profilleri, çok haftalık seans günlükleri ve simüle
// sakatlık bayrakları — aynı seed → aynı veri (mulberry32 PRNG).
// SQL tarafı: supabase/schema.sql + supabase/seed.sql (INSERT örnekleri).
// ============================================================================

// ── Deterministik PRNG (mulberry32) ───────────────────────────────────────────
export function seedRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface FixtureSquad { id: string; name: string; coachId: string; level: 'junior' | 'pro'; }
export interface FixtureAthlete {
  id: string; userId: string; fullName: string; birthDate: string; gender: 'M' | 'F';
  squadId: string; heightCm: number; weightKg: number;
}
export interface FixtureSession {
  id: string; athleteId: string; coachId: string; sessionDate: string; durationSec: number;
  trimp: number; acwr: number; avgHr: number; avgGctMs: number; avgRsi: number; injuryRiskLevel: 'low' | 'medium' | 'high';
}
export interface FixtureGrowthRecord { id: string; athleteId: string; recordedDate: string; heightCm: number; weightKg: number; shoeSize: number; }
export interface FixtureInjuryAlert { id: string; sessionId: string; athleteId: string; alertType: string; severity: 'low' | 'medium' | 'high' | 'critical'; triggerMetric: string; }
export interface FixtureTelemetryFrame { sessionId: string; timestampMs: number; hr: number; gctMs: number; rsi: number; toePressure: number; heelPressure: number; armVelocity: number; loadingRate: number; }

export interface SeedFixtureSet {
  squads: FixtureSquad[];
  athletes: FixtureAthlete[];
  sessions: FixtureSession[];
  growthRecords: FixtureGrowthRecord[];
  injuryAlerts: FixtureInjuryAlert[];
  telemetryFrames: FixtureTelemetryFrame[];
  parentLinks: { parentUserId: string; athleteId: string }[];
}

const U = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const WEEKS = 6;
const SESSIONS_PER_ATHLETE = 2;

/** Deterministik seed verisi üretir. */
export function buildSeedFixtures(seed = 2026): SeedFixtureSet {
  const rand = seedRandom(seed);
  const squads: FixtureSquad[] = [
    { id: U(101), name: 'Junior Gelişim', coachId: U(11), level: 'junior' },
    { id: U(102), name: 'Pro Performans', coachId: U(12), level: 'pro' },
  ];
  const athletes: FixtureAthlete[] = [
    { id: U(201), userId: U(21), fullName: 'Efe Yılmaz', birthDate: '2012-03-14', gender: 'M', squadId: U(101), heightCm: 148.5, weightKg: 38.2 },
    { id: U(202), userId: U(22), fullName: 'Zeynep Kaya', birthDate: '2011-07-22', gender: 'F', squadId: U(101), heightCm: 152.0, weightKg: 42.1 },
    { id: U(203), userId: U(23), fullName: 'Mert Demir', birthDate: '2010-11-05', gender: 'M', squadId: U(101), heightCm: 155.3, weightKg: 45.7 },
    { id: U(204), userId: U(24), fullName: 'Elif Şahin', birthDate: '2012-01-30', gender: 'F', squadId: U(101), heightCm: 146.9, weightKg: 36.4 },
    { id: U(205), userId: U(25), fullName: 'Arda Aksoy', birthDate: '2006-05-18', gender: 'M', squadId: U(102), heightCm: 181.2, weightKg: 74.8 },
    { id: U(206), userId: U(26), fullName: 'Deniz Kurt', birthDate: '2007-09-09', gender: 'F', squadId: U(102), heightCm: 170.5, weightKg: 61.3 },
  ];

  const sessions: FixtureSession[] = [];
  const growthRecords: FixtureGrowthRecord[] = [];
  const injuryAlerts: FixtureInjuryAlert[] = [];
  const telemetryFrames: FixtureTelemetryFrame[] = [];
  const parentLinks = athletes.slice(0, 4).map((a, i) => ({ parentUserId: U(31 + i), athleteId: a.id }));

  for (const a of athletes) {
    const isPro = a.squadId === U(102);
    for (let w = 0; w < WEEKS; w++) {
      for (let s = 0; s < SESSIONS_PER_ATHLETE; s++) {
        const sid = U(4000 + athletes.indexOf(a) * 100 + w * 10 + s);
        const trimp = Math.round((isPro ? 90 : 60) + rand() * (isPro ? 90 : 50));
        const durationSec = Math.round((isPro ? 90 : 60) * 60 + rand() * 1800);
        const avgGctMs = Number((200 + rand() * 40).toFixed(1));
        const avgRsi = Number((isPro ? 1.9 : 1.5 + rand() * 0.5).toFixed(2));
        // Simüle sakatlık bayrağı: 3. haftada Arda'da yüksek GCT + düşük RSI
        const flagged = a.id === U(205) && w === 2;
        sessions.push({
          id: sid,
          athleteId: a.id,
          coachId: isPro ? U(12) : U(11),
          sessionDate: `2026-${String(3 + w).padStart(2, '0')}-${String(1 + s * 3).padStart(2, '0')}`,
          durationSec,
          trimp,
          acwr: Number((0.7 + rand() * 0.9).toFixed(2)),
          avgHr: Math.round(isPro ? 148 : 138 + rand() * 10),
          avgGctMs,
          avgRsi,
          injuryRiskLevel: flagged ? 'high' : avgGctMs > 225 ? 'medium' : 'low',
        });
        // Telemetri örnekleri (seans başına 12 çerçeve)
        for (let t = 0; t < 12; t++) {
          telemetryFrames.push({
            sessionId: sid,
            timestampMs: t * 5000,
            hr: Math.round(135 + rand() * 45),
            gctMs: Number((avgGctMs + rand() * 20).toFixed(1)),
            rsi: Number(Math.max(0.5, avgRsi + rand() * 0.3).toFixed(2)),
            toePressure: Math.round(55 + rand() * 35),
            heelPressure: Math.round(25 + rand() * 30),
            armVelocity: Number((70 + rand() * 80).toFixed(1)),
            loadingRate: Number((1.5 + rand() * 1.2).toFixed(2)),
          });
        }
        if (flagged) {
          injuryAlerts.push({
            id: U(5000 + sessions.length),
            sessionId: sid,
            athleteId: a.id,
            alertType: 'GCT uzaması + RSI düşüşü',
            severity: 'high',
            triggerMetric: `avg_gct_ms ${avgGctMs} / avg_rsi ${avgRsi}`,
          });
        }
      }
    }
    // Büyüme kayıtları (aylık)
    for (let m = 0; m < 3; m++) {
      growthRecords.push({
        id: U(6000 + athletes.indexOf(a) * 10 + m),
        athleteId: a.id,
        recordedDate: `2026-0${2 + m}-15`,
        heightCm: Number((a.heightCm + m * 0.6).toFixed(1)),
        weightKg: Number((a.weightKg + m * 0.4).toFixed(1)),
        shoeSize: Math.round((a.gender === 'M' ? 39 : 36) + rand() * 4),
      });
    }
  }

  return { squads, athletes, sessions, growthRecords, injuryAlerts, telemetryFrames, parentLinks };
}

/** Tek satırda seed özeti (UI/CI gösterimi). */
export function seedFixturesSummary(set: SeedFixtureSet): string {
  return `Seed: ${set.squads.length} takım • ${set.athletes.length} sporcu • ${set.sessions.length} seans • ${set.telemetryFrames.length} telemetri • ${set.injuryAlerts.length} sakatlık • ${set.growthRecords.length} büyüme`;
}

