// ============================================================================
// 🎲 ETKİLEŞİMLİ TAKTİK MAÇ SİMÜLATÖRÜ & MONTE CARLO RALLİ TAHMİNCİ (Adım 132)
// Olasılıksal taktik motor: oyuncunun hız splitleri, servis tutarlılığı ve
// yorgunluk azalma hızına dayalı 1000 Monte Carlo maç simülasyonu çalıştırır.
// Spesifik rakip arketiplerine (Baseline Grinder / Big Server / All-Court
// Attacker) karşı kazanma olasılığını öngörür ve kazanma olasılığını
// maksimize eden optimal taktik vuruş seçimini üretir. Saf/deterministik.
// ============================================================================

export type OpponentArchetype = 'baseline_grinder' | 'big_server' | 'all_court_attacker';

export interface ArchetypeProfile {
  label: string;
  description: string;
  servePressure: number;  // 0-1 rakip servis baskısı
  speedMatchup: number;   // 0-1 hız eşleşme çarpanı
  rallyLength: number;    // ortalama ralli uzunluğu çarpanı
}

export const OPPONENT_ARCHETYPES: Record<OpponentArchetype, ArchetypeProfile> = {
  baseline_grinder: { label: 'Baseline Grinder', description: 'Uzun ralliler, sabit geri dönüşler', servePressure: 0.35, speedMatchup: 0.9, rallyLength: 1.4 },
  big_server: { label: 'Big Server', description: 'Güçlü servis, kısa puanlar', servePressure: 0.8, speedMatchup: 1.0, rallyLength: 0.7 },
  all_court_attacker: { label: 'All-Court Attacker', description: 'Her bölgeden atak, hızlı oyun', servePressure: 0.55, speedMatchup: 1.15, rallyLength: 0.9 },
};

export interface PlayerProfile {
  speedQuicknessMs: number;   // 20m sprint (ms)
  serveFirstInPct: number;    // 0-100 ilk servis yüzdesi
  serveWinsPct: number;       // 0-100 servis oyunu kazanma
  fatigueDecayVelocity: number; // 0-100 set başına performans düşüşü
  aggressionLevel: number;    // 0-100 agresiflik
}

export interface MatchSimulationResult {
  playerSets: number;
  opponentSets: number;
  winner: 'player' | 'opponent';
  rallies: number;
}

export interface MonteCarloResult {
  winPct: number;          // 0-100
  simulations: number;
  playerWins: number;
  opponentWins: number;
  avgRallies: number;
}

export interface ShotStrategy {
  id: string;
  label: string;
  description: string;
  aggressionBonus: number; // puan başına kazanma olasılığı bonusu (0-0.2)
  fatigueCost: number;     // ralli başına yorgunluk maliyeti
}

export const SHOT_STRATEGIES: ShotStrategy[] = [
  { id: 'aggressive_baseline', label: 'Agresif Taban Çizgisi', description: 'Derin ve sert zemin vuruşları', aggressionBonus: 0.08, fatigueCost: 0.08 },
  { id: 'serve_volley', label: 'Servis-Vole', description: 'Servis sonrası fileye yaklaş', aggressionBonus: 0.06, fatigueCost: 0.12 },
  { id: 'steady_tempo', label: 'Sabit Tempo', description: 'Riski düşük, sürekli tempo', aggressionBonus: 0.02, fatigueCost: 0.02 },
];

// ── Deterministik RNG (mulberry32) ───────────────────────────────────────────
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Puan kazanma olasılığı (servis + hız + yorgunluk + strateji + arketip) ────
export function pointWinProbability(player: PlayerProfile, archetype: OpponentArchetype, strategy: ShotStrategy, rallyIndex: number): number {
  const profile = OPPONENT_ARCHETYPES[archetype];
  const serveFactor = (player.serveFirstInPct / 100) * 0.08 + (player.serveWinsPct / 100) * 0.1;
  const speedScore = (3800 - player.speedQuicknessMs) / 800; // 0-1
  const speedFactor = speedScore * 0.12 * profile.speedMatchup;
  const fatiguePenalty = (player.fatigueDecayVelocity / 100) * 0.18 * Math.min(1, rallyIndex / 40) * profile.rallyLength;
  const strategyBonus = strategy.aggressionBonus - strategy.fatigueCost * 0.25;
  const opponentServePressure = profile.servePressure * 0.05;
  const raw = 0.42 + serveFactor + speedFactor + strategyBonus - fatiguePenalty - opponentServePressure;
  return Math.max(0.05, Math.min(0.95, raw));
}

