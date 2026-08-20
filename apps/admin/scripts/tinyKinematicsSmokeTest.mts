// ============================================================================
// 🧠 EDGE ML (TinyKinematics) + VIRTUAL LAB SMOKE TESTİ
// 6 sınıf sınıflandırma hassasiyeti • tensor math • mekanik verimlilik
// Çift-FSR + GCT • RR interval (HRV) • IMU stroke burst • start/stop • sync
// Çalıştırma: node scripts/tinyKinematicsSmokeTest.mts
// ============================================================================
import { TinyTensor, matmul, relu, softmax, sigmoid } from '../src/app/lib/sports/ai/tinyTensor.ts';
import { forwardKinematics, strikeEfficiency, sampleFeatures, computeBiomechanicalFlags, accelMagnitude, pressureDifferential, tinyKinematicsStatus } from '../src/app/lib/sports/ai/tinyKinematicsEngine.ts';
import { VirtualBleSensorLab } from '../src/app/lib/hardware/simulation/virtualBleSensorLab.ts';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// ── 1. TENSOR MATEMATİK ────────────────────────────────────────────────────
const C = matmul(new TinyTensor([1, 2, 3, 4], [2, 2]), new TinyTensor([5, 6, 7, 8], [2, 2]));
check(C.data[0] === 19 && C.data[3] === 50, 'matmul 2x2', `${C.data.join(', ')}`);
const R = relu(new TinyTensor([-1, 0.5, 2, -3], [4]));
check(R.data[0] === 0 && R.data[2] === 2, 'relu (negatif→0)', '');
const S = softmax(new TinyTensor([2, 1, 0.1], [1, 3]));
check(Math.abs(S.data.reduce((a, b) => a + b, 0) - 1) < 1e-9 && S.data[0] > S.data[2], 'softmax toplam=1 + sıralama', '');
check(Math.abs(sigmoid(TinyTensor.fromFlat([0])).data[0] - 0.5) < 1e-9, 'sigmoid(0)=0.5', '');

// ── 2. 6 HAREKET SINIFLANDIRMA HASSASİYETİ ─────────────────────────────────
const labels = ['Forehand', 'Backhand', 'Serve', 'Volley', 'Sprint', 'JumpLanding'] as const;
const results = labels.map((l) => forwardKinematics(sampleFeatures(l)));
results.forEach((r, i) => check(r.label === labels[i], `${labels[i]} doğru sınıflandırıldı`, `%${Math.round(r.confidence * 100)} güven`));
check(results.every((r) => Math.abs(r.probs.reduce((a, b) => a + b, 0) - 1) < 1e-9), 'Prob toplamı 1 (her sınıf)', '');
check(results.every((r) => r.latencyMs < 5), 'Tüm inferanslar <5ms', `max ${Math.max(...results.map((r) => r.latencyMs)).toFixed(3)}ms`);

// ── 3. İVME VEKTÖRÜ + BASINÇ FARKI HESABI ──────────────────────────────────
const spr = sampleFeatures('Sprint');
check(Math.abs(accelMagnitude(spr) - Math.sqrt(15 ** 2 + 4 ** 2 + 5.5 ** 2)) < 0.01, 'accelMag = √(ax²+ay²+az²)', accelMagnitude(spr).toFixed(2));
check(pressureDifferential(spr) === 77, 'Basınç farkı (fore-heel)', String(pressureDifferential(spr)));

// ── 4. BİYOMEKANİK FLAGLER ─────────────────────────────────────────────────
const jumpFlags = computeBiomechanicalFlags(sampleFeatures('JumpLanding'));
check(jumpFlags.highGct && jumpFlags.heelStrikeDominant && jumpFlags.highImpactLoad, 'JumpLanding flagleri (GCT/topuk/darbe)', '');
const serveFlags = computeBiomechanicalFlags(sampleFeatures('Serve'));
check(serveFlags.highAngularLoad && !serveFlags.heelStrikeDominant, 'Serve flagleri (açısal yük)', '');

// ── 5. MEKANİK VERİMLİLİK ──────────────────────────────────────────────────
const eff = strikeEfficiency(spr);
check(eff.efficiencyPct >= 60, 'Sprint mekanik verim', `%${eff.efficiencyPct}`);
check(eff.weights.forefootDrive > 0.7, 'Önayak itiş payı yüksek (diff bazlı)', eff.weights.forefootDrive.toFixed(2));
const poor = strikeEfficiency(sampleFeatures('JumpLanding'));
check(poor.efficiencyPct < 55, 'Zayıf mekanik → düşük verim', `%${poor.efficiencyPct}`);

