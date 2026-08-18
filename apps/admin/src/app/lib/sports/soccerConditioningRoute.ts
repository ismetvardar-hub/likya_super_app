// ============================================================================
// 🏃 FUTBOL SPEED TRANSITION KONDİSYON ROTASI
// 30x20m saha: Jog → Cruise → %90 Sprint → Recovery hız geçiş rotası.
// Interval temelli hız-kondisyon gelişimi; deterministik; Plan Z güvenli.
// ============================================================================

import { staffTaskDispatched } from '../ops/dazeHubEventBus';

export type SpeedSegment = 'Jog' | 'Cruise' | 'Sprint90' | 'Recovery';

export interface SpeedTransitionLap {
  lap: number;
  segment: SpeedSegment;
  distanceM: number;      // 30x20m saha kenarları
  durationSec: number;    // hedef süre
  targetPace: string;     // tempo notu
}

export const FIELD_30x20: { jog: number; cruise: number; sprint: number } = {
  jog: 30,      // 30m jog
  cruise: 20,   // 20m cruise (kenar)
  sprint: 30,   // 30m %90 sprint (uzun kenar)
};

/** Tur başına 4 segment: Jog → Cruise → Sprint90 → Recovery (tur: jog+3x30m tekrarı). */
export function buildSpeedTransitionRoute(laps = 4): SpeedTransitionLap[] {
  const route: SpeedTransitionLap[] = [];
  for (let lap = 1; lap <= laps; lap++) {
    route.push({ lap, segment: 'Jog', distanceM: FIELD_30x20.jog, durationSec: 30, targetPace: '5:00/km ritminde ısınma temposu' });
    route.push({ lap, segment: 'Cruise', distanceM: FIELD_30x20.cruise, durationSec: 14, targetPace: 'Orta-üst tempo — konuşma zorlaşır' });
    route.push({ lap, segment: 'Sprint90', distanceM: FIELD_30x20.sprint, durationSec: 11, targetPace: '%90 sprint — form bozulmadan' });
    route.push({ lap, segment: 'Recovery', distanceM: FIELD_30x20.jog, durationSec: 45, targetPace: 'Aktif toparlanma — yürüyüş/jog karışımı' });
  }
  return route;
}

export function routeTotalDurationSec(laps = 4): number {
  return buildSpeedTransitionRoute(laps).reduce((s, l) => s + l.durationSec, 0);
}

export function assignSpeedTransitionRoute(athlete: string, laps = 4): { ok: boolean; route: SpeedTransitionLap[]; totalMin: string; taskId: string } {
  const route = buildSpeedTransitionRoute(laps);
  const totalMin = (routeTotalDurationSec(laps) / 60).toFixed(1);
  const taskId = `SP-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  staffTaskDispatched(taskId, `${athlete} — Speed Transition ${laps} tur (30x20m)`, 0, laps * 4);
  return { ok: true, route, totalMin, taskId };
}

export function soccerConditioningRouteStatus(): string {
  return 'Futbol Speed Transition [30x20m • Jog→Cruise→%90 Sprint→Recovery • 4 tur ≈ 6.7dk]';
}
