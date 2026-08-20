// ============================================================================
// 🚀 PİLOT FAZ 4 SMOKE TESTİ — TRACK 11 UÇTAN UCA (Adım 116-120)
// Filo batarya/membran uyarıları • WebRTC DataChannel paketleme + faz hizası •
// Federasyon pasaportu şema + PII gizleme • zero-load drift düzeltmesi •
// Track 11 bütünlüğü (116-120). Çalıştırma: node scripts/pilotPhase4SmokeTest.mts
// ============================================================================
import { existsSync } from 'node:fs';
import {
  classifyBatterySoc, fleetMaintenanceAlerts, fleetSummary, buildOtaRolloutSchedule, approveAcademyRollout,
  canApproveAcademyRollout, MEMBRANE_DEGRADATION_WARN_PCT, type FleetDevice,
} from '../src/app/lib/hardware/hardwareFleetManager.ts';
import {
  DATA_CHANNEL_NAMES, TELEMETRY_CHANNEL, EVENT_MARKER_CHANNEL, MAX_STREAM_LATENCY_MS,
  packTelemetryPacket, unpackTelemetryPacket, packEventMarker, unpackEventMarker,
  alignFrame, buildFrameAlignmentBatch, streamLatencyOk, telemetryPacketsPerSecond,
} from '../src/app/lib/video/webrtcCourtStreamer.ts';
import {
  buildFederationExport, validateFederationSchema, maskPii, maskDate, developmentStageFor,
  type AthletePassportInput,
} from '../src/app/lib/federation/federationDataExchange.ts';
import {
  detectNonWeightBearing, applyDriftCorrection, computeCurrentBaseline, REST_WINDOW_MS,
  type FsrChannelSample,
} from '../src/app/lib/hardware/sensorSelfHealingEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 116: DONANIM FİLO SAĞLIĞI ──────────────────────────────────────────
check('116a. SoC sınıflandırma: ≤5 kritik · <15 düşük · normal · şarjda normal', classifyBatterySoc(4) === 'critical' && classifyBatterySoc(10) === 'low' && classifyBatterySoc(50) === 'normal' && classifyBatterySoc(3, true) === 'normal');
const fleet: FleetDevice[] = [
  { deviceId: 's08', kind: 'insole', setTag: 'Insole Set #08', batterySoC: 67, charging: false, chargingCycles: 90, firmwareVersion: 'v2.3.0', targetFirmwareVersion: 'v2.4.1', membraneDegradationPct: 22, degradationIndex: 0.35, lastSeenAt: '2026-08-20T10:00:00Z' },
  { deviceId: 's09', kind: 'insole', setTag: 'Insole Set #09', batterySoC: 4, charging: false, chargingCycles: 60, firmwareVersion: 'v2.4.1', targetFirmwareVersion: 'v2.4.1', membraneDegradationPct: 5, degradationIndex: 0.85, lastSeenAt: '2026-08-20T10:00:00Z' },
  { deviceId: 'hrm-a', kind: 'hrm', setTag: 'HRM #A', batterySoC: 10, charging: false, chargingCycles: 40, firmwareVersion: 'v2.4.1', targetFirmwareVersion: 'v2.4.1', membraneDegradationPct: 0, degradationIndex: 0.06, lastSeenAt: '2026-08-20T10:00:00Z' },
];
const alerts = fleetMaintenanceAlerts(fleet);
const membraneAlert = alerts.find((a) => a.message.includes('membrane'));
check('116b. Membran aşınması uyarısı: "Insole Set #08 ... degradation 22% (Recalibration recommended)"', membraneAlert?.severity === 'warning' && membraneAlert?.message.includes('FSR pressure membrane degradation 22%') && membraneAlert.message.includes('(Recalibration recommended)') && MEMBRANE_DEGRADATION_WARN_PCT === 15);
check('116c. Uyarı kuralları: kritik pil + düşük pil + firmware drift tetiklenir', alerts.some((a) => a.severity === 'critical' && a.message.includes('kritik')) && alerts.some((a) => a.message.includes('şarj gerekli')) && alerts.some((a) => a.severity === 'info' && a.message.includes('OTA rollout bekliyor')));
const schedule = buildOtaRolloutSchedule(fleet);
const approved = approveAcademyRollout(schedule.academy, { successRatePct: 98 });
const blocked = approveAcademyRollout(schedule.academy, { successRatePct: 80 });
check('116d. OTA kademeli rollout: Canary → Akademi stage-gating', schedule.canary.stage === 'canary' && schedule.canary.deviceIds.includes('s08') && schedule.academy.gated === true && approved.status === 'approved' && blocked.status === 'pending' && canApproveAcademyRollout({ successRatePct: 98 }) === true && canApproveAcademyRollout({ successRatePct: 80 }) === false);
const fleetStats = fleetSummary(fleet);
check('116e. Filo özeti: 3 cihaz, 1 kritik/düşük, 1 eski FW, 2 bozuk', fleetStats.total === 3 && fleetStats.lowBatteryCount === 2 && fleetStats.outOfDateFirmwareCount === 1 && fleetStats.degradedCount === 2);
// ── ADIM 117: WEBRTC DATACHANNEL & FAZ HİZALAMA ─────────────────────────────
check('117a. DataChannel adları + <300ms hedef', DATA_CHANNEL_NAMES.length === 2 && TELEMETRY_CHANNEL === 'telemetry_channel' && EVENT_MARKER_CHANNEL === 'event_marker_channel' && MAX_STREAM_LATENCY_MS === 300 && streamLatencyOk(299) === true && streamLatencyOk(301) === false);
const tp: Parameters<typeof packTelemetryPacket>[0] = { seq: 42, tsUs: 420_000, stream: 'insole_left', grfZ: 1.82, gctMs: 231 };
const tpPacked = packTelemetryPacket(tp);
const tpUnpacked = unpackTelemetryPacket(tpPacked);
check('117b. Telemetri paketi roundtrip (100Hz/10ms)', tpUnpacked?.seq === 42 && tpUnpacked?.grfZ === 1.82 && tpUnpacked?.gctMs === 231 && tpUnpacked?.tsUs === 420_000 && telemetryPacketsPerSecond(100) === 100);
const markerRound = unpackEventMarker(packEventMarker({ tsUs: 555_000, label: 'PB_ACHIEVED' }));
check('117c. Event marker roundtrip + bozuk paket null', markerRound?.label === 'PB_ACHIEVED' && markerRound?.tsUs === 555_000 && unpackTelemetryPacket('not-json') === null);
const alignOk = alignFrame(10_000, 10_500);   // 500µs kayma ≤ 1000µs
const alignBad = alignFrame(10_000, 11_500);  // 1500µs kayma
const batch = buildFrameAlignmentBatch([10_000, 20_000], [10_500, 20_300]);
check('117d. Mikro-saniye faz hizası: 500µs ✓ · 1500µs ✗ · batch 2/2 hizalı', alignOk.aligned === true && alignOk.skewUs === 500 && alignBad.aligned === false && batch.aligned === true && batch.alignedCount === 2 && batch.pairCount === 2);

