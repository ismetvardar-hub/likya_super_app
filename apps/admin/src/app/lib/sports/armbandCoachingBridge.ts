// ============================================================================
// 🏃 SPORTVISIONX & KOÇLUK BİYOMETRİ KÖPRÜSÜ — Pazu Bandı x Kamera
// - Kamera BBox ↔ BLE Beacon eşleşmesi (sahada kimlik karışıklığı sıfır)
// - Otomatik seans & yoklama (korta adım atınca başlar)
// - Telemetri analitiği: kol ivmesi • raket salınım hızı • şut sayısı
//   • yorgunluk eşiği • CatchPad reaksiyon süresi
// - Antrenör modu: sahada aktif koçluk süresi + sporcu başına ilgilenme
// - Mock-first: kamera/BLE yoksa deterministik simülasyon üretir
// ============================================================================

import { buildCatchPadMatrix, runReactionRound, reactionAccuracy } from './catchPadReactionEngine';
import { smartArmbandEngineStatus, type ArmbandDevice } from '../hardware/smartArmbandEngine';

export interface PlayerSession {
  playerId: string;          // Sporcu kimliği
  bleUuid: string;           // Eşleşen BLE beacon
  court: string;
  startedAt: string;
  active: boolean;
  attendanceMarked: boolean; // yoklama yazıldı mı
}

export interface TelemetrySample {
  timestamp: number;
  armAccelGs: number;        // kol ivmesi (G)
  swingSpeedKmh: number;     // raket salınım hızı
  shots: number;             // kümülatif şut
  fatiguePct: number;        // yorgunluk eşiği (0-100)
  catchPadMs: number;        // CatchPad reaksiyon süresi
}

export interface CoachingRecord {
  coachId: string;
  court: string;
  activeMinutes: number;
  attentionPerPlayerMin: number; // sporcu başına ilgilenme dk
}

export interface DailyPerformance {
  playerId: string;
  date: string;
  sessionCount: number;
  shots: number;
  accuracyPct: number;       // isabet %
  calories: number;
  avgSwingKmh: number;
  maxFatiguePct: number;
  avgCatchPadMs: number;
  coachNote: string;
}

// ---------------------------------------------------------------------------
// Hafıza + deterministik simülasyon
// ---------------------------------------------------------------------------
let sessions: PlayerSession[] = [];
let samples: TelemetrySample[] = [];
let coaching: CoachingRecord[] = [];

function stamp(): string { return new Date().toISOString(); }

/** Deterministik telemetri simülasyonu — donanım yokken mock-first. */
function simulateSample(shotSeed: number): TelemetrySample {
  const t = Date.now();
  return {
    timestamp: t,
    armAccelGs: Number((2.4 + (shotSeed % 9) * 0.18).toFixed(2)),
    swingSpeedKmh: Number((48 + (shotSeed % 15) * 2.1).toFixed(1)),
    shots: shotSeed,
    fatiguePct: Math.min(100, 18 + shotSeed * 1.7),
    catchPadMs: Math.round(360 + (shotSeed % 7) * 14),
  };
}

// ---------------------------------------------------------------------------
// 📡 1. Kamera BBox ↔ BLE Beacon eşleşmesi — kimlik karışıklığını sıfırla
// ---------------------------------------------------------------------------
export function matchPlayerToBeacon(trackingId: string, bleUuid: string, knownBands: ArmbandDevice[]): { matched: boolean; playerId: string; confidencePct: number } {
  const band = knownBands.find((b) => b.bleUuid === bleUuid);
  if (!band || band.status !== 'ACTIVE') return { matched: false, playerId: trackingId, confidencePct: 0 };
  const confidencePct = Math.min(99, 84 + (trackingId.length % 10));
  return { matched: true, playerId: band.assignedUserId, confidencePct };
}

// ---------------------------------------------------------------------------
// 🏁 2. Otomatik Seans & Yoklama — kort girişinde başlar
// ---------------------------------------------------------------------------
export function startCourtSession(playerId: string, bleUuid: string, court: string): PlayerSession {
  let session = sessions.find((s) => s.playerId === playerId && s.active);
  if (session) return session;
  session = { playerId, bleUuid, court, startedAt: stamp(), active: true, attendanceMarked: true };
  sessions.push(session);
  return session;
}

