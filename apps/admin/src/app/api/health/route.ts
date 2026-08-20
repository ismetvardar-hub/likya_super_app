// ============================================================================
// 🏥 PRODUCTION HEALTH-CHECK & CANLI SERVİS MONİTÖRÜ (Adım 101)
// Supabase DB ping (ms), Storage bucket erişimi ve PWA Service Worker
// durumunu ölçer; 200 OK + gecikme metrikleri döner.
// Motor: src/app/lib/monitoring/healthCheckEngine.ts (saf/deterministik)
// ============================================================================
import { NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildHealthPayload, measurePing, validateHealthPayload } from '../../lib/monitoring/healthCheckEngine.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SUPABASE_PLACEHOLDER_MARKERS = ['<your-project-id>', 'placeholder', 'example.com', 'your-project', 'dummy', 'localhost'];

function resolveBase(): string {
  return (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
}

function resolveKey(): string {
  return process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

function isPlaceholder(url: string): boolean {
  return SUPABASE_PLACEHOLDER_MARKERS.some((m) => url.toLowerCase().includes(m));
}

export async function GET() {
  const base = resolveBase();
  const key = resolveKey();
  const configured = !!base && !!key && !isPlaceholder(base);

  let dbPingMs = 0;
  let storagePingMs = 0;
  let dbOk = false;
  let storageOk = false;
  let dbDetail = 'Supabase env tanımlı değil — deterministik fallback (simulated)';
  let storageDetail = 'Supabase env tanımlı değil — storage simüle';

  if (configured) {
    dbPingMs = await measurePing(async (signal) => {
      const res = await fetch(`${base}/auth/v1/health`, { signal });
      dbOk = res.ok;
      dbDetail = dbOk ? `auth/v1/health OK (http_${res.status})` : `DB ping http_${res.status}`;
    });
    if (!dbOk) dbDetail = 'Supabase DB bağlantısı başarısız — fallback';

    storagePingMs = await measurePing(async (signal) => {
      const res = await fetch(`${base}/storage/v1/bucket/healthcheck`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal,
      });
      storageOk = true; // 4xx bile erişilebilirlik kanıtı
      storageDetail = `storage/v1 erişilebilir (http_${res.status})`;
    });
    if (!storageOk) storageDetail = 'Storage erişilemiyor — fallback';
  }

  // PWA Service Worker durumu (sunucu perspektifi: sw.js + manifest doğruluğu)
  const swFile = existsSync(join(process.cwd(), 'public', 'sw.js'));
  let manifestValid = false;
  try {
    const manifest = JSON.parse(readFileSync(join(process.cwd(), 'public', 'manifest.json'), 'utf8')) as Record<string, unknown>;
    manifestValid = !!manifest.name && !!manifest.start_url && manifest.display === 'standalone';
  } catch {
    manifestValid = false;
  }

  const payload = buildHealthPayload({
    dbPingMs,
    storagePingMs,
    dbOk: configured ? dbOk : true,
    dbStatus: configured ? (dbOk ? 'ok' : 'unavailable') : 'simulated',
    dbDetail,
    storageOk: configured ? storageOk : true,
    storageStatus: configured ? (storageOk ? 'ok' : 'unavailable') : 'simulated',
    storageDetail,
    swAvailable: swFile,
    manifestValid,
    swDetail: swFile
      ? (manifestValid ? 'sw.js yayında + manifest standalone geçerli' : 'sw.js var ama manifest geçersiz')
      : 'sw.js yok — PWA kurulamaz',
    uptimeSec: Math.floor(process.uptime()),
  });

  const selfCheck = validateHealthPayload(payload);
  return NextResponse.json({ ...payload, selfCheck }, { status: 200 });
}
