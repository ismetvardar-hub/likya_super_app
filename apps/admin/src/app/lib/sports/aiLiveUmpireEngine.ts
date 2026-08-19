// ============================================================================
// ⚖️ AI CANLI SAHA HAKEMİ MOTORU — Tenis & Padel için tam otonom hakem
// - Tenis/Padel puanlama: 0-15-30-40, Deuce, Advantage, Game, Set, Tie-break
// - Kural ihlal dedektörü: OUT / FAULT / DOUBLE_BOUNCE / NET_TOUCH / FOOT_FAULT
// - Otonom sesli anons katmanı (Web Speech API + bildirim metinleri)
// - İtiraz & VAR Challenge (karar teyidi)
// - Mock-first: optik/IMU donanımı yoksa deterministik karar simülasyonu
// ============================================================================

export type UmpireViolation = 'OUT' | 'FAULT' | 'DOUBLE_BOUNCE' | 'NET_TOUCH' | 'FOOT_FAULT';

export interface UmpireScore {
  pointsA: number;   // 0-3 (0=Love, 1=15, 2=30, 3=40) ; tie-break'te gerçek puan
  pointsB: number;
  gamesA: number;
  gamesB: number;
  setsA: number;
  setsB: number;
  tieBreak: boolean;
  completed: boolean;
}

export interface Announcement {
  text: string;            // sesli anons metni ("Out!", "15 - Love")
  kind: 'POINT' | 'GAME' | 'SET' | 'MATCH' | 'VIOLATION' | 'CHALLENGE';
  speakerText: string;     // SpeechSynthesis metni
  highlight: string;
}

export interface UmpireDecision {
  id: string;
  violation: UmpireViolation;
  calledAt: string;
  overturned: boolean;
  announcement: Announcement;
}

const POINT_NAMES = ['Love', '15', '30', '40'];
let decisions: UmpireDecision[] = [];
let seq = 1;

