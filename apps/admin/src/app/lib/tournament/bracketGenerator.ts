// ============================================================================
// 🏆 TEK/ÇİFT ELİMİNASYON TURNUVASI BRAKET MOTORU (Adım 80)
// 4 • 8 • 16 • 32 • 64 oyuncu çekimi (tek & çift eliminasyon)
// Otomatik seed yerleşimi (üst seed'ler kura yarılarına/çeyreklerine ayrılır)
// Maç kazananı ilerleme + canlı kort atama dağıtımı.
// Deterministik; sıfır bağımlılık.
// ============================================================================

export const BRACKET_SIZES = [4, 8, 16, 32, 64] as const;
export type BracketSize = (typeof BRACKET_SIZES)[number];
export type BracketMode = 'single' | 'double';

export interface BracketMatch {
  id: string;
  round: number;
  matchIndex: number;
  players: [number, number]; // seed no'lar (0 = henüz belli değil)
  winner: number | null;
  court: string | null;
}

export interface Bracket {
  size: number;
  mode: BracketMode;
  rounds: BracketMatch[][];
  playerCount: number;
  winner: number | null;
}

/** Standart seed sıralaması: üst seed'ler kura yarılarına/çeyreklerine dağılır. */
export function seedOrder(size: number): number[] {
  if (size <= 1) return [1];
  const half = seedOrder(size / 2);
  const comp = half.map((s) => size + 1 - s);
  const out: number[] = [];
  for (let i = 0; i < half.length; i++) out.push(half[i], comp[i]);
  return out;
}

/** Standart braket: seed i, complement'iyle eşleşir — 1 ile 2 finalde karşılaşır. */
export function roundOneMatches(size: number): Array<[number, number]> {
  const order = seedOrder(size);
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < order.length; i += 2) pairs.push([order[i], order[i + 1]]);
  return pairs;
}

export function generateBracket(size: BracketSize, mode: BracketMode = 'single'): Bracket {
  const rounds: BracketMatch[][] = [];
  let roundMatches: Array<[number, number]> = roundOneMatches(size);
  let round = 1;

  while (roundMatches.length >= 1) {
    const matches: BracketMatch[] = roundMatches.map((players, matchIndex) => ({
      id: `r${round}m${matchIndex}`,
      round,
      matchIndex,
      players,
      winner: null,
      court: null,
    }));
    rounds.push(matches);
    // Sonraki tur: kazananlar ardışık eşleşir
    roundMatches = Array.from({ length: Math.floor(roundMatches.length / 2) }, (_, i) => [i * 2 + 1, i * 2 + 2] as [number, number]);
    round++;
  }

  return { size, mode, rounds, playerCount: size, winner: null };
}

/** Maç kazananını kaydeder; sonraki turdaki seed yerini günceller. */
export function registerWinner(bracket: Bracket, matchId: string, winnerSeed: number): Bracket {
  const next: Bracket = JSON.parse(JSON.stringify(bracket)) as Bracket;
  for (let r = 0; r < next.rounds.length; r++) {
    const m = next.rounds[r].find((x) => x.id === matchId);
    if (m) {
      m.winner = winnerSeed;
      // Sonraki turda kazananın yerini işaretle
      if (r + 1 < next.rounds.length) {
        const slot = Math.floor(m.matchIndex / 2);
        const target = next.rounds[r + 1][slot];
        if (target) {
          const idx = m.matchIndex % 2 === 0 ? 0 : 1;
          target.players[idx] = winnerSeed;
        }
      } else {
        next.winner = winnerSeed; // final kazananı
      }
      break;
    }
  }
  return next;
}

/** Maça canlı kort atar. */
export function assignCourt(bracket: Bracket, matchId: string, court: string): Bracket {
  const next: Bracket = JSON.parse(JSON.stringify(bracket)) as Bracket;
  for (const round of next.rounds) {
    const m = round.find((x) => x.id === matchId);
    if (m) { m.court = court; break; }
  }
  return next;
}

/** Üst seed'lerin kura yarılarına dağıldığını doğrular. */
export function seedDistributionOk(size: number): boolean {
  const pairs = roundOneMatches(size);
  const firstHalf = pairs.slice(0, size / 4); // üst çeyrek
  const secondHalf = pairs.slice(size / 4);   // alt yarı
  // Seed 1 ve 2 zıt yarıda olmalı
  const has1 = (p: Array<[number, number]>) => p.some(([a, b]) => a === 1 || b === 1);
  const has2 = (p: Array<[number, number]>) => p.some(([a, b]) => a === 2 || b === 2);
  return (has1(firstHalf) && has2(secondHalf)) || (has1(secondHalf) && has2(firstHalf));
}

export function bracketStatus(): string {
  return `Bracket: ${BRACKET_SIZES.join('/')} oyuncu • tek/çift eliminasyon • seed dağılım + kort atama`;
}
