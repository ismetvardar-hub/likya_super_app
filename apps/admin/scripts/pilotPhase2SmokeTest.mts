// ============================================================================
// 🚀 PİLOT FAZ 2 SMOKE TESTİ (Adım 106-110)
// Hızlı seans başlatıcı • mola taktik HUD • ses notu timeline • veli anlık
// WhatsApp özeti • telemetri master export (CSV/JSON + Track 9 bütünlüğü)
// Çalıştırma: node scripts/pilotPhase2SmokeTest.mts
// ============================================================================
import {
  MATCH_FORMATS, validateMatchSessionConfig, createMatchSession, advanceMatchSession,
  sessionElapsedHuman, sessionElapsedMs, matchFormatPreset, MATCH_COURT_MIN, MATCH_COURT_MAX,
} from '../src/app/lib/court/matchDaySessionEngine.ts';
import { PILOT_SQUAD_ID } from '../src/app/lib/onboarding/pilotOnboardingEngine.ts';
import { gctFatigueDriftMs, aggregateIntermissionMetrics, generateTacticalAdvice, INTERMISSION_BREAK_MS } from '../src/app/lib/court/intermissionAnalyticsEngine.ts';
import { createVoiceNoteMeta, validateAudioBlobMeta, serializeVoiceNoteMeta, parseVoiceNoteMeta, mapToTelemetryTimeline, VOICE_NOTES_BUCKET } from '../src/app/lib/audio/courtVoiceNoteEngine.ts';
import { compileParentWhatsAppSummary, buildParentSummaryData, shouldDispatchNow, PARENT_DISPATCH_WINDOW_MS } from '../src/app/lib/communication/parentInstantSummaryEngine.ts';
import { framesToCsv, framesToJsonRows, buildMasterExport, validateTrack9Integrity, scoutGradeForScore, TELEMETRY_CSV_HEADER, type TelemetryFrame } from '../src/app/lib/analytics/pilotTelemetryExportEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 106: MAÇ GÜNÜ HIZLI SEANS BAŞLATICI ────────────────────────────────
check('106a. 3 maç formatı (Single Set / Best of 3 / HIIT 20dk)', MATCH_FORMATS.length === 3 && matchFormatPreset('best_of_3').label === 'Best of 3' && matchFormatPreset('hiit_20min').expectedDurationMin === 20);
const okConfig = { courtId: 4, squadId: PILOT_SQUAD_ID, format: 'best_of_3' as const, athleteId: 'at_u14_01' };
const badCourt = { ...okConfig, courtId: 9 };
const badFormat = { ...okConfig, format: 'bogus' as never };
check('106b. Konfig doğrulama: geçerli pass · kort 9 red · format red', validateMatchSessionConfig(okConfig).valid === true && validateMatchSessionConfig(badCourt).valid === false && validateMatchSessionConfig(badFormat).valid === false);
check('106c. Kort aralığı 1-8 sabiti', MATCH_COURT_MIN === 1 && MATCH_COURT_MAX === 8);
const session = createMatchSession(okConfig);
check('106d. Tek dokunuş: running + 3 BLE akışı + telemetri AÇIK', session.state === 'running' && session.telemetry.streams.length === 3 && session.telemetry.streams.includes('hrm') && session.telemetry.logging === true && session.telemetry.sampleRateHz === 100);
const setBreak = advanceMatchSession(session, 'set_break');
const resumed = advanceMatchSession(setBreak, 'resume');
const finished = advanceMatchSession(resumed, 'complete');
check('106e. Durum makinesi: running→mola→devam→bitti + geçersiz geçiş korunur', setBreak.state === 'set_break' && setBreak.setBreakCount === 1 && resumed.state === 'running' && finished.state === 'completed' && finished.telemetry.logging === false && advanceMatchSession(session, 'resume').state === 'running');
check('106f. Süre hesaplama + insan formatı', sessionElapsedMs(finished) >= 0 && sessionElapsedHuman(125_000) === '2dk 5sn');
// ── ADIM 107: MOLA & SET ARASI TAKTİK HUD ───────────────────────────────────
check('107a. GCT yorgunluk drift matematiği (+ms)', gctFatigueDriftMs(214, 238) === 24 && gctFatigueDriftMs(220, 210) === -10 && INTERMISSION_BREAK_MS === 90_000);
const rolled = aggregateIntermissionMetrics({ serveFirstInPct: 46, avgRacketSpeedKmh: 74, gctMsStart: 214, gctMsEnd: 238, highLoadDecels: 31, opponentPattern: 'Rakip derin toplarda zorlanıyor' });
check('107b. Metrik rollup: drift +24ms, deselerasyon 31', rolled.gctFatigueDriftMs === 24 && rolled.highLoadDecels === 31 && rolled.rallyPatternNote === 'Rakip derin toplarda zorlanıyor');
const advice = generateTacticalAdvice(rolled);
const healthyAdvice = generateTacticalAdvice(aggregateIntermissionMetrics({ serveFirstInPct: 68, avgRacketSpeedKmh: 92, gctMsStart: 200, gctMsEnd: 205, highLoadDecels: 12 }));
check('107c. 3 maddelik öneri her koşulda üretilir', advice.bullets.length === 3 && healthyAdvice.bullets.length === 3);
check('107d. Düşük servis + drift → slice derinliği & oyun kısaltma önerisi', advice.bullets[0].includes('slice') && advice.bullets[1].includes('kısalt') && advice.emphasis.includes('90sn'));