function now(): string {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ---------------------------------------------------------------------------
// 1. Puan String'i + Skor Durumu
// ---------------------------------------------------------------------------
export function scoreLabel(s: UmpireScore): { points: string; games: string; sets: string } {
  const points = s.tieBreak
    ? `${s.pointsA}-${s.pointsB} (TB)`
    : s.pointsA >= 3 && s.pointsB >= 3
      ? s.pointsA === s.pointsB ? 'Deuce' : s.pointsA > s.pointsB ? `Advantage A` : `Advantage B`
      : `${POINT_NAMES[s.pointsA] ?? s.pointsA} - ${POINT_NAMES[s.pointsB] ?? s.pointsB}`;
  return { points, games: `${s.gamesA}-${s.gamesB}`, sets: `${s.setsA}-${s.setsB}` };
}

// ---------------------------------------------------------------------------
// 2. Sayı Kaydı → Game / Set / Tie-break akışı + sesli anons
// ---------------------------------------------------------------------------
export function pointScored(score: UmpireScore, winner: 'A' | 'B', playerA = 'A', playerB = 'B'): { score: UmpireScore; announcement: Announcement } {
  const s: UmpireScore = { ...score };
  const winnerName = winner === 'A' ? playerA : playerB;

  if (s.tieBreak) {
    s[winner === 'A' ? 'pointsA' : 'pointsB'] += 1;
    const a = s.pointsA, b = s.pointsB;
    if ((a >= 7 || b >= 7) && Math.abs(a - b) >= 2) {
      const setWinner = a > b ? 'A' : 'B';
      s[setWinner === 'A' ? 'setsA' : 'setsB'] += 1;
      s.pointsA = 0; s.pointsB = 0; s.gamesA = 0; s.gamesB = 0; s.tieBreak = false;
      return { score: s, announcement: { text: `Tie-break ${a}-${b} — Set: ${setWinner === 'A' ? playerA : playerB}`, kind: 'SET', speakerText: `Tie break ${a}-${b}. Set ${setWinner === 'A' ? playerA : playerB}`, highlight: 'set' } };
    }
    return { score: s, announcement: { text: `Tie-break ${a}-${b}`, kind: 'POINT', speakerText: `Tie break ${a}-${b}`, highlight: 'tb' } };
  }

  s[winner === 'A' ? 'pointsA' : 'pointsB'] += 1;
  const a = s.pointsA, b = s.pointsB;
  const gameOver = (a >= 4 || b >= 4) && Math.abs(a - b) >= 2;
  if (gameOver) {
    const gameWinner = a > b ? 'A' : 'B';
    s[gameWinner === 'A' ? 'gamesA' : 'gamesB'] += 1;
    s.pointsA = 0; s.pointsB = 0;

    if (s.gamesA >= 6 && s.gamesB >= 6) {
      s.tieBreak = true;
      return { score: s, announcement: { text: `Oyun: ${gameWinner === 'A' ? playerA : playerB} — 6-6, Tie-break`, kind: 'GAME', speakerText: `Game ${gameWinner === 'A' ? playerA : playerB}. Six all. Tie break.`, highlight: 'tb' } };
    }
    const setOver = (s.gamesA >= 6 || s.gamesB >= 6) && Math.abs(s.gamesA - s.gamesB) >= 2;
    if (setOver) {
      const setWinner = s.gamesA > s.gamesB ? 'A' : 'B';
      s[setWinner === 'A' ? 'setsA' : 'setsB'] += 1;
      if (s.setsA === 2 || s.setsB === 2) {
        return { score: s, announcement: { text: `Oyun, Set, Maç: ${setWinner === 'A' ? playerA : playerB} 🏆 (${s.setsA}-${s.setsB})`, kind: 'MATCH', speakerText: `Game, set and match ${setWinner === 'A' ? playerA : playerB}`, highlight: 'match' } };
      }
      return { score: s, announcement: { text: `Set: ${setWinner === 'A' ? playerA : playerB} ${s.gamesA}-${s.gamesB}`, kind: 'SET', speakerText: `Set ${setWinner === 'A' ? playerA : playerB}`, highlight: 'set' } };
    }
    return { score: s, announcement: { text: `Oyun: ${gameWinner === 'A' ? playerA : playerB}`, kind: 'GAME', speakerText: `Game ${gameWinner === 'A' ? playerA : playerB}`, highlight: 'game' } };
  }

  const label = scoreLabel(s).points;
  const text = a === b && a >= 3 ? 'Deuce' : label;
  return { score: s, announcement: { text, kind: 'POINT', speakerText: text, highlight: 'point' } };
}


// ---------------------------------------------------------------------------
// 3. Kural İhlal Dedektörü → Sesli Anons
// ---------------------------------------------------------------------------
export function callViolation(violation: UmpireViolation, detail = ''): Announcement {
  const map: Record<UmpireViolation, { text: string; speak: string }> = {
    OUT: { text: 'OUT!', speak: 'Out!' },
    FAULT: { text: 'FAULT! (Servis dışı)', speak: 'Fault!' },
    DOUBLE_BOUNCE: { text: 'ÇİFT SEKME! (Double Bounce)', speak: 'Double bounce.' },
    NET_TOUCH: { text: 'FİLEYE TEMAS! (Net Touch)', speak: 'Net touch.' },
    FOOT_FAULT: { text: 'AYAK ÇİZGİ İHLALİ! (Foot Fault)', speak: 'Foot fault.' },
  };
  const m = map[violation];
  return { text: detail ? `${m.text} — ${detail}` : m.text, kind: 'VIOLATION', speakerText: `${m.speak}${detail ? ` ${detail}` : ''}`, highlight: 'violation' };
}

// ---------------------------------------------------------------------------
// 4. İtiraz & VAR Challenge — karar teyidi (3D pozisyon incelemesi)
// ---------------------------------------------------------------------------
export function resolveChallenge(violation: UmpireViolation, evidenceMarginMm: number): { upheld: boolean; announcement: Announcement; decision: UmpireDecision } {
  const overturned = violation === 'OUT' && Math.abs(evidenceMarginMm) < 8;
  const decision: UmpireDecision = {
    id: `UMP-${String(seq++).padStart(3, '0')}`,
    violation,
    calledAt: now(),
    overturned,
    announcement: overturned
      ? { text: 'İTİRAZ KABUL — Karar değişti: IN (içeride)', kind: 'CHALLENGE', speakerText: 'Challenge upheld. The ball was in.', highlight: 'challenge' }
      : { text: `İtiraz Reddedildi — ${callViolation(violation).text} doğrulandı`, kind: 'CHALLENGE', speakerText: 'Challenge rejected.', highlight: 'challenge' },
  };
  decisions.unshift(decision);
  if (decisions.length > 12) decisions.pop();
  return { upheld: overturned, announcement: decision.announcement, decision };
}

export function getUmpireDecisions(): UmpireDecision[] {
  return [...decisions];
}

export function aiUmpireStatus(): string {
  return `AI Hakem: ${decisions.length} karar • canlı skor + sesli anons + VAR challenge aktif`;
}

// ---------------------------------------------------------------------------
// 5. Web Speech API — otonom sesli anons (tarayıcıda ses yoksa mock)
// ---------------------------------------------------------------------------
export function speakAnnouncement(a: Announcement): void {
  if (typeof window === 'undefined') return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  const utter = new SpeechSynthesisUtterance(a.speakerText);
  utter.lang = 'en-US';
  utter.rate = 0.95;
  synth.speak(utter);
}

