// ============================================================================
// 🧠 EDGE ML + VIRTUAL LAB SMOKE TESTİ
// Tensor math (matmul/relu/softmax) • <5ms sınıflandırma • verimlilik
// Çift-FSR eğrileri • HR/HRV yorgunluk • deterministik paket akışı
// Çalıştırma: npx tsx scripts/tinyKinematicsSmokeTest.mts
// ============================================================================
import { TinyTensor, matmul, relu, softmax, sigmoid } from '../src/app/lib/sports/ai/tinyTensor';
import { forwardKinematics, strikeEfficiency, sampleFeatures } from '../src/app/lib/sports/ai/tinyKinematicsEngine';
import { VirtualBleSensorLab } from '../src/app/lib/hardware/simulation/virtualBleSensorLab';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// ── 1. TENSOR MATEMATİK ────────────────────────────────────────────────────
const A = new TinyTensor([1, 2, 3, 4], [2, 2]);
const B = new TinyTensor([5, 6, 7, 8], [2, 2]);
const C = matmul(A, B);
check(C.data[0] === 19 && C.data[1] === 22 && C.data[2] === 43 && C.data[3] === 50, 'matmul 2x2', `${C.data.join(', ')}`);
const R = relu(new TinyTensor([-1, 0.5, 2, -3], [4]));
check(R.data[0] === 0 && R.data[2] === 2, 'relu (negatif→0)', `${R.data.join(', ')}`);
const S = softmax(new TinyTensor([2, 1, 0.1], [1, 3]));
check(Math.abs(S.data.reduce((a, b) => a + b, 0) - 1) < 1e-9 && S.data[0] > S.data[2], 'softmax toplam=1 + sıralama', `${S.data.map((v) => v.toFixed(3)).join(', ')}`);
const SG = sigmoid(TinyTensor.fromFlat([0]));
check(Math.abs(SG.data[0] - 0.5) < 1e-9, 'sigmoid(0)=0.5', '');
const Z = TinyTensor.zeros([2, 3]);
check(Z.data.every((v) => v === 0), 'zeros tensörü', `${Z.shape.join('x')}`);

// ── 2. HAREKET SINIFLANDIRMA (<5ms, 4 sınıf) ───────────────────────────────
const labels = ['Forehand', 'Backhand', 'Sprint', 'JumpLanding'] as const;
const results = labels.map((l) => forwardKinematics(sampleFeatures(l)));
results.forEach((r, i) => check(r.label === labels[i], `${labels[i]} sınıflandırıldı`, `%${Math.round(r.confidence * 100)} güven`));
check(results.every((r) => Math.abs(r.probs.reduce((a, b) => a + b, 0) - 1) < 1e-9), 'Prob toplamı 1 (her sınıf)', '');
check(results.every((r) => r.latencyMs < 5), 'Tüm inferanslar <5ms', `max ${Math.max(...results.map((r) => r.latencyMs)).toFixed(3)}ms`);

// ── 3. GREV MEKANİK VERİMLİLİK ─────────────────────────────────────────────
const eff = strikeEfficiency(sampleFeatures('Sprint'));
check(eff.efficiencyPct >= 60, 'Sprint mekanik verim hesabı', `%${eff.efficiencyPct}`);
check(eff.weights.forefootDrive > 0.7, 'Önayak itiş payı yüksek (sprint)', eff.weights.forefootDrive.toFixed(2));
check(eff.advice.length > 10, 'Sade dil koç önerisi', eff.advice);
const badEff = strikeEfficiency({ gctMs: 320, heelPressure: 92, forefootPressure: 40, accelMag: 10, jerk: 60, velocityZ: 0.2, lateralVelocity: 1, pressureRatio: 0.3 });
check(badEff.efficiencyPct < 50, 'Zayıf mekanik → düşük verim', `%${badEff.efficiencyPct}`);

// ── 4. VIRTUAL LAB: ÇİFT-FSR EĞRİLERİ ──────────────────────────────────────
const lab = new VirtualBleSensorLab('normal', 42);
const f1 = lab.nextFrame(0, 'walk');
const earlyHeel = lab.nextFrame(10, 'walk');  // topuk basışı fazı
const lateFore = lab.nextFrame(160, 'walk');  // önayak itişi fazı (döngü farklı)
const f = lab.streamPackets(1000, 50);
const sprintLab = new VirtualBleSensorLab('fresh', 42);
const sprint = sprintLab.streamPackets(500, 50);
// Sprint frame: döngüyü önayak fazına al (40 walk adımı sonrası sprint)
const sprintLab2 = new VirtualBleSensorLab('fresh', 42);
for (let i = 0; i < 40; i++) sprintLab2.nextFrame(i * 50, 'walk');
const sprintFrame = sprintLab2.nextFrame(2000, 'sprint');
check(earlyHeel.heelFsr > earlyHeel.forefootFsr, 'Erken faz → topuk basışı baskın', `heel ${earlyHeel.heelFsr} > fore ${earlyHeel.forefootFsr}`);
check(sprintFrame !== undefined && sprintFrame.forefootFsr > sprintFrame.heelFsr, 'Sprint → önayak itişi baskın', `fore ${sprintFrame?.forefootFsr} > heel ${sprintFrame?.heelFsr}`);
check(f.length === 20, 'Paket akışı üretildi (1s @ 50ms)', `${f.length} paket`);
check(f.every((x) => x.hrvMs >= 8 && x.hr >= 40), 'Tüm paketler geçerli HR/HRV', `hr ${f[0].hr}-${Math.max(...f.map((x) => x.hr))}`);

// ── 5. BLE PAKETİ (6 byte) ─────────────────────────────────────────────────
const packet = lab.toBlePacket(lateFore, 7);
check(packet.payload.length === 6 && packet.crcOk, 'BLE paketi 6 byte + CRC', `[${Array.from(packet.payload).join(',')}]`);
check(packet.payload[4] === Math.min(255, lateFore.hr), 'Paket HR byte degeri', String(packet.payload[4]));

// ── 6. YORGUNLUK: HR SPIKE + HRV BOZULMASI ─────────────────────────────────
const freshS = new VirtualBleSensorLab('fresh', 7).simulateSession(6000, 50);
const fatiguedS = new VirtualBleSensorLab('fatigued', 7).simulateSession(6000, 50);
check(fatiguedS.hrMax > freshS.hrMax, 'Yorgunluk → HR spike artışı', `${freshS.hrMax} → ${fatiguedS.hrMax} bpm`);
check(fatiguedS.hrvMean < freshS.hrvMean, 'Yorgunluk → HRV düşüşü', `${freshS.hrvMean} → ${fatiguedS.hrvMean} ms`);
check(fatiguedS.hrvDropPct > 5, 'HRV zamanla bozulur (drop%)', `%${fatiguedS.hrvDropPct}`);
check(fatiguedS.forefootPeak > fatiguedS.heelPeak, 'Sprint baskın önayak tepe', `heel ${fatiguedS.heelPeak} / fore ${fatiguedS.forefootPeak}`);

// ── 7. DETERMİNİZM ──────────────────────────────────────────────────────────
const labA = new VirtualBleSensorLab('normal', 99).streamPackets(300, 50);
const labB = new VirtualBleSensorLab('normal', 99).streamPackets(300, 50);
check(JSON.stringify(labA) === JSON.stringify(labB), 'Aynı seed → aynı paket serisi (deterministik)', '');

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/26 geçti`);
process.exit(pass === 26 ? 0 : 1);
