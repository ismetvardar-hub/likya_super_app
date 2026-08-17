// ============================================================================
// 🏀 GENÇ SPORCU GELİŞİM MÜFREDATI — PHV & OTA (Basketball Ready 360)
// 6-16 yaş grupları için Peak Height Velocity (PHV) gelişim evresi tespiti ve
// antrenman drill planlaması. Deterministik; Plan Z güvenli. Kırılmasız.
// ============================================================================

export interface AthleteProfile {
  age: number;
  gender: 'k' | 'e';
  heightCm: number;
  weeklyHours: number;
}

export type PhvStage = 'pre-phv' | 'phv' | 'post-phv';

export interface DrillPlan {
  stage: PhvStage;
  focus: string;
  drills: { name: string; sets: string; minutes: number }[];
  weeklyVolume: number;
}

// PHV evresi tespiti (deterministik yaş/momentum kuralları)
export function detectPhvStage(profile: AthleteProfile): PhvStage {
  if (profile.gender === 'k') {
    if (profile.age < 9) return 'pre-phv';
    if (profile.age >= 9 && profile.age <= 13) return 'phv';
    return 'post-phv';
  }
  if (profile.age < 11) return 'pre-phv';
  if (profile.age >= 11 && profile.age <= 15) return 'phv';
  return 'post-phv';
}

// Dril planı üret (faza göre odak değişir)
export function planDrills(profile: AthleteProfile): DrillPlan {
  const stage = detectPhvStage(profile);
  const baseMinutes = profile.weeklyHours * 12;
  switch (stage) {
    case 'pre-phv':
      return {
        stage,
        focus: 'Koordinasyon & Temel Hareket Becerileri',
        drills: [
          { name: 'Temel Top Sürme Zigzag', sets: '4x8 dk', minutes: 32 },
          { name: 'Ayak Çalışması Merdiveni', sets: '3x6 dk', minutes: 18 },
          { name: 'Fun-Game 3v3', sets: '2x10 dk', minutes: 20 },
        ],
        weeklyVolume: baseMinutes,
      };
    case 'phv':
      return {
        stage,
        focus: 'İvmelenme & Havada Kontrol (Ready 360)',
        drills: [
          { name: 'Sprint + Layup Zinciri', sets: '4x6 dk', minutes: 24 },
          { name: 'Zıplama Kontrolü (reaktif)', sets: '3x8 dk', minutes: 24 },
          { name: 'İki Elle Pas Tekniği', sets: '3x6 dk', minutes: 18 },
        ],
        weeklyVolume: baseMinutes,
      };
    default:
      return {
        stage,
        focus: 'Oyun Zekâsı & Pozisyon Spesifik',
        drills: [
          { name: 'Pick & Roll Senaryosu', sets: '4x8 dk', minutes: 32 },
          { name: 'Şut Mekaniği (form üstü)', sets: '3x10 dk', minutes: 30 },
          { name: 'Maç İçi Karar Drişleri', sets: '2x12 dk', minutes: 24 },
        ],
        weeklyVolume: baseMinutes,
      };
  }
}

// Yaş grubu etiketi
export function ageBandLabel(age: number): string {
  if (age <= 8) return 'U-8 (6-8 yaş)';
  if (age <= 12) return 'U-12 (9-12 yaş)';
  if (age <= 16) return 'U-16 (13-16 yaş)';
  return '16+';
}

export function phvStatus(): string {
  return `PHV Müfredat [6-16 yaş • Ready 360/OTA • 3 evre + drill planlama]`;
}
