// ============================================================================
// 🧠 TINY TENSOR MOTORU — bağımlılıksız mikro-inferans katmanı (TinyTorch)
// Saf TypeScript: matmul • relu • sigmoid • softmax — ağırlık yok, LLM yok
// ESP32 / tarayıcıda <5ms hareket sınıflandırması
// ============================================================================

export class TinyTensor {
  data: number[];
  shape: number[];

  constructor(data: number[], shape: number[]) {
    this.data = data;
    this.shape = shape;
  }

  static zeros(shape: number[]): TinyTensor {
    return new TinyTensor(new Array(shape.reduce((a, b) => a * b, 1)).fill(0), shape);
  }
  static fromFlat(values: number[]): TinyTensor {
    return new TinyTensor(values, [values.length]);
  }
  get rows(): number { return this.shape[0] ?? 1; }
  get cols(): number { return this.shape[1] ?? 1; }
}

// ── Tensor işlemleri ────────────────────────────────────────────────────────
export function matmul(a: TinyTensor, b: TinyTensor): TinyTensor {
  if (a.cols !== b.rows) throw new Error(`matmul şekil uyumsuz: ${a.shape} x ${b.shape}`);
  const m = a.rows, n = b.cols, k = a.cols;
  const out = new Array(m * n).fill(0);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let t = 0; t < k; t++) s += a.data[i * k + t] * b.data[t * n + j];
      out[i * n + j] = s;
    }
  }
  return new TinyTensor(out, [m, n]);
}

export function addBias(x: TinyTensor, bias: number[]): TinyTensor {
  if (x.cols !== bias.length) throw new Error('bias uzunluğu sütunla uyuşmuyor');
  return new TinyTensor(x.data.map((v, i) => v + bias[i % bias.length]), x.shape);
}

export function relu(x: TinyTensor): TinyTensor {
  return new TinyTensor(x.data.map((v) => Math.max(0, v)), x.shape);
}

export function sigmoid(x: TinyTensor): TinyTensor {
  return new TinyTensor(x.data.map((v) => 1 / (1 + Math.exp(-v))), x.shape);
}

export function softmax(x: TinyTensor): TinyTensor {
  const rows = x.rows, cols = x.cols;
  const out = new Array(x.data.length).fill(0);
  for (let r = 0; r < rows; r++) {
    const slice = x.data.slice(r * cols, (r + 1) * cols);
    const mx = Math.max(...slice);
    const exps = slice.map((v) => Math.exp(v - mx));
    const sum = exps.reduce((a, b) => a + b, 0);
    exps.forEach((v, c) => { out[r * cols + c] = v / sum; });
  }
  return new TinyTensor(out, x.shape);
}

// ── Tek katman softmax regresyon: 12 → 6 (logits) ───────────────────────────
export const KIN_MODEL = {
  inputDim: 12,
  outputDim: 6,
  classes: ['Forehand', 'Backhand', 'Serve', 'Volley', 'Sprint', 'JumpLanding'] as const,
  // Elle kurulmuş deterministik ayrıştırıcı (mock-first eğitim)
  // W 12×6: satır = öznitelik, kolon = [Fore, Back, Serve, Volley, Sprint, Jump]
  // Öznitelikler: [gct, heel, fore, accel, jerk, angVel, vz, latV, ratio, angVelZ, jerkLow, heelImpact]
  W: [
    [0.0, 0.0, 0.0, 0.0, -1.5, 0.0],     // gct:  sprint kısa temas
    [-0.3, -0.3, -0.2, -0.2, -1.5, 1.2], // heel: jump sert topuk, sprint topuk yok
    [0.1, 0.1, 0.2, 0.2, 0.2, -0.4],     // fore: jump düşük önayak
    [-0.8, -0.8, -0.2, -1.0, 2.0, -0.3], // accel: sprint yüksek ivme, volley düşük
    [-0.3, -0.3, -0.3, -1.2, 0.4, 0.6],  // jerk: volley kontrollü, jump sert
    [0.3, -0.6, 0.8, 0.3, -0.5, 0.2],    // angVel: backhand ters yön, serve yüksek
    [0.0, 0.0, 0.5, -0.2, 0.3, -0.8],    // vz:  serve yukarı, jump aşağı
    [2.0, -2.0, 0.5, 0.6, 0.0, 0.0],     // latV: forehand +, backhand -
    [0.0, 0.0, 0.0, 0.0, 0.8, -1.2],     // ratio: sprint önayak, jump topuk
    [0.0, 0.0, 2.2, 0.0, 0.0, 0.0],      // angVelZ: serve (açısal × dikey)
    [0.0, 0.0, -0.3, 1.8, 0.0, 0.0],     // jerkLow: volley (düşük jerk)
    [0.0, 0.0, 0.0, 0.0, 0.2, 1.6],      // heelImpact: jump (heel × topuk oranı)
  ],
  b: [0.3, 0.3, 0.2, 0.2, 0.2, 0.2],
} as const;

