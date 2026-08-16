// ============================================================================
// 🔐 LOGTO ROLE GUARD — 4 Seviyeli Rol Denetleyici (Middleware/Guard Kapısı)
// Roller: SUPER_ADMIN, FACILITY_MANAGER, COACH, CREW
// Logto SSO token claim'lerinden rol çözümler; route handler'lar için
// takılabilir middleware/guard sağlar. Next.js API route'larıyla uyumlu.
// ⚠️ KIRILMASIZ: mevcut lib/access/roleGuard.ts (6 rol) ile çakışmaz;
// patronun istediği 4 seviyeli şema burada yaşar.
// ============================================================================

export type LikyaRole = 'SUPER_ADMIN' | 'FACILITY_MANAGER' | 'COACH' | 'CREW';

export const ROLES: LikyaRole[] = ['SUPER_ADMIN', 'FACILITY_MANAGER', 'COACH', 'CREW'];

export const ROLE_LABELS: Record<LikyaRole, string> = {
  SUPER_ADMIN: '👑 Süper Admin (CEO)',
  FACILITY_MANAGER: '🏢 Tesis Müdürü',
  COACH: '🎾 Antrenör',
  CREW: '🍽️ Daze Crew',
};

// Kaynak bazlı izin matrisi (Logto permission şemasıyla uyumlu)
const PERMISSION_MATRIX: Record<LikyaRole, string[]> = {
  SUPER_ADMIN: ['*'],
  FACILITY_MANAGER: [
    'facility:view', 'facility:edit', 'iot:view', 'security:view',
    'energy:view', 'shift:view', 'staff:view', 'maintenance:dispatch',
  ],
  COACH: [
    'athlete:view', 'athlete:edit', 'video:view', 'youthdev:view',
    'scouting:view', 'radar:view', 'analysis:run',
  ],
  CREW: [
    'crew:view', 'shift:view', 'inventory:view', 'pos:view', 'recipe:view',
    'stock:consume',
  ],
};

// Rol ilgili izne sahip mi? (joker destekli)
export function can(role: LikyaRole, permission: string): boolean {
  const perms = PERMISSION_MATRIX[role] ?? [];
  if (perms.includes('*')) return true;
  return perms.includes(permission);
}

// Rol hiyerarşisi: üst rol alt rolün izinlerini kapsar
export function roleHierarchy(role: LikyaRole): LikyaRole[] {
  const map: Record<LikyaRole, LikyaRole[]> = {
    SUPER_ADMIN: ['SUPER_ADMIN', 'FACILITY_MANAGER', 'COACH', 'CREW'],
    FACILITY_MANAGER: ['FACILITY_MANAGER', 'CREW'],
    COACH: ['COACH'],
    CREW: ['CREW'],
  };
  return map[role] ?? [role];
}

export function canInherited(role: LikyaRole, permission: string): boolean {
  return roleHierarchy(role).some((r) => can(r, permission));
}

// Logto token claim'lerinden rol çözümleme
export interface LogtoClaims {
  role?: string | string[];
  roles?: string[];
  sub?: string;
  [key: string]: unknown;
}

export function resolveRole(claims: LogtoClaims | null | undefined): LikyaRole {
  if (!claims) return 'CREW';
  const raw = Array.isArray(claims.roles)
    ? claims.roles[0]
    : (claims.role as string | undefined) ?? 'CREW';
  const upper = String(raw).toUpperCase();
  return (ROLES as string[]).includes(upper) ? (upper as LikyaRole) : 'CREW';
}

// Guard kapısı — bir role ilgili izin gerekli mi?
export function requireRole(requiredPermission: string) {
  return (role: LikyaRole): { allowed: boolean; role: LikyaRole; permission: string; message: string } => {
    const allowed = canInherited(role, requiredPermission);
    return {
      allowed,
      role,
      permission: requiredPermission,
      message: allowed
        ? `✅ ${ROLE_LABELS[role]} yetkilendirildi: ${requiredPermission}`
        : `⛔ ${ROLE_LABELS[role]} yetkisi yok: ${requiredPermission}`,
    };
  };
}

// Next.js API route handler sarmalayıcısı (takılabilir middleware guard)
export type GuardedHandler = (req: Request, ctx: { role: LikyaRole }) => Promise<Response> | Response;

export function guardMiddleware(requiredPermission: string) {
  return (handler: GuardedHandler, getClaims: () => LogtoClaims | null): GuardedHandler => {
    return (req, ctx) => {
      const role = resolveRole(getClaims());
      const gate = requireRole(requiredPermission)(role);
      if (!gate.allowed) {
        return new Response(
          JSON.stringify({ error: 'FORBIDDEN', message: gate.message }),
          { status: 403, headers: { 'Content-Type': 'application/json' } },
        );
      }
      return handler(req, { role });
    };
  };
}

// Rolün izinlerini listele
export function listPermissions(role: LikyaRole): string[] {
  return PERMISSION_MATRIX[role] ?? [];
}
