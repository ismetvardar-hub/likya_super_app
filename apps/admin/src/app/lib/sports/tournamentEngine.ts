// ============================================================================
// 🏆 CANLI TURNUVA & BRAKET MOTORU — Padel/Tenis Tek Eleme + Grup Sistemi
// - Tek Eleme (Single Elimination) ve Grup (Round Robin) braket üretici
// - SportVisionX skorbord entegrasyonu: skor girince üst tura otomatik geçiş
// - Canlı Kulüp Sıralaması: ELO Rating + Leaderboard
// - Mock-first: API yoksa deterministik simülasyonla offline kusursuz çalışır
// ============================================================================

export interface TournamentPlayer {
  id: string;
  name: string;
  level: number;     // 1.0 - 5.0
  elo: number;       // başlangıç 1200
}

export interface BracketMatch {
  id: string;
  round: number;                  // 1=çeyrek, 2=yarı, 3=final (8 kişi tek eleme)
  playerA?: string;
  playerB?: string;
  scoreA?: number;
  scoreB?: number;
  winnerId?: string;
  status: 'PENDING' | 'LIVE' | 'DONE';
}

const DEFAULT_ELO = 1200;

/** Deterministik demo kadrosu */
export function mockTournamentPlayers(): TournamentPlayer[] {
  return [
    { id: 'Efe', name: 'Efe Y.', level: 3.2, elo: 1245 },
    { id: 'Deniz', name: 'Deniz K.', level: 2.8, elo: 1190 },
    { id: 'Mert', name: 'Mert A.', level: 3.6, elo: 1310 },
    { id: 'Ada', name: 'Ada T.', level: 2.5, elo: 1150 },
    { id: 'Can', name: 'Can S.', level: 3.9, elo: 1345 },
    { id: 'Ela', name: 'Ela D.', level: 3.0, elo: 1210 },
    { id: 'Kaan', name: 'Kaan B.', level: 2.2, elo: 1120 },
    { id: 'Zeynep', name: 'Zeynep Ö.', level: 3.4, elo: 1270 },
  ];
}

// ---------------------------------------------------------------------------
// 1. Tek Eleme Braket Üreteci (8 oyuncu → 7 maç)
// ---------------------------------------------------------------------------
export function generateSingleElimBracket(players: TournamentPlayer[], seed = 0): BracketMatch[] {
  const ordered = [...players].sort((a, b) => (a.id.charCodeAt(0) + seed) - (b.id.charCodeAt(0) + seed));
  const picks = ordered.slice(0, 8);
  const bracket: BracketMatch[] = [];
  for (let r = 1; r <= 3; r++) {
    const matchesInRound = 4 / Math.pow(2, r - 1);
    for (let i = 0; i < matchesInRound; i++) {
      const idx = r === 1 ? i * 2 : undefined;
      bracket.push({
        id: `SE-R${r}-M${i + 1}`,
        round: r,
        playerA: r === 1 ? picks[idx!]?.id : undefined,
        playerB: r === 1 ? picks[idx! + 1]?.id : undefined,
        status: 'PENDING',
      });
    }
  }
  return bracket;
}

// ---------------------------------------------------------------------------
// 2. Skor Girişi → Üst Tura Otomatik Geçiş (SportVisionX skorbord entegrasyonu)
// ---------------------------------------------------------------------------
export function recordBracketScore(bracket: BracketMatch[], matchId: string, scoreA: number, scoreB: number): { bracket: BracketMatch[]; advanced: string; match: BracketMatch } {
  const match = bracket.find((m) => m.id === matchId);
  if (!match) throw new Error(`Maç bulunamadı: ${matchId}`);
  if (!match.playerA || !match.playerB) throw new Error('Maçta iki oyuncu olmalı');
  match.scoreA = scoreA;
  match.scoreB = scoreB;
  match.winnerId = scoreA > scoreB ? match.playerA : scoreB > scoreA ? match.playerB : match.playerA;
  match.status = 'DONE';

  // Kazananı üst turdaki maça yerleştir
  const nextRound = match.round + 1;
  const nextIdx = bracket.findIndex((m) => m.round === nextRound);
  if (nextIdx !== -1) {
    const slot = bracket[nextIdx].playerA ? 'playerB' : 'playerA';
    bracket[nextIdx] = { ...bracket[nextIdx], [slot]: match.winnerId, status: 'LIVE' };
  }
  return { bracket: [...bracket], advanced: match.winnerId!, match: { ...match } };
}

// ---------------------------------------------------------------------------
// 3. Grup (Round Robin) Üretici + Puan Tablosu
// ---------------------------------------------------------------------------
export function generateRoundRobinGroup(players: TournamentPlayer[]): BracketMatch[] {
  const matches: BracketMatch[] = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({ id: `RR-${players[i].id}-${players[j].id}`, round: 1, playerA: players[i].id, playerB: players[j].id, status: 'LIVE' });
    }
  }
  return matches;
}

export function roundRobinStandings(players: TournamentPlayer[], matches: BracketMatch[]): { id: string; name: string; played: number; won: number; points: number }[] {
  return players.map((p) => {
    const played = matches.filter((m) => m.playerA === p.id || m.playerB === p.id);
    const won = played.filter((m) => m.winnerId === p.id).length;
    return { id: p.id, name: p.name, played: played.length, won, points: won * 2 };
  }).sort((a, b) => b.points - a.points || b.won - a.won);
}

// ---------------------------------------------------------------------------
// 4. ELO Rating & Canlı Kulüp Sıralaması
// ---------------------------------------------------------------------------
export function eloChange(winner: TournamentPlayer, loser: TournamentPlayer, k = 24): { winner: TournamentPlayer; loser: TournamentPlayer; delta: number } {
  const expected = 1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));
  const delta = Math.round(k * (1 - expected));
  return { winner: { ...winner, elo: winner.elo + delta }, loser: { ...loser, elo: Math.max(800, loser.elo - delta) }, delta };
}

export function buildLeaderboard(players: TournamentPlayer[]): TournamentPlayer[] {
  return [...players].sort((a, b) => b.elo - a.elo || b.level - a.level);
}

export function tournamentEngineStatus(): string {
  return `Turnuva Motoru: Tek Eleme (8) + Round Robin gruplar • ELO ${DEFAULT_ELO} başlangıç`;
}
