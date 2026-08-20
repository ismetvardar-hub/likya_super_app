// ============================================================================
// 🔌 EDGE PROFILE ENGINE — kısıtlı donanımda ML çalıştırılabilirlik profili
// (Harvard MLSys "Hardware Kits": bellek • pil • gecikme kısıtlamaları)
// • Model boyutu (bayt), FLOPs, RAM tahmini, inferans µs, mAh/inferans
// • Hedef donanım karşılaştırması: ESP32 / ESP32-C3 / RP2040 / Mobil (JS)
// • Karar: model hedefe sığıyor mu? (deterministik eşik modeli)
// ============================================================================

export interface ModelShape {
  inputDim: number;
  outputDim: number;
  hiddenLayers?: number[]; // MLP ise gizli katman genişlikleri
}

export interface EdgeTarget {
  id: 'esp32' | 'esp32c3' | 'rp2040' | 'mobile-js';
  name: string;
  mhz: number;
  ramKb: number;
  flashKb: number;
  mac_opsPerSec: number; // ~MFLOPs (MACs/s)
}

export interface EdgeProfileRow {
  target: EdgeTarget;
  inferenceUs: number;
  ramPct: number;
  flashPct: number;
  fits: boolean;
  note: string;
}

export interface EdgeProfile {
  weightsBytes: number;
  flopsPerInference: number;
  ramEstimateKb: number;
  flashEstimateKb: number;
  mahPerInference: number;
  rows: EdgeProfileRow[];
  verdict: string;
}

export const EDGE_TARGETS: EdgeTarget[] = [
  { id: 'esp32', name: 'ESP32 (240MHz)', mhz: 240, ramKb: 520, flashKb: 4096, mac_opsPerSec: 240 },
  { id: 'esp32c3', name: 'ESP32-C3 (160MHz, RISC-V)', mhz: 160, ramKb: 400, flashKb: 4096, mac_opsPerSec: 120 },
  { id: 'rp2040', name: 'Raspberry Pi Pico RP2040', mhz: 133, ramKb: 264, flashKb: 2048, mac_opsPerSec: 80 },
  { id: 'mobile-js', name: 'Mobil tarayıcı (JS/WASM)', mhz: 2000, ramKb: 2048, flashKb: 32768, mac_opsPerSec: 1200 },
];

/** W/bias boyutu → bayt (float32). */
export function modelWeightsBytes(shape: ModelShape): number {
  const layers = [...(shape.hiddenLayers ?? []), shape.outputDim];
  let prev = shape.inputDim;
  let bytes = 0;
  for (const w of layers) {
    bytes += prev * w + w; // ağırlıklar + bias
    prev = w;
  }
  return bytes * 4;
}

/** Tek inferans için FLOPs (matmul + aktivasyon yaklaşımı). */
export function modelFlops(shape: ModelShape): number {
  const layers = [...(shape.hiddenLayers ?? []), shape.outputDim];
  let prev = shape.inputDim;
  let flops = 0;
  for (const w of layers) {
    flops += prev * w * 2 + w; // MAC + bias
    prev = w;
  }
  return flops;
}

/** Kısıtlı donanım hedeflerine göre çalıştırılabilirlik profili. */
export function profileEdgeModel(shape: ModelShape): EdgeProfile {
  const weightsBytes = modelWeightsBytes(shape);
  const flops = modelFlops(shape);
  const ramKb = Number((weightsBytes / 1024 + 4).toFixed(2)); // ağırlıklar + giriş tamponu
  const flashKb = Number((weightsBytes / 1024 + 16).toFixed(2)); // ağırlıklar + runtime sabitleri
  // ~40µA·s/MFLOP (actif akım yaklaşımı) → mAh/inferans
  const mahPerInference = Number((((flops / 1e6) * 0.04) / 3600).toFixed(7));

  const rows: EdgeProfileRow[] = EDGE_TARGETS.map((t) => {
    // 1 MAC = 2 FLOP; ops/s → µs
    const inferenceUs = Math.round((flops / 2 / (t.mac_opsPerSec * 1e6)) * 1e6);
    const ramPct = Number(((ramKb / t.ramKb) * 100).toFixed(2));
    const flashPct = Number(((flashKb / t.flashKb) * 100).toFixed(2));
    const fits = ramPct <= 25 && flashPct <= 50 && inferenceUs <= 5000;
    return {
      target: t,
      inferenceUs,
      ramPct,
      flashPct,
      fits,
      note: fits
        ? `✅ ${inferenceUs}µs inferans, RAM %${ramPct}, Flash %${flashPct} — gerçek zamanlı uygun`
        : `❌ Kısıt dışı (RAM %${ramPct} > %25 veya inferans ${inferenceUs}µs)`,
    };
  });

  const fitCount = rows.filter((r) => r.fits).length;
  const verdict = fitCount >= 2
    ? `Model ${weightsBytes} bayt — ${fitCount}/4 hedefte kısıtları karşılıyor; ESP32 tabanlık + mobil hazır`
    : `Model ${weightsBytes} bayt — yalnızca ${fitCount}/4 hedefte uygun; öznitelik/boyut küçültme gerekebilir`;

  return { weightsBytes, flopsPerInference: flops, ramEstimateKb: ramKb, flashEstimateKb: flashKb, mahPerInference, rows, verdict };
}

export function edgeProfileStatus(): string {
  return 'Edge Profil: bayt/FLOPs/RAM/µs/mAh • ESP32/Pico/mobil hedef karşılaştırma — deterministik';
}