// ── ADIM 118: FEDERASYON (TTF/ITF) VERİ DEĞİŞİMİ ────────────────────────────
const passportInput: AthletePassportInput = {
  athleteId: 'at_u14_01',
  fullName: 'Deniz Kaya',
  dateOfBirth: '2013-03-15',
  sex: 'M',
  heightCm: 162,
  weightKg: 48,
  phvOffsetMonths: -3,
  tidScore: 74,
  tidPercentile: 88,
  matchLoad: { trimp: 186, minutes: 62, matches: 1 },
  speedSplits: [{ split: '0-5m', mps: 6.2 }, { split: '5-10m', mps: 7.1 }],
  medicalNotes: 'Sol diz medial menisküs sürtünmesi gözlemlendi, takip ediliyor',
};
const itfExport = buildFederationExport(passportInput, 'itf_junior_biometric');
const ttfExport = buildFederationExport(passportInput, 'ttf_development_passport');
const serializedItf = JSON.stringify(itfExport);
check('118a. PII maskesi: isim/doğum/tıbbi not gizlenir, sızmaz', maskPii('Deniz Kaya') === 'D' + '•'.repeat('Deniz Kaya'.length - 1) && maskDate('2013-03-15') === '••••-••-••' && !serializedItf.includes('Deniz') && !serializedItf.includes('2013') && !serializedItf.includes('menisküs'));
check('118b. ITF pasaportu: şema geçerli + PII obfuscated + TID yüzdelik', itfExport.schemaValid === true && itfExport.piiObfuscated === true && itfExport.tid.percentile === 88 && itfExport.athlete.age === 13 && itfExport.load.trimp === 186);
check('118c. TTF pasaportu: yük + hız splitleri + gelişim aşaması', ttfExport.schemaValid === true && ttfExport.speedSplits.length === 2 && ttfExport.speedSplits[0].mps === 6.2 && ttfExport.tid.developmentStage === 'Developmental Tier 1' && developmentStageFor(96) === 'Elite National Prospect');
check('118d. Şema doğrulama: eksik alan yakalanır', validateFederationSchema({ format: 'ttf_development_passport', athlete: { athleteId: 'x' }, load: {}, tid: {} }, 'ttf_development_passport').valid === false);
// ── ADIM 119: SENSÖR SELF-HEALING & DRIFT DÜZELTMESİ ───────────────────────
const restSamples: FsrChannelSample[] = Array.from({ length: 25 }, (_, i) => ({ tsMs: i * 500, value: 5 }));
const rests = detectNonWeightBearing(restSamples, 8, REST_WINDOW_MS);
check('119a. Dinlenme tespiti: 12.5sn kesintisiz düşük yük → 1 geçerli aralık', rests.length === 1 && rests[0].valid === true && rests[0].durationMs >= REST_WINDOW_MS && rests[0].sampleCount === 25 && computeCurrentBaseline(restSamples) === 5);
const liveSamples: FsrChannelSample[] = [{ tsMs: 13_000, value: 20 }, { tsMs: 13_500, value: 22 }, { tsMs: 14_000, value: 19 }];
const corrected = applyDriftCorrection(liveSamples, rests, 12);
check('119b. Drift düzeltme matematiği: baseline 12 → 5, okuma 20 → 13', corrected.applied === true && corrected.newBaselineOffset === 5 && corrected.driftAmount === 7 && corrected.correctedSamples[0].value === 13);
const noRest = applyDriftCorrection(liveSamples, [], 12);
check('119c. Geçerli dinlenme yoksa düzeltme uygulanmaz (kayıpsız geçiş)', noRest.applied === false && noRest.driftAmount === 0 && noRest.note.includes('yok'));

// ── ADIM 120: TRACK 11 UÇTAN UCA BÜTÜNLÜK ───────────────────────────────────
const track11Files = [
  'src/app/lib/hardware/hardwareFleetManager.ts',
  'src/app/lib/video/webrtcCourtStreamer.ts',
  'src/app/lib/federation/federationDataExchange.ts',
  'src/app/lib/hardware/sensorSelfHealingEngine.ts',
  'src/modules/facility/HardwareFleetDashboard.tsx',
  'src/modules/video/LiveWebRtcPlayer.tsx',
  'scripts/pilotPhase4SmokeTest.mts',
];
check('120a. Track 11 dosyaları: 4 motor + 2 komponent + smoke mevcut', track11Files.every((f) => existsSync(f)));
const cross =
  fleetMaintenanceAlerts(fleet).length > 0 &&
  unpackTelemetryPacket(packTelemetryPacket(tp))?.seq === 42 &&
  buildFederationExport(passportInput, 'itf_junior_biometric').schemaValid === true &&
  applyDriftCorrection(liveSamples, rests, 12).applied === true &&
  alignFrame(10_000, 10_500).aligned === true;
check('120b. Track 11 veri hattı: filo + WebRTC + federasyon + self-healing uçtan uca', cross === true);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);


