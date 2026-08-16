// ============================================================================
// 🔐 LİKYA ROLE-BASED ACCESS CONTROL (RBAC) — Logto uyumlu rol denetleyicisi
// Roller: CEO, Tesis Müdürü, Antrenör, Daze Crew, Müşteri, Misafir
// Kaynak bazlı izinler: 'module:<id>:<view|edit>' + 'action:<ad>'
// Deterministik — merkezi kimlik (Logto SSO) entegrasyonuna hazır.
// ============================================================================

export type LikyaRole = 'CEO' | 'TESIS_MUDURU' | 'ANTRENOR' | 'DAZE_CREW' | 'MUSTERI' | 'MISAFIR';

export const ROLES: LikyaRole[] = ['CEO', 'TESIS_MUDURU', 'ANTRENOR', 'DAZE_CREW', 'MUSTERI', 'MISAFIR'];

export const ROLE_LABELS: Record<LikyaRole, string> = {
  CEO: '👑 CEO / Patron',
  TESIS_MUDURU: '🏢 Tesis Müdürü',
  ANTRENOR: '🎾 Antrenör / Sport Vision',
  DAZE_CREW: '🍽️ Daze Crew',
  MUSTERI: '🛒 Müşteri',
  MISAFIR: '👋 Misafir',
};

// Rol → izin matrisi (Logto permission şemasıyla uyumlu)
const ROLE_PERMISSIONS: Record<LikyaRole, string[]> = {
  CEO: ['*'], // süper yetki
  TESIS_MUDURU: [
    'module:facility:view', 'module:facility:edit',
    'module:iot:view', 'module:security:view', 'module:energy:view',
    'module:shift:view', 'module:staff:view', 'module:inventory:view',
    'action:maintenance:dispatch', 'action:weather:view',
  ],
  ANTRENOR: [
    'module:athlete:view', 'module:athlete:edit', 'module:video:view',
    'module:youthdev:view', 'module:holistic:view', 'module:scouting:view',
    'module:radar:view', 'module:analysis:run',
  ],
  DAZE_CREW: [
    'module:crew:view', 'module:shift:view', 'module:inventory:view',
    'module:pos:view', 'module:recipe:view', 'action:stock:consume',
  ],
  MUSTERI: [
    'module:market:view', 'module:rental:view', 'module:tickets:view',
    'module:loyalty:view', 'module:wallet:view', 'action:rent:request',
  ],
  MISAFIR: ['module:landing:view', 'module:market:view'],
};

// Bir rol ilgili izne sahip mi? (joker destekli)
export function can(role: LikyaRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] ?? [];
  if (perms.includes('*')) return true;
  if (perms.includes('module:*:view') && permission.startsWith('module:') && permission.endsWith(':view')) return true;
  return perms.includes(permission);
}

// Modüle erişim kontrolü (sidebar/modal için)
export function canAccessModule(role: LikyaRole, moduleId: string): boolean {
  return can(role, `module:${moduleId}:view`);
}

// Korumalı eylem denetleyicisi (route guard / API guard)
export function guardAction(role: LikyaRole, requiredPermission: string): { allowed: boolean; message: string; permission: string } {
  const allowed = can(role, requiredPermission);
  return {
    allowed,
    permission: requiredPermission,
    message: allowed
      ? `✅ ${ROLE_LABELS[role]} yetkilendirildi: ${requiredPermission}`
      : `⛔ ${ROLE_LABELS[role]} yetkisi yok: ${requiredPermission} — Logto RBAC engelledi`,
  };
}

// Rolün tüm izinlerini listele
export function listPermissions(role: LikyaRole): string[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

// Rol hiyerarşisi: üst rol alt rolün izinlerini de kapsar
export function roleHierarchy(role: LikyaRole): LikyaRole[] {
  const map: Record<LikyaRole, LikyaRole[]> = {
    CEO: ['CEO', 'TESIS_MUDURU', 'ANTRENOR', 'DAZE_CREW', 'MUSTERI', 'MISAFIR'],
    TESIS_MUDURU: ['TESIS_MUDURU', 'DAZE_CREW', 'MISAFIR'],
    ANTRENOR: ['ANTRENOR', 'MISAFIR'],
    DAZE_CREW: ['DAZE_CREW', 'MISAFIR'],
    MUSTERI: ['MUSTERI'],
    MISAFIR: ['MISAFIR'],
  };
  return map[role] ?? [role];
}

// Hiyerarşi kapsamında erişim
export function canInherited(role: LikyaRole, permission: string): boolean {
  return roleHierarchy(role).some((r) => can(r, permission));
}

// Logto SSO token'dan rol çözümleme köprüsü (token içindeki claims'e göre)
export function resolveRoleFromToken(claims: Record<string, unknown>): LikyaRole {
  const roleClaim = String(claims.role ?? claims['likya:role'] ?? 'MISAFIR').toUpperCase();
  return (ROLES as string[]).includes(roleClaim) ? (roleClaim as LikyaRole) : 'MISAFIR';
}
