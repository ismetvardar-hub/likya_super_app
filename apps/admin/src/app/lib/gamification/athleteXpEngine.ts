// ============================================================================
// ⭐ SPORCU SEVİYE & XP MOTORU (Adım 61) — deterministik ilerleme
// XP kaynakları: seans +100 • RSI PB +250 • GCT<200ms +150 • haftalık 3+ seans +300
// Seviye eğrisi: Level = ⌊√(XP / 100)⌋ + 1
// Çıktı: güncel seviye, seviye XP ilerlemesi, sonraki seviye ihtiyacı, rütbe başlıkları
// Deterministik; sıfır bağımlılık.
// ============================================================================

export const XP = {
  SESSION: 100,
  RSI_PERSONAL_BEST: 250,
  GCT_TARGET: 150,
  WEEKLY_3_SESSIONS: 300,
} as const;

export type XpEventKind = 'session' | 'rsi_pb' | 'gct_target' | 'weekly_streak';

export interface XpEvent {
  kind: XpEventKind;
  note?: string;
}

export const EVENT_XP: Record<XpEventKind, number> = {
  session: XP.SESSION,
  rsi_pb: XP.RSI_PERSONAL_BEST,
  gct_target: XP.GCT_TARGET,
  weekly_streak: XP.WEEKLY_3_SESSIONS,
};

/** Seviye eğrisi: Level = ⌊√(XP/100)⌋ + 1. */
export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
}

export interface LevelProgress {
  level: number;
  currentXp: number;
  levelFloorXp: number;   // bu seviyenin başlangıç XP'si
  nextLevelXp: number;    // sonraki seviye için gereken toplam XP
  xpIntoLevel: number;    // seviye içi XP
  xpNeededForNext: number;
  progressPct: number;
}

/** Seviye ilerleme detayı (UI çubuğu için). */
export function levelProgress(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const levelFloorXp = (level - 1) ** 2 * 100;
  const nextLevelXp = level ** 2 * 100;
  const xpIntoLevel = Math.max(0, xp - levelFloorXp);
  const span = Math.max(1, nextLevelXp - levelFloorXp);
  return {
    level,
    currentXp: xp,
    levelFloorXp,
    nextLevelXp,
    xpIntoLevel,
    xpNeededForNext: Math.max(0, nextLevelXp - xp),
    progressPct: Math.min(100, Math.round((xpIntoLevel / span) * 100)),
  };
}

/** XP eşiklerine göre açılan rütbe başlıkları. */
export function unlockedTitles(xp: number): string[] {
  const titles: Array<[number, string]> = [
    [0, 'Çaylak'],
    [300, 'Gelişen Atlet'],
    [1000, 'Çevik Atlet'],
    [2500, 'Elit Performans'],
    [5000, 'Master Atlet'],
  ];
  return titles.filter(([threshold]) => xp >= threshold).map(([, title]) => title);
}

export interface XpResult {
  xp: number;
  breakdown: Record<XpEventKind, number>;
  level: number;
  titles: string[];
  progress: LevelProgress;
}

/** XP olaylarını işler; seviye + rütbe başlıkları + ilerleme döndürür. */
export function awardXp(events: XpEvent[]): XpResult {
  const breakdown: Record<XpEventKind, number> = { session: 0, rsi_pb: 0, gct_target: 0, weekly_streak: 0 };
  let xp = 0;
  for (const e of events) {
    const gain = EVENT_XP[e.kind];
    breakdown[e.kind] += gain;
    xp += gain;
  }
  return { xp, breakdown, level: levelForXp(xp), titles: unlockedTitles(xp), progress: levelProgress(xp) };
}

export function athleteXpStatus(): string {
  return 'XP Motoru: seans/RSI-PB/GCT/heftalık seri • Level=⌊√(XP/100)⌋+1 • rütbeler';
}
