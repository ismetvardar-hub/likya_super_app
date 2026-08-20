// ============================================================================
// ⚖️ ACWR YÜK DENGESİ MOTORU (Adım 31) — EWMA + Rolling Window
// Acute Load (Yorgunluk): 7 gün ağırlıklı yük
// Chronic Load (Fitness): 28 gün ağırlıklı yük
// Uncoupled ACWR = Acute / Chronic
// Bölgeler: 🟢 Optimal [0.8-1.3] · 🟡 Under/Warning (<0.8 veya 1.3-1.5) · 🔴 Danger ≥1.5
// Deterministik; sıfır bağımlılık; Plan Z güvenli.
// ============================================================================

export interface DailyLoad {
  date: string; // ISO gün (YYYY-MM-DD)
  load: number; // TRIMP / session yükü (AU)
}

export type AcwrZone = 'optimal' | 'under_training' | 'warning' | 'danger';

export interface AcwrResult {
  method: 'ewma' | 'rolling';
  acute: number;
  chronic: number;
  acwr: number;
  zone: AcwrZone;
  badge: string;     // 🟢 / 🟡 / 🔴
  spikeAlert: boolean;
  advisory: string;
}

// ── Üstel Ağırlıklı Hareketli Ortalama (EWMA) ────────────────────────────────
export function ewmaLoad(loads: number[], lambda: number): number {
  if (loads.length === 0) return 0;
  let ema = loads[0];
  for (let i = 1; i < loads.length; i++) ema = lambda * loads[i] + (1 - lambda) * ema;
  return ema;
}

export function classifyAcwrZone(acwr: number): { zone: AcwrZone; badge: string; spikeAlert: boolean } {
  if (acwr >= 1.5) return { zone: 'danger', badge: '🔴', spikeAlert: true };
  if (acwr < 0.8) return { zone: 'under_training', badge: '🟡', spikeAlert: false };
  if (acwr > 1.3) return { zone: 'warning', badge: '🟡', spikeAlert: false };
  return { zone: 'optimal', badge: '🟢', spikeAlert: false };
}

export function advisoryFor(zone: AcwrZone, acwr: number): string {
  switch (zone) {
    case 'danger':
      return `🚨 SPIKE ALERT — ACWR ${acwr} ≥ 1.5; akut yük kronik bazı %50+ aşıyor, sakatlık riski ~4x. Yoğunluğu/hacmi hemen düşür.`;
    case 'warning':
      return `⚠️ ACWR ${acwr} üst bantta (1.3-1.5) — ek yük eklemeyin, toparlanma seansı planla.`;
    case 'under_training':
      return `ℹ️ ACWR ${acwr} — düşük yük; kondisyon kaybı olmadan kademeli +%10 artış önerilir.`;
    default:
      return `✅ ACWR ${acwr} optimal bölgede (0.8-1.3) — kademeli yükleme sürdürülebilir.`;
  }
}

function buildResult(method: 'ewma' | 'rolling', acute: number, chronic: number): AcwrResult {
  const acwr = chronic <= 0 ? 0 : Number((acute / chronic).toFixed(2));
  const { zone, badge, spikeAlert } = classifyAcwrZone(acwr);
  return { method, acute: Number(acute.toFixed(1)), chronic: Number(chronic.toFixed(1)), acwr, zone, badge, spikeAlert, advisory: advisoryFor(zone, acwr) };
}

/** EWMA tabanlı ACWR: λ_akut = 2/8 = 0.25, λ_kronik = 2/29 ≈ 0.069. */
export function computeAcwrEwma(dailyLoads: DailyLoad[], acuteDays = 7, chronicDays = 28): AcwrResult {
  const loads = dailyLoads.map((d) => d.load);
  const acute = ewmaLoad(loads.slice(-acuteDays), 2 / (acuteDays + 1));
  const chronic = ewmaLoad(loads.slice(-chronicDays), 2 / (chronicDays + 1));
  return buildResult('ewma', acute, chronic);
}

/** Standart rolling window ACWR: 7 gün ortalaması / 28 gün ortalaması. */
export function computeAcwrRolling(dailyLoads: DailyLoad[], acuteDays = 7, chronicDays = 28): AcwrResult {
  const loads = dailyLoads.map((d) => d.load);
  const mean = (a: number[]) => (a.length === 0 ? 0 : a.reduce((x, y) => x + y, 0) / a.length);
  const acute = mean(loads.slice(-acuteDays));
  const chronic = mean(loads.slice(-chronicDays));
  return buildResult('rolling', acute, chronic);
}

export function acwrEngineStatus(): string {
  return 'ACWR Motor: EWMA(λ 0.25/0.069) + Rolling • 7/28 gün • 🟢0.8-1.3 🟡<0.8/1.3-1.5 🔴≥1.5';
}
