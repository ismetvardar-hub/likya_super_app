// ============================================================================
// 🏅 BAŞARI ROZETİ KAYIT DEFTERİ (Adım 62)
// Rozetler: FIRST_SERVE_ACE • SPEED_DEMON • IRON_STAMINA • PERFECT_BALANCE • CONSISTENCY_KING
// Her rozet deterministik kriter eşleştirmesiyle açılır (mock telemetri üzerinden test).
// Sıfır bağımlılık; node-runnable.
// ============================================================================

export interface BadgeContext {
  trimp?: number;
  sprintSplit5m?: number;   // sn
  asymmetryPct?: number;
  streakDays?: number;
  sessionCount?: number;
  serveAces?: number;
}

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  check: (ctx: BadgeContext) => boolean;
}

export const BADGE_REGISTRY: BadgeDef[] = [
  {
    id: 'FIRST_SERVE_ACE',
    name: 'İlk Servis Ace',
    emoji: '🎯',
    description: 'Bir maçta ilk as servisini at',
    color: '#00f2fe',
    check: (ctx) => (ctx.serveAces ?? 0) >= 1,
  },
  {
    id: 'SPEED_DEMON',
    name: 'Hız Şeytanı',
    emoji: '⚡',
    description: '0-5m sprint split 1.0 sn altı',
    color: '#F27A1A',
    check: (ctx) => (ctx.sprintSplit5m ?? Infinity) < 1.0,
  },
  {
    id: 'IRON_STAMINA',
    name: 'Demir Dayanıklılık',
    emoji: '🛡️',
    description: 'Tek seansta TRIMP > 150',
    color: '#8B5CF6',
    check: (ctx) => (ctx.trimp ?? 0) > 150,
  },
  {
    id: 'PERFECT_BALANCE',
    name: 'Mükemmel Denge',
    emoji: '⚖️',
    description: 'L/R asimetri %3 altı',
    color: '#10B981',
    check: (ctx) => (ctx.asymmetryPct ?? 100) < 3,
  },
  {
    id: 'CONSISTENCY_KING',
    name: 'Tutarlılık Kralı',
    emoji: '👑',
    description: '10 günlük kesintisiz seans serisi',
    color: '#facc15',
    check: (ctx) => (ctx.streakDays ?? 0) >= 10,
  },
];

export function getBadge(id: string): BadgeDef | undefined {
  return BADGE_REGISTRY.find((b) => b.id === id);
}

/** Mock telemetri bağlamına göre açılan rozetleri döndürür. */
export function evaluateBadges(ctx: BadgeContext): BadgeDef[] {
  return BADGE_REGISTRY.filter((b) => b.check(ctx));
}

export function badgeRegistryStatus(): string {
  return `Rozet Kayıt: ${BADGE_REGISTRY.length} rozet • ace/hız/stamina/denge/tutarlılık`;
}
