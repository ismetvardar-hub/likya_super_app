// ============================================================================
// 🛡️ AŞAMA 2 — RBAC GUARD (Logto / Supabase Auth Hibrit Oturum)
// API rotaları için JWT çözümleyici + yetki denetimi middleware'i.
// Hem Supabase JWT (anon/service) hem de backend JWT (app_users) çözer.
// Saf fonksiyonlar; Plan Z güvenli — anahtar/oturum yoksa reddeder, çökmez.
// ============================================================================

export type RbacRole = 'ceo' | 'manager' | 'staff' | 'customer' | 'public';

export interface RbacToken {
  sub: string;
  role: RbacRole;
  email?: string;
  tenantId?: string;
  exp?: number;
}

export interface RbacDecision {
  allowed: boolean;
  reason: string;
  token: RbacToken | null;
}

const ROLE_HIERARCHY: Record<RbacRole, number> = { ceo: 4, manager: 3, staff: 2, customer: 1, public: 0 };

/** JWT payload çözümle (doğrulama anahtarı olmadan içerik; imza kontrolü sunucuda). */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const json = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch { return null; }
}

/** Supabase JWT (app_metadata.role) veya backend JWT (role) → RbacToken. */
export function resolveRbacToken(authHeader?: string): RbacToken | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload || !payload.sub) return null;

  const supabaseRole = payload.app_metadata && typeof payload.app_metadata === 'object'
    ? String((payload.app_metadata as Record<string, unknown>).role ?? '')
    : '';
  const rawRole = String(payload.role ?? supabaseRole ?? 'customer');
  const role: RbacRole = (['ceo', 'manager', 'staff', 'customer'] as RbacRole[]).includes(rawRole as RbacRole) ? rawRole as RbacRole : 'customer';

  return { sub: String(payload.sub), role, email: payload.email ? String(payload.email) : undefined, tenantId: payload.tenant_id ? String(payload.tenant_id) : undefined, exp: typeof payload.exp === 'number' ? payload.exp : undefined };
}

export function tokenExpired(token: RbacToken, nowSec = Math.floor(Date.now() / 1000)): boolean {
  return token.exp !== undefined && token.exp < nowSec;
}

/** Yetki denetimi: gerekli rolü karşılayan alt rolden (hierarchy) geçer. */
export function authorize(authHeader: string | undefined, required: RbacRole): RbacDecision {
  if (required === 'public') return { allowed: true, reason: 'public endpoint', token: null };
  const token = resolveRbacToken(authHeader);
  if (!token) return { allowed: false, reason: 'JWT bulunamadı — oturum gerekli', token: null };
  if (tokenExpired(token)) return { allowed: false, reason: 'JWT süresi dolmuş — yenileme gerekli', token };
  if (ROLE_HIERARCHY[token.role] < ROLE_HIERARCHY[required]) {
    return { allowed: false, reason: `Yetki yetersiz: ${token.role} ${required} gerektirir`, token };
  }
  return { allowed: true, reason: `${token.role} yetkili`, token };
}

export function rbacGuardStatus(): string {
  return 'RBAC Guard [JWT decode • Supabase+Logto hibrit • rol hiyerarşisi ceo>manager>staff>customer]';
}
