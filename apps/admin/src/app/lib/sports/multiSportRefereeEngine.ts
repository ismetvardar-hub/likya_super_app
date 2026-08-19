// ============================================================================
// 🏛️ EVRENSEL ÇOK BRANŞLI AI CANLI HAKEM SİSTEMİ
// TENNIS • PADEL • FOOTBALL • BASKETBALL • VOLLEYBALL
// - Branş kuralları + puanlama motorları (GLT, Ofsayt, Şut Saati, Set 25, ...)
// - Branşlar arası dinamik geçiş (Sport Selector)
// - Çok dilli ve branşa özel sesli anons (Web Speech API)
// - Mock-first: donanım yoksa deterministik karar simülasyonu
// ============================================================================

import { pointScored as tennisPoint, scoreLabel as tennisLabel, callViolation as tennisViolation, type UmpireScore, type Announcement } from './aiLiveUmpireEngine';

export type SupportedSport = 'TENNIS' | 'PADEL' | 'FOOTBALL' | 'BASKETBALL' | 'VOLLEYBALL';

export const SPORT_LIST: { id: SupportedSport; icon: string; label: string }[] = [
  { id: 'TENNIS', icon: '🎾', label: 'Tenis' },
  { id: 'PADEL', icon: '🏓', label: 'Padel' },
  { id: 'FOOTBALL', icon: '⚽', label: 'Futbol' },
  { id: 'BASKETBALL', icon: '🏀', label: 'Basketbol' },
  { id: 'VOLLEYBALL', icon: '🏐', label: 'Voleybol' },
];

// ---------------------------------------------------------------------------
// Branş bazlı durum şemaları
// ---------------------------------------------------------------------------
export interface FootballState {
  homeGoals: number;
  awayGoals: number;
  minute: number;
  stoppage: number;
  glt: 'GOAL' | 'NO_GOAL' | null;   // Gol çizgisi teknolojisi
  offside: boolean;
  yellowCards: number;
  redCards: number;
}

export interface BasketballState {
  homePts: number;
  awayPts: number;
  period: number;
  shotClock: number;           // 24s / 14s
  threePts: number;            // toplam 3 sayılık
  fouls: number;
  bonusFoul: boolean;
  steps: boolean;
}

export interface VolleyballState {
  homePts: number;
  awayPts: number;
  homeSets: number;
  awaySets: number;
  doubleTouch: boolean;
}

export interface MultiSportRefereeState {
  sport: SupportedSport;
  homeName: string;
  awayName: string;
  football?: FootballState;
  basketball?: BasketballState;
  volleyball?: VolleyballState;
  racket?: UmpireScore;
}

// ---------------------------------------------------------------------------
// 1. Maç Başlatma (branş bazlı)
// ---------------------------------------------------------------------------
export function initMultiSportMatch(sport: SupportedSport, homeName = 'Ev Sahibi', awayName = 'Deplasman'): MultiSportRefereeState {
  const base = { sport, homeName, awayName };
  switch (sport) {
    case 'FOOTBALL':
      return { ...base, football: { homeGoals: 0, awayGoals: 0, minute: 0, stoppage: 0, glt: null, offside: false, yellowCards: 0, redCards: 0 } };
    case 'BASKETBALL':
      return { ...base, basketball: { homePts: 0, awayPts: 0, period: 1, shotClock: 24, threePts: 0, fouls: 0, bonusFoul: false, steps: false } };
    case 'VOLLEYBALL':
      return { ...base, volleyball: { homePts: 0, awayPts: 0, homeSets: 0, awaySets: 0, doubleTouch: false } };
    case 'TENNIS':
    case 'PADEL':
      return { ...base, racket: { pointsA: 0, pointsB: 0, gamesA: 0, gamesB: 0, setsA: 0, setsB: 0, tieBreak: false, completed: false } };
  }
}

