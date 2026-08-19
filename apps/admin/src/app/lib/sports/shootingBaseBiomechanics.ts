// ============================================================================
// 🏀 ŞUT DENGE TEMELİ (SHOOTING BASE) BİYOMEKANİĞİ
// Ayak tabanı ve iniş dengesi analizörü:
//   • Ayak genişliği (omuz hizası kontrolü)
//   • Diz açısı (içe çökme / Inward cave uyarısı)
//   • Göğüs-kalça dikey hizalanması (Stacked posture)
//   • Sessiz iniş skoru (jump-landing kontrolü)
// Deterministik skorlama; Plan Z güvenli.
// ============================================================================

export interface FootStance {
  shoulderWidthCm: number;
  stanceWidthCm: number;
  stanceRatio: number;       // stance/shoulder (0.8-1.3 ideal)
  stanceVerdict: 'IDEAL' | 'DAR' | 'GENIS';
}

export interface KneePosture {
  kneeValgusDeg: number;     // içe çökme açısı (>10° uyarı)
  kneeVerdict: 'STABLE' | 'INWARD_CAVE_WARNING';
}

export interface UpperBodyPosture {
  chestHipOffsetCm: number;  // göğüs-kalça dikey kayma
  stackedPosture: boolean;   // dikey hizalı mı
}

export interface LandingControl {
  landingNoiseScore: number; // 0-100 (100 = tam sessiz/absorbe)
  softLanding: boolean;
}

export interface ShootingBaseReport {
  athlete: string;
  foot: FootStance;
  knee: KneePosture;
  posture: UpperBodyPosture;
  landing: LandingControl;
  baseScore: number;         // 0-100 genel denge skoru
  prescription: string;
}

export function analyzeFootStance(shoulderWidthCm: number, stanceWidthCm: number): FootStance {
  const ratio = Math.round((stanceWidthCm / Math.max(1, shoulderWidthCm)) * 100) / 100;
  const stanceVerdict: FootStance['stanceVerdict'] = ratio >= 0.8 && ratio <= 1.3 ? 'IDEAL' : ratio < 0.8 ? 'DAR' : 'GENIS';
  return { shoulderWidthCm, stanceWidthCm, stanceRatio: ratio, stanceVerdict };
}

export function analyzeKneePosture(kneeValgusDeg: number): KneePosture {
  return {
    kneeValgusDeg: Math.round(kneeValgusDeg * 10) / 10,
    kneeVerdict: kneeValgusDeg > 10 ? 'INWARD_CAVE_WARNING' : 'STABLE',
  };
}

export function analyzeUpperBodyPosture(chestHipOffsetCm: number): UpperBodyPosture {
  return {
    chestHipOffsetCm: Math.round(chestHipOffsetCm * 10) / 10,
    stackedPosture: Math.abs(chestHipOffsetCm) <= 5,
  };
}

export function analyzeLanding(noiseDb: number): LandingControl {
  // İniş ses şiddeti (dB): <45 sessiz/absorbe → 100; >70 sert → 20 altı
  const landingNoiseScore = Math.max(0, Math.min(100, Math.round(100 - (noiseDb - 40) * 2.5)));
  return { landingNoiseScore, softLanding: landingNoiseScore >= 70 };
}

export function analyzeShootingBase(input: {
  athlete: string;
  shoulderWidthCm: number;
  stanceWidthCm: number;
  kneeValgusDeg: number;
  chestHipOffsetCm: number;
  landingNoiseDb: number;
}): ShootingBaseReport {
  const foot = analyzeFootStance(input.shoulderWidthCm, input.stanceWidthCm);
  const knee = analyzeKneePosture(input.kneeValgusDeg);
  const posture = analyzeUpperBodyPosture(input.chestHipOffsetCm);
  const landing = analyzeLanding(input.landingNoiseDb);

  let baseScore = 50;
  if (foot.stanceVerdict === 'IDEAL') baseScore += 20; else if (foot.stanceVerdict === 'GENIS') baseScore += 5;
  if (knee.kneeVerdict === 'STABLE') baseScore += 20; else baseScore -= 20;
  if (posture.stackedPosture) baseScore += 15; else baseScore -= 10;
  baseScore = Math.max(0, Math.min(100, baseScore + Math.round((landing.landingNoiseScore - 50) / 10)));

  const prescription =
    baseScore >= 85 ? 'Elit denge tabanı — omuz hizası, nötr diz, hizalı gövde, sessiz iniş korunmalı.'
    : baseScore >= 65 ? 'İyi — küçük düzeltmeler: ayak basışını omuz hizasına genişlet ve diz içe çöküşünü izle.'
    : baseScore >= 45 ? 'Orta — şut öncesi set pozisyonunda gövde hizalaması + sessiz iniş drilleri (landing ladder).'
    : 'Zayıf — sakatlık riski: diz valgusu ve sert iniş var; denge tabanı yeniden kurulmalı (base reset).';

  return { athlete: input.athlete, foot, knee, posture, landing, baseScore, prescription };
}

export function shootingBaseBiomechanicsStatus(): string {
  return 'Şut Denge Biyomekaniği [omuz hizası • diz valgusu • stacked posture • sessiz iniş]';
}
