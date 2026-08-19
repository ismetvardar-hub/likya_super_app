// ============================================================================
// 🎾 CANLI MAÇ BULUCU & SPORCU SEVİYESİ (Matchmaking & Dynamic Leveling)
// • Oyuncu seviye puanı (Level 1.0 - 5.0) + seri (Streak)
// • Açık padel/tenis maçları havuzu (3/4 oyuncu — Katıl butonu)
// • 4 kişilik maçta eksik oyuncuyu otomatik eşleştiren akıllı radar
// Deterministik; Plan Z güvenli; mock-first.
// ============================================================================

export interface PlayerLevel {
  playerId: string;
  name: string;
  level: number;           // 1.0 - 5.0 (0.1 adım)
  xp: number;
  streakDays: number;      // seri
  tier: 'Bronz' | 'Gümüş' | 'Altın';
}

export function levelTier(level: number): PlayerLevel['tier'] {
  if (level >= 4.0) return 'Altın';
  if (level >= 3.0) return 'Gümüş';
  return 'Bronz';
}

/** XP → seviye ilerlemesi (dynamic leveling). */
export function addXp(player: PlayerLevel, xpGain: number): PlayerLevel {
  const xp = player.xp + xpGain;
  const level = Math.min(5, Math.round((player.level + xpGain / 200) * 10) / 10);
  return { ...player, xp, level: Math.round(level * 10) / 10, tier: levelTier(level) };
}

export interface OpenMatch {
  id: string;
  sport: 'padel' | 'tenis';
  court: string;
  time: string;
  levelRange: string;      // ör. "2.4 - 3.2"
  players: number;         // mevcut oyuncu
  capacity: number;        // 4
  host: string;
}

export const OPEN_MATCHES: OpenMatch[] = [
  { id: 'M-101', sport: 'padel', court: 'Padel Kort A', time: '17:00', levelRange: '2.4 - 3.2', players: 3, capacity: 4, host: 'Efe K.' },
  { id: 'M-102', sport: 'tenis', court: 'Tenis Kort B', time: '18:30', levelRange: '3.0 - 4.0', players: 2, capacity: 4, host: 'Deniz A.' },
  { id: 'M-103', sport: 'padel', court: 'Padel Kort C', time: '20:00', levelRange: '3.5 - 4.5', players: 1, capacity: 4, host: 'Mert S.' },
];

/** Akıllı eşleşme: seviye bandına uyan açık maçları filtreler. */
export function findOpenMatches(playerLevel: number, sport?: 'padel' | 'tenis'): OpenMatch[] {
  return OPEN_MATCHES.filter((m) => {
    const [min, max] = m.levelRange.split(' - ').map(Number);
    const inBand = playerLevel >= min - 0.4 && playerLevel <= max + 0.4;
    return inBand && (!sport || m.sport === sport) && m.players < m.capacity;
  });
}

/** Eksik oyuncuyu otomatik eşleştir (radar) — en uygun maçı önerir. */
export function autoMatchPlayer(playerLevel: number, sport?: 'padel' | 'tenis'): { match: OpenMatch | null; note: string } {
  const candidates = findOpenMatches(playerLevel, sport).sort((a, b) => (b.capacity - b.players) - (a.capacity - a.players));
  if (candidates.length === 0) return { match: null, note: 'Uygun açık maç yok — yeni maç oluştur önerilir' };
  return { match: candidates[0], note: `Seviye ${playerLevel.toFixed(1)} → ${candidates[0].court} önerildi (${candidates[0].players}/${candidates[0].capacity})` };
}

export function joinMatch(match: OpenMatch, playerName: string): { ok: boolean; match: OpenMatch; message: string } {
  if (match.players >= match.capacity) return { ok: false, match, message: 'Maç dolu' };
  match.players += 1;
  return { ok: true, match, message: `${playerName} ${match.court} maçına katıldı (${match.players}/${match.capacity})` };
}

export function matchmakingEngineStatus(): string {
  return 'Maç Bulucu [Level 1.0-5.0 • streak • açık maç havuzu • akıllı eşleşme radarı]';
}
