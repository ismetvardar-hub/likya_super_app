// ============================================================================
// 📡 WEB BLUETOOTH KÖPRÜSÜ SMOKE TESTİ — parse + HRV + insole + uyumluluk
// Çalıştırma: npx tsx scripts/bluetoothSmokeTest.mts
// ============================================================================
import { parseHeartRateValue, parseHeartRateRR, computeRmssd, parseInsolePressure, browserBluetoothAdvice, webBluetoothSupported, DEFAULT_INSOLE_SERVICE } from '../src/app/lib/hardware/webBluetoothBridge';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// 1) HRM parse — 8-bit BPM
const hr8 = new DataView(new Uint8Array([0x00, 150]).buffer);
check(parseHeartRateValue(hr8) === 150, 'HRM 8-bit BPM', '150 bpm');

// 2) HRM parse — 16-bit BPM
const hr16 = new DataView(new Uint8Array([0x01, 0x40, 0x01]).buffer); // 320
check(parseHeartRateValue(hr16) === 320, 'HRM 16-bit BPM', '320 bpm');

// 3) RR interval + rMSSD (flags 0x10, RR=800,800,820 ms)
const hrRR = new DataView(new Uint8Array([0x10, 150, 0x20, 0x03, 0x20, 0x03, 0x34, 0x03]).buffer);
const rr = parseHeartRateRR(hrRR);
check(rr.length === 3 && rr[0] === 800, 'RR interval parse (0x2A37 bit4)', rr.join(',') + ' ms');
check(computeRmssd(rr) === 14, 'rMSSD HRV hesabı', `${computeRmssd(rr)} ms`);

// 4) ESP32 insole — toe 78, heel 22, GCT 185ms
const ins = new DataView(new Uint8Array([78, 22, 185, 0]).buffer);
const p = parseInsolePressure(ins);
check(p.forefootPct === 78 && p.heelPct === 22, 'ESP32 basınç parse', `Ön %${p.forefootPct} / Topuk %${p.heelPct}`);
check(p.gctMs === 185, 'ESP32 GCT parse (uint16 LE)', `${p.gctMs} ms`);

// 5) Tarayıcı uyumluluk danışmanı
check(typeof webBluetoothSupported() === 'boolean', 'Web Bluetooth destek tespiti', String(webBluetoothSupported()));
check(browserBluetoothAdvice() === '' || browserBluetoothAdvice().includes('Bluefy'), 'Firefox/Safari uyarı metni', browserBluetoothAdvice().slice(0, 44) || '(Chrome — destekli)');

// 6) ESP32 service UUID (pairing spec)
check(DEFAULT_INSOLE_SERVICE === '4fafc201-1fb5-459e-8fcc-c5c9c331914b', 'ESP32 custom service UUID', DEFAULT_INSOLE_SERVICE);

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/9 geçti`);
process.exit(pass === 9 ? 0 : 1);
