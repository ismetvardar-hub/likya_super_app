// ============================================================================
// 🛠️ TRACK 2 — BATCH 6 SMOKE TESTİ (Adım 26-30)
// Virtual BLE mock • Dual Insole GATT • Asimetri/Bilateral Denge • OTA • Pack/Unpack
// Çalıştırma: node scripts/track2Batch6SmokeTest.mts
// ============================================================================
import { buildVirtualInsolePeripheral, type VirtualBleDevice, type VirtualGattCharacteristic } from '../src/app/lib/hardware/simulation/virtualBlePeripheral.ts';
import { DualInsoleManager, INSOLE_LEFT_ID, INSOLE_RIGHT_ID } from '../src/app/lib/hardware/ble/dualInsoleManager.ts';
import { asymmetryIndex, bilateralLoadBalance, analyzeStride, analyzeStrideWindow, ASYMMETRY_WARNING_THRESHOLD } from '../src/app/lib/sports/analytics/asymmetryEngine.ts';
import { BleOtaService, verifyOtaChunk } from '../src/app/lib/hardware/firmware/bleOtaService.ts';
import { buildOtaPlan, crc32 } from '../src/app/lib/hardware/bleOtaEngine.ts';
import { INSoleServiceUUID, INSolePressureCharUUID, packInsolePacket, unpackInsolePacket } from '../src/app/lib/hardware/bleProtocolDefinition.ts';
import { computeCalibrationCoefficients } from '../src/app/lib/hardware/insoleCalibration.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 26: VIRTUAL BLE GATT LIFECYCLE ───────────────────────────────────────
const dev = buildVirtualInsolePeripheral(INSOLE_LEFT_ID, { batteryPercent: 85, rssiDbm: -52, seed: 3 });
dev.connect();
check('26a. connect() → GATT bağlı', dev.gatt.connected === true);

const svc = await dev.gatt.getPrimaryService(INSoleServiceUUID);
const char = svc.getCharacteristic(INSolePressureCharUUID);
check('26b. Servis+karakteristik keşfi', svc.uuid === INSoleServiceUUID && char.uuid === INSolePressureCharUUID);
check('26c. NOTIFY + WRITE özellikleri', char.properties.includes('NOTIFY') && char.properties.includes('WRITE'));

const battSvc = await dev.gatt.getPrimaryService('180F');
const battVal = await battSvc.getCharacteristic('2A19').readValue();
check('26d. Pil okuma (0x2A19) aralıkta', battVal.getUint8(0) === 85);
check('26e. RSSI deterministik', dev.readRssi() === -52);

let notified: number | null = null;
const onChar = (evt: { target: { value: DataView } }) => {
  notified = evt.target.value.getUint8(0);
};
char.addEventListener('characteristicvaluechanged', onChar);
char.simulateNotification(new Uint8Array([42, 0, 0, 0, 0, 0]));
check('26f. Notify listener tetiklenir', notified === 42);
char.removeEventListener('characteristicvaluechanged', onChar);

dev.disconnect();
let connectError = false;
try {
  await dev.gatt.getPrimaryService(INSoleServiceUUID);
} catch {
  connectError = true;
}
check('26g. disconnect → servis erişimi reddedilir', connectError === true && dev.gatt.connected === false);

// ── ADIM 27: DUAL INSOLE GATT YÖNETİMİ ─────────────────────────────────────────
const manager = new DualInsoleManager(
  buildVirtualInsolePeripheral(INSOLE_LEFT_ID, { seed: 11 }),
  buildVirtualInsolePeripheral(INSOLE_RIGHT_ID, { seed: 22 }),
);
const conn = await manager.connect();
check('27a. İki periferik de bağlandı', conn.leftConnected && conn.rightConnected);

const pkt = manager.feedStride(0, { toePct: 70, heelPct: 30, gctMs: 180, strikeForce: 0.5 }, { toePct: 60, heelPct: 40, gctMs: 210, strikeForce: 0.6 });
check('27b. Bilateral stride decode (L/R)', pkt.seq === 0 && pkt.left.toePct === 70 && pkt.left.gctMs === 180 && pkt.right.toePct === 60 && pkt.right.gctMs === 210);

const window = manager.collectWindow(1200, 50, 9);
check('27c. Eş zamanlı pencere → 24 stride', window.length === 24 && manager.getPacketCount() === 25);
check('27d. Stride GCT bağımsız (her bacak ayrı)', window.some((p) => p.left.gctMs !== p.right.gctMs));

