// ============================================================================
// 🛠️ TRACK 2 — BATCH 5 SMOKE TESTİ (Adım 21-25)
// Pil • Kalibrasyon • Sensör Sync • Adaptif Örnekleme • Teşhis
// Çalıştırma: npx tsx scripts/track2Batch5SmokeTest.mts
// ============================================================================
import { parseBatteryLevel, classifyPower, powerBadge, batteryTelemetryStatus, LOW_BATTERY_THRESHOLD } from '../src/app/lib/hardware/batteryTelemetryService';
import { applyCalibration } from '../src/app/components/InsoleCalibrationWizard';
import { lerp, interpolateAt, buildSyncedFrames, SYNC_CLOCK_MS, type RawSample } from '../src/app/lib/hardware/sensorSyncEngine';
import { decideSamplingMode, estimateBatteryRuntime, ADAPTIVE_MODES } from '../src/app/lib/hardware/adaptiveSamplingEngine';
import { rssiQuality, RSSI_QUALITY } from '../src/app/components/HardwareDiagnosticsOverlay';

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

// ── 4. Adaptif Örnekleme (Adım 24) ──
check(decideSamplingMode(60) === 'DRILL_100HZ' && decideSamplingMode(20) === 'IDLE_20HZ', 'Yoğunluk → mod kararı', '60→Drill 20→Idle');
check(ADAPTIVE_MODES.DRILL_100HZ.intervalMs === 10, 'Drill modu 100Hz (10ms)', `${ADAPTIVE_MODES.DRILL_100HZ.intervalMs}ms`);
const drillRuntime = estimateBatteryRuntime(40, 250, 'DRILL_100HZ');
const idleRuntime = estimateBatteryRuntime(40, 250, 'IDLE_20HZ');
check(idleRuntime.hours > drillRuntime.hours, 'Idle modu pil ömrü uzatır', `${drillRuntime.hours}h vs ${idleRuntime.hours}h`);

// ── 5. Teşhis (Adım 25) ──
check(rssiQuality(-50) === 'EXCELLENT' && rssiQuality(-90) === 'POOR', 'RSSI kalite eşikleri', `${RSSI_QUALITY[rssiQuality(-50)].label} → ${RSSI_QUALITY[rssiQuality(-90)].label}`);
check(rssiQuality(-70) === 'FAIR', 'RSSI orta bant', RSSI_QUALITY.FAIR.label);

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/14 geçti`);
process.exit(pass === 14 ? 0 : 1);
