// ============================================================================
// 🩹 PEACE & LOVE SAKATLIK VE REHABİLİTASYON MOTORU
// Akut yumuşak doku sakatlıkları için modern protokol:
//   PEACE (Protect, Elevate, Avoid NSAIDs, Compress, Educate) — Gün 1-3
//   LOVE  (Load, Optimism, Vascularisation, Exercise) — Gün 4+
// Sporcu profilinde bildirime göre gün gün aktif iyileşme + Progressive
// Loading (antrenmana dönüş yükleme) reçetesi üretir. Deterministik; Plan Z.
// ============================================================================

export type InjuryType = 'kas' | 'bilek-burkulma' | 'diz' | 'omuz' | 'genel-yumusak-doku';

export interface PeacePhase {
  phase: 'PEACE';
  days: [1, 3];
  principles: { letter: string; label: string; action: string }[];
}

export interface LovePhase {
  phase: 'LOVE';
  days: [4, 14];
  principles: { letter: string; label: string; action: string }[];
}

export interface RehabDayPlan {
  day: number;
  phase: 'PEACE' | 'LOVE';
  loadPercent: number;        // antrenman yükü (progressive loading)
  protocol: string;
  exercises: string[];
  returnSportSignal: string;
}

export const PEACE_PRINCIPLES: PeacePhase['principles'] = [
  { letter: 'P', label: 'Protect', action: 'İlk 1-3 gün ağrılı hareketten kaçın; aktiviteyi ağrı eşiğinin altında tut.' },
  { letter: 'E', label: 'Elevate', action: 'Ekstremiteyi kalp seviyesi üstünde tut; ödemi azalt (günde 3-4x 20dk).' },
  { letter: 'A', label: 'Avoid NSAIDs', action: 'NSAİİ ve buz, iyileşmeyi geciktirir — enflamasyon doğal süreçtir.' },
  { letter: 'C', label: 'Compress', action: 'Kompresyon bandajı ile ödemi sınırla; aşırı sıkı olmamalı.' },
  { letter: 'E', label: 'Educate', action: 'Sporcuyu süreç hakkında bilgilendir; pasif tedavi yerine aktif katılım.' },
];

export const LOVE_PRINCIPLES: LovePhase['principles'] = [
  { letter: 'L', label: 'Load', action: 'Gün 4+ ağrısız kademeli yükleme başla — doku yeniden adaptasyonu.' },
  { letter: 'O', label: 'Optimism', action: 'Olumlu beklenti; beyin-vücut bağlantısı iyileşmeyi hızlandırır.' },
  { letter: 'V', label: 'Vascularisation', action: 'Düşük yoğunluklu bisiklet/yüzme ile kan akışını artır.' },
  { letter: 'E', label: 'Exercise', action: 'Ağrısız aktif egzersiz — ROM, izometrik, ardından güç.' },
];

const INJURY_SEVERITY: Record<InjuryType, { initialRestDays: number; loadSteps: number[] }> = {
  'kas': { initialRestDays: 3, loadSteps: [30, 40, 50, 60, 70, 80, 90, 100] },
  'bilek-burkulma': { initialRestDays: 3, loadSteps: [25, 35, 45, 60, 70, 85, 95, 100] },
  'diz': { initialRestDays: 3, loadSteps: [20, 30, 40, 50, 65, 75, 85, 100] },
  'omuz': { initialRestDays: 3, loadSteps: [25, 35, 50, 60, 70, 80, 90, 100] },
  'genel-yumusak-doku': { initialRestDays: 3, loadSteps: [30, 40, 50, 65, 75, 85, 95, 100] },
};

/** Sporcunun sakatlık bildirimine göre 14 günlük gün gün rehabilitasyon planı. */
export function generateRehabPlan(injury: InjuryType, athlete: string, injuryDay = 1): RehabDayPlan[] {
  const cfg = INJURY_SEVERITY[injury] ?? INJURY_SEVERITY['genel-yumusak-doku'];
  const plan: RehabDayPlan[] = [];

  for (let d = 1; d <= 14; d++) {
    const isPeace = d <= cfg.initialRestDays;
    const loadIndex = Math.min(d - 1 - cfg.initialRestDays, cfg.loadSteps.length - 1);
    const loadPercent = isPeace ? 0 : cfg.loadSteps[Math.max(0, loadIndex)];

    const exercises = isPeace
      ? ['Ağrısız ROM (eklem hareket genişliği)', 'İzometrik kasılma 3x5s (ağrı eşiği altı)', 'Elevasyon + kompresyon (3x20dk)']
      : d === 4
        ? ['Düşük yoğunluklu bisiklet 10dk', 'Ağrısız aktif ROM', `Progressive Load %${loadPercent} — izometrik → konsantrik`]
        : d <= 7
          ? [`Yük %${loadPercent}: bisiklet 15dk + hafif direnç bantları`, 'Denge egzersizleri (tek bacak 3x20s)', 'Vaskülarizasyon: yürüyüş 20dk']
          : [`Yük %${loadPercent}: güç çalışması (vücut ağırlığı → ek yük)`, 'Koordinasyon + aglity drilleri', 'Saha içi jog + yön değiştirme (düşük tempo)'];

    plan.push({
      day: d,
      phase: isPeace ? 'PEACE' : 'LOVE',
      loadPercent,
      protocol: isPeace
        ? `PEACE — ${PEACE_PRINCIPLES.map((p) => p.label).join(' / ')}`
        : `LOVE — Load %${loadPercent} + ${LOVE_PRINCIPLES.map((p) => p.label).join(' / ')}`,
      exercises,
      returnSportSignal: d >= 10 ? 'Saha antrenmanına ağrısız dönüş denemesi (temas yok)' : d === 14 ? 'Tam takım antrenmanına kademeli katılım' : 'Antrenmana dönüş sinyali yok — yük takibi sürüyor',
    });
  }
  return plan;
}

/** Gün bazlı hızlı reçete (UI kartı için). */
export function rehabDayCard(injury: InjuryType, athlete: string, day: number): RehabDayPlan | null {
  const plan = generateRehabPlan(injury, athlete);
  return plan.find((p) => p.day === day) ?? null;
}

export function injuryRehabEngineStatus(): string {
  return 'PEACE & LOVE Rehabilitasyon Motoru [PEACE Gün 1-3 • LOVE Gün 4+ • Progressive Loading 14 gün]';
}
