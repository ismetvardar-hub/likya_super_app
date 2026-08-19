// ============================================================================
// 🎯 CATCHPAD IoT REAKSİYON & TRİPOD ŞUT TAKİP MOTORU
// • 6'lı akıllı pod matrisi: Pod Işığı → Reaksiyon Süresi (ms) → İsabet Oranı
// • Hooper POV tripod modu: tek kameradan pota/oyuncu açısı → şut sayısı + %
// Bluetooth pod yoksa zarif simülasyon (mock-first). Deterministik; Plan Z.
// ============================================================================

export interface CatchPad {
  id: string;
  name: string;
  batteryPct: number;
  connected: boolean;    // Bluetooth eşleşme
  lastReactionMs: number;
  hits: number;
  misses: number;
}

export function buildCatchPadMatrix(connectedCount = 6): CatchPad[] {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `CP-${i + 1}`,
    name: `Pod ${i + 1}`,
    batteryPct: 92 - i * 3,
    connected: i < connectedCount,
    lastReactionMs: 0,
    hits: 0,
    misses: 0,
  }));
}

export interface ReactionRound {
  podId: string;
  lightOn: boolean;
  reactionMs: number;    // ışık yanma → dokunma süresi
  hit: boolean;
}

/** Pod ışığı yak → reaksiyon süresi ölç → isabet. (simülasyon: deterministik) */
export function runReactionRound(pod: CatchPad, reactionMs: number, targetMs = 450): ReactionRound {
  const hit = reactionMs <= targetMs;
  pod.lastReactionMs = reactionMs;
  if (hit) pod.hits++;
  else pod.misses++;
  return { podId: pod.id, lightOn: true, reactionMs, hit };
}

export function reactionAccuracy(pods: CatchPad[]): { hitRate: number; avgMs: number; bestMs: number } {
  const total = pods.reduce((a, p) => a + p.hits + p.misses, 0);
  const hits = pods.reduce((a, p) => a + p.hits, 0);
  const reactive = pods.filter((p) => p.lastReactionMs > 0);
  return {
    hitRate: total > 0 ? Math.round((hits / total) * 100) : 0,
    avgMs: reactive.length > 0 ? Math.round(reactive.reduce((a, p) => a + p.lastReactionMs, 0) / reactive.length) : 0,
    bestMs: reactive.length > 0 ? Math.min(...reactive.map((p) => p.lastReactionMs)) : 0,
  };
}

// ── HOPER POV — TRİPOD ŞUT TAKİBİ ───────────────────────────────────────────
export interface HooperPovShot {
  shotId: string;
  detected: boolean;
  entryAngleDeg: number;   // çember giriş açısı
  made: boolean;           // isabet (açı 35-50° ideal)
  distanceM: number;
}

/** Tek kamera (tripod) çıkarımı — pota + oyuncu açısından şut sayar. */
export function detectTripodShot(frame: { playerY: number; rimY: number; ballArc: number; distanceM: number }): HooperPovShot {
  const detected = frame.ballArc > 0.5 && frame.playerY > frame.rimY; // oyuncu altta (yüksek y), pota üstte
  const entryAngleDeg = detected ? Math.round(frame.ballArc * 45) : 0;
  const made = detected && entryAngleDeg >= 35 && entryAngleDeg <= 50;
  return { shotId: `POV-${Date.now().toString(36)}`, detected, entryAngleDeg, made, distanceM: frame.distanceM };
}

export interface HooperSession {
  shots: HooperPovShot[];
  makes: number;
  attempts: number;
  shootingPct: number;
}

export function hooperSessionAccumulate(session: HooperSession, shot: HooperPovShot): HooperSession {
  const shots = [...session.shots.slice(-49), shot];
  const attempts = shots.filter((s) => s.detected).length;
  const makes = shots.filter((s) => s.made).length;
  return { shots, makes, attempts, shootingPct: attempts > 0 ? Math.round((makes / attempts) * 100) : 0 };
}

export function catchPadReactionStatus(): string {
  return 'CatchPad IoT [6 pod • ms reaksiyon • isabet % • Hooper POV tripod şut takibi]';
}
