// ============================================================================
// ⚡ DİNAMİK GRF VEKTÖR YAKLAŞIMI (Zemin Tepki Kuvveti)
// • Dikey GRF: F = m·(g + a_z) — tabanlık ivme verisinden tahmin
// • Üç eksenli kuvvet vektörü: dikey + ön-arka (anterior/posterior) + mediolateral
// • Vektör açısı ve sol-sağ asimetri % (çift tabanlık desteği)
// Deterministik; sıfır bağımlılık; mock-first.
// ============================================================================

export interface GrfVector {
  verticalGrfN: number;       // dikey zemin tepki (N)
  anteriorPosteriorN: number; // ön-arka bileşen (N, + = itiş)
  mediolateralN: number;      // yanal bileşen (N, + = içe)
  totalMagnitudeN: number;    // vektör büyüklüğü (N)
  vectorAngleDeg: number;     // dikey eksene göre sapma açısı (0 = saf dikey)
  grfMultiplier: number;      // vücut ağırlığının katı (G)
}

const G = 9.81;

/** Tek bir örnekten (vücut kütlesi + 3 eksen ivme) GRF vektörünü hesaplar. */
export function analyzeGrfVector(input: {
  bodyMassKg: number;
  accelX: number; // mediolateral (m/s²)
  accelY: number; // anterior-posterior (m/s²)
  accelZ: number; // dikey (m/s²)
}): GrfVector {
  const { bodyMassKg, accelX, accelY, accelZ } = input;
  const vertical = bodyMassKg * (G + accelZ);
  const ap = bodyMassKg * accelY;
  const ml = bodyMassKg * accelX;
  const total = Math.sqrt(vertical ** 2 + ap ** 2 + ml ** 2);
  const angle = Math.atan2(Math.sqrt(ap ** 2 + ml ** 2), Math.max(1e-6, vertical)) * (180 / Math.PI);
  return {
    verticalGrfN: Math.round(vertical),
    anteriorPosteriorN: Math.round(ap),
    mediolateralN: Math.round(ml),
    totalMagnitudeN: Math.round(total),
    vectorAngleDeg: Math.round(angle * 10) / 10,
    grfMultiplier: Math.round((vertical / Math.max(1, bodyMassKg * G)) * 10) / 10,
  };
}

export interface GrfAsymmetry {
  asymPct: number;          // 0-100 (0 = mükemmel simetri)
  dominantSide: 'L' | 'R';
  advisory: string;
}

/** Çift tabanlıktan sol/sağ tepe kuvvet asimetrisi (asimetri >%15 → risk). */
export function computeGrfAsymmetry(leftPeakN: number, rightPeakN: number): GrfAsymmetry {
  const total = leftPeakN + rightPeakN;
  if (total <= 0) return { asymPct: 0, dominantSide: 'R', advisory: 'Kuvvet verisi yok' };
  const asymPct = Math.round((Math.abs(leftPeakN - rightPeakN) / Math.max(leftPeakN, rightPeakN)) * 100);
  const dominantSide: 'L' | 'R' = leftPeakN >= rightPeakN ? 'L' : 'R';
  const advisory =
    asymPct > 15
      ? `⚠️ Asimetri %${asymPct} — dominant ${dominantSide}; tek bacak kuvvet çalışması (bilateral %15 altı hedef)`
      : `✅ Asimetri %${asymPct} — dengeli (≤%15)`;
  return { asymPct, dominantSide, advisory };
}

export function grfVectorStatus(): string {
  return 'GRF Vektör: F=m·(g+a) • 3 eksen • vektör açısı • L/R asimetri — sıfır bağımlılık';
}
