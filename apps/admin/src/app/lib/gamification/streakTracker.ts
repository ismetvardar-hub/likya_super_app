// ============================================================================
// 🔥 ANTRENMAN SERİSİ & TUTARLILIK TAKİBİ (Adım 63)
// • Aktif ardışık günlük/haftalık seri hesaplama
// • Dondurma koruması: 1 günlük dinlenme hafifliği seriyi bozmaz
// • Katılım skoru (%0-100) — takım/veli raporları için
// Deterministik; sıfır bağımlılık.
// ============================================================================

export interface StreakDay {
  date: string;      // ISO gün
  attended: boolean;
}

export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
  frozenDays: number;
  freezeUsed: boolean;
  adherencePct: number;
}

/** Ardışık seri + dondurma korumalı hesap (tarih sıralı girdi bekler). */
export function computeStreak(days: StreakDay[], freezeEnabled = true): StreakResult {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let current = 0;
  let best = 0;
  let frozen = 0;
  let freezeUsed = false;

  for (const d of sorted) {
    if (d.attended) {
      current++;
      if (current > best) best = current;
    } else if (freezeEnabled && !freezeUsed && current > 0) {
      // 1 günlük dinlenme hafifliği: seri korunur, dondurma kullanılır
      freezeUsed = true;
      frozen++;
    } else {
      current = 0;
    }
  }
  const total = sorted.length;
  const adherencePct = total > 0 ? Math.round((sorted.filter((d) => d.attended).length / total) * 100) : 100;
  return { currentStreak: current, bestStreak: best, frozenDays: frozen, freezeUsed, adherencePct };
}

/** Belirli bir pencerede katılım skoru (%0-100). */
export function computeAdherence(days: StreakDay[], windowDays = 30): number {
  const window = [...days].sort((a, b) => b.date.localeCompare(a.date)).slice(0, windowDays);
  if (window.length === 0) return 100;
  return Math.round((window.filter((d) => d.attended).length / window.length) * 100);
}

export function streakTrackerStatus(): string {
  return 'Streak: ardışık gün • 1 gün dondurma koruması • katılım %';
}