// ── ADIM 28: ASİMETRİ & BİLATERAL DENGE ───────────────────────────────────────
check('28a. Simetrik GCT → %0 asimetri', asymmetryIndex(200, 200) === 0);
check('28b. Formül: |200-240|/240 = %16.7', asymmetryIndex(200, 240) === 16.7);
const bal = bilateralLoadBalance(520, 480);
check('28c. Yük dengesi 52/48', bal.leftPct === 52 && bal.rightPct === 48);

const imbalanced = analyzeStride({ gctLeftMs: 200, gctRightMs: 240, peakLoadLeftN: 520, peakLoadRightN: 480 });
check(`28d. %16.7 > %${ASYMMETRY_WARNING_THRESHOLD} → uyarı`, imbalanced.warning === true && imbalanced.status === 'warning');

const balancedWindow = manager.collectWindow(1200, 100, 5);
const winAnalysis = analyzeStrideWindow(balancedWindow);
check('28e. Dengeli pencere → uyarı yok', winAnalysis.warning === false);
manager.disconnect();

// ── ADIM 30: KALİBRASYON REGRESYON + BINARY PACK/UNPACK ───────────────────────
const lin = computeCalibrationCoefficients({ weightKg: 65, tareAdc: { toe: 512, heel: 510 }, singleAdc: { toe: 2650, heel: 2550 } });
check('30a. Lineer regresyon katsayıları', lin.kToe === 0.239 && lin.kHeel === 0.063);

const packed = packInsolePacket(70, 30, 180, 0.5);
check('30b. pack → 6 byte', packed.length === 6 && packed[0] === 70 && packed[1] === 30);
const unpacked = unpackInsolePacket(new DataView(packed.buffer));
check('30c. pack/unpack yuvarlak geçiş', unpacked.toePct === 70 && unpacked.heelPct === 30 && unpacked.gctMs === 180 && unpacked.strikeForce === 0.5);

const bigGct = packInsolePacket(50, 50, 500, 0.8);
const bigUnpacked = unpackInsolePacket(new DataView(bigGct.buffer));
check('30d. GCT 500 (uint16 LE) doğru', bigUnpacked.gctMs === 500 && bigUnpacked.strikeForce === 0.8);

// ── ADIM 29: BLE OTA SERVİSİ ───────────────────────────────────────────────────
const otaDev = buildVirtualInsolePeripheral('OTA_TARGET', { seed: 5 });
otaDev.connect();
const otaSvc = await otaDev.gatt.getPrimaryService(INSoleServiceUUID);
const otaChar = otaSvc.getCharacteristic(INSolePressureCharUUID);
const firmware = new Uint8Array(Array.from({ length: 100 }, (_, i) => (i * 7) & 0xff));

const progressEvents: string[] = [];
const ota = new BleOtaService();
const otaResult = await ota.start(firmware, otaChar, (e) => progressEvents.push(e.status));
check('29a. OTA tamamlandı + CRC doğrulandı', otaResult.ok === true && otaResult.crcVerified === true && otaResult.packets === 5);
check('29b. İlerleme olayları (sending→verifying→done)', progressEvents.includes('sending') && progressEvents.includes('verifying') && progressEvents.includes('done'));

// Bozuk kanal: her parçayı bozan yazıcı → CRC hatası
const corruptChar = {
  writeLog: [] as Uint8Array[],
  async writeValueWithResponse(v: Uint8Array): Promise<void> {
    const b = new Uint8Array(v);
    b[6] ^= 0xff; // payload'ı boz
    this.writeLog.push(b);
  },
} as VirtualGattCharacteristic;
const corruptResult = await new BleOtaService().start(firmware, corruptChar);
check('29c. Bozuk iletim → CRC hatası + firmware reddi', corruptResult.ok === false && corruptResult.crcVerified === false);

const plan = buildOtaPlan(firmware);
check('29d. verifyOtaChunk: doğru vs bozuk', verifyOtaChunk(plan[0], plan[0].payload) === true && verifyOtaChunk(plan[0], new Uint8Array([1, 2, 3])) === false);
check('29e. Firmware CRC standart vektörü', crc32(new TextEncoder().encode('123456789')) === 0xcbf43926);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

