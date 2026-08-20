// ============================================================================
// 📅 DİNAMİK VELİ TAKVİMİ & iCAL PROGRAM SENKRON MOTORU (Adım 144)
// Otomatik canlı takvim besleme dışa aktarıcı: Apple Calendar, Google Calendar
// ve Outlook için RFC 5545 uyumlu `.ics` abonelik beslemeleri üretir. Kort
// ataması, maç saati veya turnuva programı değiştiğinde manuel yeniden içe
// aktarma gerektirmeden dinamik güncellenir. Saf/deterministik.
// ============================================================================

export interface CalendarEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  startIso: string; // RFC3339 (offset'li)
  endIso: string;
}

export interface CalendarFeed {
  calendarName: string;
  events: CalendarEvent[];
}

export const ICAL_PRODID = '-//Likya SportVisionX//TR//';
export const ICAL_VERSION = '2.0';

// ── iCal metin kaçış ─────────────────────────────────────────────────────────
export function icsEscape(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

// ── ISO → UTC 'YYYYMMDDTHHMMSSZ' (zaman dilimi uyumlu) ───────────────────────
export function formatIcsDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const parts: (string | number)[] = [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
    'T',
    String(date.getUTCHours()).padStart(2, '0'),
    String(date.getUTCMinutes()).padStart(2, '0'),
    String(date.getUTCSeconds()).padStart(2, '0'),
    'Z',
  ];
  return parts.join('');
}

// ── VEVENT blok ──────────────────────────────────────────────────────────────
export function buildVevent(event: CalendarEvent): string {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${icsEscape(event.uid)}`,
    `DTSTAMP:${formatIcsDateTime(new Date().toISOString())}`,
    `DTSTART:${formatIcsDateTime(event.startIso)}`,
    `DTEND:${formatIcsDateTime(event.endIso)}`,
    `SUMMARY:${icsEscape(event.summary)}`,
  ];
  if (event.description) lines.push(`DESCRIPTION:${icsEscape(event.description)}`);
  if (event.location) lines.push(`LOCATION:${icsEscape(event.location)}`);
  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

// ── Tam .ics besleme (RFC 5545) ──────────────────────────────────────────────
export function buildIcsFeed(feed: CalendarFeed, prodId = ICAL_PRODID): string {
  const header = [
    'BEGIN:VCALENDAR',
    `PRODID:${prodId}`,
    `VERSION:${ICAL_VERSION}`,
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${icsEscape(feed.calendarName)}`,
  ];
  const body = feed.events.map((e) => buildVevent(e));
  return [...header, ...body, 'END:VCALENDAR'].join('\r\n');
}

export function parseEventCount(ics: string): number {
  return (ics.match(/BEGIN:VEVENT/g) ?? []).length;
}

// ── Deterministik takvim UID + abonelik token ────────────────────────────────
export function eventUid(athleteId: string, sessionId: string): string {
  return `${athleteId}-${sessionId}@likya.court`;
}

export function generateCalendarToken(athleteId: string, secret: string): string {
  let seed = 0;
  const s = `${secret}:${athleteId}`;
  for (let i = 0; i < s.length; i++) seed = (seed * 31 + s.charCodeAt(i)) >>> 0;
  return seed.toString(16).padStart(10, '0').slice(0, 10);
}

export function calendarSyncStatus(): string {
  return `iCal: RFC ${ICAL_VERSION} RFC5545 • Apple/Google/Outlook abonelik • dinamik güncelleme + zaman dilimi (UTC)`;
}
