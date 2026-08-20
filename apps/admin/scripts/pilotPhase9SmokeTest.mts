// ============================================================================
// 🚀 PİLOT FAZ 9 SMOKE TESTİ — TRACK 16 UÇTAN UCA (Adım 141-145)
// Mobil köprü payload sıkıştırma + diff senkron • HRV/RHR Readiness + ACWR
// yük azaltma • push sessiz saat bastırma + TR/EN/DE/FR • RFC 5545 VEVENT +
// zaman dilimi • Track 16 bütünlüğü. Çalıştırma: node scripts/pilotPhase9SmokeTest.mts
// ============================================================================
import { existsSync } from 'node:fs';
import {
  MobileBridgeEngine, computeEtag, payloadSizeBytes, diffItems, validateWellnessSurvey,
  SYNC_PAYLOAD_BUDGET_BYTES, type SyncableRecord,
} from '../src/app/lib/mobile/mobileBridgeEngine.ts';
import {
  readinessScore, adjustTrainingLoad, normalizeBiometric, rhrComponent, hrvComponent,
  sleepComponent, vo2Component, type BiometricSnapshot,
} from '../src/app/lib/health/healthConnectAdapter.ts';
import {
  isQuietHour, shouldDeliver, buildPushPayload, pushPlatform, CATEGORY_CRITICAL, localizeMessage,
} from '../src/app/lib/notifications/mobilePushRouter.ts';
import {
  buildIcsFeed, buildVevent, formatIcsDateTime, icsEscape, parseEventCount, generateCalendarToken,
  eventUid, type CalendarEvent,
} from '../src/app/lib/calendar/calendarSyncEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 141: MOBİL KÖPRÜ API ───────────────────────────────────────────────
const engine = new MobileBridgeEngine();
const items1: SyncableRecord[] = [
  { id: 'a', athleteId: 'at-1', updatedAt: 'x', value: 1 },
  { id: 'b', athleteId: 'at-1', updatedAt: 'x', value: 2 },
];
const full = engine.pull('at-1', items1);
const noop = engine.pull('at-1', items1, full.etag);
const items2 = [...items1, { id: 'c', athleteId: 'at-1', updatedAt: 'x', value: 3 }];
const diff = engine.pull('at-1', items2, full.etag);
check('141a. ETag + pull: full → noop (aynı etag) → diff (yeni kayıt)', full.kind === 'full' && full.etag === computeEtag(items1) && noop.kind === 'noop' && noop.sizeBytes === 0 && diff.kind === 'diff' && diff.items.length === 1 && diff.items[0].id === 'c');
check('141b. Diff çözümü: added/removed kimlikleri', diffItems(items1, items2).added.length === 1 && diffItems(items2, items1).removed.length === 1);
const batch = Array.from({ length: 50 }, (_, i) => ({ id: `r${i}`, athleteId: 'at-1', updatedAt: 'x', ts: i }));
check('141c. Bütçe: 50 kayıt <10KB + payload boyut hesabı', engine.underBudget(batch) === true && payloadSizeBytes(batch) < SYNC_PAYLOAD_BUDGET_BYTES && SYNC_PAYLOAD_BUDGET_BYTES === 10 * 1024);
check('141d. İyilik anketi doğrulama: geçerli pass · ağrı 6 red', validateWellnessSurvey({ athleteId: 'at-1', date: '2026-08-20', sleepHours: 7.5, soreness: 2, mood: 4 }).valid === true && validateWellnessSurvey({ athleteId: 'at-1', date: '2026-08-20', sleepHours: 7.5, soreness: 6, mood: 4 }).valid === false);
const enginePush = new MobileBridgeEngine();
const acceptedPush = enginePush.push('at-2', { athleteId: 'at-2', etag: '', kind: 'full', items: items1, sizeBytes: 0 }, (its) => void its);
const conflictPush = enginePush.push('at-2', { athleteId: 'at-2', etag: 'wrong-etag', kind: 'full', items: items2, sizeBytes: 0 }, (its) => void its);
check('141e. Push: kabul + etag çakışma tespiti', acceptedPush.accepted === true && acceptedPush.conflict === false && conflictPush.accepted === false && conflictPush.conflict === true);
// ── ADIM 142: HEALTH CONNECT READINESS ───────────────────────────────────────
const snapshot: BiometricSnapshot = { athleteId: 'at-1', restingHrBpm: 55, hrvSdnnMs: 50, sleepDeepHrs: 1.2, sleepRemHrs: 1.3, vo2Max: 50, source: 'apple_health', capturedAt: '2026-08-20T06:00:00Z' };
check('142a. Bileşenler: RHR70 · HRV41.18 · uyku71.43 · VO2 60', rhrComponent(55) === 70 && Math.round(hrvComponent(50) * 100) / 100 === 41.18 && Math.round(sleepComponent(1.2, 1.3) * 100) / 100 === 71.43 && vo2Component(50) === 60);
const readiness = readinessScore(snapshot);
check('142b. Readiness skoru: 60 → AMBER', readiness.score === 60 && readiness.tier === 'AMBER');
const amber = adjustTrainingLoad(100, readiness);
const redSnapshot: BiometricSnapshot = { ...snapshot, restingHrBpm: 70, hrvSdnnMs: 20, sleepDeepHrs: 0.3, sleepRemHrs: 0.2, vo2Max: 36 };
const red = adjustTrainingLoad(100, readinessScore(redSnapshot));
const greenSnapshot: BiometricSnapshot = { ...snapshot, restingHrBpm: 45, hrvSdnnMs: 90, sleepDeepHrs: 2, sleepRemHrs: 1.6, vo2Max: 58 };
const green = adjustTrainingLoad(100, readinessScore(greenSnapshot));
check('142c. ACWR yük azaltma: AMBER %20 → 80 · RED %40 → 60 · GREEN %0 → 100', amber.adjustedLoad === 80 && amber.dampeningPct === 20 && red.adjustedLoad === 60 && red.dampeningPct === 40 && red.tier === 'RED' && green.adjustedLoad === 100 && green.dampeningPct === 0 && green.tier === 'GREEN');
const normalized = normalizeBiometric({ sleepDeepHrs: 72, sleepRemHrs: 48, restingHrBpm: 58 }, 'whoop', 'at-1');
check('142d. Kaynak normalizasyonu: Whoop dakika → saat (72dk=1.2sa)', normalized.sleepDeepHrs === 1.2 && normalized.sleepRemHrs === 0.8 && normalized.source === 'whoop');

