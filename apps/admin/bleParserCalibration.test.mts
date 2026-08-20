// ============================================================================
// TRACK 2 DOĞRULAMA — BLE parsing • kalibrasyon hattı • çift tabanlık • OTA
// (Adım 27-30) Çalıştırma: node bleParserCalibration.test.mts
// ============================================================================
import { parseInsolePressure, parseHeartRateValue, computeRmssd } from './src/app/lib/hardware/webBluetoothBridge.ts';
import { simulateDualInsole, footStrikeAsymmetry } from './src/app/lib/sports/dualInsoleEngine.ts';
import { crc32, buildOtaPlan, encodeOtaPacket, decodeOtaPacket, createOtaSession, advanceOtaSession } from './src/app/lib/hardware/bleOtaEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean) {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name);
}

// ── ADIM 30a: BLE insole payload ayrıştırma (0x4FAF) ─────────────────────────
// Payload: [0]=toe % [1]=heel % [2..3]=gct_ms (uint16 LE)
const insoleBuf = new ArrayBuffer(4);
const insoleView = new DataView(insoleBuf);
insoleView.setUint8(0, 70);
insoleView.setUint8(1, 30);
insoleView.setUint16(2, 180, true);
const insole = parseInsolePressure(insoleView);
check('BLE insole: forefoot %70 / heel %30 / GCT 180ms', insole.forefootPct === 70 && insole.heelPct === 30 && insole.gctMs === 180);

// ── ADIM 30b: Kalp hızı ayrıştırma (8/16 bit) ────────────────────────────────
const hr8 = new DataView(new ArrayBuffer(2));
hr8.setUint8(0, 0x00); // 8-bit flag
hr8.setUint8(1, 155);
check('BLE HRM: 8-bit nabız 155', parseHeartRateValue(hr8) === 155);

const hr16 = new DataView(new ArrayBuffer(3));
hr16.setUint8(0, 0x01); // 16-bit flag
hr16.setUint16(1, 400, true); // 400 bpm (16-bit okuma)
check('BLE HRM: 16-bit nabız 400', parseHeartRateValue(hr16) === 400);

const rr = [800, 780, 820, 790, 810];
const rmssd = computeRmssd(rr);
check('BLE HRM: rMSSD hesaplanır', rmssd !== null && rmssd > 0);

// ── ADIM 27: Çift tabanlık simülasyonu ───────────────────────────────────────
const symFrames = simulateDualInsole(7, 4800, { asymPct: 0 }, 50);
check('Çift tabanlık: simetrik konfig simetrik akış üretir', symFrames.length === 96 && symFrames.every((f) => f.left && f.right));

const asymFrames = simulateDualInsole(7, 4800, { asymPct: 30, dominantSide: 'L' }, 50);
const asymResult = footStrikeAsymmetry(asymFrames);
check('Çift tabanlık: %30 L baskın → denge düşük + L dominant', asymResult.dominantSide === 'L' && asymResult.balancePct < 90);
check('Çift tabanlık: simetrik akış → yüksek denge', footStrikeAsymmetry(symFrames).balancePct >= 95);

// ── ADIM 29: BLE OTA ──────────────────────────────────────────────────────────
check('CRC32 standart vektörü: "123456789" → 0xCBF43926', crc32(new TextEncoder().encode('123456789')) === 0xcbf43926);

const firmware = new Uint8Array(Array.from({ length: 100 }, (_, i) => i & 0xff));
const plan = buildOtaPlan(firmware);
check('OTA: 100B firmware → 5 paket (20B)', plan.length === 5 && plan.every((p) => p.payload.length === 20));

const lastPlan = buildOtaPlan(new Uint8Array(Array.from({ length: 105 }, (_, i) => i & 0xff)));
check('OTA: kalan 5B son paket kısa', lastPlan.length === 6 && lastPlan[5].payload.length === 5);

const enc = encodeOtaPacket(plan[2]);
const dec = decodeOtaPacket(enc);
check('OTA: encode/decode yuvarlak geçiş (CRC doğru)', dec !== null && dec.seq === 2 && dec.crc === plan[2].crc);
const tampered = new Uint8Array(enc);
tampered[6] = tampered[6] ^ 0xff;
check('OTA: bozulmuş paket CRC ile reddedilir', decodeOtaPacket(tampered) === null);

const session = createOtaSession(firmware);
const s1 = advanceOtaSession(session, [0, 1, 2, 3], [4]);
check('OTA: 1 başarısız → yeniden gönderim listesi + ilerleme %80', s1.progressPct === 80 && s1.missing.includes(4) && s1.retries === 1);
const s2 = advanceOtaSession(session, [0, 1, 2, 3, 4]);
check('OTA: tüm ACK → %100 tamamlandı', s2.progressPct === 100 && s2.done === true);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);
