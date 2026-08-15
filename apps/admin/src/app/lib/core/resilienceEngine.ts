// ============================================================================
// 🛡️ LİKYA MİKROSERVİS DAYANIKLILIK KATMANI (Resilience Engine)
// Idempotency (mükerrer işlem kilidi) + Circuit Breaker (devre kesici)
// Daze Hub finans & borsa operasyonlarını kurşun geçirmez yapar.
// ============================================================================

// ----------------------------------------------------------------------------
// 🔐 IDEMPOTENCY — Tekil İşlem Anahtarı
// Aynı anahtar ile ikinci istek gelirse sonuç verilmez / önbellekten döner.
// Çift tıklama, mükerrer sipariş ve çift para çekimini engeller.
// ----------------------------------------------------------------------------
export interface IdempotencyOptions {
  ttlMs?: number;                 // kilidin ömrü (varsayılan 10 dk)
  throwOnDuplicate?: boolean;     // true: tekrar isteği hata olarak fırlat
}

const processedKeys = new Map<string, { result: unknown; expiresAt: number }>();

export async function withIdempotency<T>(
  key: string,
  action: () => Promise<T> | T,
  options: IdempotencyOptions = {}
): Promise<{ success: boolean; result?: T; duplicate?: boolean; error?: string }> {
  const { ttlMs = 10 * 60 * 1000, throwOnDuplicate = false } = options;
  const now = Date.now();

  // eski kilitleri temizle
  processedKeys.forEach((v, k) => {
    if (v.expiresAt < now) processedKeys.delete(k);
  });

  const existing = processedKeys.get(key);
  if (existing) {
    if (throwOnDuplicate) {
      return { success: false, duplicate: true, error: 'İşlem anahtarı zaten işlendi — mükerrer işlem engellendi.' };
    }
    return { success: true, duplicate: true, result: existing.result as T };
  }

  try {
    const result = await action();
    processedKeys.set(key, { result, expiresAt: Date.now() + ttlMs });
    return { success: true, result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// ----------------------------------------------------------------------------
// ⚡ CIRCUIT BREAKER — Devre Kesici
// Dış servis (hava durumu, SMS, ödeme vb.) çökerse sistemi kilitlemez;
// açık devrede doğrudan fallback'e geçer, süre sonra yarım açık dener.
// ----------------------------------------------------------------------------
export interface CircuitBreakerOptions {
  failureThreshold?: number; // kapanmadan önceki hata sayısı (varsayılan 3)
  openMs?: number;           // açık kalma süresi (varsayılan 15 sn)
  successToClose?: number;   // yarım açıkta başarıyla kapanma sayısı
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private openedAt = 0;
  private successesInHalfOpen = 0;
  readonly serviceName: string;
  private readonly threshold: number;
  private readonly openMs: number;
  private readonly successToClose: number;

  constructor(serviceName: string, options: CircuitBreakerOptions = {}) {
    this.serviceName = serviceName;
    this.threshold = options.failureThreshold ?? 3;
    this.openMs = options.openMs ?? 15 * 1000;
    this.successToClose = options.successToClose ?? 1;
  }

  getState(): CircuitState {
    if (this.state === 'OPEN' && Date.now() - this.openedAt >= this.openMs) {
      this.state = 'HALF_OPEN';
      this.successesInHalfOpen = 0;
    }
    return this.state;
  }

  private onFailure(): void {
    this.failures++;
    if (this.state === 'HALF_OPEN' || this.failures >= this.threshold) {
      this.state = 'OPEN';
      this.openedAt = Date.now();
      console.warn(`[CircuitBreaker] ${this.serviceName} AÇILDI — hata sayısı: ${this.failures}`);
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successesInHalfOpen++;
      if (this.successesInHalfOpen >= this.successToClose) {
        this.state = 'CLOSED';
        this.failures = 0;
        console.info(`[CircuitBreaker] ${this.serviceName} kapatıldı (iyileşti)`);
      }
    } else {
      this.failures = 0;
    }
  }

  async call<T>(action: () => Promise<T>, fallback: () => Promise<T>): Promise<{ result: T; usedFallback: boolean; state: CircuitState }> {
    const state = this.getState();
    if (state === 'OPEN') {
      const fallbackResult = await fallback();
      return { result: fallbackResult, usedFallback: true, state };
    }
    try {
      const result = await action();
      this.onSuccess();
      return { result, usedFallback: false, state: this.getState() };
    } catch (e) {
      this.onFailure();
      const fallbackResult = await fallback();
      return { result: fallbackResult, usedFallback: true, state: this.getState() };
    }
  }
}

// Sistem geneli kayıt defteri — dashboard göstergesi için
export const circuitBreakerRegistry: Record<string, CircuitBreaker> = {};
export function getOrCreateBreaker(serviceName: string): CircuitBreaker {
  if (!circuitBreakerRegistry[serviceName]) {
    circuitBreakerRegistry[serviceName] = new CircuitBreaker(serviceName);
  }
  return circuitBreakerRegistry[serviceName];
}
