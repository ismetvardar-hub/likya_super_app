// ============================================================================
// 🧠 TINYTORCH & EDGE ML DOĞRULAMA TESTİ (Harvard MLSys müfredatı uyarlaması)
// tensor ops • SGD eğitim döngüsü • akış yumuşatma • güç/kanal modelleri • edge profil
// Çalıştırma: node tinyMlsys.test.mts
// ============================================================================
import {
  TinyTensor, leakyRelu, tanh, crossEntropy, mse, scale, addTensors, subTensors,
  sum, mean, argmax, accuracy, randomNormal, trainLinearModel,
} from './src/app/lib/sports/ai/tinyTensor.ts';
import {
  classifyStream, confidentPrediction, normalizeFeatures, DEFAULT_CALIBRATION_RANGES,
  forwardKinematics, sampleFeatures,
} from './src/app/lib/sports/ai/tinyKinematicsEngine.ts';
import {
  VirtualBleSensorLab, estimateBatteryDrain, simulateChannel, sessionToJson,
} from './src/app/lib/hardware/simulation/virtualBleSensorLab.ts';
import { profileEdgeModel } from './src/app/lib/sports/ai/edgeProfileEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean) {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name);
}

// ── 1. TENSOR OPS ─────────────────────────────────────────────────────────────
const lr = leakyRelu(new TinyTensor([-1, 0.5], [2]), 0.1);
check('leakyRelu: negatif → αx, pozitif → x', lr.data[0] === -0.1 && lr.data[1] === 0.5);
check('tanh(0)=0 ve tanh(1)≈0.76', tanh(new TinyTensor([0, 1], [2])).data[0] === 0 && Math.abs(tanh(new TinyTensor([1], [1])).data[0] - 0.7616) < 0.001);

const ce = crossEntropy(new TinyTensor([0.2, 0.8], [1, 2]), 1);
check('crossEntropy: -ln(0.8)≈0.223', Math.abs(ce - 0.2231) < 0.001);
const m = mse(new TinyTensor([1, 2], [2]), new TinyTensor([3, 4], [2]));
check('mse: ((2)²+(2)²)/2 = 4', m === 4);

const sc = scale(new TinyTensor([1, 2], [2]), 3);
check('scale: ×3', sc.data[0] === 3 && sc.data[1] === 6);
check('addTensors + subTensors', addTensors(new TinyTensor([1, 2], [2]), new TinyTensor([3, 4], [2])).data[1] === 6 && subTensors(new TinyTensor([5, 5], [2]), new TinyTensor([1, 2], [2])).data[0] === 4);

check('sum/mean/argmax', sum(new TinyTensor([1, 2, 3], [3])) === 6 && mean(new TinyTensor([1, 2, 3], [3])) === 2 && argmax(new TinyTensor([0.2, 0.9, 0.1], [3])) === 1);
check('accuracy: 2/2 doğru', accuracy([[0.9, 0.1], [0.2, 0.8]], [0, 1]) === 1);

// ── 2. SGD EĞİTİM DÖNGÜSÜ (on-device training) ───────────────────────────────
const trainX = [[0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]];
const trainY = [0, 1, 0, 1];
const trained = trainLinearModel({ X: trainX, y: trainY }, 300, 0.5, 7);
check('Eğitim: kayıp düşer (0.69 → <0.1)', trained.lossHistory[0] > 0.6 && trained.lossHistory[trained.lossHistory.length - 1] < 0.1);
check('Eğitim: ayırılabilir veride %100 doğruluk', trained.accuracyFinal === 1);
const trained2 = trainLinearModel({ X: trainX, y: trainY }, 300, 0.5, 7);
check('Eğitim: deterministik (aynı seed → aynı kayıp)', JSON.stringify(trained.lossHistory) === JSON.stringify(trained2.lossHistory));

const rn1 = randomNormal([2, 3], 42);
const rn2 = randomNormal([2, 3], 42);
check('randomNormal: deterministik + boyut doğru', JSON.stringify(rn1) === JSON.stringify(rn2) && rn1.length === 2 && rn1[0].length === 3);

// ── 3. AKIŞ SINIFLANDIRMA + GÜVEN EŞİĞİ ──────────────────────────────────────
const sprintStream = Array.from({ length: 8 }, () => sampleFeatures('Sprint'));
const stream = classifyStream(sprintStream, { windowSize: 5 });
check('Akış: tam Sprint penceresi → Sprint + güven 1.0', stream.label === 'Sprint' && stream.confidence === 1);

