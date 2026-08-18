// ============================================================================
// 🏃 TAKTİK DRILL & KONDİSYON REÇETELERİ — Gelişmiş Suit
//   1. Diagonal Sprint + Active Recovery (20yd çapraz + crossover zone)
//   2. Beat Defender Without Speed (Pace → Hip Attack → Hesi → Separation)
//   3. Passing & Cutting Spacing (genişlik + zamanlama)
//   4. 5-Round Full-Body Cardio döngüsü
// Her drill: hedef, set/rep, teknik odak, başarı ölçütü. Plan Z güvenli.
// ============================================================================

import { staffTaskDispatched } from '../ops/dazeHubEventBus';

export interface TacticalDrill {
  id: string;
  icon: string;
  name: string;
  category: 'hiz' | '1v1' | 'pas' | 'kardiyo';
  goal: string;
  setsReps: string;
  rest: string;
  techniqueFocus: string[];
  successCriteria: string;
}

export const TACTICAL_DRILLS: TacticalDrill[] = [
  {
    id: 'diagonal-sprint',
    icon: '📐',
    name: 'Diagonal Sprint + Active Recovery',
    category: 'hiz',
    goal: '20yd çapraz sprint sonrası crossover zone ile aktif toparlanma — yön değiştirme ve frenleme kapasitesi.',
    setsReps: '4x 20yd çapraz (sağ-sol dönüşümlü)',
    rest: '30s crossover zone (jog + lateral shuffle)',
    techniqueFocus: ['Plant öncesi hız düşürme (Brake Index)', 'Crossover adımda kalça alçak', 'Gövde dönüşü topa değil rotaya'],
    successCriteria: 'Son tekrarda brake index ≥ 0.75 ve crossover kayma < 15cm',
  },
  {
    id: 'beat-defender',
    icon: '🏃',
    name: 'Beat Defender Without Speed',
    category: '1v1',
    goal: 'Hızlanmadan adam eksiltme: Pace (ritim) → Hip Attack (kalça atak) → Hesi (duraksama) → Separation (ayrışma).',
    setsReps: '5x 1v1 (savunmacı %80 tempo)',
    rest: '45s',
    techniqueFocus: ['Pace: savunmacıyı ritmine al, hızlanma yok', 'Hip Attack: kalçayı savunmacının ön ayağına kır', 'Hesi: duraksama ile tepkiyi dondur', 'Separation: son adımda 1m ayrışma'],
    successCriteria: '4/5 denemede savunmacıyı hızlanmadan geçmek (1m üstü ayrışma)',
  },
  {
    id: 'passing-cutting',
    icon: '🔄',
    name: 'Passing & Cutting Spacing',
    category: 'pas',
    goal: 'Pas + kesme zamanlaması: genişlik korunurken içeri kes ve ikinci pası kur.',
    setsReps: '3x 8 pas döngüsü (5 oyuncu)',
    rest: '40s',
    techniqueFocus: ['Dış kanat çizgiye yaslanır (spacing ≥ 4m)', 'Kesme öncesi göz teması', 'İkinci pas tek dokunuş'],
    successCriteria: 'Pas döngüsü 90s altında ve 0 top kaybı',
  },
  {
    id: '5-round-cardio',
    icon: '❤️',
    name: '5-Round Full-Body Cardio',
    category: 'kardiyo',
    goal: '5 tur tam vücut kardiyo döngüsü — kondisyon + toparlanma hızı.',
    setsReps: '5 tur: 30s jump squat + 30s mekik + 30s mountain climber + 30s dinlenme',
    rest: '30s tur arası',
    techniqueFocus: ['Nabız toparlanma takibi (recoveryRate)', 'Form bozulmadan tempo', 'Nefes ritmi 2-2'],
    successCriteria: '5. turda nabız 1. turdakinin +%15 altında',
  },
];

export function getTacticalDrill(id: string): TacticalDrill | null {
  return TACTICAL_DRILLS.find((d) => d.id === id) ?? null;
}

/** Drilli sahaya/sporcuya ata → Daze Hub Event Bus personel görevi. */
export function assignTacticalDrill(drillId: string, athlete: string): { ok: boolean; drill: TacticalDrill | null; taskId: string } {
  const drill = getTacticalDrill(drillId);
  if (!drill) return { ok: false, drill: null, taskId: '' };
  const taskId = `TD-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  staffTaskDispatched(taskId, `${athlete} — ${drill.name}`, 0, 12);
  return { ok: true, drill, taskId };
}

export function tacticalDrillsSuiteStatus(): string {
  return `Taktik Drill Suiti [${TACTICAL_DRILLS.length} reçete: çapraz sprint • 1v1 • pas-kesme • 5-tur kardiyo]`;
}