// ══════════════════════════════════════════════════════════════════════════
// 🧠 TINYTORCH EK KATMANLAR — aktivasyon • redüksiyon • kayıp • SGD eğitimi
// (Harvard MLSys müfredatı: sıfırdan hafif PyTorch benzeri kütüphane)
// ══════════════════════════════════════════════════════════════════════════

// ── Ek aktivasyonlar ─────────────────────────────────────────────────────────
export function tanh(x: TinyTensor): TinyTensor {
  return new TinyTensor(x.data.map((v) => Math.tanh(v)), x.shape);
}

export function leakyRelu(x: TinyTensor, alpha = 0.01): TinyTensor {
  return new TinyTensor(x.data.map((v) => (v > 0 ? v : alpha * v)), x.shape);
}

// ── Redüksiyonlar & yardımcılar ──────────────────────────────────────────────
export function sum(x: TinyTensor): number {
  return x.data.reduce((a, b) => a + b, 0);
}

export function mean(x: TinyTensor): number {
  return x.data.length === 0 ? 0 : x.data.reduce((a, b) => a + b, 0) / x.data.length;
}

/** En yüksek değerin düz (flat) indeksi — sınıf tahmini için. */
export function argmax(x: TinyTensor): number {
  let best = 0;
  for (let i = 1; i < x.data.length; i++) if (x.data[i] > x.data[best]) best = i;
  return best;
}

/** Sınıflandırma doğruluğu: satır bazlı tahmin indeksi vs hedef. */
export function accuracy(predRows: number[][], targets: number[]): number {
  if (predRows.length === 0) return 0;
  let correct = 0;
  for (let i = 0; i < predRows.length; i++) {
    if (argmax(new TinyTensor(predRows[i], [predRows[i].length])) === targets[i]) correct++;
  }
  return correct / predRows.length;
}

// ── İkili aritmetik ───────────────────────────────────────────────────────────
export function scale(x: TinyTensor, s: number): TinyTensor {
  return new TinyTensor(x.data.map((v) => v * s), x.shape);
}

export function addTensors(a: TinyTensor, b: TinyTensor): TinyTensor {
  if (a.data.length !== b.data.length) throw new Error('addTensors boyut uyumsuz');
  return new TinyTensor(a.data.map((v, i) => v + b.data[i]), a.shape);
}

export function subTensors(a: TinyTensor, b: TinyTensor): TinyTensor {
  if (a.data.length !== b.data.length) throw new Error('subTensors boyut uyumsuz');
  return new TinyTensor(a.data.map((v, i) => v - b.data[i]), a.shape);
}

// ── Kayıp fonksiyonları ───────────────────────────────────────────────────────
/** Kategorik çapraz entropi: -ln(p[hedef]) — softmax olasılıkları üzerinden. */
export function crossEntropy(probs: TinyTensor, targetIdx: number): number {
  const p = probs.data[targetIdx] ?? 0;
  return -Math.log(Math.max(1e-9, Math.min(1, p)));
}

