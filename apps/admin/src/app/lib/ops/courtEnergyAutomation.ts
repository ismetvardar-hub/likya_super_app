// ============================================================================
// 💡 IOT KORT ENERJİ & AYDINLATMA OTOMASYONU — Likya Pass x BLE Varlık
// - Pazu bandı / Likya Pass QR ile kort girişi → LED projektör + skorbord aç
//   (LIGHTS_ON tetikleyicisi)
// - BLE varlık yoklaması 2 dk boş kalırsa ENERGY_SAVING (LIGHTS_OFF)
// - Mock-first: IoT röle bağlı değilse deterministik durum simülasyonu
// ============================================================================

export type CourtEnergyState = 'LIGHTS_ON' | 'ENERGY_SAVING' | 'LIGHTS_OFF';

export interface CourtEnergyStatus {
  courtId: string;
  state: CourtEnergyState;
  floodlightsPct: number;    // LED projektör gücü
  scoreboardOn: boolean;
  powerKw: number;           // anlık çekim
  lastActivity: string;      // son hareket saati
  idleSeconds: number;       // BLE boşluk süresi
  triggeredBy: string;       // 'NFC/BLE: Efe' gibi
}

const IDLE_LIMIT_SEC = 120;  // 2 dk
const courts: Record<string, CourtEnergyStatus> = {};

function now(): string {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function ensure(courtId: string): CourtEnergyStatus {
  if (!courts[courtId]) {
    courts[courtId] = { courtId, state: 'ENERGY_SAVING', floodlightsPct: 20, scoreboardOn: false, powerKw: 0.4, lastActivity: now(), idleSeconds: 0, triggeredBy: 'otomatik' };
  }
  return courts[courtId];
}

// ---------------------------------------------------------------------------
// 1. Kort Girişi → LIGHTS_ON (Pazu Bandı / Likya Pass QR ile)
// ---------------------------------------------------------------------------
export function courtEntryOn(courtId: string, memberName: string): CourtEnergyStatus {
  const c = ensure(courtId);
  c.state = 'LIGHTS_ON';
  c.floodlightsPct = 100;
  c.scoreboardOn = true;
  c.powerKw = 6.4;
  c.lastActivity = now();
  c.idleSeconds = 0;
  c.triggeredBy = `NFC/BLE: ${memberName}`;
  return { ...c };
}

// ---------------------------------------------------------------------------
// 2. BLE Varlık Yoklaması — boşluk süresini işlet, 2 dk sonra tasarruf
// ---------------------------------------------------------------------------
export function courtIdleTick(courtId: string, seconds = 1): CourtEnergyStatus {
  const c = ensure(courtId);
  if (c.state === 'LIGHTS_ON') {
    c.idleSeconds += seconds;
    if (c.idleSeconds >= IDLE_LIMIT_SEC) {
      c.state = 'ENERGY_SAVING';
      c.floodlightsPct = 15;
      c.scoreboardOn = false;
      c.powerKw = 0.3;
      c.lastActivity = now();
      c.triggeredBy = 'BLE varlık yok (2dk)';
    }
  }
  return { ...c };
}

export function courtExitOff(courtId: string): CourtEnergyStatus {
  const c = ensure(courtId);
  c.state = 'LIGHTS_OFF';
  c.floodlightsPct = 0;
  c.scoreboardOn = false;
  c.powerKw = 0.05;
  c.lastActivity = now();
  c.idleSeconds = 0;
  c.triggeredBy = 'resmi kapanış';
  return { ...c };
}

export function getCourtEnergyStatus(courtId: string): CourtEnergyStatus {
  return { ...ensure(courtId) };
}

export function courtEnergyStatus(courtId: string): string {
  const c = ensure(courtId);
  const icon = c.state === 'LIGHTS_ON' ? '💡' : c.state === 'ENERGY_SAVING' ? '🌙' : '🔌';
  return `${icon} ${c.courtId}: ${c.state} • %${c.floodlightsPct} • ${c.powerKw} kW • ${c.triggeredBy}`;
}
