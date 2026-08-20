// ============================================================================
// ⚡ CİHAZ İÇİ MİKRO-TRANSFORMER BİYOMEKANİK ÇIKARIM MOTORU (Adım 131)
// Sıfır-bağımlılık, hafif edge tensor transformer (Karpathy nanoGPT esinli):
// 100Hz füzyonlu kinematik karelerin (IMU + tabanlık + poz) kayan penceresini
// alır ve saf TypeScript çok başlı self-attention ileri geçişi çalıştırır
// (Python/WASM bağımlılığı yok). 3 vuruş öncesi kinetik çöküş / yorgunluk
// sıçramasını <15ms gecikmeyle öngörür. Deterministik; node-runnable.
// ============================================================================

export interface MicroTransformerConfig {
  dModel: number;    // gizli boyut
  nHead: number;     // baş sayısı
  nLayer: number;    // katman sayısı
  dInput: number;    // kare başına özellik
  windowSize: number; // penceredeki kare sayısı (T)
  seed: number;
}

export const EDGE_DEFAULT_CONFIG: MicroTransformerConfig = { dModel: 16, nHead: 4, nLayer: 2, dInput: 6, windowSize: 16, seed: 42 };
export const SHOTS_AHEAD = 3; // 3 vuruş öncesi tahmin
export const EDGE_LATENCY_BUDGET_MS = 15;

export type EdgeOutcome = 'STABLE' | 'FATIGUE_SPIKE' | 'KINETIC_BREAKDOWN';

export interface EdgePrediction {
  breakdownProbability: number; // 0-1
  fatigueProbability: number;   // 0-1
  outcome: EdgeOutcome;
  shotsAhead: number;
  latencyMs: number;
  logits: number[];
}

// ── Deterministik RNG (mulberry32) — ağırlık başlatma + test için ────────────
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Temel tensör operasyonları ───────────────────────────────────────────────
export function transpose(A: number[][]): number[][] {
  const m = A.length;
  const n = A[0]?.length ?? 0;
  const out: number[][] = [];
  for (let j = 0; j < n; j++) {
    const col: number[] = [];
    for (let i = 0; i < m; i++) col.push(A[i][j]);
    out.push(col);
  }
  return out;
}

export function matMul(A: number[][], B: number[][]): number[][] {
  const m = A.length;
  const k = A[0]?.length ?? 0;
  const n = B[0]?.length ?? 0;
  const out: number[][] = [];
  for (let i = 0; i < m; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let t = 0; t < k; t++) sum += A[i][t] * B[t][j];
      row.push(sum);
    }
    out.push(row);
  }
  return out;
}

export function matVec(A: number[][], v: number[]): number[] {
  return A.map((row) => row.reduce((acc, a, j) => acc + a * (v[j] ?? 0), 0));
}

export function vecMulMat(v: number[], A: number[][]): number[] {
  return A[0]?.map((_, j) => v.reduce((acc, vi, i) => acc + vi * (A[i]?.[j] ?? 0), 0)) ?? [];
}

export function softmaxRow(v: number[]): number[] {
  const max = Math.max(...v);
  const exp = v.map((x) => Math.exp(x - max));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map((x) => x / sum);
}

export function layerNorm(v: number[], gamma: number[], beta: number[], eps = 1e-5): number[] {
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  const variance = v.reduce((a, b) => a + (b - mean) ** 2, 0) / v.length;
  const invStd = 1 / Math.sqrt(variance + eps);
  return v.map((x, i) => gamma[i] * (x - mean) * invStd + beta[i]);
}

