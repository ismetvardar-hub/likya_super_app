// ============================================================================
// 🦶 EXTREMES AKILLI AI TABANLIK (Smart Insole) — Plantiga / Stryd Sınıfı
// 6-Nokta Basınç Matrisi (FSR) + 200-400Hz IMU
// - GCT (Zemin Temas Süresi) ve RSI (Reaktif Kuvvet İndeksi) hesaplayıcı
// - Pronasyon / Supinasyon sınıflandırıcı (içe/nötr/dışa basma açı tespiti)
// - Darbe yükleme oranı & stres kırığı erken uyarı radarı (Asym>%10 → RISK_ALERT)
// - Mock-first: donanım bağlı değilse 200 Hz gerçekçi adım telemetrisi
// ============================================================================

// 6 noktalı FSR matris hücreleri (tabanlık altı)
export type InsoleCell = 'HEEL' | 'MET1' | 'MET5' | 'TOES' | 'MID_LAT' | 'MID_MED';

export interface PressureMatrix {
  heel: number;        // Topuk
  met1: number;        // 1. Metatars (başparmak kökü)
  met5: number;        // 5. Metatars (küçük parmak kökü)
  toes: number;        // Ayak parmakları
  midfoot: number;     // Orta taban kavisi (lateral+medial ort.)
  sixCellRaw: Record<InsoleCell, number>; // 6 hücre ham basınç (kPa)
}

export interface InsoleTelemetry {
  foot: 'R' | 'L';
  pressure: PressureMatrix;
  gctMs: number;            // Zemin Temas Süresi
  flightMs: number;         // Havada kalma süresi
  rsi: number;              // Reaktif Kuvvet İndeksi = flight/gct
  pronationAngle: number;   // derece (+ içe basma, - dışa basma)
  gaitType: 'PRONATION' | 'NEUTRAL' | 'SUPINATION';
  loadingRate: number;      // kN/s (darbe yükleme oranı)
  stepAsymmetry: number;    // % |GRF_sağ - GRF_sol| / max
  grf: number;              // tahmini GRF (kN)
  timestamp: number;
}

export interface InsoleAlert {
  severity: 'INFO' | 'RISK_ALERT' | 'CRITICAL';
  code: string;
  message: string;
}

const GCT_FATIGUE_THRESHOLD_MS = 220; // >220ms → reaktif elastik güç kaybı
const LOADING_RATE_RISK = 150;        // kN/s — stres kırığı risk eşiği
const ASYMMETRY_RISK_PCT = 10;        // %10 üzeri → koruma refleksi
const RSI_ELITE = 0.55;               // elit seviye RSI alt sınırı

// ---------------------------------------------------------------------------
// 1. Basınç Matrisi Simülasyonu (mock-first, deterministik)
// ---------------------------------------------------------------------------
export function simulatePressureMatrix(seed: number, foot: 'R' | 'L'): PressureMatrix {
  const heel = Math.round(90 + (seed % 7) * 8);
  const met1 = Math.round(70 + ((seed + 3) % 6) * 7);
  const met5 = Math.round(55 + ((seed + 5) % 5) * 6);
  const toes = Math.round(38 + ((seed + 1) % 4) * 5);
  const midLat = Math.round(18 + ((seed + 2) % 3) * 4);
  const midMed = Math.round(22 + ((seed + 4) % 3) * 4);
  return {
    heel,
    met1,
    met5,
    toes,
    midfoot: Math.round((midLat + midMed) / 2),
    sixCellRaw: { HEEL: heel, MET1: met1, MET5: met5, TOES: toes, MID_LAT: midLat, MID_MED: midMed },
  };
}

// ---------------------------------------------------------------------------
// 2. GCT + RSI Hesaplayıcı
// ---------------------------------------------------------------------------
export function computeContactMetrics(gctMs: number, flightMs: number): { rsi: number; fatigue: boolean; band: string } {
  const rsi = Number((flightMs / Math.max(1, gctMs)).toFixed(2));
  const fatigue = gctMs > GCT_FATIGUE_THRESHOLD_MS;
  const band = gctMs < 185 ? 'Elit Seviye' : gctMs < 220 ? 'İyi Seviye' : 'Yorgunluk Eşiği Üstü';
  return { rsi, fatigue, band };
}


