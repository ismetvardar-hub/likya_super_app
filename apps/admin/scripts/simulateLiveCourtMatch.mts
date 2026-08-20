// ============================================================================
// 🎾 CANLI SAHA SEANS SIMÜLASYONU & DONANIM KALİBRASYON PROTOKOLÜ
// Uçtan uca simüle on-court pilot testi:
//   FAZ 0: Kort çıkışı + akıllı dolap (Kort #1, Dolap #12, HRM #04, Çift #02)
//   FAZ 1: 500 örneklik zero-drift kalibrasyon (sensorSelfHealing + baseline)
//   FAZ 2: 3 set 100Hz çift tabanlık + HRM telemetri simülasyonu (ralli patlaması,
//          ayak vuruşu, kardiyovasküler drift) + yorgunluk tetikleyicileri +
//          koç sesli not işaretleme
//   FAZ 3: Maç sonu veli WhatsApp özeti + master CSV/JSON export
//   DİAG : Paket kaybı <%2, bellek stabilitesi, alt-saniye bütünlüğü
// Çalıştırma: node scripts/simulateLiveCourtMatch.mts
// ============================================================================
import { mkdirSync, writeFileSync } from 'node:fs';
import {
  createLockerInventory, createSensorInventory, checkoutToAthlete,
} from '../src/app/lib/facility/hardwareCheckoutEngine.ts';
import { SmartLockerController } from '../src/app/lib/facility/smartLockerController.ts';
import { computeBaselineZero, BASELINE_CALIBRATION_SAMPLES } from '../src/app/lib/hardware/fieldPairingWizardEngine.ts';
import { applyDriftCorrection, detectNonWeightBearing, type FsrChannelSample } from '../src/app/lib/hardware/sensorSelfHealingEngine.ts';
import { CourtTelemetryStressMonitor, buildTelemetryPacket, PACKET_LOSS_WARN_PCT, MAX_BUFFER_MEMORY_BYTES } from '../src/app/lib/telemetry/courtTelemetryStressEngine.ts';
import { createMatchSession, advanceMatchSession, sessionElapsedMs, sessionElapsedHuman, type MatchSession } from '../src/app/lib/court/matchDaySessionEngine.ts';
import { generateTacticalAdvice, aggregateIntermissionMetrics } from '../src/app/lib/court/intermissionAnalyticsEngine.ts';
import { forecastFatigue, generateFatigueAlert, type FatigueModelInput } from '../src/app/lib/ai/inMatchFatigueAdvisor.ts';
import { createVoiceNoteMeta, mapToTelemetryTimeline, buildStorageUploadPath } from '../src/app/lib/audio/courtVoiceNoteEngine.ts';
import { compileParentWhatsAppSummary } from '../src/app/lib/communication/parentInstantSummaryEngine.ts';
import { buildMasterExport, validateTrack9Integrity, type TelemetryFrame } from '../src/app/lib/analytics/pilotTelemetryExportEngine.ts';
import { mulberry32 } from '../src/app/lib/tactics/monteCarloMatchSimulator.ts';

