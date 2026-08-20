// ============================================================================
// 🧼 GİRDİ TEMİZLEYİCİ & HIZ SINIRLAYICI (Adım 96)
// SQLi / XSS / prototype pollution sanitizasyonu + token bucket rate limiting
// (Auth, Veli OTP, Ödeme webhook'ları gibi hassas uç noktalar için).
// Deterministik; sıfır bağımlılık; node-runnable.
// ============================================================================

const SQL_PATTERN = /(\bunion\b|\bselect\b|\binsert\b|\bdelete\b|\bdrop\b|\b--\b|;|')/gi;

/** SQL enjeksiyon riski mi? */
export function isSqlInjectionRisk(input: string): boolean {
  return SQL_PATTERN.test(input);
}

/** SQL enjeksiyon kalıplarını etkisizleştirir (tehlikeli karakterleri nötralize eder). */
export function sanitizeSql(input: string): string {
  return input.replace(/'/g, "''").replace(/;/g, '').replace(/--/g, '').trim();
}

/** XSS tehlikeli karakterlerini HTML varlıklarına çevirir. */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Prototype pollution saldırısına karşı __proto__ / constructor anahtarlarını temizler. */
export function sanitizePrototypePollution<T extends Record<string, unknown>>(input: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    out[k] = v;
  }
  return out as T;
}

// ── Token bucket hız sınırlayıcı ───────────────────────────────────────────────
export interface RateLimiterStats {
  capacity: number;
  tokens: number;
  refillPerSec: number;
  rejected: number;
}

export class TokenBucketRateLimiter {
  private readonly capacity: number;
  private readonly refillPerSec: number;
  private tokens: number;
  private lastRefillMs: number;
  private rejected = 0;

  constructor(capacity: number, refillPerSec: number) {
    this.capacity = capacity;
    this.refillPerSec = refillPerSec;
    this.tokens = capacity;
    this.lastRefillMs = Date.now();
  }

  private refill(): void {
    const elapsedSec = (Date.now() - this.lastRefillMs) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillPerSec);
    this.lastRefillMs = Date.now();
  }

  /** Token tüketir; yoksa isteği reddeder. */
  tryConsume(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    this.rejected++;
    return false;
  }

  /** Test için token seviyesini kurar. */
  setTokens(v: number): void {
    this.tokens = Math.max(0, Math.min(this.capacity, v));
  }

  stats(): RateLimiterStats {
    this.refill();
    return { capacity: this.capacity, tokens: Math.round(this.tokens * 100) / 100, refillPerSec: this.refillPerSec, rejected: this.rejected };
  }
}

/** Hassas uç noktalar için hazır sınırlayıcılar. */
export function createSensitiveRateLimiters(): Record<'auth' | 'otp' | 'webhook', TokenBucketRateLimiter> {
  return {
    auth: new TokenBucketRateLimiter(20, 1),    // dk'da ~20 giriş denemesi
    otp: new TokenBucketRateLimiter(10, 0.5),   // OTP gönderimi
    webhook: new TokenBucketRateLimiter(60, 5), // ödeme webhook'ları
  };
}

export function inputSanitizerStatus(): string {
  return 'Sanitizer: SQLi/XSS/prototype • token bucket (auth/otp/webhook)';
}
