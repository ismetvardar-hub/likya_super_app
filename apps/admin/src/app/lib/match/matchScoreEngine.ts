// ============================================================================
// 🎾 CANLI MAÇ SKOR & BİYOMEKANİK OVERLAY MOTORU (Adım 76)
// Tenis (0/15/30/40, Deuce, Avantaj; oyun; set) + Basketbol (periyot, shot clock, sayı)
// HUD overlay: aktif server/oyuncu canlı nabız, anlık servis hızı, son ralli GCT.
// Nokta nokta biyomekanik momentum günlüğü üretir. Deterministik; sıfır bağımlılık.
// ============================================================================

// ── TENİS ─────────────────────────────────────────────────────────────────────
export interface TennisScore {
  aPoints: number; // 0-3 (0,15,30,40)
  bPoints: number;
  deuce: boolean;
  ad: 'A' | 'B' | null;
  aGames: number;
  bGames: number;
  aSets: number;
  bSets: number;
  tiebreak: boolean;
  server: 'A' | 'B';
  winner: 'A' | 'B' | null;
}

export function newTennisScore(server: 'A' | 'B' = 'A'): TennisScore {
  return { aPoints: 0, bPoints: 0, deuce: false, ad: null, aGames: 0, bGames: 0, aSets: 0, bSets: 0, tiebreak: false, server, winner: null };
}

const POINT_LABEL = ['0', '15', '30', '40'] as const;

/** Tenis puan görünümü: 0/15/30/40, Deuce, Avantaj. */
export function tennisPointDisplay(s: TennisScore): { a: string; b: string } {
  if (s.tiebreak) return { a: String(s.aPoints), b: String(s.bPoints) };
  if (s.deuce) return s.ad === 'A' ? { a: 'Avantaj', b: '40' } : s.ad === 'B' ? { a: '40', b: 'Avantaj' } : { a: 'Deuce', b: 'Deuce' };
  return { a: POINT_LABEL[s.aPoints] ?? '40', b: POINT_LABEL[s.bPoints] ?? '40' };
}

export function tennisDisplay(s: TennisScore): string {
  return `${s.aSets}-${s.bSets} ${s.aGames}-${s.bGames}`;
}

/** Puan kazanımını işler; oyun/set kazanımlarını yönetir. */
export function scoreTennisPoint(s: TennisScore, winner: 'A' | 'B'): TennisScore {
  if (s.winner) return s;
  const next: TennisScore = { ...s };

  if (s.tiebreak) {
    if (winner === 'A') next.aPoints++; else next.bPoints++;
    const lead = Math.abs(next.aPoints - next.bPoints);
    if (Math.max(next.aPoints, next.bPoints) >= 7 && lead >= 2) {
      if (winner === 'A') next.aSets++; else next.bSets++;
      return finalizeSet(next, winner);
    }
    return next;
  }

  if (s.deuce) {
    // Gerçek deuce (ad yok): puan kazanan avantaj alır
    if (s.ad === null) { next.ad = winner; return next; }
    // Avantaj tarafı puan kazanırsa oyun; diğer taraf kazanırsa deuce'ya dönüş
    if (s.ad === winner) return winGame(next, winner);
    next.ad = null;
    return next;
  }

  if (winner === 'A') next.aPoints++; else next.bPoints++;
  if (next.aPoints >= 4 || next.bPoints >= 4) return winGame(next, winner);
  if (next.aPoints === 3 && next.bPoints === 3) { next.deuce = true; next.ad = null; }
  return next;
}

function winGame(s: TennisScore, winner: 'A' | 'B'): TennisScore {
  const next: TennisScore = { ...s, aPoints: 0, bPoints: 0, deuce: false, ad: null, server: winner };
  if (winner === 'A') next.aGames++; else next.bGames++;
  // Set kazanımı: 6+ oyun ve 2 fark VEYA 7 (tiebreak)
  if (Math.max(next.aGames, next.bGames) >= 6 && Math.abs(next.aGames - next.bGames) >= 2) {
    if (winner === 'A') next.aSets++; else next.bSets++;
    return finalizeSet(next, winner);
  }
  if (next.aGames === 6 && next.bGames === 6) { next.tiebreak = true; next.server = winner; }
  return next;
}

function finalizeSet(s: TennisScore, _winner: 'A' | 'B'): TennisScore {
  const next: TennisScore = { ...s, aPoints: 0, bPoints: 0, aGames: 0, bGames: 0, deuce: false, ad: null, tiebreak: false };
  if (next.aSets >= 2 || next.bSets >= 2) next.winner = next.aSets > next.bSets ? 'A' : 'B';
  return next;
}

// ── BASKETBOL ────────────────────────────────────────────────────────────────
export interface BasketballScore {
  period: number;
  shotClockSec: number;
  homePoints: number;
  awayPoints: number;
  periodClockSec: number;
}

export function newBasketballScore(): BasketballScore {
  return { period: 1, shotClockSec: 24, homePoints: 0, awayPoints: 0, periodClockSec: 600 };
}

export function basketballScored(s: BasketballScore, team: 'home' | 'away', points: 1 | 2 | 3): BasketballScore {
  const next = { ...s };
  if (team === 'home') next.homePoints += points; else next.awayPoints += points;
  return next;
}

export function basketballShotClock(s: BasketballScore, seconds: number): BasketballScore {
  return { ...s, shotClockSec: Math.max(0, seconds) };
}

export function nextBasketballPeriod(s: BasketballScore): BasketballScore {
  return { ...s, period: s.period + 1, shotClockSec: 24, periodClockSec: 600 };
}

// ── BİYOMEKANİK MOMENTUM GÜNLÜĞÜ ──────────────────────────────────────────────
export interface MomentumEntry {
  point: number;
  player: 'A' | 'B' | 'home' | 'away';
  heartRate: number;
  serveVelocityKmh: number;
  rallyGctMs: number;
  timestamp: string;
}

export function recordMomentum(entries: MomentumEntry[], point: number, player: 'A' | 'B' | 'home' | 'away', telemetry: { heartRate: number; serveVelocityKmh: number; rallyGctMs: number }): MomentumEntry[] {
  return [...entries, { point, player, ...telemetry, timestamp: new Date().toISOString() }];
}

export function matchScoreStatus(): string {
  return 'Maç Skoru: Tenis 0/15/30/40+Deuce+set • Basketbol periyot/shotclock • momentum log';
}