// ---------------------------------------------------------------------------
// 2. Branş Skor Olayları
// ---------------------------------------------------------------------------
export type MultiSportEvent =
  | 'GOAL_HOME' | 'GOAL_AWAY' | 'GLT_CHECK' | 'OFFSIDE_CALL' | 'YELLOW_CARD' | 'RED_CARD' | 'MINUTE_TICK'
  | 'TWO_PT_HOME' | 'THREE_PT_HOME' | 'TWO_PT_AWAY' | 'THREE_PT_AWAY' | 'SHOT_CLOCK_14' | 'SHOT_CLOCK_RESET' | 'STEPS_CALL' | 'FOUL_CALL'
  | 'POINT_HOME' | 'POINT_AWAY'
  | 'RACKET_HOME' | 'RACKET_AWAY';

export function scoreEvent(state: MultiSportRefereeState, evt: MultiSportEvent): { state: MultiSportRefereeState; announcement: Announcement } {
  const sport = state.sport;
  const A = state.homeName;
  const B = state.awayName;

  // -------- FUTBOL --------
  if (sport === 'FOOTBALL' && state.football) {
    const f = { ...state.football };
    let text = '';
    let kind: Announcement['kind'] = 'POINT';
    switch (evt) {
      case 'GOAL_HOME': f.homeGoals += 1; text = `⚽ GOL! ${A} ${f.homeGoals}-${f.awayGoals}`; kind = 'POINT'; break;
      case 'GOAL_AWAY': f.awayGoals += 1; text = `⚽ GOL! ${B} ${f.homeGoals}-${f.awayGoals}`; kind = 'POINT'; break;
      case 'GLT_CHECK': f.glt = f.glt === 'GOAL' ? 'NO_GOAL' : 'GOAL'; text = f.glt === 'GOAL' ? 'GOL ÇİZGİSİ: GOAL ✅ (top çizgiyi geçti)' : 'GOL ÇİZGİSİ: NO_GOAL ❌ (top çizgiyi geçmedi)'; kind = 'VIOLATION'; break;
      case 'OFFSIDE_CALL': f.offside = true; text = 'YARI-OTOMATİK OFSAYT: OFFSIDE 🚩 — gol iptal'; kind = 'VIOLATION'; break;
      case 'YELLOW_CARD': f.yellowCards += 1; text = `🟨 Sarı Kart — ${f.yellowCards}. sarı`; kind = 'VIOLATION'; break;
      case 'RED_CARD': f.redCards += 1; text = '🟥 Kırmızı Kart! Oyun 10 kişi kaldı'; kind = 'VIOLATION'; break;
      case 'MINUTE_TICK': f.minute = Math.min(90, f.minute + 1); text = `${f.minute}. dakika`; kind = 'POINT'; break;
    }
    return { state: { ...state, football: f }, announcement: { text, kind, speakerText: text, highlight: kind === 'VIOLATION' ? 'violation' : 'point' } };
  }

  // -------- BASKETBOL --------
  if (sport === 'BASKETBALL' && state.basketball) {
    const b = { ...state.basketball };
    let text = '';
    let kind: Announcement['kind'] = 'POINT';
    switch (evt) {
      case 'TWO_PT_HOME': b.homePts += 2; text = `🏀 2 sayı — ${A} ${b.homePts}-${b.awayPts}`; break;
      case 'THREE_PT_HOME': b.homePts += 3; b.threePts += 1; text = `🏀 3 SAYI! 🎯 ${A} ${b.homePts}-${b.awayPts}`; break;
      case 'TWO_PT_AWAY': b.awayPts += 2; text = `🏀 2 sayı — ${B} ${b.homePts}-${b.awayPts}`; break;
      case 'THREE_PT_AWAY': b.awayPts += 3; b.threePts += 1; text = `🏀 3 SAYI! 🎯 ${B} ${b.homePts}-${b.awayPts}`; break;
      case 'SHOT_CLOCK_14': b.shotClock = 14; text = '⏱️ Şut saati 14 saniyeye indirildi'; break;
      case 'SHOT_CLOCK_RESET': b.shotClock = 24; text = '⏱️ Şut saati sıfırlandı (24s)'; break;
      case 'STEPS_CALL': b.steps = true; text = '🚶 HATALI YÜRÜME (STEPS)! Top kaybı'; kind = 'VIOLATION'; break;
      case 'FOUL_CALL':
        b.fouls += 1;
        b.bonusFoul = b.fouls >= 5;
        text = b.bonusFoul ? `💥 ${b.fouls}. Faul — BONUS! Serbest atış` : `🦵 ${b.fouls}. Faul kaydedildi`;
        kind = 'VIOLATION';
        break;
    }
    return { state: { ...state, basketball: b }, announcement: { text, kind, speakerText: text, highlight: kind === 'VIOLATION' ? 'violation' : 'point' } };
  }


  // -------- VOLEYBOL --------
  if (sport === 'VOLLEYBALL' && state.volleyball) {
    const v = { ...state.volleyball };
    let text = '';
    let kind: Announcement['kind'] = 'POINT';
    if (evt === 'POINT_HOME' || evt === 'POINT_AWAY') {
      const home = evt === 'POINT_HOME';
      if (home) v.homePts += 1; else v.awayPts += 1;
      const setOver = (v.homePts >= 25 || v.awayPts >= 25) && Math.abs(v.homePts - v.awayPts) >= 2;
      if (setOver) {
        if (home) v.homeSets += 1; else v.awaySets += 1;
        v.homePts = 0; v.awayPts = 0;
        text = `🏐 SET: ${home ? A : B} ${v.homeSets}-${v.awaySets}`;
        kind = 'SET';
      } else {
        text = `🏐 Puan — ${home ? A : B} ${v.homePts}-${v.awayPts}`;
      }
    }
    return { state: { ...state, volleyball: v }, announcement: { text, kind, speakerText: text, highlight: kind === 'SET' ? 'set' : 'point' } };
  }

  // -------- TENİS / PADEL --------
  if ((sport === 'TENNIS' || sport === 'PADEL') && state.racket) {
    const winner = evt === 'RACKET_HOME' ? 'A' : 'B';
    const r = tennisPoint(state.racket, winner, A, B);
    return { state: { ...state, racket: r.score }, announcement: r.announcement };
  }

  return { state, announcement: { text: 'Bilinmeyen olay', kind: 'POINT', speakerText: '', highlight: 'point' } };
}


