// ============================================================================
// 🚀 PİLOT FAZ 1 SMOKE TESTİ (Adım 101-105)
// Health-check payload + ping matematiği • BLE eşleştirme/RSSI • 50MB ring
// buffer + paket kaybı • pilot ekip + veli OTP • çökme raporu kuyruğu
// Çalıştırma: node scripts/pilotPhase1SmokeTest.mts
// ============================================================================
import { buildHealthPayload, validateHealthPayload, formatUptime, measurePing } from '../src/app/lib/monitoring/healthCheckEngine.ts';
import {
  FIELD_DEVICE_PROFILES, fieldDeviceProfile, rssiQuality, rssiBars, batteryVoltageGauge, batteryHealth,
  computeBaselineZero, BASELINE_CALIBRATION_SAMPLES, BONDED_DEVICES_KEY, bondDevice, serializeBondedDevices,
  parseBondedDevices, upsertBondedDevice,
} from '../src/app/lib/hardware/fieldPairingWizardEngine.ts';
import {
  RingBuffer, PacketLossTracker, JitterTracker, CourtTelemetryStressMonitor, buildTelemetryPacket,
  MAX_BUFFER_MEMORY_BYTES, PACKET_LOSS_WARN_PCT,
} from '../src/app/lib/telemetry/courtTelemetryStressEngine.ts';
import { generatePilotSquad, generateParentInvites, verifyParentInvite, createOtp, PILOT_SQUAD_NAME } from '../src/app/lib/onboarding/pilotOnboardingEngine.ts';
import { classifyCrashKind, serializeCrashDump, deserializeCrashDump, FieldCrashReporter, createMemoryCrashStorage, CRASH_QUEUE_KEY } from '../src/app/lib/monitoring/fieldCrashReporter.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 101: HEALTH-CHECK ───────────────────────────────────────────────────
const payload = buildHealthPayload({ dbPingMs: 42, storagePingMs: 87, swAvailable: true, manifestValid: true, uptimeSec: 90_123 });
check('101a. Payload yapısı: statusCode 200 + 3 servis + build', payload.statusCode === 200 && payload.success === true && !!payload.services.database && !!payload.services.storage && !!payload.services.pwaServiceWorker && payload.build.app === 'likya-sportvisionx');
check('101b. Ping matematiği: total = db + storage', payload.latency.totalMs === 42 + 87 && payload.latency.dbPingMs === 42 && payload.latency.storagePingMs === 87);
check('101c. Uptime insan formatı (90.123sn)', payload.latency.systemUptimeSec === 90123 && formatUptime(90_123) === '1g 1s 2d 3sn');
check('101d. validateHealthPayload geçerli payload', validateHealthPayload(payload).valid === true);
check('101e. validateHealthPayload bozuk payload yakalar', validateHealthPayload({ ...payload, latency: { ...payload.latency, totalMs: 1 } }).valid === false);
check('101f. healthy bayrağı servis durumlarından türer', payload.healthy === true && buildHealthPayload({ dbPingMs: 5, storagePingMs: 5, swAvailable: false, uptimeSec: 1 }).healthy === false);
const pingMs = await measurePing(async () => { /* hızlı probe */ });
check('101g. measurePing süre döndürür (>= 0)', pingMs >= 0);
// ── ADIM 102: SAHA BLE EŞLEŞTİRME ────────────────────────────────────────────
check('102a. 3 cihaz profili (Sol/Sağ/HRM) + service UUID', FIELD_DEVICE_PROFILES.length === 3 && fieldDeviceProfile('insole_left').serviceUuid === '4fafc201-1fb5-459e-8fcc-c5c9c331914b' && fieldDeviceProfile('hrm').namePatterns.some((n) => n.includes('DECATHLON')));
check('102b. RSSI eşikleri: EXCELLENT≥-55 · GOOD≥-70 · FAIR≥-80 · WEAK<-80', rssiQuality(-50) === 'EXCELLENT' && rssiQuality(-60) === 'GOOD' && rssiQuality(-75) === 'FAIR' && rssiQuality(-85) === 'WEAK');
check('102c. RSSI bar seviyesi (4 bar)', rssiBars(-50) === 4 && rssiBars(-60) === 3 && rssiBars(-75) === 2 && rssiBars(-85) === 1);
check('102d. Pil voltaj göstergesi: 4.2V=%100 · 3.6V=%50 · 3.0V=%0', batteryVoltageGauge(4.2) === 100 && batteryVoltageGauge(3.6) === 50 && batteryVoltageGauge(3.0) === 0);
check('102e. Pil sağlığı: good/low/critical', batteryHealth(4.1) === 'good' && batteryHealth(3.3) === 'low' && batteryHealth(3.1) === 'critical');
const stableCal = computeBaselineZero(Array.from({ length: BASELINE_CALIBRATION_SAMPLES }, () => 0));
const unstableCal = computeBaselineZero(Array.from({ length: BASELINE_CALIBRATION_SAMPLES }, (_, i) => (i % 2 === 0 ? -0.5 : 0.5)));
check('102f. 5sn baseline: stabil örnekler → güvenli ofset', stableCal.stable === true && stableCal.offset === 0 && stableCal.samples === BASELINE_CALIBRATION_SAMPLES);
check('102g. Baseline değişken örnekler → stabil DEĞİL', unstableCal.stable === false && unstableCal.note.includes('Değişken'));
const bondedList = upsertBondedDevice([bondDevice('insole_left', 'mac-L1', { rssi: -58, voltage: 4.1 })], bondDevice('hrm', 'mac-H1', { rssi: -72, voltage: 3.9 }));
const reparsed = parseBondedDevices(serializeBondedDevices(bondedList));
check('102h. Bonded kayıt: localStorage seri/deseri + dedupe (aynı kind güncellenir)', reparsed.length === 2 && reparsed[1].deviceId === 'mac-H1' && upsertBondedDevice(bondedList, bondDevice('hrm', 'mac-H2')).length === 2 && BONDED_DEVICES_KEY === 'likya_bonded_devices');

