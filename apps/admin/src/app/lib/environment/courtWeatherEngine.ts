// ============================================================================
// 🌦️ ÇEVRESEL HAVA SENSÖRÜ & ZEMİN TELAFİ MOTORU (Adım 139)
// Açık/kapalı kortlar için çevresel telafi hesaplayıcı: ortam sıcaklığı, bağıl
// nem, rüzgar hızı ve zemin ıslaklığını alır; Adım 127 top zıplama fiziğini ve
// tabanlık kayma riski katsayılarını ıslaklık/sıcaklığa göre ayarlar. Aşırı
// koşullarda (WBGT > 28°C) otomatik sıcak çarpması / hidrasyon molası alarmı
// tetikler. Saf/deterministik; sıfır bağımlılık.
// ============================================================================

export const WBGT_ALERT_THRESHOLD_C = 28;
export const MAX_BOUNCE_REDUCTION_PCT = 30;

export interface WeatherInput {
  tempC: number;
  humidityPct: number;    // 0-100
  windKph: number;
  surfaceWetnessPct: number; // 0-100
}

export interface WeatherAdjustments {
  wbgtC: number;
  ballBounceReductionPct: number;
  airDensityFactor: number;
  slipRisk: number; // 0-1
  frictionCoefficient: number; // 0-1 (yüksek = daha iyi tutuş)
}

export interface WeatherAlert {
  triggered: boolean;
  severity: 'info' | 'warning' | 'emergency';
  message: string;
  wbgtC: number;
}

// ── Basitleştirilmiş WBGT: WBGT ≈ T × (0.7 + 0.3 × nem/100) ─────────────────
export function computeWbgt(tempC: number, humidityPct: number): number {
  const clampedHumidity = Math.max(0, Math.min(100, humidityPct));
  return Math.round(tempC * (0.7 + 0.3 * (clampedHumidity / 100)) * 10) / 10;
}

export function computeAdjustments(weather: WeatherInput): WeatherAdjustments {
  const wbgtC = computeWbgt(weather.tempC, weather.humidityPct);
  const ballBounceReductionPct = Math.round(Math.min(MAX_BOUNCE_REDUCTION_PCT, weather.surfaceWetnessPct * 0.12 + weather.humidityPct * 0.04) * 100) / 100;
  const airDensityFactor = Math.round((1 + (20 - weather.tempC) * 0.003 + weather.humidityPct * 0.0005) * 10000) / 10000;
  const slipRisk = Math.round(Math.min(1, weather.surfaceWetnessPct / 100 * 0.6 + weather.humidityPct / 100 * 0.2) * 1000) / 1000;
  const frictionCoefficient = Math.round((1 - slipRisk) * 1000) / 1000;
  return { wbgtC, ballBounceReductionPct, airDensityFactor, slipRisk, frictionCoefficient };
}

// ── Adım 127 top zıplamasına çevresel telafi ─────────────────────────────────
export function adjustBallBounce(baseBounceM: number, weather: WeatherInput): { adjustedM: number; reductionPct: number; note: string } {
  const adjustments = computeAdjustments(weather);
  const adjustedM = Math.round(baseBounceM * (1 - adjustments.ballBounceReductionPct / 100) * 1000) / 1000;
  return {
    adjustedM,
    reductionPct: adjustments.ballBounceReductionPct,
    note: `Zemin ıslaklığı %${weather.surfaceWetnessPct} + nem %${weather.humidityPct} → zıplama %${adjustments.ballBounceReductionPct} azaldı`,
  };
}

// ── Isı/nem alarmı (WBGT > 28°C → sıcak çarpması / hidrasyon molası) ────────
export function weatherAlert(weather: WeatherInput): WeatherAlert {
  const adjustments = computeAdjustments(weather);
  if (adjustments.wbgtC > WBGT_ALERT_THRESHOLD_C) {
    return {
      triggered: true,
      severity: 'emergency',
      message: `WBGT ${adjustments.wbgtC}°C > ${WBGT_ALERT_THRESHOLD_C}°C — SICAK ÇARPMASI RİSKİ: hidrasyon molası zorunlu, yoğunluğu düşürün`,
      wbgtC: adjustments.wbgtC,
    };
  }
  if (adjustments.slipRisk > 0.5) {
    return {
      triggered: true,
      severity: 'warning',
      message: `Zemin kaygan (slip risk ${adjustments.slipRisk}) — tabanlık tutuşu düşük, vardiya/ayakkabı kontrolü önerilir`,
      wbgtC: adjustments.wbgtC,
    };
  }
  if (adjustments.wbgtC > 24) {
    return {
      triggered: true,
      severity: 'info',
      message: `WBGT ${adjustments.wbgtC}°C — hidrasyon hatırlatması (24°C üzeri)`,
      wbgtC: adjustments.wbgtC,
    };
  }
  return { triggered: false, severity: 'info', message: 'Çevresel koşullar uygun', wbgtC: adjustments.wbgtC };
}

export function courtWeatherStatus(): string {
  return `Hava Motoru: WBGT (eşik ${WBGT_ALERT_THRESHOLD_C}°C) • zıplama/slip telafisi • ıslaklık/nem düzeltmeleri`;
}
