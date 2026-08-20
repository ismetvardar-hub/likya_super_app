// ============================================================================
// 🛠️ TRACK 2 — BATCH 5 SMOKE TESTİ (Adım 21-25)
// Pil • Kalibrasyon • Sensör Sync • Adaptif Örnekleme • Teşhis
// Çalıştırma: node scripts/track2Batch5SmokeTest.mts
// ============================================================================
import { parseBatteryLevel, classifyPower, powerBadge, batteryTelemetryStatus, LOW_BATTERY_THRESHOLD } from '../src/app/lib/hardware/batteryTelemetryService.ts';
import { applyCalibration, computeCalibrationCoefficients } from '../src/app/lib/hardware/insoleCalibration.ts';
import { lerp, interpolateAt, buildSyncedFrames, SYNC_CLOCK_MS, type RawSample } from '../src/app/lib/hardware/sensorSyncEngine.ts';
import { decideSamplingMode, estimateBatteryRuntime, ADAPTIVE_MODES } from '../src/app/lib/hardware/adaptiveSamplingEngine.ts';
import { rssiQuality, RSSI_QUALITY, linkStability } from '../src/app/lib/hardware/diagnosticsMetrics.ts';
import { VirtualBleSensorLab } from '../src/app/lib/hardware/simulation/virtualBleSensorLab.ts';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// ── 1. Pil (Adım 21) ──
const batt = parseBatteryLevel(new DataView(new Uint8Array([12]).buffer));
check(batt === 12, '0x2A19 parse', `%${batt}`);
check(classifyPower(12) === 'low' && classifyPower(3) === 'critical', 'Düşük pil sınıflandırma (<%15)', `eşik %${LOW_BATTERY_THRESHOLD}`);
check(powerBadge(80).badge.includes('İyi') && powerBadge(80, true).badge.includes('Şarj'), 'Güç durum rozetleri', powerBadge(80).badge + ' / ' + powerBadge(80, true).badge);
check(batteryTelemetryStatus(8).includes('Kritik') || batteryTelemetryStatus(8).includes('Düşük'), 'Düşük pil uyarısı metni', batteryTelemetryStatus(8));

// ── 2. Kalibrasyon (Adım 22) ──
const kToe = 0.2, tare = 500;
check(applyCalibration(2650, tare, kToe) === 430, 'ADC → Newton uygulama', `${applyCalibration(2650, tare, kToe)} N`);
const lin = computeCalibrationCoefficients({ weightKg: 65, tareAdc: { toe: 512, heel: 510 }, singleAdc: { toe: 2650, heel: 2550 } });
check(lin.kToe === 0.239 && lin.kHeel === 0.063, 'Lineer regresyon katsayıları (k=ΔN/ΔADC)', `kToe ${lin.kToe} · kHeel ${lin.kHeel}`);
check(Math.round(applyCalibration(2650, lin.tareToe, lin.kToe)) === 511, "Katsayılar ADC'ye uygulanınca ağırlık ≈ 511N", '65kg × 0.8 × g');

// ── 3. Sensör Sync (Adım 23) ──
check(lerp(100, 200, 0.5) === 150, 'Doğrusal interpolasyon', '150');
const raw: RawSample[] = [
  { source: 'HRM', tMs: 0, value: 150 },
  { source: 'HRM', tMs: 1000, value: 160 },
  { source: 'INSOLE', tMs: 100, value: 80 },
  { source: 'INSOLE', tMs: 200, value: 90 },
  { source: 'IMU', tMs: 0, value: 1.0 },
  { source: 'IMU', tMs: 500, value: 2.0 },
];
check(interpolateAt(raw.filter((r) => r.source === 'HRM'), 500) === 155, 'HRM 500ms interpolasyon', '155 bpm');
const frames = buildSyncedFrames(raw, 0, 400);
check(frames.length === 5 && frames[2].tMs === 200, '100ms ortak saat vektörü', `${frames.length} çerçeve @ ${SYNC_CLOCK_MS}ms`);
const f500 = buildSyncedFrames(raw, 0, 500);
check(f500.some((f) => f.imuG !== undefined), 'IMU normalize frame', 'imuG eklendi');

// Kanal bilgili INSOLE akışı → toePct/heelPct/gctMs 100ms vektörde doldurulur
const rawCh: RawSample[] = [
  { source: 'INSOLE', tMs: 0, value: 60, channel: 'forefoot' },
  { source: 'INSOLE', tMs: 0, value: 40, channel: 'heel' },
  { source: 'INSOLE', tMs: 0, value: 180, channel: 'gct' },
  { source: 'INSOLE', tMs: 200, value: 90, channel: 'forefoot' },
  { source: 'INSOLE', tMs: 200, value: 10, channel: 'heel' },
  { source: 'INSOLE', tMs: 200, value: 150, channel: 'gct' },
];
const fCh = buildSyncedFrames(rawCh, 0, 200);
check(fCh[1].toePct === 75 && fCh[1].heelPct === 25 && fCh[1].gctMs === 165, 'INSOLE kanal interpolasyonu (100ms)', `toe ${fCh[1].toePct} · heel ${fCh[1].heelPct} · gct ${fCh[1].gctMs}`);

// feedToSync uçtan uca: lab → RawSample → toePct/heelPct/gctMs
const labSync = new VirtualBleSensorLab('normal', 4).feedToSync(2000);
check(labSync.some((f) => f.toePct !== undefined && f.heelPct !== undefined && f.gctMs !== undefined), 'feedToSync → toe/heel/GCT senkron frame', `${labSync.filter((f) => f.toePct !== undefined).length} frame`);

// ── 4. Adaptif Örnekleme (Adım 24) ──
check(decideSamplingMode(60) === 'DRILL_100HZ' && decideSamplingMode(20) === 'IDLE_20HZ', 'Yoğunluk → mod kararı', '60→Drill 20→Idle');
check(ADAPTIVE_MODES.DRILL_100HZ.intervalMs === 10, 'Drill modu 100Hz (10ms)', `${ADAPTIVE_MODES.DRILL_100HZ.intervalMs}ms`);
const drillRuntime = estimateBatteryRuntime(40, 250, 'DRILL_100HZ');
const idleRuntime = estimateBatteryRuntime(40, 250, 'IDLE_20HZ');
check(idleRuntime.hours > drillRuntime.hours, 'Idle modu pil ömrü uzatır', `${drillRuntime.hours}h vs ${idleRuntime.hours}h`);

// ── 5. Teşhis (Adım 25) ──
check(rssiQuality(-50) === 'EXCELLENT' && rssiQuality(-90) === 'POOR', 'RSSI kalite eşikleri', `${RSSI_QUALITY[rssiQuality(-50)].label} → ${RSSI_QUALITY[rssiQuality(-90)].label}`);
check(rssiQuality(-70) === 'FAIR', 'RSSI orta bant', RSSI_QUALITY.FAIR.label);
check(linkStability(0) === 'Stabil' && linkStability(12) === 'Kritik', 'Bağlantı stabilite rozetleri', '0→Stabil · 12→Kritik');

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/19 geçti`);
process.exit(pass === 19 ? 0 : 1);