// ── ADIM 108: KORT SES NOTU & AUDIO MARKER ──────────────────────────────────
const noteMeta = createVoiceNoteMeta({ sessionId: 'ms_20260820_1200_1', athleteId: 'at_u14_01', tsMs: 1_752_000_000_000, durationMs: 8_500, sizeBytes: 17_850 });
check('108a. Ses notu meta: webm + pending + bucket sabiti', noteMeta.mimeType === 'audio/webm' && noteMeta.uploadState === 'pending' && VOICE_NOTES_BUCKET === 'session-voice-notes');
check('108b. Meta doğrulama: geçerli pass · süre üst sınırı red', validateAudioBlobMeta(noteMeta).valid === true && validateAudioBlobMeta({ ...noteMeta, durationMs: 400_000 }).valid === false);
check('108c. Meta seri/deseri roundtrip', parseVoiceNoteMeta(serializeVoiceNoteMeta(noteMeta))?.id === noteMeta.id);
const sessionStart = 1_751_998_800_000; // seans başlangıcı
const mapping = mapToTelemetryTimeline(sessionStart + 1000, sessionStart, sessionStart + 900_000);
check('108d. 100Hz timeline eşleme: +1000ms → çerçeve #100', mapping.sessionOffsetMs === 1000 && mapping.frameIndex === 100 && mapping.telemetryFrameMs === sessionStart + 1000);

