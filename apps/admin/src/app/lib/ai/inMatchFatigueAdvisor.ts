// ============================================================================
// 🤖 OTONOM AI MAÇ İÇİ YORGUNLUK TAHMİNCİ & TAKTİK DANIŞMANI (Adım 112)
// Gerçek zamanlı dayanıklılık tükenme öngörüsü: GCT uzama hızı, aktif
// deselerasyon sayısı ve kardiyovasküler drift modelleyerek olası başarısızlık
// noktasını (T_fatigue — kalan dakika) tahmin eder. Eşik aşıldığında koça
// otomatik taktik alarmı üretir. Saf/deterministik — node'da doğrulanabilir.
// ============================================================================

export type FatigueRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface FatigueModelInput {
  gctBaselineMs: number;                 // maç başı ortalama GCT
  gctCurrentMs: number;                  // anlık ortalama GCT
  gctElongationVelocityMsPerSet: number; // GCT uzama hızı (ms/set)
  activeDecelsPerSet: number;            // set başına yüksek yüklü deselerasyon
  cardioDriftBpm: number;                // maç içi kalp hızı sürüklenmesi
  setMinutesPlayed: number;              // oynanan süre (dk)
}

export interface FatigueForecast {
  tFatigueMinutes: number;   // kalan dayanıklılık (dk)
  fatigueScore: number;      // 0-100
  riskLevel: FatigueRiskLevel;
  pointOfFailureNote: string;
}

export const FATIGUE_FAILURE_THRESHOLD = 75;

// ── Yorgunluk skoru (GCT %40 + deselerasyon %35 + kardiyo %25) ───────────────
export function computeFatigueScore(input: FatigueModelInput): number {
  const gctComponent = Math.max(0, Math.min(40, input.gctElongationVelocityMsPerSet * 5));
  const decelComponent = Math.max(0, Math.min(35, (input.activeDecelsPerSet / 30) * 35));
  const cardioComponent = Math.max(0, Math.min(25, (input.cardioDriftBpm / 30) * 25));
  return Math.round(Math.max(0, Math.min(100, gctComponent + decelComponent + cardioComponent)));
}

export function forecastTFatigueMinutes(input: FatigueModelInput): number {
  const fatigueScore = computeFatigueScore(input);
  const velocityPerMin = Math.max(0.5, fatigueScore / Math.max(1, input.setMinutesPlayed));
  return Math.max(0, Math.round((FATIGUE_FAILURE_THRESHOLD - fatigueScore) / velocityPerMin));
}

export function riskLevelFor(fatigueScore: number): FatigueRiskLevel {
  if (fatigueScore >= 70) return 'critical';
  if (fatigueScore >= 50) return 'high';
  if (fatigueScore >= 30) return 'moderate';
  return 'low';
}

export function forecastFatigue(input: FatigueModelInput): FatigueForecast {
  const fatigueScore = computeFatigueScore(input);
  const tFatigueMinutes = forecastTFatigueMinutes(input);
  const riskLevel = riskLevelFor(fatigueScore);
  const note =
    riskLevel === 'critical'
      ? `⚠️ Yorgunluk %${fatigueScore} — ${tFatigueMinutes} dk içinde başarısızlık noktası; koç müdahalesi şart`
      : riskLevel === 'high'
        ? `Tahmini T_fatigue: ${tFatigueMinutes} dk kaldı — tempo yönetimi önerilir`
        : `Yorgunluk %${fatigueScore} — dayanıklılık rezervi yeterli`;
  return { tFatigueMinutes, fatigueScore, riskLevel, pointOfFailureNote: note };
}

export interface FatigueAlert {
  triggered: boolean;
  alert: string;
}

export const FATIGUE_TRIGGER_SCORE = 50;

// ── Taktik alarm üretici (deterministik şablon) ──────────────────────────────
export function generateFatigueAlert(input: FatigueModelInput, gameNumber?: number): FatigueAlert {
  const fatigueScore = computeFatigueScore(input);
  const game = gameNumber ?? Math.max(1, Math.ceil(input.setMinutesPlayed / 5));
  const dropPct = Math.max(5, Math.min(30, Math.round(input.gctElongationVelocityMsPerSet * 9)));

  if (fatigueScore >= FATIGUE_TRIGGER_SCORE || input.gctElongationVelocityMsPerSet >= 2 || input.cardioDriftBpm >= 15) {
    return {
      triggered: true,
      alert: `Oyuncunun bacak reaktif gücü ${game}. oyunda %${dropPct} düştü; servis-vole taktiği yerine taban çizgisinde tempo kontrolüne geçin.`,
    };
  }
  return {
    triggered: false,
    alert: `Yorgunluk izleme aktif (skor %${fatigueScore}) — mevcut tempo korunabilir.`,
  };
}

export function inMatchFatigueStatus(): string {
  return `AI Yorgunluk: GCT uzama + deselerasyon + kardiyo drift → T_fatigue (dk) • tetik eşiği %${FATIGUE_TRIGGER_SCORE}`;
}