/** Ortalama kare hata. */
export function mse(pred: TinyTensor, target: TinyTensor): number {
  if (pred.data.length !== target.data.length) throw new Error('mse boyut uyumsuz');
  let s = 0;
  for (let i = 0; i < pred.data.length; i++) s += (pred.data[i] - target.data[i]) ** 2;
  return s / pred.data.length;
}

// ── Deterministik ağırlık başlatma (xorshift PRNG + Box-Muller) ───────────────
export function randomNormal(shape: [number, number], seed: number, scale = 0.1): number[][] {
  let s = seed >>> 0;
  const next = () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
  const out: number[][] = [];
  for (let i = 0; i < shape[0]; i++) {
    const row: number[] = [];
    for (let j = 0; j < shape[1]; j++) {
      const u1 = Math.max(1e-9, next());
      const u2 = next();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      row.push(Number((z * scale).toFixed(4)));
    }
    out.push(row);
  }
  return out;
}


// ── SGD EĞİTİM DÖNGÜSÜ (on-device training) — softmax+CE gradyanı ─────────────
// Geri yayılım: logits gradyanı (probs - onehot), W -= lr·(1/N)·Σ(xᵀ·grad)
export interface TrainLinearInput {
  X: number[][]; // N×D öznitelikler
  y: number[];   // N hedef sınıf indeksleri
}

export interface TrainLinearResult {
  weights: number[][];  // D×C
  bias: number[];
  lossHistory: number[];
  accuracyFinal: number;
}

/** Çok sınıflı doğrusal modeli SGD ile sıfırdan eğitir (deterministik, tarayıcıda). */
export function trainLinearModel(input: TrainLinearInput, epochs = 200, lr = 0.5, seed = 1): TrainLinearResult {
  const n = input.X.length;
  const d = input.X[0]?.length ?? 0;
  if (n === 0 || d === 0) throw new Error('Eğitim verisi boş');
  const C = Math.max(...input.y) + 1;

  let W = randomNormal([d, C], seed, 0.1);
  let b = new Array(C).fill(0);
  const lossHistory: number[] = [];

  const logitsFor = (i: number): number[] =>
    b.map((bb, c) => bb + W.reduce((acc, wrow, k) => acc + wrow[c] * input.X[i][k], 0));

  for (let e = 0; e < epochs; e++) {
    let lossSum = 0;
    const gradW = Array.from({ length: d }, () => new Array<number>(C).fill(0));
    const gradB = new Array<number>(C).fill(0);

    for (let i = 0; i < n; i++) {
      const probs = softmax(new TinyTensor(logitsFor(i), [1, C])).data;
      lossSum += -Math.log(Math.max(1e-9, probs[input.y[i]]));
      for (let k = 0; k < d; k++) {
        for (let c = 0; c < C; c++) {
          const err = probs[c] - (c === input.y[i] ? 1 : 0);
          gradW[k][c] += (err * input.X[i][k]) / n;
        }
      }
      for (let c = 0; c < C; c++) gradB[c] += (probs[c] - (c === input.y[i] ? 1 : 0)) / n;
    }
    W = W.map((row, k) => row.map((v, c) => v - lr * gradW[k][c]));
    b = b.map((v, c) => v - lr * gradB[c]);
    lossHistory.push(Number((lossSum / n).toFixed(4)));
  }

  let correct = 0;
  for (let i = 0; i < n; i++) if (argmax(new TinyTensor(logitsFor(i), [1, C])) === input.y[i]) correct++;
  return { weights: W, bias: b, lossHistory, accuracyFinal: correct / n };
}

export function tinyTensorStatus(): string {
  return 'TinyTensor: matmul/relu/tanh/softmax • CE/MSE • SGD eğitim döngüsü — sıfır bağımlılık';
}

