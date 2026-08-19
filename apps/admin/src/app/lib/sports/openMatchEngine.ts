// ============================================================================
// 🎾 AÇIK MAÇ EŞLEŞTİRME RADARI — 4 kişilik Padel / 2 kişilik Tenis havuzu
// - Açık maç oluşturma + seviye filtresi (örn: 2.5 - 3.5)
// - "Eksik N Oyuncu Aranıyor" anlık kulüp bildirimi + tek tıkla katılım
// - Mock-first: offline simülasyonda deterministik çalışır
// ============================================================================

export type MatchSport = 'Padel' | 'Tenis';

export interface OpenMatch {
  id: string;
  sport: MatchSport;
  court: string;
  levelMin: number;
  levelMax: number;
  totalSlots: number;         // Padel 4, Tenis 2
  joined: { name: string; level: number }[];
  status: 'OPEN' | 'FULL';
  createdBy: string;
}

let openMatches: OpenMatch[] = [];
let seq = 1;

/** Deterministik demo havuzu */
export function initOpenMatches(): OpenMatch[] {
  if (openMatches.length === 0) {
    openMatches = [
      { id: 'OM-01', sport: 'Padel', court: 'Padel Kort A', levelMin: 2.5, levelMax: 3.5, totalSlots: 4, joined: [{ name: 'Efe', level: 3.2 }, { name: 'Mert', level: 3.6 }, { name: 'Deniz', level: 2.8 }], status: 'OPEN', createdBy: 'Efe' },
      { id: 'OM-02', sport: 'Padel', court: 'Padel Kort C', levelMin: 3.0, levelMax: 4.0, totalSlots: 4, joined: [{ name: 'Can', level: 3.9 }, { name: 'Ada', level: 3.5 }], status: 'OPEN', createdBy: 'Can' },
      { id: 'OM-03', sport: 'Tenis', court: 'Tenis Kort 2', levelMin: 2.0, levelMax: 3.0, totalSlots: 2, joined: [{ name: 'Kaan', level: 2.2 }], status: 'OPEN', createdBy: 'Kaan' },
      { id: 'OM-04', sport: 'Padel', court: 'Padel Kort B', levelMin: 2.5, levelMax: 3.5, totalSlots: 4, joined: [{ name: 'Ela', level: 3.0 }, { name: 'Zeynep', level: 3.4 }, { name: 'Efe', level: 3.2 }, { name: 'Mert', level: 3.6 }], status: 'FULL', createdBy: 'Ela' },
    ];
  }
  return openMatches;
}

// ---------------------------------------------------------------------------
// 1. Açık Maç Oluştur + Seviye Filtresi
// ---------------------------------------------------------------------------
export function createOpenMatch(sport: MatchSport, court: string, levelMin: number, levelMax: number, createdBy: string): OpenMatch {
  const totalSlots = sport === 'Padel' ? 4 : 2;
  const match: OpenMatch = {
    id: `OM-${String(seq++).padStart(2, '0')}`,
    sport,
    court,
    levelMin,
    levelMax,
    totalSlots,
    joined: [],
    status: 'OPEN',
    createdBy,
  };
  openMatches.push(match);
  return match;
}

export function findOpenMatches(level: number, sport?: MatchSport): OpenMatch[] {
  return openMatches.filter((m) => {
    const inSport = sport ? m.sport === sport : true;
    const inLevel = level >= m.levelMin && level <= m.levelMax;
    const isOpen = m.status === 'OPEN';
    return inSport && isOpen && inLevel;
  });
}

// ---------------------------------------------------------------------------
// 2. Tek Tıkla Katılım
// ---------------------------------------------------------------------------
export function joinOpenMatch(matchId: string, playerName: string, level: number): { ok: boolean; match?: OpenMatch; message: string } {
  const match = openMatches.find((m) => m.id === matchId);
  if (!match) return { ok: false, message: `Maç bulunamadı: ${matchId}` };
  if (level < match.levelMin || level > match.levelMax) return { ok: false, message: `Seviyeniz (${level}) bu maç için uygun değil (${match.levelMin}-${match.levelMax})` };
  if (match.joined.some((p) => p.name === playerName)) return { ok: false, message: `${playerName} zaten bu maçta` };
  if (match.joined.length >= match.totalSlots) return { ok: false, message: 'Maç dolu' };
  match.joined.push({ name: playerName, level });
  if (match.joined.length === match.totalSlots) match.status = 'FULL';
  return { ok: true, match: { ...match }, message: `${playerName} ${match.court} maçına katıldı (${match.joined.length}/${match.totalSlots})` };
}

// ---------------------------------------------------------------------------
// 3. "Eksik N Oyuncu Aranıyor" Anlık Kulüp Bildirimi
// ---------------------------------------------------------------------------
export function missingAnnouncement(match: OpenMatch): string {
  const missing = match.totalSlots - match.joined.length;
  if (missing <= 0) return `${match.court} maçı DOLDU (${match.sport})`;
  return `🔔 ${match.court} (${match.sport} ${match.levelMin}-${match.levelMax}L): Eksik ${missing} Oyuncu Aranıyor!`;
}

export function openMatchEngineStatus(): string {
  const open = openMatches.filter((m) => m.status === 'OPEN').length;
  return `Eşleşme Radarı: ${openMatches.length} açık maç havuzu • ${open} dolu değil • seviye filtresi 2.0-4.0`;
}
