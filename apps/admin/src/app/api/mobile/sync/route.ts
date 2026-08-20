// ============================================================================
// 📱 MOBİL SENKRON API — POST/GET (Adım 141)
// Cihaz ↔ sunucu çift yönlü senkron: ETag önbelleği + diff sıkıştırma (<10KB).
// Motor: src/app/lib/mobile/mobileBridgeEngine.ts (saf/deterministik)
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { MobileBridgeEngine, computeEtag, payloadSizeBytes, type SyncableRecord } from '../../../lib/mobile/mobileBridgeEngine.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Bellek içi veri deposu (demo/pilot — üretimde Supabase)
const store = new Map<string, SyncableRecord[]>();
const engine = new MobileBridgeEngine();

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      athleteId?: string;
      etag?: string;
      items?: SyncableRecord[];
      action?: 'pull' | 'push';
    };
    const athleteId = (body.athleteId || '').trim();
    if (!athleteId) return NextResponse.json({ success: false, error: 'athleteId gerekli' }, { status: 400 });

    if (body.action === 'push' && body.items) {
      const incoming = { athleteId, etag: body.etag ?? '', kind: 'full' as const, items: body.items, sizeBytes: payloadSizeBytes(body.items) };
      const result = engine.push(athleteId, incoming, (items) => store.set(athleteId, [...(store.get(athleteId) ?? []), ...items]));
      return NextResponse.json({ success: true, ...result, sizeBytes: incoming.sizeBytes }, { status: result.accepted ? 200 : 409 });
    }

    // pull (varsayılan): sunucu kayıtlarını ETag + diff ile döndür
    const items = store.get(athleteId) ?? [];
    const payload = engine.pull(athleteId, items, body.etag);
    return NextResponse.json(
      { success: true, payload, underBudget: payload.sizeBytes <= 10 * 1024 },
      { status: 200, headers: { ETag: `"${payload.etag}"`, 'Cache-Control': 'private, max-age=60' } },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const athleteId = request.nextUrl.searchParams.get('athleteId') || '';
  const clientEtag = request.headers.get('if-none-match')?.replace(/^"|"$/g, '') ?? '';
  if (!athleteId) return NextResponse.json({ success: false, error: 'athleteId sorgu parametresi gerekli' }, { status: 400 });
  const items = store.get(athleteId) ?? [];
  const payload = engine.pull(athleteId, items, clientEtag || undefined);
  if (payload.kind === 'noop') {
    return new NextResponse(null, { status: 304, headers: { ETag: `"${payload.etag}"` } });
  }
  return NextResponse.json({ success: true, payload }, { status: 200, headers: { ETag: `"${payload.etag}"`, 'Cache-Control': 'private, max-age=60' } });
}