// Karışık akış: 4 Backhand + 1 Forehand → çoğunluk Backhand (yumuşatma)
const mixed = [...Array.from({ length: 4 }, () => sampleFeatures('Backhand')), sampleFeatures('Forehand')];
const mixedResult = classifyStream(mixed, { windowSize: 5 });
check('Akış: 4/5 çoğunluk → Backhand (flicker yok)', mixedResult.smoothedLabel === 'Backhand');

// Düşük güvenli çekişmeli pencere → Belirsiz
const split = [...Array.from({ length: 2 }, () => sampleFeatures('Serve')), sampleFeatures('Forehand'), sampleFeatures('Backhand'), sampleFeatures('Volley')];
check('Akış: %40 çoğunluk → Belirsiz (eşik 0.5)', classifyStream(split, { windowSize: 5, minConfidence: 0.5 }).label === 'Belirsiz');

const cp = confidentPrediction(sampleFeatures('Sprint'));
check('Güven eşiği: net Sprint örneği kabul', cp.accepted === true && cp.label === 'Sprint');
const raw = forwardKinematics(sampleFeatures('Sprint'));
check('Güven eşiği: çelişkili örnek reddedilir', confidentPrediction({ ...sampleFeatures('Sprint'), gctMs: 260, heelPressure: 80 }, raw.confidence + 0.05).accepted === false);

// ── 4. KALİBRASYON ────────────────────────────────────────────────────────────
const norm = normalizeFeatures({ ...sampleFeatures('Sprint'), gctMs: 200 }, DEFAULT_CALIBRATION_RANGES);
check('Kalibrasyon: GCT 200 → 0-1 aralıkta', norm.gctMs > 0.4 && norm.gctMs < 0.5 && norm.heelPressure >= 0 && norm.heelPressure <= 1);

// ── 5. GÜÇ MODELİ (pil) ───────────────────────────────────────────────────────
const power100 = estimateBatteryDrain({ activeMs: 3_600_000, sampleRateHz: 100, mahCapacity: 120 });
const power10 = estimateBatteryDrain({ activeMs: 3_600_000, sampleRateHz: 10, mahCapacity: 120 });
check('Güç: 100Hz 1 saat → ~18mA, %15 pil', power100.currentMa === 18 && Math.abs(power100.activePct - 15) < 0.5);
check("Güç: 10Hz → 100Hz'den az tüketir (adaptif tasarruf)", power10.currentMa < power100.currentMa && power10.hoursUntilEmpty > power100.hoursUntilEmpty);

// ── 6. KANAL SİMÜLASYONU (gecikme + kayıp) ────────────────────────────────────
const lab = new VirtualBleSensorLab('normal', 3);
const baseFrames = lab.streamPackets(5000, 50);
const chanA = simulateChannel(baseFrames, { packetLossPct: 10, latencyMs: 20, seed: 5 });
const chanB = simulateChannel(baseFrames, { packetLossPct: 10, latencyMs: 20, seed: 5 });
check('Kanal: deterministik (aynı seed → aynı kayıp)', chanA.dropped === chanB.dropped);
check('Kanal: %10 kayıp → ~%10 düşer', chanA.lossPct === 10 && chanA.dropped >= 8 && chanA.dropped <= 12);
check('Kanal: gecikme jitter 14-32ms aralığında', chanA.latenciesMs.every((l) => l >= 14 && l <= 32));

// ── 7. OTURUM DIŞA AKTARIMI ───────────────────────────────────────────────────
const exported = sessionToJson(baseFrames, { athleteId: 'at-01' });
const parsed = JSON.parse(exported);
check('Dışa aktarım: JSON yuvarlak geçiş + meta korunur', parsed.frames.length === baseFrames.length && parsed.meta.athleteId === 'at-01');

// ── 8. EDGE PROFİL (Hardware Kits: bellek/pil/gecikme) ────────────────────────
const edge = profileEdgeModel({ inputDim: 12, outputDim: 6 });
check('Edge profil: 12→6 model = 312 bayt, ~150 FLOPs', edge.weightsBytes === 312 && edge.flopsPerInference === 150);
check('Edge profil: ESP32 hedefinde gerçek zamanlı uygun', edge.rows.find((r) => r.target.id === 'esp32')?.fits === true);
check('Edge profil: ≥2 hedef uygun → hazır kararı', edge.verdict.includes('hazır'));

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