// ── Oyun / set / maç simülasyonu (best of 3) ─────────────────────────────────
function simulateGame(player: PlayerProfile, archetype: OpponentArchetype, strategy: ShotStrategy, rng: () => number): 'player' | 'opponent' {
  let p = 0;
  let o = 0;
  let rally = 0;
  while (Math.abs(p - o) < 2 || (p < 4 && o < 4)) {
    rally++;
    const prob = pointWinProbability(player, archetype, strategy, rally);
    if (rng() < prob) p++;
    else o++;
    if (p >= 4 && o <= p - 2) return 'player';
    if (o >= 4 && p <= o - 2) return 'opponent';
    if (rally > 30) return p > o ? 'player' : 'opponent';
  }
  return p > o ? 'player' : 'opponent';
}

function simulateSet(player: PlayerProfile, archetype: OpponentArchetype, strategy: ShotStrategy, rng: () => number): { playerGames: number; opponentGames: number; rallies: number } {
  let pg = 0;
  let og = 0;
  let rallies = 0;
  while (true) {
    if (rng() < 0.5) {
      pg++;
      rallies += 8;
    } else {
      og++;
      rallies += 8;
    }
    if ((pg >= 6 || og >= 6) && Math.abs(pg - og) >= 2) break;
    if (pg === 6 && og === 6) { pg++; break; } // tiebreak yaklaşımı
    if (pg + og > 12) break;
  }
  return { playerGames: pg, opponentGames: og, rallies };
}

export function simulateMatch(player: PlayerProfile, archetype: OpponentArchetype, rng: () => number, strategy: ShotStrategy = SHOT_STRATEGIES[0]): MatchSimulationResult {
  let playerSets = 0;
  let opponentSets = 0;
  let rallies = 0;
  while (playerSets < 2 && opponentSets < 2) {
    const set = simulateSet(player, archetype, strategy, rng);
    rallies += set.rallies;
    if (set.playerGames > set.opponentGames) playerSets++;
    else opponentSets++;
  }
  return { playerSets, opponentSets, winner: playerSets > opponentSets ? 'player' : 'opponent', rallies };
}

// ── Monte Carlo: N maç simülasyonu → kazanma yüzdesi ────────────────────────
export function runMonteCarlo(player: PlayerProfile, archetype: OpponentArchetype, simulations = 1000, rng: () => number = Math.random, strategy: ShotStrategy = SHOT_STRATEGIES[0]): MonteCarloResult {
  let playerWins = 0;
  let rallies = 0;
  for (let i = 0; i < simulations; i++) {
    const result = simulateMatch(player, archetype, rng, strategy);
    if (result.winner === 'player') playerWins++;
    rallies += result.rallies;
  }
  return {
    winPct: Math.round((playerWins / simulations) * 1000) / 10,
    simulations,
    playerWins,
    opponentWins: simulations - playerWins,
    avgRallies: Math.round(rallies / simulations),
  };
}

// ── Optimal taktik vuruş seçimi (strateji karşılaştırma) ────────────────────
export interface StrategyComparison {
  strategy: ShotStrategy;
  winPct: number;
}

export function optimalShotSelection(player: PlayerProfile, archetype: OpponentArchetype, simulations = 200, rng: () => number = Math.random): { best: StrategyComparison; baseline: number; upliftPct: number; perStrategy: StrategyComparison[] } {
  const perStrategy = SHOT_STRATEGIES.map((s) => {
    const mc = runMonteCarlo(player, archetype, simulations, rng, s);
    return { strategy: s, winPct: mc.winPct };
  });
  const best = perStrategy.reduce((a, b) => (b.winPct > a.winPct ? b : a));
  const baseline = runMonteCarlo(player, archetype, simulations, rng, SHOT_STRATEGIES[0]).winPct;
  return { best, baseline, upliftPct: Math.round((best.winPct - baseline) * 10) / 10, perStrategy };
}

export function monteCarloMatchStatus(): string {
  return `Monte Carlo: 1000 maç • ${Object.keys(OPPONENT_ARCHETYPES).length} rakip arketipi • ${SHOT_STRATEGIES.length} strateji • optimal vuruş seçimi`;
}

