// ============================================================================
// 🏥 PRODUCTION HEALTH-CHECK & CANLI SERVİS MONİTÖRÜ (Adım 101)
// Supabase DB bağlantısı, Storage bucket erişimi ve PWA Service Worker
// durumunu tek bir 200 OK payload'da toplar. Saf/deterministik motor:
// ping süreleri dışarıdan enjekte edilir; route.ts gerçek ağ ölçümü yapar.
// ============================================================================

export type ServiceStatus = 'ok' | 'degraded' | 'unavailable' | 'simulated';

export interface ServiceProbe {
  name: 'db' | 'storage' | 'pwa';
  ok: boolean;
  status: ServiceStatus;
  pingMs: number;
  detail: string;
}

export interface HealthPayload {
  success: boolean;
  statusCode: 200;
  healthy: boolean;
  checkedAt: string;
  latency: {
    dbPingMs: number;
    storagePingMs: number;
    totalMs: number;
    systemUptimeSec: number;
    systemUptimeHuman: string;
  };
  services: {
    database: { status: ServiceStatus; ok: boolean; pingMs: number; detail: string };
    storage: { status: ServiceStatus; ok: boolean; pingMs: number; detail: string };
    pwaServiceWorker: { status: ServiceStatus; ok: boolean; swFile: boolean; manifestValid: boolean; detail: string };
  };
  build: { app: string; version: string };
}

export interface HealthCheckInput {
  dbPingMs: number;
  storagePingMs: number;
  dbOk?: boolean;
  dbStatus?: ServiceStatus;
  dbDetail?: string;
  storageOk?: boolean;
  storageStatus?: ServiceStatus;
  storageDetail?: string;
  swAvailable: boolean;
  manifestValid?: boolean;
  swDetail?: string;
  uptimeSec: number;
  checkedAt?: string;
}

// ── Uptime formatı: "1g 2s 3d 4sn" (gün/saat/dakika/saniye) ───────────────────
export function formatUptime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${d}g ${h}s ${m}d ${sec}sn`;
}

// ── Ping ölçer: timeout güvenli (probe AbortSignal alır, süre her zaman döner) ─
export async function measurePing(probe: (signal: AbortSignal) => Promise<void> | void, timeoutMs = 3000): Promise<number> {
  const started = Date.now();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    await probe(ctrl.signal);
  } catch {
    // bağlantı hatası → süre yine ölçülür (route hata detayını raporlar)
  } finally {
    clearTimeout(t);
  }
  return Date.now() - started;
}

// ── 200 OK payload üretici (ping matematiği burada sabitlenir) ────────────────
export function buildHealthPayload(input: HealthCheckInput): HealthPayload {
  const dbPingMs = Math.max(0, Math.round(input.dbPingMs));
  const storagePingMs = Math.max(0, Math.round(input.storagePingMs));
  const dbOk = input.dbOk ?? true;
  const storageOk = input.storageOk ?? true;
  const healthy = dbOk && storageOk && input.swAvailable;

  return {
    success: true,
    statusCode: 200,
    healthy,
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    latency: {
      dbPingMs,
      storagePingMs,
      totalMs: dbPingMs + storagePingMs,
      systemUptimeSec: Math.max(0, Math.floor(input.uptimeSec)),
      systemUptimeHuman: formatUptime(input.uptimeSec),
    },
    services: {
      database: {
        status: input.dbStatus ?? (dbOk ? 'ok' : 'unavailable'),
        ok: dbOk,
        pingMs: dbPingMs,
        detail: input.dbDetail ?? (dbOk ? 'Supabase DB erişilebilir' : 'Supabase DB erişilemiyor'),
      },
      storage: {
        status: input.storageStatus ?? (storageOk ? 'ok' : 'unavailable'),
        ok: storageOk,
        pingMs: storagePingMs,
        detail: input.storageDetail ?? (storageOk ? 'Storage bucket erişilebilir' : 'Storage bucket erişilemiyor'),
      },
      pwaServiceWorker: {
        status: input.swAvailable ? 'ok' : 'unavailable',
        ok: input.swAvailable,
        swFile: input.swAvailable,
        manifestValid: input.manifestValid ?? input.swAvailable,
        detail: input.swDetail ?? (input.swAvailable ? 'sw.js yayında + manifest geçerli (standalone)' : 'sw.js/public bulunamadı'),
      },
    },
    build: { app: 'likya-sportvisionx', version: '1.0.1-pilot' },
  };
}

// ── Yapı & ping matematiği doğrulayıcı (health endpoint'i kendi kendini denetler) ─
export function validateHealthPayload(payload: HealthPayload): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!payload || typeof payload !== 'object') return { valid: false, issues: ['payload yok'] };
  if (payload.statusCode !== 200) issues.push('statusCode 200 olmalı');
  if (payload.success !== true) issues.push('success true olmalı');
  if (payload.latency.dbPingMs < 0 || payload.latency.storagePingMs < 0) issues.push('negatif ping ölçümü');
  const total = payload.latency.dbPingMs + payload.latency.storagePingMs;
  if (payload.latency.totalMs !== total) issues.push(`totalMs toplam uyuşmuyor (${payload.latency.totalMs} !== ${total})`);
  if (!payload.latency.systemUptimeHuman.includes('sn')) issues.push('uptime insan formatı eksik (sn)');
  if (payload.latency.systemUptimeSec < 0) issues.push('negatif uptime');
  if (!payload.services.database || !payload.services.storage || !payload.services.pwaServiceWorker) issues.push('servis alanları eksik');
  if (typeof payload.services.pwaServiceWorker.swFile !== 'boolean') issues.push('pwa swFile boolean olmalı');
  if (typeof payload.services.pwaServiceWorker.manifestValid !== 'boolean') issues.push('pwa manifestValid boolean olmalı');
  if (payload.healthy !== (payload.services.database.ok && payload.services.storage.ok && payload.services.pwaServiceWorker.ok)) issues.push('healthy bayrağı servis durumlarıyla uyumsuz');
  return { valid: issues.length === 0, issues };
}

export function healthEngineStatus(): string {
  return 'Health Check: DB ping + Storage ping + PWA SW durumu → 200 OK (uptime ile)';
}