// ---------------------------------------------------------------------------
// 3. Branşa Özel Kural İhlalleri
// ---------------------------------------------------------------------------
export type MultiSportViolation = 'OUT' | 'FAULT' | 'OFFSIDE' | 'STEPS' | 'DOUBLE_TOUCH' | 'NET_TOUCH';

export function callMultiViolation(sport: SupportedSport, violation: MultiSportViolation, detail = ''): Announcement {
  const tr: Record<MultiSportViolation, string> = {
    OUT: 'OUT! (Dışarıda)',
    FAULT: 'FAULT! (Servis hatası)',
    OFFSIDE: 'OFSAYT! (Offside)',
    STEPS: 'HATALI YÜRÜME! (Steps)',
    DOUBLE_TOUCH: 'ÇİFT VURUŞ! (Double Touch)',
    NET_TOUCH: 'FİLEYE TEMAS! (Net Touch)',
  };
  const text = detail ? `${tr[violation]} — ${detail}` : tr[violation];
  return { text, kind: 'VIOLATION', speakerText: text, highlight: 'violation' };
}

// ---------------------------------------------------------------------------
// 4. Çok Dilli / Branşa Özel Sesli Anons
// ---------------------------------------------------------------------------
export function multiSportAnnounce(announcement: Announcement, lang: 'tr' | 'en' = 'en'): void {
  if (typeof window === 'undefined') return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  const utter = new SpeechSynthesisUtterance(announcement.speakerText);
  utter.lang = lang;
  utter.rate = 0.95;
  synth.speak(utter);
}

export function multiSportRefereeStatus(sport: SupportedSport): string {
  const s = SPORT_LIST.find((x) => x.id === sport);
  return `Evrensel AI Hakem: ${s?.label} aktif • 5 branş • GLT + Ofsayt + Şut Saati + Set 25 destekli`;
}

