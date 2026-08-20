// ============================================================================
// ⚖️ TABANLIK KALİBRASYONU — saf mantık katmanı (Adım 22)
// Tare/Sıfır Yük • Tek Bacak • Dinamik Adım → k_toe, k_heel katsayıları
// Lineer regresyon: k = ΔNewton / ΔADC (tare noktası + ağırlık noktası)
// localStorage'a kayıt + ham ADC'ye uygulama — UI'dan bağımsız, test edilebilir.
// ============================================================================

export const CALIBRATION_LS_KEY = 'extremes_insole_calibration';

export interface CalibrationCoefficients {
  kToe: number;      // ADC birimi → Newton (toe)
  kHeel: number;
  tareToe: number;   // sıfır yük ADC
  tareHeel: number;
  calibratedAt: string;
}

export interface CalibrationInput {
  weightKg: number;
  tareAdc: { toe: number; heel: number };
  singleAdc: { toe: number; heel: number };
  toeLoadRatio?: number; // tek bacakta toe payı (varsayılan 0.8)
}

/** Lineer regresyon: k = ΔNewton / ΔADC — tare (0 yük) ve tek bacak (ağırlık) noktalarından. */
export function computeCalibrationCoefficients(input: CalibrationInput): Omit<CalibrationCoefficients, 'calibratedAt'> {
  const { weightKg, tareAdc, singleAdc, toeLoadRatio = 0.8 } = input;
  const weightN = weightKg * 9.81;
  const kToe = Number(((weightN * toeLoadRatio) / Math.max(1, singleAdc.toe - tareAdc.toe)).toFixed(3));
  const kHeel = Number(((weightN * (1 - toeLoadRatio)) / Math.max(1, singleAdc.heel - tareAdc.heel)).toFixed(3));
  return { kToe, kHeel, tareToe: tareAdc.toe, tareHeel: tareAdc.heel };
}

/** Calibration katsayılarını ham ADC'ye uygula → Newton. */
export function applyCalibration(adcValue: number, tare: number, k: number): number {
  return (adcValue - tare) * k;
}

/** localStorage'dan kalibrasyon katsayılarını yükle (yoksa null). */
export function loadCalibration(): CalibrationCoefficients | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CALIBRATION_LS_KEY);
    return raw ? (JSON.parse(raw) as CalibrationCoefficients) : null;
  } catch {
    return null;
  }
}

/** Kalibrasyon katsayılarını localStorage'a kaydet. */
export function saveCalibration(c: CalibrationCoefficients): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CALIBRATION_LS_KEY, JSON.stringify(c));
}

export function insoleCalibrationStatus(): string {
  return 'Tabanlık Kalibrasyon: k=ΔN/ΔADC lineer regresyon • tare/tek bacak/dinamik • localStorage';
}