// ── ADIM 103: 100Hz TELEMETRİ TAMPON & STRES ────────────────────────────────
const buf = new RingBuffer<{ b: number }>(10_000, () => 100);
let dropped = 0;
for (let i = 0; i < 1000; i++) dropped = buf.push({ b: i }).dropped;
check('103a. Ring-buffer bellek üst sınırı: 10KB cap → 900 düşürme', buf.stats().memoryBytes <= 10_000 && dropped === 900 && buf.stats().size === 100);
check('103b. Varsayılan 50MB üst sınır (2 saatlik maç güvenliği)', MAX_BUFFER_MEMORY_BYTES === 50 * 1024 * 1024);
const lossTracker = new PacketLossTracker();
for (let i = 1; i <= 100; i++) lossTracker.record(i);
const gapTracker = new PacketLossTracker();
for (let i = 1; i <= 50; i++) gapTracker.record(i);
for (let i = 56; i <= 105; i++) gapTracker.record(i); // 51-55 kayıp (5/105)
check('103c. Paket kaybı: sağlıklı %0 · boşluklu >%2 uyarı', lossTracker.lossPct() === 0 && lossTracker.hasWarning() === false && gapTracker.lossPct() > PACKET_LOSS_WARN_PCT && gapTracker.hasWarning() === true);
const jitterOk = new JitterTracker();
[0, 10, 20, 30, 40, 50].forEach((t) => jitterOk.record(t));
const jitterBad = new JitterTracker();
[0, 10, 20, 35, 45, 55].forEach((t) => jitterBad.record(t));
check('103d. Jitter: nominal 10ms → 0ms · 15ms sapma → 1ms', jitterOk.jitterMs() === 0 && jitterBad.jitterMs() === 1);
const monitor = new CourtTelemetryStressMonitor();
for (let i = 1; i <= 100; i++) {
  monitor.ingest(buildTelemetryPacket('insole_left', i, i * 10, 64));
  monitor.ingest(buildTelemetryPacket('insole_right', i, i * 10, 64));
}
const healthySample = monitor.sample();
check('103e. Monitör sağlıklı akış → healthy + %0 kayıp', healthySample.status === 'healthy' && healthySample.packetLossPct === 0);
const stressMonitor = new CourtTelemetryStressMonitor();
for (let i = 1; i <= 50; i++) stressMonitor.ingest(buildTelemetryPacket('insole_left', i, i * 10, 256));
for (let i = 56; i <= 300_050; i++) stressMonitor.ingest(buildTelemetryPacket('insole_left', i, i * 10, 256));
const stressSample = stressMonitor.sample();
check('103f. Stres: bellek 50MB üstünde asla → düşürme tetiklenir + uyarı', stressMonitor.memoryBytes() <= MAX_BUFFER_MEMORY_BYTES && stressMonitor.droppedFrames() > 0 && stressSample.status === 'warning');
// ── ADIM 104: PİLOT EKİP & VELİ HIZLI KAYIT ─────────────────────────────────
const squad = generatePilotSquad();
check('104a. Pilot batch: 1 koç + 4 sporcu + "U14 Elit Gelişim"', squad.coach.role === 'head_coach' && squad.athletes.length === 4 && squad.squad.name === PILOT_SQUAD_NAME && squad.squad.name === 'U14 Elit Gelişim');
const fixedRng = () => 0.5;
const otp = createOtp(fixedRng);
check('104b. 6 haneli OTP (deterministik RNG)', otp.length === 6 && /^\d{6}$/.test(otp) && otp === '555555');
const invites = generateParentInvites(squad.athletes, { rng: fixedRng, ttlHours: 48 });
check('104c. 4 veli daveti: link + 6 hane OTP + 48sa TTL', invites.length === 4 && invites.every((i) => i.inviteLink.includes('parent/verify') && /^\d{6}$/.test(i.otp) && i.status === 'pending'));
const okVerify = verifyParentInvite(invites, invites[0].inviteId, invites[0].otp);
check('104d. Doğru OTP → veli doğrulanır + davet "used"', okVerify.ok === true && okVerify.message.includes('doğrulandı') && invites[0].status === 'used');
const badVerify = verifyParentInvite(invites, invites[0].inviteId, '000000');
check('104e. Yanlış OTP → reddedilir (kullanılmış davet de reddedilir)', badVerify.ok === false && verifyParentInvite(invites, 'inv_olmayan', '123456').ok === false);

