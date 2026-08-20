// ============================================================================
// 💡 GVS KNX KORT AYDINLATMA & OTOMASYON GATEWAY (Adım 136)
// Bina-otomasyon protokol sürücüsü: kort floodlight'ları + çevresel devreler.
// Komutlar: ON / OFF / DIM_LUX (0-100%) / SCENE_MATCH_HIGH_INTENSITY /
// SCENE_STANDBY_ECO. Otomatik zamanlama: planlı seans başlamadan 5 dk önce aç,
// kort 10 dk boşsa ECO standby (%15). Başarısız-güvenli: headless CI ve offline
// demo için bellek-içi simülasyon sürücüsü. Saf/deterministik.
// ============================================================================

export type KnxCommand = 'ON' | 'OFF' | 'DIM_LUX' | 'SCENE_MATCH_HIGH_INTENSITY' | 'SCENE_STANDBY_ECO';

export const KNX_LIGHTS_GROUP_ADDRESS = '1/1/1';
export const KNX_ECO_STANDBY_DIM_PCT = 15;
export const KNX_MATCH_INTENSITY_DIM_PCT = 100;
export const SESSION_LIGHT_LEAD_MS = 5 * 60_000;   // seans öncesi 5 dk
export const VACANT_ECO_DELAY_MS = 10 * 60_000;    // 10 dk boşluk

export interface KnxCommandPayload {
  command: KnxCommand;
  value: number;        // DIM_LUX için 0-100
  groupAddress: string;
  telegram: string;     // KNX/1/1/1/COMMAND[:value]
}

export interface KnxLightingState {
  power: boolean;
  dimPct: number;
  scene: string;
  lastCommand: KnxCommand | null;
  updatedAtMs: number;
}

export interface CourtSessionEvent {
  courtId: number;
  startsAtMs: number;
}

export type ScheduleAction = 'TURN_ON_PRE_SESSION' | 'DIM_ECO_VACANT' | 'NO_CHANGE';

export interface ScheduleResult {
  action: ScheduleAction;
  state: KnxLightingState;
  reason: string;
}

// ── Komut payload derleme (telegram formatı) ─────────────────────────────────
export function buildKnxTelegram(command: KnxCommand, value = 0, groupAddress = KNX_LIGHTS_GROUP_ADDRESS): KnxCommandPayload {
  const normalized = command === 'DIM_LUX' ? Math.max(0, Math.min(100, Math.round(value))) : 0;
  const telegram = normalized > 0 && command === 'DIM_LUX'
    ? `KNX/${groupAddress}/${command}:${normalized}`
    : `KNX/${groupAddress}/${command}`;
  return { command, value: normalized, groupAddress, telegram };
}

export function knxCommandFromTelegram(telegram: string): KnxCommandPayload | null {
  const match = /^KNX\/([\d/]+)\/(ON|OFF|DIM_LUX|SCENE_MATCH_HIGH_INTENSITY|SCENE_STANDBY_ECO)(?::(\d+))?$/.exec(telegram);
  if (!match) return null;
  return {
    command: match[2] as KnxCommand,
    value: match[3] ? Number(match[3]) : 0,
    groupAddress: match[1],
    telegram,
  };
}

// ── GVS KNX aydınlatma gateway (bellek-içi simülasyon driver) ────────────────
export class KnxLightingGateway {
  private readonly state: KnxLightingState;

  constructor(initial: Partial<KnxLightingState> = {}) {
    this.state = { power: false, dimPct: 0, scene: 'STANDBY', lastCommand: null, updatedAtMs: 0, ...initial };
  }

  applyCommand(command: KnxCommand, value = 0, nowMs = Date.now()): KnxLightingState {
    switch (command) {
      case 'ON':
        this.state.power = true;
        this.state.dimPct = KNX_MATCH_INTENSITY_DIM_PCT;
        this.state.scene = 'ACTIVE';
        break;
      case 'OFF':
        this.state.power = false;
        this.state.dimPct = 0;
        this.state.scene = 'OFF';
        break;
      case 'DIM_LUX': {
        const dim = Math.max(0, Math.min(100, Math.round(value)));
        this.state.power = dim > 0;
        this.state.dimPct = dim;
        this.state.scene = dim === KNX_ECO_STANDBY_DIM_PCT ? 'ECO_STANDBY' : 'DIM';
        break;
      }
      case 'SCENE_MATCH_HIGH_INTENSITY':
        this.state.power = true;
        this.state.dimPct = 100;
        this.state.scene = 'MATCH_HIGH_INTENSITY';
        break;
      case 'SCENE_STANDBY_ECO':
        this.state.power = true;
        this.state.dimPct = KNX_ECO_STANDBY_DIM_PCT;
        this.state.scene = 'ECO_STANDBY';
        break;
    }
    this.state.lastCommand = command;
    this.state.updatedAtMs = nowMs;
    return { ...this.state };
  }

  // ── Otomatik zamanlama: seans öncesi 5 dk aç, 10 dk boşlukta ECO ───────────
  applySchedule(sessions: CourtSessionEvent[], nowMs: number, courtOccupied: boolean, courtId = 1): ScheduleResult {
    const upcoming = sessions
      .filter((s) => s.courtId === courtId && s.startsAtMs >= nowMs)
      .sort((a, b) => a.startsAtMs - b.startsAtMs);
    const nextSession = upcoming[0];

    if (nextSession && nextSession.startsAtMs - nowMs <= SESSION_LIGHT_LEAD_MS) {
      const state = this.applyCommand('SCENE_MATCH_HIGH_INTENSITY', 100, nowMs);
      return { action: 'TURN_ON_PRE_SESSION', state, reason: `Seans ${Math.ceil((nextSession.startsAtMs - nowMs) / 1000)}sn sonra — floodlight'lar tam güçte açıldı` };
    }
    if (!courtOccupied && this.state.power && this.state.dimPct !== KNX_ECO_STANDBY_DIM_PCT) {
      const state = this.applyCommand('SCENE_STANDBY_ECO', KNX_ECO_STANDBY_DIM_PCT, nowMs);
      return { action: 'DIM_ECO_VACANT', state, reason: `Kort ${VACANT_ECO_DELAY_MS / 60000} dk boş — ECO standby %${KNX_ECO_STANDBY_DIM_PCT}` };
    }
    return { action: 'NO_CHANGE', state: { ...this.state }, reason: 'Zamanlama koşulu yok' };
  }

  stateSnapshot(): KnxLightingState {
    return { ...this.state };
  }
}

export function knxLightingStatus(): string {
  return `KNX: ${KNX_LIGHTS_GROUP_ADDRESS} • 5 komut • seans öncesi ${SESSION_LIGHT_LEAD_MS / 60000}dk • ECO %${KNX_ECO_STANDBY_DIM_PCT} (${VACANT_ECO_DELAY_MS / 60000}dk boşluk)`;
}
