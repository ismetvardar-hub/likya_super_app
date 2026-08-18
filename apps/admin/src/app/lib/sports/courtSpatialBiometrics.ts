// ============================================================================
// 📐 ÇİZGİ TUZAĞI (SIDELINE TRAP) VE KALECİ/TURNİKE BİYOMEKANİK KARTLARI
//   • Saha kenarı mesafe risk skalası: Danger (0-1ft) / Risk (1-2ft) / Safe (2+ft)
//   • Kaleci açı kapatma + bacak blok puanlama
//   • 2-adım turnike ayak basış sırası (Outside → Inside → Vertical Takeoff)
// Deterministik skorlama; Plan Z güvenli.
// ============================================================================

export type SidelineZone = 'DANGER' | 'RISK' | 'SAFE';

export interface SidelineRisk {
  distanceFt: number;
  zone: SidelineZone;
  riskScore: number;    // 0-100 (100 = çizgiye yapışık/riskli)
  trapOpportunity: boolean; // savunmacı çizgiye sıkıştırabilir mi
  note: string;
}

/** Çizgiye uzaklık (ft) → bölge + risk skoru. */
export function evaluateSidelineRisk(distanceFt: number): SidelineRisk {
  if (distanceFt < 0) distanceFt = 0;
  if (distanceFt <= 1) {
    return { distanceFt, zone: 'DANGER', riskScore: 95, trapOpportunity: true, note: 'Çizgiye yapışık — savunmacı yan çizgiye sıkıştırabilir, ters yön oyun kur.' };
  }
  if (distanceFt <= 2) {
    return { distanceFt, zone: 'RISK', riskScore: 60, trapOpportunity: true, note: 'Risk bölgesi — içeriye kat veya çizgi dışına kaçış zamanlaması kritik.' };
  }
  return { distanceFt, zone: 'SAFE', riskScore: 15, trapOpportunity: false, note: 'Güvenli bölge — çizgi tuzağı riski düşük, genişlik korunabilir.' };
}

// ── KALECİ: AÇI KAPATMA + BACAK BLOK ────────────────────────────────────────
export interface GoalkeeperShotAngle {
  shotDistanceM: number;
  shooterAngleDeg: number;  // 0 = tam karşı, 90 = yandan
  nearPostCoverage: 0 | 1 | 2 | 3; // köşe kapama kalitesi
  angleCoverageScore: number; // 0-100
}

export function evaluateAngleCoverage(shotDistanceM: number, shooterAngleDeg: number, nearPostCoverage: 0 | 1 | 2 | 3): GoalkeeperShotAngle {
  const distanceBonus = Math.max(0, 40 - shotDistanceM * 4); // yakın şut daha kritik
  const angleFactor = Math.max(0.4, 1 - Math.abs(shooterAngleDeg - 45) / 45); // 45° en zor açı
  const coverFactor = (nearPostCoverage / 3) * 35;
  const angleCoverageScore = Math.round(Math.min(100, distanceBonus + angleFactor * 25 + coverFactor));
  return { shotDistanceM, shooterAngleDeg, nearPostCoverage, angleCoverageScore };
}

export function scoreLegBlock(blockClean: boolean, deflectTarget: boolean, followThrough: boolean): { score: number; note: string } {
  let score = 40;
  if (blockClean) score += 25;
  if (deflectTarget) score += 20;
  if (followThrough) score += 15;
  return {
    score,
    note: score >= 90 ? 'Mükemmel bacak blok — top açıya, kontrol kaleciye.' : score >= 60 ? 'İyi blok — hedefli saptırma geliştirilebilir.' : 'Blok zayıf — bacak pozisyonu ve takip çalışması gerekli.',
  };
}

// ── 2-ADIM TURNİKE (LAYUP) AYAK BASIŞ SIRASI ────────────────────────────────
export interface LayupFootwork {
  outsideFoot: 0 | 1 | 2;   // 1. adım doğru mu
  insideFoot: 0 | 1 | 2;    // 2. adım doğru mu
  verticalTakeoff: 0 | 1 | 2; // dikey çıkış doğru mu
  footworkScore: number;    // 0-100
  note: string;
}

export function scoreLayupFootwork(outsideFoot: 0 | 1 | 2, insideFoot: 0 | 1 | 2, verticalTakeoff: 0 | 1 | 2): LayupFootwork {
  const max = 6;
  const raw = outsideFoot + insideFoot + verticalTakeoff;
  const footworkScore = Math.round((raw / max) * 100);
  return {
    outsideFoot, insideFoot, verticalTakeoff, footworkScore,
    note: footworkScore === 100
      ? 'Mükemmel 2-adım: Dış ayak → İç ayak → Dikey çıkış senkronu (Outside → Inside → Takeoff).'
      : footworkScore >= 60
        ? 'İyi akış — adım sırası doğru ama dikey çıkış güçsüz; kalça sıkıştırma ekle.'
        : 'Adım sırası bozuk — Outside foot → Inside foot → Vertical Takeoff zinciri tekrar çalışılmalı.',
  };
}

export function courtSpatialBiometricsStatus(): string {
  return 'Çizgi Tuzağı & Kaleci/Turnike Biyomekaniği [Danger/Risk/Safe 0-1ft-2ft • Açı kapatma • 2-adım basış]';
}
