// ============================================================================
// 🎛️ KORT ALT AKSİYON ÇUBUĞU KONFİGÜRASYONU (Adım 74)
// Tek elle kullanım için hızlı aksiyonlar: Drill Başlat/Durdur • Sporcu Değiştir
// • Sesli Not • Sakatlık Durdur • Teşhis HUD. Saf, test edilebilir.
// ============================================================================

export type BottomActionId = 'start-stop-drill' | 'switch-athlete' | 'record-voice' | 'injury-stop' | 'diagnostics-hud';

export interface BottomAction {
  id: BottomActionId;
  label: string;
  emoji: string;
  color: string;
}

export const BOTTOM_ACTIONS: BottomAction[] = [
  { id: 'start-stop-drill', label: 'Drill', emoji: '▶️', color: '#00f2fe' },
  { id: 'switch-athlete', label: 'Sporcu', emoji: '👤', color: '#8B5CF6' },
  { id: 'record-voice', label: 'Ses Notu', emoji: '🎙️', color: '#F27A1A' },
  { id: 'injury-stop', label: 'Sakatlık', emoji: '🛑', color: '#F43F5E' },
  { id: 'diagnostics-hud', label: 'Teşhis', emoji: '📊', color: '#10B981' },
];

export interface ActionBarState {
  actions: Array<{ id: BottomActionId; enabled: boolean }>;
  orientation: 'portrait' | 'landscape';
  drillActive: boolean;
  currentAthleteIndex: number;
}

/** Aksiyon çubuğu durumunu serileştirir (layout persistence / test). */
export function serializeActionState(state: ActionBarState): string {
  return JSON.stringify(state);
}

export function deserializeActionState(json: string): ActionBarState | null {
  try {
    const parsed = JSON.parse(json) as ActionBarState;
    if (!Array.isArray(parsed.actions)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function createDefaultActionState(): ActionBarState {
  return { actions: BOTTOM_ACTIONS.map((a) => ({ id: a.id, enabled: true })), orientation: 'portrait', drillActive: false, currentAthleteIndex: 0 };
}

export function courtActionBarStatus(): string {
  return `Alt Aksiyon: ${BOTTOM_ACTIONS.length} tek-parmak aksiyon • portrait/landscape • serileştirme`;
}
