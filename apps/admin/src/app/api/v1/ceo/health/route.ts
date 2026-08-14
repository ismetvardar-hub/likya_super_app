import { NextResponse } from 'next/server';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

// ============================================================================
// LİKYA DOCTOR — SAĞLIK KONTROLÜ & OTONOM ONARIM ENDPOINT'İ
// Port 3000 (Next.js), Port 8000 (Python/FastAPI), Cloudflare Tunnel izler.
// Yanıt vermeyen servisi nohup ile otomatik yeniden başlatır (self-healing).
// ============================================================================

const execAsync = promisify(exec);

const PROJECT_ROOT = path.resolve(process.cwd(), process.cwd().endsWith('apps/admin') ? '../..' : '.');
const ADMIN_DIR = path.join(PROJECT_ROOT, 'apps/admin');

async function checkService(name: string, url: string, timeoutMs = 3000) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timer);
    return { name, url, status: 'up' as const, http: res.status };
  } catch {
    return { name, url, status: 'down' as const };
  }
}

async function restartService(name: string, cmd: string, cwd: string): Promise<boolean> {
  try {
    await execAsync(`cd ${cwd} && nohup ${cmd} > /tmp/likya-doctor-${name}.log 2>&1 &`);
    return true;
  } catch (e) {
    console.error(`[Doctor] ${name} yeniden başlatılamadı:`, e instanceof Error ? e.message : String(e));
    return false;
  }
}

const SERVICE_MAP: Record<string, { cmd: string; cwd: string; url: string }> = {
  'next-js': { cmd: 'npm run dev', cwd: ADMIN_DIR, url: 'http://localhost:3000' },
  'python-fastapi': { cmd: 'python3 -m uvicorn main:app --host 0.0.0.0 --port 8000', cwd: PROJECT_ROOT, url: 'http://localhost:8000/health' },
  'cloudflare-tunnel': { cmd: 'cloudflared tunnel --url http://localhost:3000', cwd: PROJECT_ROOT, url: 'http://localhost:8787' },
};

export async function GET() {
  const checks = await Promise.all(
    Object.entries(SERVICE_MAP).map(([name, s]) => checkService(name, s.url)),
  );

  const down = checks.filter((c) => c.status === 'down');
  const autoHeal: { service: string; action: string }[] = [];

  // OTONOM ONARIM: yanıt vermeyen servisleri yeniden tetikle
  for (const d of down) {
    const svc = SERVICE_MAP[d.name];
    if (svc) {
      const ok = await restartService(d.name, svc.cmd, svc.cwd);
      autoHeal.push({ service: d.name, action: ok ? 'yeniden başlatıldı (auto-heal)' : 'yeniden başlatılamadı — manuel kontrol gerekli' });
    }
  }

  return NextResponse.json({
    success: true,
    checkedAt: new Date().toISOString(),
    services: checks,
    healthy: down.length === 0,
    autoHeal,
  });
}

// Manuel restart tetikleme: POST { service: 'next-js' | 'python-fastapi' | 'cloudflare-tunnel' }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const service = body?.service as string;
    const svc = SERVICE_MAP[service];
    if (!svc) {
      return NextResponse.json({ success: false, error: 'Bilinmeyen servis' }, { status: 400 });
    }
    const ok = await restartService(service, svc.cmd, svc.cwd);
    return NextResponse.json({ success: ok, service, action: ok ? 'yeniden başlatıldı' : 'başlatılamadı' });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
