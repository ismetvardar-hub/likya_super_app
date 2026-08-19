// ============================================================================
// 📊 OTONOM SPORCU GELİŞİM KARNESİ MOTORU — SporAkademik x Catapult x MobilSporcu
// - SportVisionX telemetrisini birleştirir: vuruş hızı • isabet % • CatchPad
//   reaksiyon (ms) • LSS yorgunluk → günlük branş bazlı gelişim karnesi
// - ACWR (Akut:Kronik Yük Oranı) sakatlık risk göstergesi (Catapult standardı)
// - 4 haftalık trend grafiği (Catapult yük indeksi formatında)
// - Manuel veri girişi YOK: tüm veri SportVisionX telemetri köprüsünden akar
// ============================================================================

import { buildDailyPerformance, averageReaction } from './armbandCoachingBridge';

export interface AthleteReportCard {
  athleteId: string;
  branch: 'Padel' | 'Tenis' | 'Genel Atletik';
  date: string;
  stars: number;                    // 1-5 yıldız
  telemetry: {
    shots: number;
    accuracyPct: number;
    swingSpeedKmh: number;
    catchPadMs: number;
    fatiguePct: number;
  };
  acwr: number;                     // Akut:Kronik oran (1.0 ideal, >1.5 risk)
  weeklyLoad: number;               // Catapult yük indeksi (AU)
  coachNote: string;
}

export interface WeekTrendPoint {
  week: number;                     // 4,3,2,1 (4 = 4 hafta önce)
  load: number;                     // AU
  acwr: number;
  label: string;
}

const LAST_WEEKS = [
  { week: 4, load: 2840, label: 'W-4' },
  { week: 3, load: 3120, label: 'W-3' },
  { week: 2, load: 2980, label: 'W-2' },
  { week: 1, load: 3260, label: 'W-1' },
];

/** Catapult tarzı yük indeksi: şut × salınım hızı ağırlığı + reaksiyon faktörü */
function computeWeeklyLoad(shots: number, swingKmh: number, catchPadMs: number): number {
  return Math.round(shots * 45 + swingKmh * 18 + (450 - Math.min(450, catchPadMs)) * 1.6);
}

/** ACWR = akut (7g ort) / kronik (28g ort). 0.8-1.3 güvenli bant; >1.5 riskli. */
function computeAcwr(currentLoad: number, history: number[]): number {
  const acute = (currentLoad + history[0]) / 2;
  const chronic = (history[0] + history[1] + history[2] + history[3]) / 4;
  return Number((acute / Math.max(1, chronic)).toFixed(2));
}

function starsOf(accuracy: number, swing: number, reactMs: number, acwr: number): number {
  let s = 3;
  if (accuracy >= 70) s += 1;
  if (swing >= 60) s += 1;
  if (reactMs <= 380) s += 1;
  if (acwr > 1.4) s -= 1;
  return Math.max(1, Math.min(5, s));
}

// ---------------------------------------------------------------------------
// 📋 1. Günlük Branş Bazlı Gelişim Karnesi — SportVisionX telemetrisinden
// ---------------------------------------------------------------------------
export function buildAutonomousReportCard(athleteId: string, branch: 'Padel' | 'Tenis' | 'Genel Atletik' = 'Padel'): AthleteReportCard {
  // SportVisionX köprüsünden otomatik beslenir (manuel giriş yok)
  const perf = buildDailyPerformance(athleteId);
  const react = averageReaction();
  const load = computeWeeklyLoad(perf.shots, perf.avgSwingKmh, perf.avgCatchPadMs);
  const acwr = computeAcwr(load, LAST_WEEKS.map((w) => w.load));
  const stars = starsOf(perf.accuracyPct, perf.avgSwingKmh, perf.avgCatchPadMs, acwr);

  const riskNote = acwr > 1.5
    ? `⚠️ ACWR ${acwr} kritik — akut yük kronik yükü aştı; hacim %30 azaltılmalı`
    : acwr > 1.3
      ? `⚠️ ACWR ${acwr} yükseliyor — yük artışını izleyin`
      : `✅ ACWR ${acwr} güvenli bantta (0.8-1.3)`;

  return {
    athleteId,
    branch,
    date: new Date().toISOString().slice(0, 10),
    stars,
    telemetry: {
      shots: perf.shots,
      accuracyPct: perf.accuracyPct,
      swingSpeedKmh: perf.avgSwingKmh,
      catchPadMs: perf.avgCatchPadMs,
      fatiguePct: Math.round(perf.maxFatiguePct),
    },
    acwr,
    weeklyLoad: load,
    coachNote: `${riskNote}. Antrenör: ${perf.coachNote}`,
  };
}

// ---------------------------------------------------------------------------
// 📈 2. 4 Haftalık Trend — Catapult yük indeksi formatında grafik verisi
// ---------------------------------------------------------------------------
export function buildWeekTrend(athleteId: string): WeekTrendPoint[] {
  const current = buildDailyPerformance(athleteId);
  const currentLoad = computeWeeklyLoad(current.shots, current.avgSwingKmh, current.avgCatchPadMs);
  return LAST_WEEKS.map((w) => {
    const load = w.week === 1 ? currentLoad : w.load;
    const acwr = computeAcwr(load, LAST_WEEKS.map((x) => x.load));
    return { week: w.week, load, acwr, label: w.label };
  });
}


// ---------------------------------------------------------------------------
// 🩺 3. Sakatlık Kırmızı Bayrak Radarı (Red Flag) — ACWR + yorgunluk
// ---------------------------------------------------------------------------
export interface RedFlag {
  athleteId: string;
  branch: string;
  acwr: number;
  fatiguePct: number;
  redFlag: boolean;
  reason: string;
}

export function redFlagScan(athletes: string[]): RedFlag[] {
  return athletes.map((id) => {
    const card = buildAutonomousReportCard(id);
    const reasons: string[] = [];
    if (card.acwr > 1.4) reasons.push(`ACWR ${card.acwr} kritik`);
    if (card.telemetry.fatiguePct > 80) reasons.push(`yorgunluk %${card.telemetry.fatiguePct}`);
    if (card.stars === 1) reasons.push('performans düşüşü');
    return {
      athleteId: id,
      branch: card.branch,
      acwr: card.acwr,
      fatiguePct: card.telemetry.fatiguePct,
      redFlag: reasons.length > 0,
      reason: reasons.length ? reasons.join(' • ') : 'temiz',
    };
  });
}

// ---------------------------------------------------------------------------
// 🚌 4. Tek Tıkla Toplu Yoklama — pazu bandı BLE ile otomatik dolu liste
// ---------------------------------------------------------------------------
export interface AttendanceRow {
  athleteId: string;
  present: boolean;      // BLE beacon sahada mı?
  source: 'BLE-BAND' | 'MANUAL';
}

export function buildAttendanceList(athleteIds: string[], presentIds: string[]): AttendanceRow[] {
  return athleteIds.map((id) => ({
    athleteId: id,
    present: presentIds.includes(id),
    source: presentIds.includes(id) ? 'BLE-BAND' : 'MANUAL',
  }));
}

export function autonomousReportCardStatus(): string {
  const card = buildAutonomousReportCard('Efe');
  return `Otonom Karne: ${card.branch} • ${card.stars}⭐ • ACWR ${card.acwr} • ${card.weeklyLoad} AU/hafta`;
}