// ── ADIM 105: SAHA HATA TELEMETRİSİ & ÇÖKME RAPORLAYICI ─────────────────────
check('105a. Hata sınıflandırma: GATT/kota/ağ/unhandled', classifyCrashKind(new Error('GATT operation failed: Device disconnected')) === 'gatt_disconnect' && classifyCrashKind(new DOMException('The quota has been exceeded.', 'QuotaExceededError')) === 'indexeddb_quota' && classifyCrashKind(new TypeError('Failed to fetch')) === 'network' && classifyCrashKind(new Error('genel hata')) === 'runtime');
const crash = serializeCrashDump(new Error('GATT server disconnected'), { deviceId: 'mac-H1' }, 'https://court7.likya.com/live');
const restored = deserializeCrashDump(JSON.stringify(crash));
check('105b. Çökme dökümü seri/deseri roundtrip', restored?.id === crash.id && restored.kind === 'gatt_disconnect' && restored.context.deviceId === 'mac-H1' && restored.url === 'https://court7.likya.com/live');
const storage = createMemoryCrashStorage();
const reporter = new FieldCrashReporter(storage, 3); // max 3 döküm
reporter.capture(new Error('A'));
reporter.capture(new Error('B'));
reporter.capture(new Error('C'));
reporter.capture(new Error('D'));
const replay = reporter.replayQueue();
check('105c. Kuyruk sınırı: 4 capture → son 3 kalır + sıra korunur', reporter.queueLength() === 3 && replay.map((d) => d.message).join('') === 'BCD');
const offline = await reporter.flush(async () => true, false);
check('105d. Çevrimdışı flush: 0 gönderim, hepsi bekliyor', offline.flushed === 0 && offline.pending === 3 && reporter.queueLength() === 3);
const online = await reporter.flush(async () => true, true);
check('105e. Ağ dönünce otomatik flush: 3/3 gönderildi', online.flushed === 3 && online.pending === 0 && reporter.queueLength() === 0 && CRASH_QUEUE_KEY === 'likya_crash_queue');
const retryReporter = new FieldCrashReporter();
retryReporter.capture(new Error('X'));
const retryFlush = await retryReporter.flush(async () => false, true);
check('105f. Başarısız gönderim kuyrukta kalır (replayAttempts artar)', retryFlush.failed === 1 && retryFlush.pending === 1 && retryReporter.replayQueue()[0].replayAttempts === 1);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);