// ── ADIM 109: MAÇ SONU VELİ ANLIK WHATSAPP ÖZETİ ────────────────────────────
const summary = compileParentWhatsAppSummary({ athleteName: 'Deniz', parentName: 'Ayşe', durationMin: 62, trimp: 186, highlightPb: 'Yeni servis hızı rekoru: 178 km/s' });
const summaryNoPb = compileParentWhatsAppSummary({ athleteName: 'Deniz', parentName: 'Ayşe', durationMin: 62, trimp: 186, highlightPb: null });
check('109a. Mesaj: süre + TRIMP + toparlanma önerisi içerir', summary.includes('62 dk') && summary.includes('TRIMP') && summary.includes('186') && summary.includes('Toparlanma'));
check('109b. PB satırı yalnızca rekor varsa eklenir', summary.includes('Yeni servis hızı rekoru') && !summaryNoPb.includes('rekoru'));
check('109c. TRIMP 186 → 48 saat aktif toparlanma', buildParentSummaryData({ athleteName: 'D', parentName: 'P', durationMin: 60, trimp: 186, highlightPb: null }).recoveryHours === 48);
const endedAt = new Date(Date.now() - 30_000).toISOString();
const staleAt = new Date(Date.now() - (PARENT_DISPATCH_WINDOW_MS + 10_000)).toISOString();
check('109d. 60sn tetikleme penceresi: içinde true · dışında false', shouldDispatchNow(endedAt) === true && shouldDispatchNow(staleAt) === false && PARENT_DISPATCH_WINDOW_MS === 60_000);
// ── ADIM 110: PİLOT TELEMETRİ MASTER EXPORT ────────────────────────────────
const frames: TelemetryFrame[] = Array.from({ length: 100 }, (_, i) => ({
  tsMs: i * 10,
  stream: i % 2 === 0 ? 'insole_left' : 'insole_right',
  toePct: 45 + (i % 10),
  heelPct: 40 + (i % 8),
  gctMs: 200 + (i % 30),
  strike: 0.5 + (i % 5) / 10,
}));
const csv = framesToCsv(frames);
check('110a. CSV: başlık + 100 satır (100Hz senkronize)', csv.startsWith(TELEMETRY_CSV_HEADER) && csv.split('\n').length === 101 && csv.split('\n')[1].includes('insole_left'));
const compact = framesToJsonRows(frames);
check('110b. Kompakt JSON: 6 sütun + 100 satır (array-of-arrays)', compact.columns.length === 6 && compact.rows.length === 100 && Array.isArray(compact.rows[0]) && compact.rows[0].length === 6);
const dailyLoads = Array.from({ length: 28 }, (_, i) => ({ date: `2026-07-${String((i % 28) + 1).padStart(2, '0')}`, load: 40 + (i % 7) * 8 }));
const bundle = buildMasterExport({
  sessionId: 'ms_20260820_1200_1',
  athleteId: 'at_u14_01',
  format: 'best_of_3',
  durationMin: 62,
  frames,
  dailyLoads,
  trimpInput: { durationMin: 62, avgHr: 148, restHr: 60, maxHr: 195, sex: 'M' },
  tid: { maturationOffsetMonths: 4, reactivePowerVelocity: 0.9, cognitiveReactionMs: 240, brakeEfficiencyPct: 78, injuryResiliencePct: 82 },
  track9: {
    health: { dbPingMs: 42, storagePingMs: 87, healthy: true },
    pairing: { bondedDevices: 3 },
    stress: { maxBufferMB: 50, packetLossPct: 1.2 },
    onboarding: { athleteCount: 4, invitesGenerated: 4 },
    crash: { queuedDumps: 0, flushed: 0 },
    session: { courtId: 7, format: 'best_of_3' },
    intermission: { serveFirstInPct: 62, gctDriftMs: 24 },
    voiceNotes: { count: 3, bucket: 'session-voice-notes' },
    parentSummary: { dispatched: true, messageChars: 210 },
  },
});
check('110c. Master paket: ham telemetri + TRIMP/ACWR eğrileri + scout notu', bundle.rawTelemetry.csv.length > 0 && bundle.loads.trimp.trimp > 0 && bundle.loads.acwr.acwr > 0 && bundle.scout.tidScore >= 0 && bundle.scout.tidScore <= 100 && typeof bundle.scout.grade === 'string');
check('110d. Scout harf notu: 92 → Pro', scoutGradeForScore(92) === 'Pro' && scoutGradeForScore(55) === 'C');
const integrity = validateTrack9Integrity(bundle);
check('110e. Track 9 bütünlüğü: Adım 101-110 — 10/10 domain', integrity.ok === true && integrity.checks.length === 10 && integrity.checks.every((c) => c.ok === true), `${integrity.checks.filter((c) => c.ok).length}/10`);
check('110f. Paket boyutları raporlanır (KB)', bundle.sizes.csvKb > 0 && bundle.sizes.totalKb > 0 && bundle.meta.frameCount === 100);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);