// ---------------------------------------------------------------------------
// 3. Pronasyon / Supinasyon Sınıflandırıcı
// ---------------------------------------------------------------------------
export function classifyGait(pronationAngle: number): 'PRONATION' | 'NEUTRAL' | 'SUPINATION' {
  if (pronationAngle > 4) return 'PRONATION';
  if (pronationAngle < -2) return 'SUPINATION';
  return 'NEUTRAL';
}

export function gaitLabel(gait: 'PRONATION' | 'NEUTRAL' | 'SUPINATION'): string {
  if (gait === 'PRONATION') return 'İçe Basma (Aşırı Pronasyon)';
  if (gait === 'SUPINATION') return 'Dışa Basma (Supinasyon)';
  return 'Nötr Basma';
}

// ---------------------------------------------------------------------------
// 4. Darbe Yükü & Stres Kırığı Erken Uyarı Radarı
// ---------------------------------------------------------------------------
export function computeLoadingRate(grfChangeKn: number, dtS: number): number {
  return Number((grfChangeKn / Math.max(0.01, dtS)).toFixed(1));
}

export function computeAsymmetry(grfRight: number, grfLeft: number): number {
  return Number((Math.abs(grfRight - grfLeft) / Math.max(1, Math.max(grfRight, grfLeft)) * 100).toFixed(1));
}

export function insoleRiskRadar(tel: InsoleTelemetry): InsoleAlert[] {
  const alerts: InsoleAlert[] = [];
  if (tel.gctMs > GCT_FATIGUE_THRESHOLD_MS) {
    alerts.push({ severity: 'RISK_ALERT', code: 'GCT_HIGH', message: `GCT ${tel.gctMs}ms > 220ms — reaktif elastik güç kaybı, yorgunluk tespiti` });
  }
  if (tel.stepAsymmetry > ASYMMETRY_RISK_PCT) {
    alerts.push({ severity: 'RISK_ALERT', code: 'ASYMMETRY', message: `Adım asimetrisi %${tel.stepAsymmetry} > %10 — sporcu bir bacağını sakınıyor (koruma refleksi)` });
  }
  if (tel.loadingRate > LOADING_RATE_RISK) {
    alerts.push({ severity: 'CRITICAL', code: 'LOADING_RATE', message: `Darbe yükleme oranı ${tel.loadingRate} kN/s > 150 — Aşil tendiniti ve stres kırığı riski` });
  }
  if (alerts.length === 0) alerts.push({ severity: 'INFO', code: 'OK', message: 'Tabanlık parametreleri normal aralıkta' });
  return alerts;
}


// ---------------------------------------------------------------------------
// 5. Adım Telemetrisi Üretici (mock-first 200Hz)
// ---------------------------------------------------------------------------
let stepCounter = 0;

export function generateStepTelemetry(foot: 'R' | 'L', grfRight: number, grfLeft: number, seedBias = 0): InsoleTelemetry {
  stepCounter += 1;
  const seed = stepCounter + seedBias;
  const pressure = simulatePressureMatrix(seed, foot);
  const gctMs = Math.round(170 + (seed % 9) * 8 + seedBias * 3);
  const flightMs = Math.round(200 + (seed % 7) * 15);
  const pronationAngle = Number((3.1 + ((seed % 5) - 2) * 1.4).toFixed(1));
  const grf = Number((0.8 + (seed % 6) * 0.06).toFixed(2));
  const loadingRate = computeLoadingRate(grf, 0.012);
  const asymmetry = computeAsymmetry(grfRight, grfLeft);

  return {
    foot,
    pressure,
    gctMs,
    flightMs,
    rsi: computeContactMetrics(gctMs, flightMs).rsi,
    pronationAngle,
    gaitType: classifyGait(pronationAngle),
    loadingRate,
    stepAsymmetry: asymmetry,
    grf,
    timestamp: Date.now(),
  };
}

export function smartInsoleEngineStatus(): string {
  return `Tabanlık Motoru: 6 nokta FSR • 200 Hz IMU • GCT 220ms eşik • ${stepCounter} adım simüle`;
}

