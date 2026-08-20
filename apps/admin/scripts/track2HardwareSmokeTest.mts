// ============================================================================
// 🛠️ TRACK 2 — DONANIM & BLE SMOKE TESTİ (Batch 4: Adım 16-20)
// Paket pack/unpack • EMA filtre • Bağlantı state machine • UUID'ler
// Çalıştırma: npx tsx scripts/track2HardwareSmokeTest.mts
// ============================================================================
import { packInsolePacket, unpackInsolePacket, INSoleServiceUUID, INSolePressureCharUUID, PAYLOAD_SIZE } from '../src/app/lib/hardware/bleProtocolDefinition';
import { InsoleSignalFilter, EmaFilter, MovingAverageFilter, sensorSignalFilterStatus } from '../src/app/lib/hardware/sensorSignalFilter';
import { initialState, onDisconnected, onConnected, onPacket, evaluateWatchdog, shouldRetryNow, nextBackoff, WATCHDOG_TIMEOUT_MS } from '../src/app/lib/hardware/bleConnectionManager';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// 1) BLE protokol UUID'leri (Adım 18)
check(INSoleServiceUUID === '4fafc201-1fb5-459e-8fcc-c5c9c331914b', 'Custom Service UUID', INSoleServiceUUID);
check(INSolePressureCharUUID === 'beb5483e-36e1-4688-b7f5-ea07361b26a8', 'Pressure & Timing Char UUID', INSolePressureCharUUID);

// 2) Pack/Unpack roundtrip (Adım 18)
const packed = packInsolePacket(78, 22, 185, 0.42);
check(packed.length === PAYLOAD_SIZE && packed[0] === 78 && packed[1] === 22, 'Pack — 6 byte payload', `[${Array.from(packed).join(',')}]`);
const view = new DataView(packed.buffer);
const unpacked = unpackInsolePacket(view);
check(unpacked.gctMs === 185 && unpacked.strikeForce === 0.42, 'Unpack — GCT uint16 LE + strike', `GCT ${unpacked.gctMs}ms • strike ${unpacked.strikeForce}`);

// 3) EMA filtre (Adım 17) — gürültülü sinyal yumuşatma
const ema = new EmaFilter(0.25);
const noisy = [80, 79, 81, 80, 78, 81, 79, 80];   // jitter'lı sinyal
const smooth = noisy.map((v) => ema.filter(v));
check(Math.abs(smooth[7] - 80) < 4, 'EMA jitter bastırma', `son: ${smooth[7].toFixed(1)} (hedef ~80)`);
const filter = new InsoleSignalFilter();
filter.process(80, 20);
filter.process(5, 100);   // anomali — filtre bunu yumuşatır
for (let i = 0; i < 12; i++) filter.process(78 + (i % 2), 22 - (i % 2));   // stabil sinyal
const f3 = filter.process(78, 22);
check(f3.toePct >= 60 && f3.toePct <= 100, 'Çift aşamalı filtre hattı (toe stabil)', `son: %${f3.toePct}`);
const mavg = new MovingAverageFilter(4);
const m = [90, 92, 91, 93].map((v) => mavg.filter(v));
check(m[3] === 91.5, 'Moving average (pencere 4)', String(m[3]));

// 4) Bağlantı state machine (Adım 20)
let st = initialState();
check(st.state === 'idle', 'Başlangıç: idle', st.state);
st = onDisconnected(st, 1000);
check(st.state === 'reconnecting' && st.attempt === 1 && st.backoffMs === 400, 'Bağlantı kopması → backoff 400ms', `${st.attempt} • ${st.backoffMs}ms`);
st = onDisconnected(st, 1000);
check(st.backoffMs === 800, 'Üstel geri çekilme (2. deneme 800ms)', `${st.backoffMs}ms`);
check(nextBackoff(4) === 3200 && nextBackoff(8) === 8000, 'Backoff üst sınır 8000ms', `${nextBackoff(4)}/${nextBackoff(8)}`);
st = onConnected(st, 5000);
check(st.state === 'connected' && st.attempt === 0, 'Bağlanma → connected + deneme sıfırlama', st.state);
st = onPacket(st, 5200);
st = evaluateWatchdog(st, 7000);   // 1800ms sessiz > 1500ms
check(st.state === 'dropout' && st.droppedSince === 7000, 'Watchdog: 1500ms sessizlik → dropout', `silent ${7000 - 5200}ms > ${WATCHDOG_TIMEOUT_MS}ms`);
st = onPacket(st, 7100);
st = evaluateWatchdog(st, 7200);
check(st.state === 'connected' && st.droppedSince === null, 'Paket gelince dropout kurtarılır', st.state);
const rec = onDisconnected(st, 9000);
check(shouldRetryNow(rec, 9400) && !shouldRetryNow(rec, 9300), 'Reconnect: backoff süresi dolunca retry', `${rec.backoffMs}ms`);

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/15 geçti`);
console.log(sensorSignalFilterStatus());
process.exit(pass === 15 ? 0 : 1);