export function endCourtSession(playerId: string): PlayerSession | undefined {
  const session = sessions.find((s) => s.playerId === playerId && s.active);
  if (session) session.active = false;
  return session;
}

export function listSessions(): PlayerSession[] { return [...sessions]; }


// ---------------------------------------------------------------------------
// 📈 3. Telemetri Analitiği — ivme • salınım • şut • yorgunluk • CatchPad
// ---------------------------------------------------------------------------
export function recordTelemetry(playerId: string, shotSeed: number): TelemetrySample {
  const s = simulateSample(shotSeed);
  samples.push(s);
  if (samples.length > 240) samples.shift();
  return s;
}

export function getTelemetry(): TelemetrySample[] {
  return [...samples];
}

export function fatigueRisk(thresholdPct = 80): { riskActive: boolean; currentPct: number; athletesAtRisk: number } {
  const latest = samples.length ? samples[samples.length - 1] : null;
  const currentPct = latest?.fatiguePct ?? 0;
  return { riskActive: currentPct >= thresholdPct, currentPct, athletesAtRisk: currentPct >= thresholdPct ? 1 : 0 };
}

export function averageReaction(): { avgMs: number; hitRatePct: number; bestMs: number } {
  const pods = buildCatchPadMatrix(6);
  const ms = samples.length ? Math.round(samples.reduce((a, s) => a + s.catchPadMs, 0) / samples.length) : 380;
  const round = runReactionRound(pods[0], ms, 450);
  const acc = reactionAccuracy(pods);
  return { avgMs: ms, hitRatePct: Math.round(acc.hitRate * 100), bestMs: acc.bestMs };
}

// ---------------------------------------------------------------------------
// 🧑‍🏫 4. Antrenör Modu — sahada aktif koçluk + sporcu başına ilgilenme
// ---------------------------------------------------------------------------
export function recordCoaching(coachId: string, court: string, activeMinutes: number, athletesCount: number): CoachingRecord {
  const rec: CoachingRecord = {
    coachId,
    court,
    activeMinutes,
    attentionPerPlayerMin: Number((activeMinutes / Math.max(1, athletesCount)).toFixed(1)),
  };
  coaching.push(rec);
  return rec;
}

export function getCoachingStats(): { sessionsCoached: number; totalMinutes: number; avgAttentionMin: number } {
  const totalMinutes = coaching.reduce((a, c) => a + c.activeMinutes, 0);
  const avgAttentionMin = coaching.length ? totalMinutes / coaching.length : 0;
  return { sessionsCoached: coaching.length, totalMinutes, avgAttentionMin: Number(avgAttentionMin.toFixed(1)) };
}


// ---------------------------------------------------------------------------
// 🗓️ 5. Günün Antrenman Performans Karnesi
// ---------------------------------------------------------------------------
export function buildDailyPerformance(playerId: string): DailyPerformance {
  const latest = samples.length ? samples[samples.length - 1] : simulateSample(24);
  const acc = reactionAccuracy(buildCatchPadMatrix(6));
  return {
    playerId,
    date: new Date().toISOString().slice(0, 10),
    sessionCount: sessions.filter((s) => s.playerId === playerId).length || 1,
    shots: latest.shots,
    accuracyPct: Math.round(52 + (latest.shots % 30) * 1.1),
    calories: Math.round(140 + latest.shots * 5),
    avgSwingKmh: latest.swingSpeedKmh,
    maxFatiguePct: Math.round(latest.fatiguePct),
    avgCatchPadMs: latest.catchPadMs,
    coachNote: latest.fatiguePct > 80 ? 'Yorgunluk eşiği aşıldı — kısa mola ver, hacmi azalt' : 'Formda — teknik çalışma hacmini artırabilirsin',
  };
}

export function armbandCoachingBridgeStatus(): string {
  const live = samples.length ? samples[samples.length - 1] : null;
  const c = getCoachingStats();
  return `Köprü: ${sessions.filter((s) => s.active).length} canlı seans • ${live ? `${live.shots} şut / %${live.fatiguePct} yorgunluk` : 'beklemede'} • ${c.totalMinutes} dk koçluk • ${smartArmbandEngineStatus()}`;
}