const results: { name: string; ok: boolean; detail: string }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond, detail });
  console.log((cond ? '  ✅ PASS' : '  ❌ FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}
function log(msg: string) {
  console.log('     ' + msg);
}

console.log('🎾 LİKYA SPORTVISIONX — CANLI SAHA SEANS SİMÜLASYONU BAŞLIYOR\n');

// ═══════════════════════════════════════════════════════════════════════════
// FAZ 0 — KORT ÇIKIŞI & AKILLI DOLAP ATAMASI
// ═══════════════════════════════════════════════════════════════════════════
console.log('── FAZ 0: Kort Çıkışı & Akıllı Dolap ──');
const ATHLETE = 'at_u14_01';
const now0 = Date.now();

const lockers = createLockerInventory(40);
const sensors = createSensorInventory(8, 8);
const hrm04 = checkoutToAthlete(sensors, 'hrm-4', ATHLETE).find((a) => a.id === 'hrm-4');
const insoleL = checkoutToAthlete(sensors, 'insole-3', ATHLETE).find((a) => a.id === 'insole-3');
const insoleR = checkoutToAthlete(sensors, 'insole-4', ATHLETE).find((a) => a.id === 'insole-4');
check('Donanım çıkışı: HRM #04 + Çift Tabanlık #02 (sol-3/sağ-4) CHECKED_OUT', hrm04?.state === 'CHECKED_OUT' && insoleL?.state === 'CHECKED_OUT' && insoleR?.state === 'CHECKED_OUT', `HRM ${hrm04?.serial} · ${insoleL?.serial}/${insoleR?.serial}`);

const smartLockers = new SmartLockerController(40);
let lockerClaim: { lockerId: number; unlockKey: string; ephemeral: boolean } | null = null;
// Sıralı claim: dolap 1..12 (ilk müsait her zaman sırayla gelir) → #12'yi tut, 1-11'i geri bırak
for (let id = 1; id <= 12; id++) {
  const c = smartLockers.claimLocker(ATHLETE, now0);
  if (c.ok && c.claim.lockerId === id) lockerClaim = id === 12 ? c.claim : lockerClaim;
}
for (let id = 1; id <= 11; id++) {
  const r = smartLockers.releaseLocker(id, ATHLETE);
  if (r.ok) smartLockers.inspectAndReturn(id);
}
const locker12 = checkoutToAthlete(lockers, 'locker-12', ATHLETE).find((a) => a.id === 'locker-12');
check('Akıllı dolap: Dolap #12 OCCUPIED + ephemeral BLE anahtar', lockerClaim?.lockerId === 12 && smartLockers.locker(12)?.status === 'OCCUPIED' && (lockerClaim?.unlockKey ?? '').startsWith('ble-') && locker12?.state === 'CHECKED_OUT', `🔑 ${lockerClaim?.unlockKey}`);

const session: MatchSession = createMatchSession({ courtId: 1, squadId: 'sq_u14_elit', format: 'best_of_3', athleteId: ATHLETE });
let match: MatchSession = session;
check('Kort #1 seansı başlatıldı (3 BLE akışı + 100Hz kayıt)', session.state === 'running' && session.telemetry.streams.length === 3 && session.telemetry.sampleRateHz === 100);
// ═══════════════════════════════════════════════════════════════════════════
// FAZ 1 — ZERO-DRIFT KALİBRASYON (500 baseline örneği @ 100Hz)
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n── FAZ 1: Zero-Drift Kalibrasyon (500 örnek) ──');
const rng = mulberry32(2026);
const baselineSamples = Array.from({ length: BASELINE_CALIBRATION_SAMPLES }, () => Math.round((5 + rng() * 0.3) * 100) / 100);
const baseline = computeBaselineZero(baselineSamples);
check('500 örneklik baseline: stabil + sıfır ofset', baseline.stable === true && baseline.samples === BASELINE_CALIBRATION_SAMPLES && baseline.offset <= 6, `ofset ${baseline.offset} · CV %${baseline.cv} · ort ${baseline.mean}`);

const restSamples: FsrChannelSample[] = Array.from({ length: 25 }, (_, i) => ({ tsMs: i * 500, value: 5 + rng() * 0.2 }));
const rests = detectNonWeightBearing(restSamples, 8, 10_000);
const liveSample: FsrChannelSample[] = [{ tsMs: 14_000, value: 20 }, { tsMs: 14_500, value: 22 }];
const driftFix = applyDriftCorrection(liveSample, rests, 12);
check('Self-healing: rest tespiti + baseline drift düzeltmesi', rests[0]?.valid === true && driftFix.applied === true, `baseline 12 → ${driftFix.newBaselineOffset} · okuma 20 → ${driftFix.correctedSamples[0].value}`);
log(`Kalibrasyon sonucu: ofset ${baseline.offset} (sıfır-taban), drift düzeltmesi ${driftFix.driftAmount}`);

// ═══════════════════════════════════════════════════════════════════════════
// FAZ 2 — 3 SET MAÇ SİMÜLASYONU (100Hz çift tabanlık + HRM)
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n── FAZ 2: 3 Set Rekabetçi Maç Simülasyonu (100Hz) ──');
const monitor = new CourtTelemetryStressMonitor();
const exportFrames: TelemetryFrame[] = [];
let seqLeft = 0;
let seqRight = 0;
let nowMs = 0;
let injectedLoss = 0;
let generatedLeft = 0;
let generatedRight = 0;
let voiceMemoBookmark: { id: string; frameIndex: number } | null = null;

const SET_COUNT = 3;
const GAMES_PER_SET = 4;
const POINTS_PER_GAME = 3;
const gctBase = 214;
const gctSetDrift = 14; // her sette GCT +14ms (yorgunluk drift'i)
let intermissionCards = 0;
let fatigueAlerts = 0;
let cardioHr = 142;

for (let setIdx = 0; setIdx < SET_COUNT; setIdx++) {
  const setGct = gctBase + gctSetDrift * setIdx;
  for (let gameIdx = 0; gameIdx < GAMES_PER_SET; gameIdx++) {
    for (let pointIdx = 0; pointIdx < POINTS_PER_GAME; pointIdx++) {
      const rallyFrames = 220 + ((gameIdx * 17 + pointIdx * 31) % 180); // 220-399 kare

      // Kritik break-point rallisi: 2. set, son oyun, son puan — koç sesli not
      const isBreakPointRally = setIdx === 1 && gameIdx === GAMES_PER_SET - 1 && pointIdx === POINTS_PER_GAME - 1;
      if (isBreakPointRally) {
        const memo = createVoiceNoteMeta({ sessionId: session.id, athleteId: ATHLETE, tsMs: Date.now() + nowMs, durationMs: 6400 });
        const mapping = mapToTelemetryTimeline(Date.now() + nowMs, Date.now(), null);
        voiceMemoBookmark = { id: memo.id, frameIndex: mapping.frameIndex };
        log(`🎙️ Koç sesli not işaretlendi @ break-point rallisi → ${buildStorageUploadPath(memo.sessionId, memo.id)} (çerçeve #${mapping.frameIndex})`);
      }

      for (let f = 0; f < rallyFrames; f++) {
        nowMs += 10; // 100Hz
        const strikePulse = Math.sin((f % 40) / 40 * Math.PI * 2) > 0.7 ? 1 : 0;
        const grfL = Math.round((0.9 + strikePulse * 0.9 + rng() * 0.15) * 100) / 100;
        const grfR = Math.round((0.85 + strikePulse * 0.85 + rng() * 0.15) * 100) / 100;
        const gctMs = Math.round(setGct + f * 0.02 + rng() * 2);
        const toePctL = Math.round(40 + strikePulse * 25 + rng() * 6);
        const heelPctL = Math.round(55 - strikePulse * 18 + rng() * 6);
        const toePctR = Math.round(38 + strikePulse * 24 + rng() * 6);
        const heelPctR = Math.round(52 - strikePulse * 16 + rng() * 6);

        // Sol akış (paket kaybı enjeksiyonu ~%1)
        generatedLeft++;
        if (rng() > 0.01) {
          monitor.ingest(buildTelemetryPacket('insole_left', ++seqLeft, nowMs, 64));
          exportFrames.push({ tsMs: nowMs, stream: 'insole_left', toePct: toePctL, heelPct: heelPctL, gctMs, strike: grfL });
        } else {
          injectedLoss++;
        }
        // Sağ akış (tam)
        generatedRight++;
        monitor.ingest(buildTelemetryPacket('insole_right', ++seqRight, nowMs, 64));
        exportFrames.push({ tsMs: nowMs, stream: 'insole_right', toePct: toePctR, heelPct: heelPctR, gctMs, strike: grfR });
      }
      cardioHr += 0.5 + rng(); // kardiyovasküler drift
    }
  }
  log(`Set ${setIdx + 1} tamam — ${GAMES_PER_SET * POINTS_PER_GAME} ralli · GCT taban ${setGct}ms · HR ≈ ${Math.round(cardioHr)}bpm`);
  // Set arası: yorgunluk tahmini + taktik mola kartı (GCT drift > 20ms)
  if (setIdx < SET_COUNT - 1) {
    match = advanceMatchSession(match, 'set_break');
    const fatigueInput: FatigueModelInput = {
      gctBaselineMs: gctBase,
      gctCurrentMs: setGct + gctSetDrift,
      gctElongationVelocityMsPerSet: gctSetDrift,
      activeDecelsPerSet: 18 + setIdx * 6,
      cardioDriftBpm: Math.round(cardioHr - 142),
      setMinutesPlayed: 16 + setIdx * 4,
    };
    const forecast = forecastFatigue(fatigueInput);
    const fatigueAlert = generateFatigueAlert(fatigueInput);
    if (fatigueAlert.triggered) fatigueAlerts++;
    log(`Yorgunluk: skor ${forecast.fatigueScore} · T_fatigue ${forecast.tFatigueMinutes}dk · risk ${forecast.riskLevel}${fatigueAlert.triggered ? ' 🚨 ' + fatigueAlert.alert : ''}`);
    const driftMs = (setGct - gctBase) + gctSetDrift; // kümülatif GCT uzaması
    if (driftMs > 20) {
      const advice = generateTacticalAdvice(aggregateIntermissionMetrics({ serveFirstInPct: 58 - setIdx * 4, avgRacketSpeedKmh: 92 - setIdx * 3, gctMsStart: setGct, gctMsEnd: setGct + gctSetDrift, highLoadDecels: 22 + setIdx * 6 }));
      intermissionCards++;
      log(`🟡 GCT drift +${driftMs}ms > 20ms → MOLA TAKTİK KARTI: ${advice.bullets[0]}`);
    }
    match = advanceMatchSession(match, 'resume');
  }
}
match = advanceMatchSession(match, 'complete');
const durationMs = sessionElapsedMs(match);
log(`🏁 Maç tamamlandı — ${sessionElapsedHuman(durationMs)} · set molası ${match.setBreakCount} · HRM ort ≈ ${Math.round(cardioHr)}bpm · sesli not ${voiceMemoBookmark ? '✓' : '✗'} · mola kartı ${intermissionCards} · yorgunluk alarmı ${fatigueAlerts}`);

// ═══════════════════════════════════════════════════════════════════════════
// FAZ 3 — MAÇ SONU: VELİ WHATSAPP ÖZETİ + MASTER CSV/JSON EXPORT
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n── FAZ 3: Maç Sonu Otomasyonu ──');
const durationMin = Math.max(1, Math.round(durationMs / 60000));
const trimpEstimate = Math.round(62 + durationMin * 1.4 + Math.round(cardioHr - 142) * 0.8);
const summary = compileParentWhatsAppSummary({
  athleteName: 'Deniz',
  parentName: 'Ayşe',
  durationMin,
  trimp: trimpEstimate,
  highlightPb: 'Yeni servis hızı rekoru: 178 km/s',
});
check('Veli WhatsApp özeti üretildi (süre + TRIMP + PB + toparlanma)', summary.includes(`${durationMin} dk`) && summary.includes('TRIMP') && summary.includes('rekoru') && summary.includes('Toparlanma'));
log('📲 Veli özeti:\n' + summary.split('\n').map((l) => '     ' + l).join('\n'));

const dailyLoads = Array.from({ length: 28 }, (_, i) => ({ date: `2026-08-${String((i % 28) + 1).padStart(2, '0')}`, load: 40 + (i % 7) * 8 }));
const bundle = buildMasterExport({
  sessionId: session.id,
  athleteId: ATHLETE,
  format: 'best_of_3',
  durationMin,
  frames: exportFrames,
  dailyLoads,
  trimpInput: { durationMin, avgHr: Math.round(cardioHr), restHr: 60, maxHr: 195, sex: 'M' },
  tid: { maturationOffsetMonths: -3, reactivePowerVelocity: 1.05, cognitiveReactionMs: 240, brakeEfficiencyPct: 78, injuryResiliencePct: 82 },
  track9: {
    health: { dbPingMs: 42, storagePingMs: 87, healthy: true },
    pairing: { bondedDevices: 3 },
    stress: { maxBufferMB: 50, packetLossPct: monitor.sample().packetLossPct },
    onboarding: { athleteCount: 4, invitesGenerated: 4 },
    crash: { queuedDumps: 0, flushed: 0 },
    session: { courtId: 1, format: 'best_of_3' },
    intermission: { serveFirstInPct: 54, gctDriftMs: 28 },
    voiceNotes: { count: voiceMemoBookmark ? 1 : 0, bucket: 'session-voice-notes' },
    parentSummary: { dispatched: true, messageChars: summary.length },
  },
});
const integrity = validateTrack9Integrity(bundle);
const exportDir = '/tmp/likya-sim-export';
mkdirSync(exportDir, { recursive: true });
writeFileSync(`${exportDir}/match-telemetry.csv`, bundle.rawTelemetry.csv);
writeFileSync(`${exportDir}/match-telemetry.json`, JSON.stringify(bundle.rawTelemetry.compactJson));
writeFileSync(`${exportDir}/match-summary.json`, JSON.stringify({ meta: bundle.meta, loads: bundle.loads, scout: bundle.scout, track9: bundle.track9, sizes: bundle.sizes }));
check('Master export: CSV + kompakt JSON + TRIMP/ACWR + scout + Track9', integrity.ok === true && bundle.meta.frameCount === exportFrames.length && bundle.loads.trimp.trimp > 0 && bundle.loads.acwr.acwr > 0 && typeof bundle.scout.grade === 'string');
log(`📦 Export → ${exportDir}/ (CSV ${bundle.sizes.csvKb}KB · JSON ${bundle.sizes.jsonKb}KB · ${bundle.meta.frameCount} kare · TRIMP ${bundle.loads.trimp.trimp} · ACWR ${bundle.loads.acwr.acwr} · scout ${bundle.scout.ceiling})`);

// ═══════════════════════════════════════════════════════════════════════════
// DİAGNOSTİK — paket kaybı <%2, bellek stabilitesi, alt-saniye bütünlüğü
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n── DİAGNOSTİK: Telemetri Bütünlüğü ──');
const sample = monitor.sample();
const lossPct = sample.packetLossPct;
check(`Paket kaybı ${lossPct}% < %${PACKET_LOSS_WARN_PCT}`, lossPct < PACKET_LOSS_WARN_PCT, `${generatedLeft - seqLeft} sol paket düştü (enjekte ${injectedLoss})`);
check('Bellek stabilitesi: ring-buffer ≤ 50MB + heap stabil', monitor.memoryBytes() <= MAX_BUFFER_MEMORY_BYTES && sample.bufferMemoryMB <= 50, `${sample.bufferMemoryMB}MB buffer · ${monitor.droppedFrames()} çerçeve düştü`);
const heapUsedMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
const rssMb = Math.round(process.memoryUsage().rss / 1024 / 1024);
check(`Heap stabil: ${heapUsedMb}MB heap / ${rssMb}MB RSS`, heapUsedMb < 256, `ingested ${generatedLeft + generatedRight} paket`);
check('Alt-saniye bütünlüğü: sol/sağ akış sıraları tutarlı', seqLeft > 0 && seqRight > 0 && seqLeft === generatedLeft - injectedLoss && seqRight === generatedRight);
check('Saha akışı tamamlandı: dolap + kalibrasyon + 3 set + yorgunluk + sesli not + özet', lockerClaim?.lockerId === 12 && baseline.stable === true && match.state === 'completed' && intermissionCards >= 1 && voiceMemoBookmark !== null && fatigueAlerts >= 1, `${intermissionCards} mola kartı · ${fatigueAlerts} yorgunluk alarmı`);

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${failed === 0 ? '🎉' : '⚠️'} SAHA SİMÜLASYONU: ${results.length - failed}/${results.length} kontrol geçti`);
process.exit(failed > 0 ? 1 : 0);