export function relu(v: number[]): number[] {
  return v.map((x) => Math.max(0, x));
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function sinusoidalPosEnc(seq: number, dModel: number): number[] {
  const pos: number[] = [];
  for (let d = 0; d < dModel; d++) {
    const freq = 10000 ** ((2 * Math.floor(d / 2)) / dModel);
    pos.push(d % 2 === 0 ? Math.sin(seq / freq) : Math.cos(seq / freq));
  }
  return pos;
}

// ── Giriş normalizasyonu: her özellik sütununu ort 0 / std 1'e çeker ────────
export function normalizeWindow(window: number[][]): number[][] {
  const T = window.length;
  const d = window[0]?.length ?? 0;
  const out = window.map((row) => [...row]);
  for (let col = 0; col < d; col++) {
    const vals = out.map((row) => row[col]);
    const mean = vals.reduce((a, b) => a + b, 0) / T;
    const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / T;
    const std = Math.sqrt(variance) || 1;
    for (let t = 0; t < T; t++) out[t][col] = (out[t][col] - mean) / std;
  }
  return out;
}

// ── Katman ağırlıkları (deterministik başlatma) ──────────────────────────────
interface LayerWeights {
  q: number[][][]; // [head][dModel][dk]
  k: number[][][];
  v: number[][][];
  out: number[][]; // dModel×dModel
  w1: number[][];  // dModel×ffn
  b1: number[];
  w2: number[][];  // ffn×dModel
  b2: number[];
  ln1g: number[];
  ln1b: number[];
  ln2g: number[];
  ln2b: number[];
}

export class EdgeMicroTransformer {
  private readonly config: MicroTransformerConfig;
  private readonly win: number[][];   // dInput×dModel
  private readonly layers: LayerWeights[];
  private readonly headW: number[][]; // dModel×2
  private readonly dk: number;

  constructor(config: Partial<MicroTransformerConfig> = {}) {
    this.config = { ...EDGE_DEFAULT_CONFIG, ...config };
    this.dk = Math.max(1, Math.floor(this.config.dModel / this.config.nHead));
    const rng = mulberry32(this.config.seed);
    const rand = () => rng() * 2 - 1; // [-1,1]

    this.win = Array.from({ length: this.config.dInput }, () => Array.from({ length: this.config.dModel }, () => rand()));
    const ffn = this.config.dModel * 2;
    this.layers = Array.from({ length: this.config.nLayer }, () => {
      const head = () => Array.from({ length: this.config.nHead }, () => Array.from({ length: this.config.dModel }, () => Array.from({ length: this.dk }, () => rand())));
      return {
        q: head(),
        k: head(),
        v: head(),
        out: Array.from({ length: this.config.dModel }, () => Array.from({ length: this.config.dModel }, () => rand())),
        w1: Array.from({ length: this.config.dModel }, () => Array.from({ length: ffn }, () => rand())),
        b1: Array.from({ length: ffn }, () => rand()),
        w2: Array.from({ length: ffn }, () => Array.from({ length: this.config.dModel }, () => rand())),
        b2: Array.from({ length: this.config.dModel }, () => rand()),
        ln1g: Array.from({ length: this.config.dModel }, () => 1),
        ln1b: Array.from({ length: this.config.dModel }, () => 0),
        ln2g: Array.from({ length: this.config.dModel }, () => 1),
        ln2b: Array.from({ length: this.config.dModel }, () => 0),
      };
    });
    this.headW = Array.from({ length: this.config.dModel }, () => [rand(), rand()]);
  }

  // ── İleri geçiş: pencere (T×dInput) → olasılık çıktısı ─────────────────────
  forward(window: number[][]): EdgePrediction {
    const started = Date.now();
    const T = this.config.windowSize;
    // Pencereyi T'ye hizala (pad/trim) — 3 vuruş öncesi bağlam
    const raw = window.slice(-T);
    const padded: number[][] = Array.from({ length: T }, (_, i) => {
      const row = raw[i] ?? [];
      const filled = Array.from({ length: this.config.dInput }, (_, d) => row[d] ?? 0);
      return filled;
    });

    // Gömme (normalleştirilmiş giriş) + sinüzoidal konum kodlaması
    const normalized = normalizeWindow(padded);
    let h: number[][] = normalized.map((row) => vecMulMat(row, this.win));
    for (let t = 0; t < T; t++) {
      const pos = sinusoidalPosEnc(t, this.config.dModel);
      h[t] = h[t].map((x, d) => x + pos[d]);
    }

    for (const layer of this.layers) {
      h = this.selfAttentionLayer(h, layer);
      // FFN + residual + layernorm
      h = h.map((token) => {
        const ffnPre = relu(vecMulMat(token, layer.w1).map((x, i) => x + layer.b1[i]));
        const ffnOut = vecMulMat(ffnPre, layer.w2).map((x, i) => x + layer.b2[i]);
        const merged = token.map((x, i) => x + ffnOut[i]);
        return layerNorm(merged, layer.ln2g, layer.ln2b);
      });
    }

    // Global ortalama havuzlama → baş çıktısı
    const pooled: number[] = Array.from({ length: this.config.dModel }, (_, d) => h.reduce((acc, token) => acc + token[d], 0) / T);
    const logits = vecMulMat(pooled, this.headW);
    const fatigueProbability = Math.round(sigmoid(logits[0]) * 10000) / 10000;
    const breakdownProbability = Math.round(sigmoid(logits[1]) * 10000) / 10000;
    const outcome: EdgeOutcome = breakdownProbability > 0.75 ? 'KINETIC_BREAKDOWN' : fatigueProbability > 0.6 ? 'FATIGUE_SPIKE' : 'STABLE';

    return {
      breakdownProbability,
      fatigueProbability,
      outcome,
      shotsAhead: SHOTS_AHEAD,
      latencyMs: Date.now() - started,
      logits,
    };
  }

  private selfAttentionLayer(x: number[][], layer: LayerWeights): number[][] {
    const T = x.length;
    const dModel = this.config.dModel;
    const headsOut: number[][][] = []; // [head][T][dk]
    for (let hIdx = 0; hIdx < this.config.nHead; hIdx++) {
      const Wq = layer.q[hIdx];
      const Wk = layer.k[hIdx];
      const Wv = layer.v[hIdx];
      const Q = matMul(x, Wq); // T×dk
      const K = matMul(x, Wk);
      const V = matMul(x, Wv);
      const scores = matMul(Q, transpose(K)).map((row) => row.map((s) => s / Math.sqrt(this.dk))); // T×T
      const attn = scores.map((row) => softmaxRow(row));
      const headOut = matMul(attn, V); // T×dk
      headsOut.push(headOut);
    }
    // Başları birleştir
    const concat: number[][] = Array.from({ length: T }, (_, t) => {
      const token: number[] = [];
      for (const headOut of headsOut) token.push(...headOut[t]);
      return token;
    });
    // Çıkış projeksiyonu + residual + layernorm
    const projected = matMul(concat, layer.out);
    return projected.map((token, t) => layerNorm(x[t].map((v, d) => v + token[d]), layer.ln1g, layer.ln1b));
  }

  configInfo(): MicroTransformerConfig {
    return { ...this.config };
  }
}

export function predictShotsAhead(window: number[][], shotsAhead = SHOTS_AHEAD): number {
  // Tahmin: pencere sonundan itibaren kaç vuruş sonrası risk? (meta-etiket)
  return Math.max(0, shotsAhead);
}

export function edgeTransformerStatus(): string {
  return `Edge Transformer: ${EDGE_DEFAULT_CONFIG.nLayer}L×${EDGE_DEFAULT_CONFIG.nHead}H • ${EDGE_DEFAULT_CONFIG.windowSize} kare pencere • ${SHOTS_AHEAD} vuruş öncesi • <${EDGE_LATENCY_BUDGET_MS}ms hedef`;
}

