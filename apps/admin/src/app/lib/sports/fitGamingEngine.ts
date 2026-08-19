// ============================================================================
// 🎮 FIT-GAMING & OYUNLAŞTIRMA KATMANI — CatchPad x Efor x Rozetler
// - Dinamik XP: CatchPad reaksiyon süresi + antrenman eforu
// - Ligler: Bronz → Gümüş → Altın → Elit Lig
// - Rozetler (Badges) + "Hız Şampiyonu" / "Reaksiyon Kralı" liderlik tablosu
// - Daze Chef ödül kuponu üretimi (Smoothie / Meyve Kasesi)
// ============================================================================

export type League = 'Bronz' | 'Gümüş' | 'Altın' | 'Elit Lig';

export interface GamerProfile {
  athleteId: string;
  xp: number;
  league: League;
  badges: string[];
  bestReactionMs: number;
  topSpeedKmh: number;
}

export interface LeaderRow {
  athleteId: string;
  value: number;
  league: League;
}

const LEAGUE_XP: Record<League, number> = { Bronz: 0, 'Gümüş': 300, 'Altın': 750, 'Elit Lig': 1400 };

const BADGES = {
  FAST_HAND: '🔥 Hızlı El (CatchPad <380ms)',
  CANNON_ARM: '🚀 Top Kovanı (Vuruş >90 km/s)',
  IRON_MAN: '🦾 Demir Adam (7 gün seri)',
  PRECISION: '🎯 Keskin Nişancı (İsabet >%75)',
};

// ---------------------------------------------------------------------------
// 1. Dinamik XP Hesaplama + Seviye/ Lig
// ---------------------------------------------------------------------------
export function addFitXp(profile: GamerProfile, reactionMs: number, effortScore: number, speedKmh: number, accuracyPct: number): GamerProfile {
  // Reaksiyon + Efor + Hız + İsabet tabanlı XP
  const xpGain = Math.max(5, Math.round((450 - Math.min(450, reactionMs)) * 0.2 + effortScore * 0.5 + (speedKmh - 50) * 1.2 + (accuracyPct - 50) * 0.4));
  const next: GamerProfile = {
    ...profile,
    xp: profile.xp + xpGain,
    bestReactionMs: Math.min(profile.bestReactionMs || 9999, reactionMs),
    topSpeedKmh: Math.max(profile.topSpeedKmh, speedKmh),
  };
  // Lig tespiti
  const league: League = next.xp >= LEAGUE_XP['Elit Lig'] ? 'Elit Lig' : next.xp >= LEAGUE_XP['Altın'] ? 'Altın' : next.xp >= LEAGUE_XP['Gümüş'] ? 'Gümüş' : 'Bronz';
  next.league = league;
  // Rozetler
  const badges = new Set(next.badges);
  if (next.bestReactionMs < 380) badges.add(BADGES.FAST_HAND);
  if (next.topSpeedKmh > 90) badges.add(BADGES.CANNON_ARM);
  if (accuracyPct > 75) badges.add(BADGES.PRECISION);
  next.badges = Array.from(badges);
  return next;
}

export function leagueProgress(profile: GamerProfile): { current: number; next: number; pct: number; nextLeague: League | null } {
  const current = LEAGUE_XP[profile.league];
  const nextL = (['Bronz', 'Gümüş', 'Altın', 'Elit Lig'] as League[])[(['Bronz', 'Gümüş', 'Altın', 'Elit Lig'] as League[]).indexOf(profile.league) + 1];
  const next = nextL ? LEAGUE_XP[nextL] : null;
  return {
    current,
    next: next ?? current,
    pct: next ? Math.min(100, Math.round(((profile.xp - current) / (next - current)) * 100)) : 100,
    nextLeague: nextL ?? null,
  };
}

// ---------------------------------------------------------------------------
// 2. Liderlik Tablosu — Hız Şampiyonu / Reaksiyon Kralı
// ---------------------------------------------------------------------------
export function buildLeaderboards(profiles: GamerProfile[]): { speed: LeaderRow[]; reaction: LeaderRow[] } {
  return {
    speed: [...profiles].sort((a, b) => b.topSpeedKmh - a.topSpeedKmh).slice(0, 5).map((p) => ({ athleteId: p.athleteId, value: p.topSpeedKmh, league: p.league })),
    reaction: [...profiles].sort((a, b) => (a.bestReactionMs || 9999) - (b.bestReactionMs || 9999)).slice(0, 5).map((p) => ({ athleteId: p.athleteId, value: p.bestReactionMs, league: p.league })),
  };
}

// ---------------------------------------------------------------------------
// 3. Daze Chef Ödül Kuponu
// ---------------------------------------------------------------------------
export function generateDazeCoupon(athleteId: string, reward: 'Smoothie' | 'Meyve Kasesi'): { code: string; reward: string; validUntil: string } {
  const code = `DAZE-${athleteId.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const validUntil = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  return { code, reward, validUntil };
}

export function fitGamingStatus(): string {
  return 'Fit-Gaming: XP • Bronz/Gümüş/Altın/Elit Lig • Rozetler • Daze kuponları';
}
