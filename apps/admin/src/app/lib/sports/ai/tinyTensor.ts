// ============================================================================
// 🧠 TINY TENSOR MOTORU — bağımlılıksız mikro-inferans katmanı (TinyTorch)
// Saf TypeScript: matmul • relu • sigmoid • softmax — ağırlık yok, LLM yok
// ESP32 / tarayıcıda <5ms hareket sınıflandırması
// ============================================================================

export class TinyTensor {
  constructor(public data: number[], public shape: number[]) {}

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

// ── Tek katman softmax regresyon: 8 → 4 (logits) ───────────────────────────
export const KIN_MODEL = {
  inputDim: 8,
  outputDim: 4,
  classes: ['Forehand', 'Backhand', 'Sprint', 'JumpLanding'] as const,
  // Elle kurulmuş deterministik ayrıştırıcı (mock-first eğitim)
  // W 8×4: satır = öznitelik [gct, heel, fore, accel, jerk, vz, latV, ratio], kolon = sınıf
  W: [
    [0.0, 0.0, -1.5, 0.0],   // gct:  sprint'te kısa temas
    [-0.3, -0.3, -1.5, 1.5], // heel: JumpLanding topuk, sprint topuk yok
    [0.0, 0.0, 0.0, -0.4],   // fore: JumpLanding düşük önayak
    [-0.8, -0.8, 2.0, -0.3], // accel: sprint yüksek ivme
    [-0.3, -0.3, 0.4, 0.8],  // jerk: jump sert iniş
    [0.0, 0.0, 0.0, -0.6],   // vz:  jump negatif dikey hız
    [1.5, -1.5, 0.0, 0.0],   // latV: forehand +, backhand -
    [0.0, 0.0, 0.8, -1.2],   // ratio: sprint önayak, jump topuk
  ],
  b: [0.2, 0.2, 0.2, 0.1],
} as const;
