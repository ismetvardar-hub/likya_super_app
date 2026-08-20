// ============================================================================
// 📅 VELİ TAKVİM ABONELİK BESLEMESİ — /api/calendar/[token] (Adım 144)
// RFC 5545 uyumlu `.ics` abonelik beslemesi (Apple/Google/Outlook). Token
// doğrulaması + dinamik güncelleme. Motor: calendarSyncEngine.ts
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { buildIcsFeed, generateCalendarToken, eventUid, type CalendarEvent } from '../../../lib/calendar/calendarSyncEngine.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CALENDAR_SECRET = process.env.CALENDAR_FEED_SECRET ?? 'likya-calendar-secret';

interface DynamicSession {
  athleteId: string;
  sessionId: string;
  summary: string;
  location: string;
  startIso: string;
  durationMin: number;
}

export async function GET(_request: NextRequest, context: { params: { token: string } }) {
  const token = context.params.token ?? '';
  // Örnek: token = <calendarToken>:<athleteId> — token'ı doğrula
  const [calToken, athleteId] = token.split(':');
  if (!calToken || !athleteId || generateCalendarToken(athleteId, CALENDAR_SECRET) !== calToken) {
    return NextResponse.json({ success: false, error: 'Geçersiz takvim token' }, { status: 401 });
  }

  // Dinamik program (demo — canlıda Supabase'den) — kort değişikliği otomatik yansır
  const sessions: DynamicSession[] = [
    { athleteId, sessionId: 's-1001', summary: `Kort Antrenmanı — ${athleteId}`, location: 'Kort 3', startIso: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), durationMin: 90 },
    { athleteId, sessionId: 's-1002', summary: `Maç — ${athleteId}`, location: 'Kort 5', startIso: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(), durationMin: 120 },
  ];

  const events: CalendarEvent[] = sessions.map((s) => ({
    uid: eventUid(athleteId, s.sessionId),
    summary: s.summary,
    description: 'Likya SportVisionX otomatik senkronize antrenman programı',
    location: s.location,
    startIso: s.startIso,
    endIso: new Date(new Date(s.startIso).getTime() + s.durationMin * 60_000).toISOString(),
  }));

  const ics = buildIcsFeed({ calendarName: `Likya — ${athleteId}`, events });
  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="likya-${athleteId}.ics"`,
      'Cache-Control': 'public, max-age=300', // 5 dk — dinamik güncelleme
    },
  });
}
