// ============================================================================
// 🎮 DAZE VISION — MERAK, ODAKLANMA & GAMIFICATION SEANSLARI
// • 25/5 Pomodoro + aktif esneme seans sayacı
// • 10 dk "İlk Adım" başlangıç rutini (Masa → Görev → 10 dk odak)
// • %1 Kazanan Zihniyeti (efor-sonuç korelasyonu)
// • Mini hedefler, seviye atlama, puan toplama (Daze-Gift puanı)
// • 2 dk zıplama + derin nefes mola bildirimi
// • Haftalık merak/odaklanma skoru (ebeveyn mini grafiği) + mental indeks
// Deterministik; Plan Z güvenli.
// ============================================================================

export interface SessionState {
  mode: 'focus' | 'break' | 'idle';
  remainingSec: number;
  cyclesCompleted: number;
  score: number;           // Daze-Gift puanı
  level: number;
}

export const POMODORO = { focusSec: 25 * 60, breakSec: 5 * 60, activeStretchSec: 2 * 60 };

export function startFocusSession(state: SessionState): SessionState {
  return { ...state, mode: 'focus', remainingSec: POMODORO.focusSec, cyclesCompleted: state.cyclesCompleted };
}

export function tickSession(state: SessionState, deltaSec = 1): SessionState & { transition: 'none' | 'break' | 'stretch' | 'complete' } {
  let remainingSec = Math.max(0, state.remainingSec - deltaSec);
  let mode = state.mode;
  let cyclesCompleted = state.cyclesCompleted;
  let score = state.score;
  let transition: 'none' | 'break' | 'stretch' | 'complete' = 'none';

  if (remainingSec === 0) {
    if (mode === 'focus') {
      cyclesCompleted++;
      score += 10;
      const isCycle2 = cyclesCompleted % 2 === 0;
      mode = 'break';
      remainingSec = isCycle2 ? POMODORO.activeStretchSec : POMODORO.breakSec;
      transition = isCycle2 ? 'stretch' : 'break';
    } else {
      mode = 'idle';
      transition = 'complete';
    }
  }

  return { mode, remainingSec, cyclesCompleted, score, level: Math.floor(score / 50) + 1, transition };
}

/** 10 dk İlk Adım rutini adımları. */
export function firstStepRoutine(): { steps: string[]; durationMin: number } {
  return { steps: ['Masayı hazırla (su + malzeme)', 'Tek görev seç (en küçük olanı)', '10 dk kesintisiz odaklan'], durationMin: 10 };
}

/** %1 Kazanan Zihniyeti — efor-sonuç korelasyonu (trying vs winning). */
export function onePercentMindset(effortScore: number, outcomeScore: number): { ratio: number; verdict: string; note: string } {
  const ratio = outcomeScore > 0 ? Math.round((effortScore / outcomeScore) * 100) : 0;
  const verdict = ratio >= 100 ? 'EFOR → SONUÇ' : 'SONUÇ → EFOR BEKLENTİSİ';
  const note = ratio >= 100
    ? 'Efor sonuçtan güçlü: süreç doğru, kazanım zamanla gelecek.'
    : 'Sonuç efordan önde: şans/paylaşım var — sürdürülebilirlik için eforu sabitle.';
  return { ratio, verdict, note };
}

/** Mini hedef + seviye/puan oyunlaştırma. */
export function gamificationGoal(goal: { name: string; weight: number }, completed: boolean): { newScore: number; leveledUp: boolean; badge: string } {
  const gained = completed ? goal.weight : 0;
  const newScore = gained;
  const leveledUp = completed && gained >= 50;
  return { newScore: gained, leveledUp, badge: leveledUp ? '🏆 Seviye Atladın!' : completed ? '🎖️ Görev Tamamlandı' : '' };
}

/** 2 dk hareket molası bildirimi (zıplama + derin nefes). */
export function movementBreakAlert(): { message: string; exercises: string[] } {
  return {
    message: '⏸️ 2 dk hareket molası — ekrandan kalk, bedeni şarj et!',
    exercises: ['10x yumuşak zıplama', '5x derin nefes (4-7-8)', '3x omuz/kol esneme'],
  };
}

/** Haftalık merak/odak skoru (ebeveyn mini grafik verisi). */
export function weeklyCuriosityScore(dailyFocusMin: number[]): { avgMin: number; trend: number; sparkline: number[]; score: number } {
  const avgMin = dailyFocusMin.length > 0 ? Math.round(dailyFocusMin.reduce((a, b) => a + b, 0) / dailyFocusMin.length) : 0;
  const trend = dailyFocusMin.length >= 2 ? dailyFocusMin[dailyFocusMin.length - 1] - dailyFocusMin[dailyFocusMin.length - 2] : 0;
  const score = Math.min(100, Math.round((avgMin / 150) * 100));
  return { avgMin, trend, sparkline: dailyFocusMin, score };
}

/** Sporcu mental yorgunluk & motivasyon indeksi (antrenör ekranı). */
export function mentalLoadIndex(focusScore: number, moodScore: number, sessionsDone: number): { fatigue: number; motivation: number; advice: string } {
  const fatigue = Math.min(100, Math.max(0, Math.round((100 - focusScore) * 0.7 + sessionsDone * 4)));
  const motivation = Math.min(100, Math.max(0, Math.round(moodScore * 0.8 - sessionsDone * 2)));
  const advice = fatigue > 70 ? 'Mental yorgunluk yüksek — seans azalt, ertesi güne taşı' : motivation < 40 ? 'Motivasyon düşük — küçük kazanım hedefi + sosyal bağ kur' : 'Mental denge sağlıklı';
  return { fatigue, motivation, advice };
}

export function curiosityGamificationStatus(): string {
  return 'Gamification [25/5 Pomodoro • 10 dk ilk adım • %1 zihniyet • seviye/puan • 2 dk mola • mental indeks]';
}
