// ============================================================================
// ⚡ DİNAMİK GRF VEKTÖR TAHMİNİ (Adım 34) — basınç kalibrasyonlu yaklaşım
// F_z ≈ m·g + k_cal·(ΔP_toe + ΔP_heel)
// Instantaneous Impact Peak (IP) • Active Peak (AP) • Loading Rate (kN/s)
// Sonuç kuvveti: F_res = √(Fz² + Fap² + Fml²) (ön-arka/lateral veri yoksa ≈ Fz)
// Deterministik; sıfır bağımlılık.
// ============================================================================

export interface GrfCalibration {
  kToe: number;
  kHeel: number;
  tareToe: number;
  tareHeel: number;
}

export interface StancePressureSample {
  tMs?: number;
  toePct: number;
  heelPct: number;
  gctMs?: number;
}

export interface GrfStanceAnalysis {
  bodyWeightN: number;
  verticalGrfN: number;     // Fz (durma/tepe)
  resultantN: number;       // F_res
  impactPeakN: number;      // IP — temasın ilk %35'inde tepe
  activePeakN: number;      // AP — aktif itiş fazında tepe
  loadingRateKnS: number;   // (IP - BW) / t_impact
  grfMultiplier: number;    // Fz / BW katı
}

/** Tek bir basınç örneğinden dikey GRF: Fz ≈ m·g + k_cal·(ΔP_toe + ΔP_heel). */
export function approximateVerticalGrf(bodyMassKg: number, cal: GrfCalibration, sample: StancePressureSample): number {
  const deltaToe = sample.toePct - cal.tareToe;
  const deltaHeel = sample.heelPct - cal.tareHeel;
  return bodyMassKg * 9.81 + (cal.kToe * deltaToe + cal.kHeel * deltaHeel);
}

export interface GrfStanceInput {
  bodyMassKg: number;
  calibration: GrfCalibration;
  samples: StancePressureSample[];
  timeToImpactMs?: number;  // temas başlangıcı → IP süresi (varsayılan 30ms)
  apForceN?: number;        // ön-arka bileşen (varsa)
  mlForceN?: number;        // mediolateral bileşen (varsa)
}

/** Duruş fazı boyunca GRF profili: IP (ilk %35) ve AP (aktif faz) analizi. */
export function analyzeGroundReaction(input: GrfStanceInput): GrfStanceAnalysis {
  const { bodyMassKg, calibration, timeToImpactMs = 30 } = input;
  const bodyWeightN = bodyMassKg * 9.81;
  const vertical = input.samples.map((s) => approximateVerticalGrf(bodyMassKg, calibration, s));
  const stance = vertical.filter((f) => f > bodyWeightN + 5); // yüklü örnekler

  if (stance.length === 0) {
    return { bodyWeightN, verticalGrfN: bodyWeightN, resultantN: bodyWeightN, impactPeakN: bodyWeightN, activePeakN: bodyWeightN, loadingRateKnS: 0, grfMultiplier: 1 };
  }

  const impactEnd = Math.max(1, Math.round(stance.length * 0.35));
  const impactPeakN = Math.round(Math.max(...stance.slice(0, impactEnd)));
  const activePeakN = Math.round(Math.max(...stance.slice(impactEnd)));
  const peak = Math.max(impactPeakN, activePeakN);
  const loadingRateKnS = Number((((impactPeakN - bodyWeightN) / 1000) / (timeToImpactMs / 1000)).toFixed(1));
  const ap = input.apForceN ?? 0;
  const ml = input.mlForceN ?? 0;
  const resultantN = Math.round(Math.sqrt(peak ** 2 + ap ** 2 + ml ** 2));

  return {
    bodyWeightN: Math.round(bodyWeightN),
    verticalGrfN: peak,
    resultantN,
    impactPeakN,
    activePeakN,
    loadingRateKnS,
    grfMultiplier: Number((peak / Math.max(1, bodyWeightN)).toFixed(2)),
  };
}

export function grfApproximationStatus(): string {
  return 'GRF Yaklaşım: Fz=m·g+k·ΔP • IP/AP • Loading Rate kN/s • F_res — basınç kalibrasyonlu';
}
