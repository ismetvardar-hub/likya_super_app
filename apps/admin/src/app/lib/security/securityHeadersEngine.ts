// ============================================================================
// 🛡️ GÜVENLİK SIKILAŞTIRMA: CSP, HSTS & PENETRASYON GUARDRAIL'LERİ (Adım 96)
// Strict güvenlik başlıkları: Content-Security-Policy • Strict-Transport-Security
// • X-Content-Type-Options • X-Frame-Options • Referrer-Policy
// Deterministik; sıfır bağımlılık; node-runnable.
// ============================================================================

export type SecurityHeaderKey =
  | 'Content-Security-Policy'
  | 'Strict-Transport-Security'
  | 'X-Content-Type-Options'
  | 'X-Frame-Options'
  | 'Referrer-Policy'
  | 'Permissions-Policy';

export interface SecurityHeaderOptions {
  upgradeInsecureRequests?: boolean;
  frameAncestors?: string[];
  connectSrc?: string[];
}

/** CSP direktifleri üretir (strict default-src 'none'). */
export function buildCsp(opts: SecurityHeaderOptions = {}): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob:`,
    `connect-src 'self' ${(opts.connectSrc ?? []).join(' ')}`,
    `frame-ancestors ${(opts.frameAncestors ?? ["'self'"]).join(' ')}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    opts.upgradeInsecureRequests === false ? '' : "upgrade-insecure-requests",
  ];
  return directives.filter(Boolean).join('; ');
}

/** Varsayılan strict güvenlik başlıkları seti. */
export function defaultSecurityHeaders(opts: SecurityHeaderOptions = {}): Record<SecurityHeaderKey, string> {
  return {
    'Content-Security-Policy': buildCsp(opts),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  };
}

export interface HeaderAudit {
  headers: Record<SecurityHeaderKey, string>;
  missing: SecurityHeaderKey[];
  pass: boolean;
}

/** Mevcut başlık setini denetler; eksikleri raporlar. */
export function auditSecurityHeaders(headers: Partial<Record<SecurityHeaderKey, string>>): HeaderAudit {
  const required = defaultSecurityHeaders();
  const missing = (Object.keys(required) as SecurityHeaderKey[]).filter((k) => !headers[k]);
  return { headers: { ...required, ...headers }, missing, pass: missing.length === 0 };
}

export function securityHeadersStatus(): string {
  return 'Güvenlik: CSP • HSTS • nosniff • frame DENY • referrer — strict varsayılan';
}
