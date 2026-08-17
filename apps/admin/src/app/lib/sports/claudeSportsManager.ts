// ============================================================================
// 🎾 CLAUDE SPORTS MANAGER — Otonom Kulüp Direktörü
// Padel, tenis, basketbol ve su sporları takımları için antrenman planlama,
// performans özeti, scouting ve maç raporu. Deterministik; Plan Z güvenli.
// ============================================================================

export type SportBranch = 'padel' | 'tenis' | 'basketbol' | 'su-sporlari';

export interface TeamStats {
  branch: SportBranch;
  members: number;
  avgScore: number;
  nextMatch: string;
}

export interface TrainingPlan {
  branch: SportBranch;
  week: number;
  sessions: { day: string; focus: string; durationMin: number }[];
}

export interface MatchReport {
  branch: SportBranch;
  opponent: string;
  score: string;
  verdict: string;
  keyMoments: string[];
}

export const TEAM_STATS: TeamStats[] = [
  { branch: 'padel', members: 24, avgScore: 82, nextMatch: 'Cumartesi 18:00 — Kort 1' },
  { branch: 'tenis', members: 18, avgScore: 78, nextMatch: 'Pazar 10:00 — Kort 3' },
  { branch: 'basketbol', members: 15, avgScore: 85, nextMatch: 'Cuma 20:00 — Spor Salonu' },
  { branch: 'su-sporlari', members: 20, avgScore: 74, nextMatch: 'Cumartesi 09:00 — Dalga Havuzu' },
];

const FOCUS_POOL = ['Kondisyon', 'Teknik vuruş', 'Taktik oyun kurma', 'Servis/başlangıç', 'Savunma', 'Rekabetçi maç'];

// Haftalık antrenman planı (deterministik)
export function planTraining(branch: SportBranch): TrainingPlan {
  return {
    branch,
    week: 1,
    sessions: [1, 2, 3].map((i) => ({
      day: ['Pzt', 'Çar', 'Cum'][i - 1],
      focus: FOCUS_POOL[(branch.length + i) % FOCUS_POOL.length],
      durationMin: 60 + i * 15,
    })),
  };
}

// Maç raporu (deterministik)
export function generateMatchReport(branch: SportBranch, opponent: string): MatchReport {
  const base = 3 + (branch.length % 3);
  return {
    branch,
    opponent,
    score: `${base}-${base >= 4 ? 2 : base - 1}`,
    verdict: base >= 4 ? 'Zafer — takım formda 🎉' : 'Dengeli maç; gelişim alanları raporlandı',
    keyMoments: ['Açılış rallyleri kontrollüydü', 'Kritik anlarda servis isabeti %78', 'Koç önerisi: ikinci periyot taktik değişimi'],
  };
}

// Scouting özeti (deterministik)
export function scoutingSummary(branch: SportBranch): string {
  return `🔎 ${branch} scouting: 3 aday ön incelemede — en yüksek skor 88 (biyomekanik radar ort. 121 km/h). Daze nezaket tonuyla adaylarla iletişim planlandı.`;
}

export function sportsManagerStatus(): string {
  return `Claude Sports Manager [4 branş • antrenman+maç+scouting • otonom direktör]`;
}
