// ============================================================================
// 🧪 COURT SESSION E2E — UÇTAN UCA SENARYO SUITE (Adım 98)
// Playwright tarayıcı akışlarının headless/CI karşılığı — motorları doğrudan
// çalıştıran deterministik senaryolar:
//  S1: Koç sanal BLE bağlar → drill başlatır → yorgunluk tetikler → seans biter → PDF
//  S2: Veli giriş → OTP doğrula → büyüme eğrisi + PB kutlaması → feragat imzalar
//  S3: Offline → IndexedDB telemetri → reconnect → otomatik background sync
// Çalıştırma: node scripts/runE2eHeadless.mts (tarayıcı gerektirmez)
// ============================================================================
import { VirtualBleSensorLab } from '../src/app/lib/hardware/simulation/virtualBleSensorLab.ts';
import { assessMechanicalFatigue } from '../src/app/lib/sports/analytics/fatigueCurveEngine.ts';
import { buildScoutReport, reportMarkdown, type ScoutMetrics } from '../src/app/lib/scouting/scoutReportGenerator.ts';
import { ParentVerificationEngine } from '../src/app/lib/auth/parentVerificationEngine.ts';
import { growthVelocity, detectPhv, type GrowthMeasurement } from '../src/app/lib/analytics/growthVelocityEngine.ts';
import { detectPersonalBest, type PbHistory } from '../src/app/lib/gamification/pbDetectionEngine.ts';
import { clearanceStatus, signWaiver, type MedicalClearance } from '../src/app/lib/legal/digitalWaiverEngine.ts';
import { OfflineStorageEngine, createMemoryStorageBackend } from '../src/app/lib/storage/offlineStorageEngine.ts';
import { BackgroundSyncEngine } from '../src/app/lib/sync/backgroundSyncEngine.ts';

export interface E2EScenarioResult {
  id: string;
  name: string;
  ok: boolean;
  detail: string;
}

// ── SENARYO 1: KOÇ SEANS AKIŞI ────────────────────────────────────────────────
export function scenario1CoachSession(): E2EScenarioResult {
  // 1. Sanal BLE sensör bağla
  const lab = new VirtualBleSensorLab('normal', 7);
  const frame = lab.nextFrame(1000, 'sprint');
  if (frame.gctMs <= 0) return { id: 'S1', name: 'Koç Seans Akışı', ok: false, detail: 'BLE çerçevesi yok' };
  // 2. Drill sonrası yorgunluk degradasyonu
  const fatigue = assessMechanicalFatigue({
    gctBaselineMs: 200, gctCurrentMs: 245, rsiBaseline: 2.0, rsiCurrent: 1.4,
    hrBaseline: 120, hrCurrent: 160, powerBaseline: 80, powerCurrent: 74,
  }, 45);
  if (fatigue.level !== 'kritik') return { id: 'S1', name: 'Koç Seans Akışı', ok: false, detail: 'Yorgunluk tespit edilmedi' };
  // 3. Seans özeti → scout raporu → PDF/markdown
  const metrics: ScoutMetrics = { speedKmh: 26, reactivePower: 1.9, strikeMechanics: 74, staminaIndex: 70, mentalResilience: 62 };
  const report = buildScoutReport({ athleteName: 'Efe', metrics });
  const pdf = reportMarkdown(report);
  if (!pdf.includes('Efe') || report.overall <= 0) return { id: 'S1', name: 'Koç Seans Akışı', ok: false, detail: 'Rapor üretilemedi' };
  return { id: 'S1', name: 'Koç Seans Akışı', ok: true, detail: `BLE+fatigue+PDF (skor ${report.overall}/80)` };
}

// ── SENARYO 2: VELİ AKIŞI ─────────────────────────────────────────────────────
export function scenario2ParentFlow(): E2EScenarioResult {
  // 1. Veli OTP doğrula (antrenör onaylı)
  const otp = new ParentVerificationEngine();
  const token = otp.generateOtp('a1', 'veli-1', 7);
  const verify = otp.verify({ token: token.token, coachConfirmed: true });
  if (!verify.ok) return { id: 'S2', name: 'Veli Akışı', ok: false, detail: 'OTP doğrulanmadı' };
  // 2. Büyüme eğrisi + PHV
  const growth: GrowthMeasurement[] = [{ date: '2026-01-01', heightCm: 150 }, { date: '2026-04-01', heightCm: 152.5 }];
  const velocities = growthVelocity(growth);
  const phv = detectPhv(growth);
  if (velocities[0]?.velocityCmPerYear < 9 || !phv.phvDetected) return { id: 'S2', name: 'Veli Akışı', ok: false, detail: 'PHV tespit edilemedi' };
  // 3. PB kutlaması
  const history: PbHistory = { maxRsi: 2.0, minGctMs: 200, peakSprintKmh: 30, maxServeKmh: 170 };
  const pb = detectPersonalBest('MAX_RSI', 2.6, history.maxRsi);
  if (!pb) return { id: 'S2', name: 'Veli Akışı', ok: false, detail: 'PB yok' };
  // 4. Dijital feragat imzala → VALID
  const clearance: MedicalClearance = { signedAt: null, expiresAt: null, healthDocUploaded: false };
  const signed = signWaiver(clearance, 'imza', '2027-01-01T00:00:00Z');
  const final = { ...signed, healthDocUploaded: true };
  if (clearanceStatus(final) !== 'VALID') return { id: 'S2', name: 'Veli Akışı', ok: false, detail: 'Feragat VALID olmadı' };
  return { id: 'S2', name: 'Veli Akışı', ok: true, detail: 'OTP+PHV+PB+feragat VALID' };
}

// ── SENARYO 3: OFFLINE → SENKRONİZASYON ───────────────────────────────────────
export async function scenario3OfflineSync(): Promise<E2EScenarioResult> {
  const storage = new OfflineStorageEngine(createMemoryStorageBackend());
  let flushed = 0;
  const sync = new BackgroundSyncEngine(storage, async (batch) => { flushed += batch.length; return { ok: true }; }, 25);
  sync.setConnectivity(false);
  for (let i = 0; i < 40; i++) {
    await storage.enqueuePending('telemetry', { sessionId: 'off-1', timestampMs: i * 100 });
  }
  if ((await storage.countPending()) !== 40) return { id: 'S3', name: 'Offline Sync', ok: false, detail: 'Kuyruk dolmadı' };
  sync.setConnectivity(true);
  await new Promise((r) => setTimeout(r, 20));
  if (flushed !== 40 || (await storage.countPending()) !== 0) return { id: 'S3', name: 'Offline Sync', ok: false, detail: `flush ${flushed}/40` };
  return { id: 'S3', name: 'Offline Sync', ok: true, detail: '40 çerçeve kuyruğa → 2 batch flush' };
}

/** Tüm E2E senaryolarını çalıştırır. */
export async function runE2EScenarios(): Promise<E2EScenarioResult[]> {
  const s1 = scenario1CoachSession();
  const s2 = scenario2ParentFlow();
  const s3 = await scenario3OfflineSync();
  return [s1, s2, s3];
}
