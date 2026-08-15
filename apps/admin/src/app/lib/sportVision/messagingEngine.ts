// ============================================================================
// 📲 LİKYA SPORT VISION — KİŞİSELLEŞTİRİLMİŞ MESAJLAŞMA & İLETİŞİM MOTORU
// Sporcu / Antrenör / Müşteri rolleri için ayrı, bilimsel ve motive edici şablonlar.
// (Stat verileri deterministik motor tarafından üretilir; burada sadece metinleşir.)
// ============================================================================

import type { ObserverAgentProfile } from './branchAgents';
import type { BiomechanicsReport, InjuryReport } from './sportsScienceEngine';

// ----------------------------------------------------------------------------
// SPORCUYA — motive edici, gelişim odaklı, anlaşılır mesaj
// ----------------------------------------------------------------------------
export function buildAthleteMessage(
  agent: ObserverAgentProfile,
  bio: BiomechanicsReport,
  injury: InjuryReport,
  extra: { strikeSpeedKmh?: number; calories?: number } = {}
): string {
  const speedLine = extra.strikeSpeedKmh
    ? `\n⚡ Vuruş hızın ${extra.strikeSpeedKmh} km/s — geçen haftaya göre canlılık var.`
    : '';
  const calorieLine = extra.calories
    ? `\n🔥 Bu seansta ~${extra.calories} kcal yaktın.`
    : '';
  const injLine =
    injury.riskLevel === 'YÜKSEK'
      ? `\n🛡️ ${agent.icon} ${agent.name}: vücudun sinyal veriyor — ${injury.regeneration}`
      : injury.riskLevel === 'ORTA'
        ? `\n🛡️ Dinlenme planına sadık kal: ${injury.regeneration}`
        : '';

  return `${agent.icon} ${agent.name} mesajı:\n${bio.verdict}${speedLine}${calorieLine}${injLine}\n\n📈 Gelişim odaklı: küçük kazanımlar büyük şampiyonluklar kurar. Yarına hazırlan!`;
}

// ----------------------------------------------------------------------------
// ANTENÖRE — teknik, taktik ve bilimsel antrenman yük raporu
// ----------------------------------------------------------------------------
export function buildCoachMessage(
  agent: ObserverAgentProfile,
  bio: BiomechanicsReport,
  injury: InjuryReport,
  pedagogy: { tacticalAdvice: string; athleteDevelopment: string; nextStep: string }
): string {
  return `${agent.icon} ${agent.name} — ANTENÖR RAPORU\n━━━━━━━━━━━━━━━━\n🧬 Biyomekanik: ${bio.verdict}\n⚖️ Asimetri: %${bio.asymmetryScore.toFixed(1)} • Denge: %${bio.balanceScore}\n🛡️ Sakatlık riski: ${injury.verdict} ${injury.regeneration}\n🎓 Takti̇k: ${pedagogy.tacticalAdvice}\n🧠 Sporcu gelişimi: ${pedagogy.athleteDevelopment}\n${pedagogy.nextStep}`;
}

// ----------------------------------------------------------------------------
// MÜŞTERİYE (tesis misafiri) — sade, heveslendirici aktivite mesajı
// ----------------------------------------------------------------------------
export function buildCustomerMessage(agent: ObserverAgentProfile, calories: number, durationMin: number): string {
  return `${agent.icon} ${agent.name} seansını tamamladın! ${durationMin} dakikada ~${calories} kcal enerji harcadın. Likya Kampüsü'nde formda kal — bir sonraki seansın ${agent.rhythm.toLowerCase()} ritimle seni bekliyor! 🎾🏊🧘`;
}