// ── ADIM 143: MOBİL PUSH ROUTER ──────────────────────────────────────────────
const quietNight = new Date(2026, 7, 20, 23, 0);
const brightDay = new Date(2026, 7, 20, 10, 0);
check('143a. Sessiz saatler: 23:00 sessiz · 10:00 değil', isQuietHour(quietNight) === true && isQuietHour(brightDay) === false && CATEGORY_CRITICAL.INJURY_RISK_ALERT === true && CATEGORY_CRITICAL.TRAINING_REMINDER === false);
check('143b. Bastırma: sakatlık kritik → sessizde iletilir · hatırlatma → bastırılır', shouldDeliver('INJURY_RISK_ALERT', quietNight) === true && shouldDeliver('TRAINING_REMINDER', quietNight) === false && shouldDeliver('TRAINING_REMINDER', brightDay) === true);
const tr = buildPushPayload('INJURY_RISK_ALERT', 'TR', 'ios');
const en = buildPushPayload('INJURY_RISK_ALERT', 'EN', 'ios');
const de = buildPushPayload('INJURY_RISK_ALERT', 'DE', 'android');
const fr = buildPushPayload('INJURY_RISK_ALERT', 'FR', 'android');
check('143c. Çok dilli payload: TR/EN/DE/FR ayrık + platform APNS/FCM', tr.platform === 'APNS' && tr.title.includes('Sakatlık') && en.title.includes('Injury') && de.title.includes('Verletzungs') && de.platform === 'FCM' && fr.body.includes('blessure') && pushPlatform('android') === 'FCM' && localizeMessage('COURT_CHANGE', 'TR').body.includes('Kort 3'));
// ── ADIM 144: iCAL / RFC 5545 TAKVİM SENKRON ────────────────────────────────
check('144a. iCal metin kaçış: virgül + noktalı virgül', icsEscape('Kort 3, A; B') === 'Kort 3\\, A\\; B');
check('144b. Zaman dilimi uyumu: +03:00 → UTC Z (14:00→11:00Z)', formatIcsDateTime('2026-08-20T14:00:00+03:00') === '20260820T110000Z');
const calEvent: CalendarEvent = { uid: eventUid('at-1', 's-1'), summary: 'Kort 3, Antrenman', startIso: '2026-08-20T14:00:00+03:00', endIso: '2026-08-20T15:30:00+03:00', location: 'Kort 3' };
const vevent = buildVevent(calEvent);
check('144c. VEVENT: UID + DTSTART/DTEND (UTC) + SUMMARY kaçış', vevent.includes('BEGIN:VEVENT') && vevent.includes('UID:at-1-s-1@likya.court') && vevent.includes('DTSTART:20260820T110000Z') && vevent.includes('DTEND:20260820T123000Z') && vevent.includes('SUMMARY:Kort 3\\, Antrenman'));
const icsFeed = buildIcsFeed({ calendarName: 'Likya — at-1', events: [calEvent, { ...calEvent, uid: eventUid('at-1', 's-2'), summary: 'Maç', location: 'Kort 5' }] });
check('144d. RFC5545 besleme: başlık + VERSION 2.0 + 2 VEVENT', icsFeed.startsWith('BEGIN:VCALENDAR') && icsFeed.includes('VERSION:2.0') && icsFeed.includes('PRODID:-//Likya') && icsFeed.includes('X-WR-CALNAME:Likya') && parseEventCount(icsFeed) === 2 && icsFeed.includes('END:VCALENDAR'));
check('144e. Takvim token deterministik + sporcuya özel', generateCalendarToken('at-1', 'secret') === generateCalendarToken('at-1', 'secret') && generateCalendarToken('at-2', 'secret') !== generateCalendarToken('at-1', 'secret'));

// ── ADIM 145: TRACK 16 UÇTAN UCA BÜTÜNLÜK ───────────────────────────────────
const track16Files = [
  'src/app/lib/mobile/mobileBridgeEngine.ts',
  'src/app/lib/health/healthConnectAdapter.ts',
  'src/app/lib/notifications/mobilePushRouter.ts',
  'src/app/lib/calendar/calendarSyncEngine.ts',
  'src/app/api/mobile/sync/route.ts',
  'src/app/api/calendar/[token]/route.ts',
  'scripts/pilotPhase9SmokeTest.mts',
];
check('145a. Track 16 dosyaları: 4 motor + 2 route + smoke mevcut', track16Files.every((f) => existsSync(f)));
const cross = noop.kind === 'noop' && diff.kind === 'diff' && readiness.tier === 'AMBER' && red.tier === 'RED' && shouldDeliver('TRAINING_REMINDER', quietNight) === false && parseEventCount(icsFeed) === 2 && formatIcsDateTime('2026-08-20T14:00:00+03:00') === '20260820T110000Z';
check('145b. Track 16 veri hattı: köprü + health + push + takvim uçtan uca', cross === true);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);


