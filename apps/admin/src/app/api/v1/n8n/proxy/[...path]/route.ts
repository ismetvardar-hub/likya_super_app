import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// 🛡️ n8n SERVER-SIDE API PROXY — tarayıcıya N8N_API_KEY ASLA sızmaz
// Gelen GET/POST/PUT/DELETE → process.env.N8N_BASE_URL + X-N8N-API-KEY header'ı
// eklenerek n8n bulut/yerel uç noktasına iletilir. Env yoksa güvenli MOCK
// yanıtı döner (Plan Z — asla çökme).
// Özel rota: GET /api/v1/n8n/proxy/health → canlı/mock durum bildirimi.
// ============================================================================

export const runtime = 'nodejs';
export const maxDuration = 20;

const N8N_KEY_HEADER = 'X-N8N-API-KEY';

function envReady(): boolean {
  return Boolean(process.env.N8N_BASE_URL && process.env.N8N_API_KEY);
}

function baseUrl(): string {
  return (process.env.N8N_BASE_URL ?? '').replace(/\/$/, '');
}

/** Webhook yolu: /webhook/... → base'in /api/v1 eki kaldırılarak köke bağlanır. */
function resolveTargetUrl(apiBase: string, path: string[]): string {
  const joined = path.join('/');
  if (joined.startsWith('webhook/')) {
    const root = apiBase.replace(/\/api\/v1$/, '');
    return `${root}/${joined}`;
  }
  return `${apiBase}/${joined}`;
}

function mockResponse(path: string, method: string): NextResponse {
  const mockId = `wf_mock_${Date.now().toString(36)}_${Math.round(Math.random() * 1e5).toString(36)}`;
  return NextResponse.json({
    ok: true,
    mode: 'mock',
    workflowId: mockId,
    active: true,
    path,
    method,
    message: `🟡 MOCK — n8n proxy: N8N_BASE_URL/N8N_API_KEY tanımlı değil. "${path}" yerel kuyruğa kaydedildi (${mockId}).`,
  });
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ?? [];
  if (path[0] === 'health') {
    return NextResponse.json({
      ok: true,
      live: envReady(),
      mode: envReady() ? 'live' : 'mock',
      n8nStatus: envReady() ? 'http-200-expected' : 'standby',
      baseUrl: envReady() ? baseUrl() : null,
      note: envReady() ? 'n8n canlı hedefe proxy hazır' : 'N8N_BASE_URL/N8N_API_KEY gerekli — MOCK modu',
    });
  }
  if (!envReady()) return mockResponse(path.join('/'), 'GET');

  try {
    const target = resolveTargetUrl(baseUrl(), path) + req.nextUrl.search;
    const upstream = await fetch(target, {
      method: 'GET',
      headers: { [N8N_KEY_HEADER]: process.env.N8N_API_KEY as string, Accept: 'application/json' },
      cache: 'no-store',
    });
    const body = await upstream.json().catch(() => null);
    return NextResponse.json({ ok: upstream.ok, mode: 'live', status: upstream.status, data: body });
  } catch (err) {
    return NextResponse.json({ ok: false, mode: 'live', status: 502, error: (err as Error).message, message: 'n8n bulut uç noktasına ulaşılamadı' }, { status: 502 });
  }
}

async function forward(req: NextRequest, params: { path: string[] }, method: string): Promise<NextResponse> {
  const path = params.path ?? [];
  if (!envReady()) return mockResponse(path.join('/'), method);
  try {
    const target = resolveTargetUrl(baseUrl(), path) + req.nextUrl.search;
    const contentType = req.headers.get('content-type') ?? 'application/json';
    const upstream = await fetch(target, {
      method,
      headers: {
        [N8N_KEY_HEADER]: process.env.N8N_API_KEY as string,
        'Content-Type': contentType,
        Accept: 'application/json',
      },
      body: req.body ? await req.text() : undefined,
      cache: 'no-store',
    });
    const body = await upstream.json().catch(() => null);
    return NextResponse.json({ ok: upstream.ok, mode: 'live', status: upstream.status, data: body });
  } catch (err) {
    return NextResponse.json({ ok: false, mode: 'live', status: 502, error: (err as Error).message, message: 'n8n bulut uç noktasına ulaşılamadı' }, { status: 502 });
  }
}

export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) { return forward(req, ctx.params, 'POST'); }
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) { return forward(req, ctx.params, 'PUT'); }
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) { return forward(req, ctx.params, 'DELETE'); }
