// ============================================================================
// ⚡ AŞAMA 16 — ANTRENÖR MAÇ İÇİ CANLI İSTATİSTİK & DEĞİŞİKLİK ÖNERİSİ
// Oyuncu yorgunluk/nabız durumuna göre antrenöre değişiklik ve taktik önerisi.
// Deterministik eşikler; Plan Z güvenli.
// ============================================================================

import { staffTaskDispatched } from '../ops/dazeHubEventBus';

export interface LivePlayerStat {
  playerId: string;
  name: string;
  heartRate: number;        // bpm
  distanceKm: number;       // maç içi kat edilen mesafe
  fatigueIndex: number;     // 0-100 (yorgunluk)
  sprints: number;          // yüksek tempo koşu sayısı
}

export type SubstitutionUrgency = 'none' | 'watch' | 'urgent';

export interface SubstitutionSuggestion {
  urgency: SubstitutionUrgency;
  reason: string;
  suggestedPlayerOut: LivePlayerStat | null;
  suggestedPlayerIn: string | null;
}

const HR_MAX = 185;
const DIST_ALERT = 10;
const FATIGUE_ALERT = 75;

export function analyzeLivePlayer(stats: LivePlayerStat[]): SubstitutionSuggestion {
  const highHr = stats.filter((p) => p.heartRate >= HR_MAX);
  const highDist = stats.filter((p) => p.distanceKm >= DIST_ALERT);
  const highFatigue = stats.filter((p) => p.fatigueIndex >= FATIGUE_ALERT);
  const urgentPool = [...highHr, ...highDist, ...highFatigue];

  if (urgentPool.length === 0) {
    return { urgency: 'none', reason: 'Tüm oyuncular yeşil bölgede — ritmi koru.', suggestedPlayerOut: null, suggestedPlayerIn: null };
  }

  const worst = urgentPool.reduce((a, b) => (b.fatigueIndex + (b.heartRate / 200) * 100 > a.fatigueIndex + (a.heartRate / 200) * 100 ? b : a));

  if (highHr.length >= 2 || (worst.heartRate >= HR_MAX && worst.distanceKm >= DIST_ALERT * 0.8)) {
    const suggestion = {
      urgency: 'urgent' as SubstitutionUrgency,
      reason: `${worst.name} — nabız ${worst.heartRate} bpm, ${worst.distanceKm.toFixed(1)} km, yorgunluk ${worst.fatigueIndex}/100. Acil değişiklik önerilir.`,
      suggestedPlayerOut: worst,
      suggestedPlayerIn: pickFreshLeg(worst),
    };
    staffTaskDispatched(`SUB-${Date.now().toString(36).slice(-4).toUpperCase()}`, `ACİL DEĞİŞİKLİK: ${worst.name} → ${suggestion.suggestedPlayerIn}`, 0, 5);
    return suggestion;
  }

  return {
    urgency: 'watch',
    reason: `${worst.name} izleniyor — yorgunluk ${worst.fatigueIndex}/100, nabız ${worst.heartRate} bpm. Sonraki 5 dk içinde değerlendir.`,
    suggestedPlayerOut: worst,
    suggestedPlayerIn: null,
  };
}

function pickFreshLeg(out: LivePlayerStat): string {
  const subs = ['Yedek 7', 'Yedek 11', 'Yedek 14'];
  return subs[Math.abs(out.playerId.length) % subs.length];
}

export function liveGameTacticsEngineStatus(): string {
  return 'Maç İçi Motor [nabız 185 • mesafe 10km • yorgunluk 75 • acil/izle değişiklik önerisi]';
}
