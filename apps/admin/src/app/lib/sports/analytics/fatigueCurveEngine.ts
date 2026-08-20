// ============================================================================
// 😮💨 GERÇEK ZAMANLI MEKANİK YORGUNLUK DEGRADASYONU (Adım 32)
// Degradasyon indeksi bileşenleri:
//  • GCT uzaması > %15 (zemin temasında drift)
//  • RSI düşüşü > %20 (reaktif güç kaybı)
//  • Kardiyovasküler dekouple: HR yükselirken kol/vuruş gücü sabit/düşük
// Çıktı: Stamina % (0-100) + decay hızı (%/dk) + risk seviyesi.
// Deterministik; sıfır bağımlılık.
// ============================================================================

export interface FatigueInput {
  gctBaselineMs: number;
  gctCurrentMs: number;
  rsiBaseline: number;
  rsiCurrent: number;
  hrCurrent: number;
  hrBaseline: number;
  powerBaseline: number; // kol/vuruş güç indeksi (0-100)
  powerCurrent: number;
}

export type FatigueLevel = 'taze' | 'yorgun' | 'kritik';

export interface FatigueAssessment {
  gctDriftPct: number;       // GCT uzaması %
  rsiDropPct: number;        // RSI düşüşü %
  hrRisePct: number;         // HR artışı %
  decouplingDetected: boolean; // HR↑ + güç sabit/düşük
  fatigueIndex: number;      // 0-100 birikmiş yorgunluk
  staminaPct: number;        // 100 - fatigueIndex
  decayVelocity: number;     // %/dk
  level: FatigueLevel;
  alert: string;
}

export const GCT_DRIFT_THRESHOLD_PCT = 15;
export const RSI_DROP_THRESHOLD_PCT = 20;

/**
 * Gerçek zamanlı yorgunluk degradasyon indeksi:
 * GCT drift (30), RSI düşüşü (35), kardiyovasküler dekouple (25) + kademeli bileşenler.
 */
export function assessMechanicalFatigue(input: FatigueInput, elapsedMin = 1): FatigueAssessment {
  const gctDriftPct = input.gctBaselineMs > 0 ? Number((((input.gctCurrentMs - input.gctBaselineMs) / input.gctBaselineMs) * 100).toFixed(1)) : 0;
  const rsiDropPct = input.rsiBaseline > 0 ? Number((((input.rsiBaseline - input.rsiCurrent) / input.rsiBaseline) * 100).toFixed(1)) : 0;
  const hrRisePct = input.hrBaseline > 0 ? Number((((input.hrCurrent - input.hrBaseline) / input.hrBaseline) * 100).toFixed(1)) : 0;
  // HR yükseliyor ama güç kazanmıyor → dekouple
  const decouplingDetected = hrRisePct > 8 && input.powerCurrent <= input.powerBaseline * 1.02;

  let fatigue = 0;
  // GCT drift bileşeni (maks 30)
  if (gctDriftPct > GCT_DRIFT_THRESHOLD_PCT) fatigue += 30;
  else if (gctDriftPct > 8) fatigue += 20;
  else fatigue += Math.round((gctDriftPct / GCT_DRIFT_THRESHOLD_PCT) * 20);

  // RSI düşüş bileşeni (maks 35)
  if (rsiDropPct > RSI_DROP_THRESHOLD_PCT) fatigue += 35;
  else if (rsiDropPct > 10) fatigue += 24;
  else fatigue += Math.round((rsiDropPct / RSI_DROP_THRESHOLD_PCT) * 28);

  // Dekouple bileşeni (25)
  if (decouplingDetected) fatigue += 25;

  fatigue = Math.min(100, fatigue);
  const staminaPct = 100 - fatigue;
  const decayVelocity = Number((fatigue / Math.max(1, elapsedMin)).toFixed(1));
  const level: FatigueLevel = fatigue > 60 ? 'kritik' : fatigue > 35 ? 'yorgun' : 'taze';
  const alert =
    level === 'kritik'
      ? `🚨 Yorgunluk %${fatigue} — GCT +${gctDriftPct}% / RSI -${rsiDropPct}%${decouplingDetected ? ' / DEKOUPLE' : ''}; seansı sonlandır`
      : level === 'yorgun'
        ? `⚠️ Yorgunluk %${fatigue} — yoğunluk azalt, set arası dinlenmeyi uzat`
        : `✅ Stamina %${staminaPct} — yorgunluk yönetimi kontrol altında`;
  return { gctDriftPct, rsiDropPct, hrRisePct, decouplingDetected, fatigueIndex: fatigue, staminaPct, decayVelocity, level, alert };
}

export function fatigueCurveStatus(): string {
  return `Yorgunluk Motoru: GCT>${GCT_DRIFT_THRESHOLD_PCT}% • RSI>${RSI_DROP_THRESHOLD_PCT}% • dekouple • stamina%+decay`;
}