// ── 6. VIRTUAL LAB: ÇİFT-FSR + GCT ─────────────────────────────────────────
const lab = new VirtualBleSensorLab('normal', 42);
const early = lab.nextFrame(0, 'walk');
check(early.heelFsr > early.forefootFsr, 'Erken faz → topuk basışı', `heel ${early.heelFsr} > fore ${early.forefootFsr}`);
const gctLab = new VirtualBleSensorLab('fresh', 5);
const sprFrame = gctLab.nextFrame(0, 'sprint');
const jumpFrame = gctLab.nextFrame(100, 'jump');
check(sprFrame.gctMs >= 120 && sprFrame.gctMs <= 150, 'GCT sprint (120-150ms)', `${sprFrame.gctMs}ms`);
check(jumpFrame.gctMs >= 250 && jumpFrame.gctMs <= 300, 'GCT jump (250-300ms)', `${jumpFrame.gctMs}ms`);

// ── 7. IMU STROKE BURST ────────────────────────────────────────────────────
const imu = new VirtualBleSensorLab('normal', 9);
// Sinüs zarfı faz 0'da ~0 başlar; tepe fazına (~phase 11) ilerle
for (let i = 0; i < 10; i++) imu.nextImuFrame(i * 10, 'serve');
const serveImu = imu.nextImuFrame(100, 'serve');
const volleyImu = imu.nextImuFrame(150, 'volley');
check(Math.abs(serveImu.angularVelocity) > Math.abs(volleyImu.angularVelocity), 'Serve gyro > Volley gyro', `${serveImu.angularVelocity} vs ${volleyImu.angularVelocity}`);
check(serveImu.accelX > 5 && serveImu.accelX <= 12, 'IMU burst ivme eğrisi', `${serveImu.accelX} m/s²`);
const burst = [0, 1, 2, 3].map((i) => imu.nextImuFrame(i * 10, 'forehand'));
const peakIdx = burst.findIndex((b, i) => i > 0 && burst[i - 1].accelX < b.accelX && (i === burst.length - 1 || b.accelX >= burst[i + 1].accelX));
check(peakIdx > 0, 'Burst sinüs zarfı tepe noktası bulundu', `tepe @ ${peakIdx * 10}ms`);

// ── 8. RR INTERVAL + HRV ───────────────────────────────────────────────────
const freshRr = new VirtualBleSensorLab('fresh', 3).rrIntervals(20);
const fatRr = new VirtualBleSensorLab('fatigued', 3).rrIntervals(20);
const sd = (a: number[]) => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); };
check(Math.abs(sd(freshRr)) > Math.abs(sd(fatRr)) * 1.3, 'Yorgunluk → RR varyansı düşer (HRV düşük)', `σ ${sd(freshRr).toFixed(0)} vs ${sd(fatRr).toFixed(0)}`);
check(freshRr.every((v) => v > 700 && v < 1100), 'RR aralığı geçerli (60-85bpm)', `${freshRr[0]}ms`);

// ── 9. START/STOP + feedToSync ─────────────────────────────────────────────
const ctl = new VirtualBleSensorLab('normal', 11).start();
const t1 = ctl.tick();
const t2 = ctl.tick();
ctl.stop();
const t3 = ctl.tick();
check(t1 !== null && t2 !== null && t3 === null, 'start/stop kontrolü (dururken tick yok)', '');
const frames = new VirtualBleSensorLab('normal', 12).feedToSync(1000);
check(frames.length >= 5, 'feedToSync → 100ms senkron çerçeveler', `${frames.length} çerçeve`);
check(frames.some((f) => f.hr !== undefined && f.imuG !== undefined), 'Senkron frame HR + IMU içerir', '');

// ── 10. DETERMİNİZM ────────────────────────────────────────────────────────
const labA = new VirtualBleSensorLab('normal', 99).streamPackets(300, 50);
const labB = new VirtualBleSensorLab('normal', 99).streamPackets(300, 50);
check(JSON.stringify(labA) === JSON.stringify(labB), 'Aynı seed → aynı paket serisi', '');

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/31 geçti`);
console.log(tinyKinematicsStatus());
process.exit(pass === 31 ? 0 : 1);

