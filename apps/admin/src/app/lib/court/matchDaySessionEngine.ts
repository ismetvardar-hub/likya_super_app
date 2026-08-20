// ============================================================================
// 🏟️ KORT MAÇ GÜNÜ HIZLI SEANS BAŞLATICI MOTORU (Adım 106)
// Koç için 1-dokunuş kort kurulumu: aktif kort (1-8) + önceden eşleştirilmiş
// pilot takım ("U14 Elit Gelişim") + maç formatı (Single Set / Best of 3 /
// 20dk Yüksek Yoğunluklu Drill). Tek dokunuşla BLE tabanlık akışları,
// Decathlon HRM beslemesi ve arka plan telemetri kaydı başlatılır.
// Saf/deterministik — durum makinesi node ortamında doğrulanabilir.
// ============================================================================

export type MatchFormatId = 'single_set' | 'best_of_3' | 'hiit_20min';
export type MatchSessionState = 'running' | 'set_break' | 'completed';
export type MatchTelemetryStreamId = 'insole_left' | 'insole_right' | 'hrm';

export const MATCH_COURT_MIN = 1;
export const MATCH_COURT_MAX = 8;
export const MATCH_TELEMETRY_SAMPLE_RATE_HZ = 100;

export interface MatchFormatPreset {
  id: MatchFormatId;
  label: string;
  description: string;
  expectedDurationMin: number;
  sets: number;
}

export const MATCH_FORMATS: MatchFormatPreset[] = [
  { id: 'single_set', label: 'Single Set', description: 'Tek set, maça kadar', expectedDurationMin: 20, sets: 1 },
  { id: 'best_of_3', label: 'Best of 3', description: 'Üç set üzerinden maç', expectedDurationMin: 60, sets: 3 },
  { id: 'hiit_20min', label: '20-min High Intensity Drill', description: '20 dk yüksek yoğunluklu drill', expectedDurationMin: 20, sets: 1 },
];

export function matchFormatPreset(id: MatchFormatId): MatchFormatPreset {
  const found = MATCH_FORMATS.find((f) => f.id === id);
  if (!found) throw new Error(`Bilinmeyen maç formatı: ${id}`);
  return found;
}

export interface MatchSessionConfig {
  courtId: number;
  squadId: string;
  format: MatchFormatId;
  athleteId: string;
}

export interface MatchSessionTelemetry {
  streams: MatchTelemetryStreamId[];
  logging: boolean;
  sampleRateHz: number;
  backgroundStartedAt: string;
}

export interface MatchSession {
  id: string;
  config: MatchSessionConfig;
  state: MatchSessionState;
  startedAt: string;
  endedAt: string | null;
  telemetry: MatchSessionTelemetry;
  setBreakCount: number;
}

// ── Konfig doğrulama (kort 1-8, takım, format) ───────────────────────────────
export function validateMatchSessionConfig(config: MatchSessionConfig): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!Number.isInteger(config.courtId) || config.courtId < MATCH_COURT_MIN || config.courtId > MATCH_COURT_MAX) {
    issues.push(`Kort ${config.courtId} geçersiz — aktif kort aralığı ${MATCH_COURT_MIN}-${MATCH_COURT_MAX}`);
  }
  if (!config.squadId || config.squadId.length === 0) issues.push('Pilot takım seçilmedi (squadId boş)');
  if (!MATCH_FORMATS.some((f) => f.id === config.format)) issues.push(`Maç formatı geçersiz: ${config.format}`);
  if (!config.athleteId || config.athleteId.length === 0) issues.push('Aktif sporcu seçilmedi (athleteId boş)');
  return { valid: issues.length === 0, issues };
}

// ── Tek dokunuş: seans oluştur (BLE akışları + telemetri otomatik başlar) ────
export function createMatchSession(
  config: MatchSessionConfig,
  opts: { startedAt?: string; telemetryStreams?: MatchTelemetryStreamId[] } = {},
): MatchSession {
  const validation = validateMatchSessionConfig(config);
  if (!validation.valid) throw new Error(`Seans konfig hatalı: ${validation.issues.join('; ')}`);
  const startedAt = opts.startedAt ?? new Date().toISOString();
  return {
    id: `ms_${startedAt.replace(/\D/g, '').slice(0, 14)}_${config.courtId}`,
    config,
    state: 'running',
    startedAt,
    endedAt: null,
    telemetry: {
      streams: opts.telemetryStreams ?? ['insole_left', 'insole_right', 'hrm'],
      logging: true,
      sampleRateHz: MATCH_TELEMETRY_SAMPLE_RATE_HZ,
      backgroundStartedAt: startedAt,
    },
    setBreakCount: 0,
  };
}

export type MatchSessionAction = 'set_break' | 'resume' | 'complete';

// ── Durum makinesi: running ⇄ set_break → completed ──────────────────────────
export function advanceMatchSession(session: MatchSession, action: MatchSessionAction, now = new Date()): MatchSession {
  const next: MatchSession = { ...session, config: { ...session.config }, telemetry: { ...session.telemetry } };
  if (action === 'complete') {
    next.state = 'completed';
    next.endedAt = now.toISOString();
    next.telemetry.logging = false;
    return next;
  }
  if (action === 'set_break' && session.state === 'running') {
    next.state = 'set_break';
    next.setBreakCount = session.setBreakCount + 1;
    return next;
  }
  if (action === 'resume' && session.state === 'set_break') {
    next.state = 'running';
    next.telemetry.logging = true;
    return next;
  }
  return session; // geçersiz geçiş → değişmez
}

export function sessionElapsedMs(session: MatchSession, now = new Date()): number {
  const end = session.endedAt ? new Date(session.endedAt).getTime() : now.getTime();
  return Math.max(0, end - new Date(session.startedAt).getTime());
}

export function sessionElapsedHuman(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}dk ${s}sn`;
}

export function matchDaySessionStatus(): string {
  return `Maç Günü: ${MATCH_FORMATS.length} format • Kort ${MATCH_COURT_MIN}-${MATCH_COURT_MAX} • 3 BLE akışı (Sol/Sağ/HRM) @ ${MATCH_TELEMETRY_SAMPLE_RATE_HZ}Hz`;
}
