// ============================================================================
// 📡 DİJİTAL SİNYAL FİLTRESİ (Adım 17 — JS Mirror)
// ESP32 adc_filter.h (EMA + Low-Pass + Moving Average) karşılığı.
// BLE'den gelen ham paketleri yumuşatır (kontak paraziti / ADC jitter).
// ============================================================================

// ── 1. EMA (Exponential Moving Average) ──
export class EmaFilter {
  private value: number | null = null;
  constructor(private alpha = 0.25) {}
  filter(input: number): number {
    if (this.value === null) { this.value = input; return this.value; }
    this.value = this.alpha * input + (1 - this.alpha) * this.value;
    return this.value;
  }
  reset(): void { this.value = null; }
}

// ── 2. Tek Kutuplu Low-Pass (IIR) ──
export class LowPassFilter {
  private value = 0;
  constructor(private alpha = 0.12) {}
  filter(input: number): number {
    this.value = this.alpha * input + (1 - this.alpha) * this.value;
    return this.value;
  }
  reset(): void { this.value = 0; }
}

// ── 3. Pencereli Hareketli Ortalama (count takibi — ESP32 ile uyumlu) ──
export class MovingAverageFilter {
  private buf: number[];
  private sum = 0;
  private idx = 0;
  private count = 0;
  constructor(private window = 5) { this.buf = Array(window).fill(0); }
  filter(input: number): number {
    this.sum -= this.buf[this.idx];
    this.buf[this.idx] = input;
    this.sum += input;
    this.idx = (this.idx + 1) % this.window;
    this.count = Math.min(this.window, this.count + 1);
    return this.sum / this.count;
  }
  reset(): void { this.buf = Array(this.window).fill(0); this.sum = 0; this.idx = 0; this.count = 0; }
}

// ── 4. Çift Aşamalı Filtre Hattı (ESP32 ile birebir aynı) ──
export interface InsoleSignal {
  toePct: number;
  heelPct: number;
}

export class InsoleSignalFilter {
  private toeEma = new EmaFilter(0.25);
  private heelEma = new EmaFilter(0.25);
  private toeLp = new LowPassFilter(0.12);
  private heelLp = new LowPassFilter(0.12);
  private toeAvg = new MovingAverageFilter(4);
  private heelAvg = new MovingAverageFilter(4);

  /** Ham BLE paketinden filtrelenmiş basınç üretir */
  process(toePct: number, heelPct: number): InsoleSignal {
    const toe = this.toeAvg.filter(this.toeLp.filter(this.toeEma.filter(toePct)));
    const heel = this.heelAvg.filter(this.heelLp.filter(this.heelEma.filter(heelPct)));
    return { toePct: Math.max(0, Math.min(100, Math.round(toe))), heelPct: Math.max(0, Math.min(100, Math.round(heel))) };
  }

  reset(): void {
    this.toeEma.reset(); this.heelEma.reset();
    this.toeLp.reset(); this.heelLp.reset();
    this.toeAvg.reset(); this.heelAvg.reset();
  }
}

export function sensorSignalFilterStatus(): string {
  return 'Sinyal Filtresi: EMA 0.25 • LowPass 0.12 • MA(4) — ESP32 mirror';
}
