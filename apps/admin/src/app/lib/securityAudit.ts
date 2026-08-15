// ============================================================================
// 🛡️ STRIX GÜVENLİK & PENETRASYON DENETÇİSİ (securityAudit)
// API rotaları için: rate-limiting (kayan pencere), SQL/NoSQL/LDAP/XSS
// enjeksiyon kalkanı ve CORS denetimi. 100% deterministik — bellekte çalışır.
// ============================================================================

// ----------------------------------------------------------------------------
// 1) RATE-LIMITING — kayan pencere sayaçları (Map tabanlı, tembel temizlik)
// ----------------------------------------------------------------------------
interface RateEntry { count: number; resetAt: number; }

export interface RateLimiter {
  check(key: string, limit: number, windowMs?: number): { allowed: boolean; remaining: number; resetAt: number; retryAfterSec: number };
  reset(key?: string): void;
}

export function createRateLimiter(): RateLimiter {
  const store = new Map<string, RateEntry>();

  const check = (key: string, limit: number, windowMs = 60000) => {
    const now = Date.now();
    const entry = store.get(key);
    if (!entry || now >= entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1, resetAt: now + windowMs, retryAfterSec: 0 };
    }
    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
    }
    entry.count += 1;
    return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt, retryAfterSec: 0 };
  };

  const reset = (key?: string) => {
    if (key) store.delete(key);
    else store.clear();
  };

  return { check, reset };
}

// ----------------------------------------------------------------------------
// 2) ENJEKSİYON KALKANI — SQL / NoSQL / LDAP / XSS / Komut enjeksiyonu
// ----------------------------------------------------------------------------
export interface InjectionResult {
  safe: boolean;
  flagged: string[];
  clean: string;
}

const INJECTION_PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'SQL', re: /(\b(union|select|insert|update|delete|drop|alter|truncate)\b.*\b(from|into|table|set|where)\b)|(''\s*or\s*''='')|(--)|(;.*--)|(\/\*.*\*\/)/i },
  { name: 'NoSQL', re: /(\$where)|(\$gt)|(\$ne)|(\$regex)|(\$exists)|(\$lookup)/i },
  { name: 'LDAP', re: /(\*\)\s*\(|\|\(&|\)\s*\()/i },
  { name: 'XSS', re: /(<script)|(javascript:)|(onerror=)|(onload=)|(<iframe)|(<img[^>]*on)/i },
  { name: 'KOMUT', re: /(;\s*(rm|wget|curl|nc|bash|sh|powershell)\b)|(\|\s*(rm|sh)\b)|(`[^`]*`)/i },
  { name: 'PATH', re: /(\.\.\/)|(\.\.\\)/i },
];

export function injectionShield(input: string): InjectionResult {
  if (!input) return { safe: true, flagged: [], clean: input ?? '' };
  const flagged: string[] = [];
  for (const { name, re } of INJECTION_PATTERNS) {
    if (re.test(input)) flagged.push(name);
  }
  // Temizleme: tehlikeli karakterlerden arındır (SQL meta karakterleri)
  const clean = input.replace(/['";\\`]/g, '').replace(/\b(union|select|insert|delete|drop|alter|truncate)\b/gi, '');
  return { safe: flagged.length === 0, flagged, clean };
}

export function sanitizeInput(input: string): string {
  return injectionShield(input).clean;
}


// ----------------------------------------------------------------------------
// 3) CORS DENETİMİ — izin verilen origin kararları + başlıklar
// ----------------------------------------------------------------------------
export interface CorsDecision {
  allowed: boolean;
  headers: Record<string, string>;
}

const CORS_HEADERS_BASE: Record<string, string> = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

export function corsAudit(origin: string | undefined, allowedOrigins: string[], allowCredentials = true): CorsDecision {
  if (!origin || origin === 'null') {
    // Tarayıcı dışı (curl, sunucu) — izin ver; credentials yok
    return { allowed: true, headers: { ...CORS_HEADERS_BASE, 'Access-Control-Allow-Origin': '*' } };
  }
  const exactMatch = allowedOrigins.includes(origin);
  const wildcard = allowedOrigins.some(
    (a) => a.endsWith('*') && new RegExp(`^${a.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace('\\*', '.*')}$`).test(origin)
  );
  if (!exactMatch && !wildcard) {
    return { allowed: false, headers: {} };
  }
  return {
    allowed: true,
    headers: {
      ...CORS_HEADERS_BASE,
      'Access-Control-Allow-Origin': origin,
      ...(allowCredentials ? { 'Access-Control-Allow-Credentials': 'true' } : {}),
      'Vary': 'Origin',
    },
  };
}

// ----------------------------------------------------------------------------
// 4) BİRLEŞİK DENETİM — tek noktadan request incelemesi
// ----------------------------------------------------------------------------
export interface AuditOptions {
  allowedOrigins: string[];
  rateLimit: number;
  rateWindowMs?: number;
  allowCredentials?: boolean;
}

export interface AuditResult {
  ok: boolean;
  rate: { allowed: boolean; remaining: number; retryAfterSec: number };
  injection: { safe: boolean; flagged: string[] };
  cors: { allowed: boolean };
  checksPassed: string[];
}

export function auditRequest(
  limiter: RateLimiter,
  input: string,
  origin: string | undefined,
  clientKey: string,
  opts: AuditOptions
): AuditResult {
  const rate = limiter.check(clientKey, opts.rateLimit, opts.rateWindowMs ?? 60000);
  const injection = injectionShield(input);
  const cors = corsAudit(origin, opts.allowedOrigins, opts.allowCredentials ?? true);

  const checksPassed: string[] = [];
  if (rate.allowed) checksPassed.push('rate-limit');
  if (injection.safe) checksPassed.push('injection');
  if (cors.allowed) checksPassed.push('cors');

  return {
    ok: rate.allowed && injection.safe && cors.allowed,
    rate: { allowed: rate.allowed, remaining: rate.remaining, retryAfterSec: rate.retryAfterSec },
    injection: { safe: injection.safe, flagged: injection.flagged },
    cors: { allowed: cors.allowed },
    checksPassed,
  };
}

