// ============================================================================
// 🏥 ORTOPEDİK POSTÜR & TABANLIK SAĞLIK MOTORU — 3 dk yürüyüş/koşu testi
// - Statik + dinamik basış analizi: düz tabanlık eğilimi, kavis çökme
// - Omurga yük dengesi (sağ/sol asimetri)
// - Likya Market özel ortopedik tabanlık sipariş yönlendirmesi
// - Mock-first: tabanlık donanımı yoksa deterministik 3 dk test simülasyonu
// ============================================================================

export interface OrthopedicReport {
  athleteId: string;
  date: string;
  archIndex: number;          // naviküler düşme (mm) — >8mm düz tabanlık eğilimi
  flatFootTendency: boolean;
  archCollapseMm: number;     // kavis çökme (dinamik)
  spineBalancePct: number;    // omurga yük dengesi (100 = mükemmel simetri)
  pronationStatic: number;    // statik basış açısı
  pronationDynamic: number;   // dinamik basış açısı
  pressurePeakkPa: number;
  advice: string;
  recommended: 'DESTEK_TABANLIK' | 'DÜZ_TABANLIK' | 'SPOR_TABANLIK';
  marketLink: string;
}

const ARCH_COLLAPSE_LIMIT_MM = 8;

// ---------------------------------------------------------------------------
// 1. 3 Dakikalık Yürüyüş/Koşu Testi — statik + dinamik analiz
// ---------------------------------------------------------------------------
export function runOrthopedicTest(athleteId: string, seed = 0): OrthopedicReport {
  const archCollapseMm = Number((3.2 + ((seed + 4) % 8) * 0.9).toFixed(1));       // 3-10mm
  const flatFootTendency = archCollapseMm > ARCH_COLLAPSE_LIMIT_MM;
  const spineBalancePct = Math.round(86 + ((seed + 2) % 12));                     // 86-97
  const pronationStatic = Number((2.1 + ((seed + 1) % 6) * 0.8).toFixed(1));      // ~2-6°
  const pronationDynamic = Number((pronationStatic + 1.8 + (seed % 3) * 0.7).toFixed(1));
  const pressurePeak = Math.round(240 + (seed % 9) * 14);

  const flatTxt = flatFootTendency
    ? `⚠️ Kavis çökmesi ${archCollapseMm}mm (>8mm) — düz tabanlık eğilimi tespit edildi`
    : `✅ Kavis çökmesi ${archCollapseMm}mm — normal aralıkta`;
  const advice = `${flatTxt}. Dinamik basış ${pronationDynamic}° (${pronationDynamic > 5 ? 'içe basma eğilimi' : 'nötr'}). Omurga yük dengesi %${spineBalancePct}.`;
  const recommended = flatFootTendency ? 'DÜZ_TABANLIK' : pronationDynamic > 5 ? 'DESTEK_TABANLIK' : 'SPOR_TABANLIK';

  return {
    athleteId,
    date: new Date().toISOString().slice(0, 10),
    archIndex: Number(archCollapseMm.toFixed(1)),
    flatFootTendency,
    archCollapseMm,
    spineBalancePct,
    pronationStatic,
    pronationDynamic,
    pressurePeakkPa: pressurePeak,
    advice,
    recommended,
    marketLink: `https://likya-market.vercel.app/ortopedik?tip=${recommended}&sporcu=${athleteId}`,
  };
}

// ---------------------------------------------------------------------------
// 2. Likya Market Özel Tabanlık Yönlendirmesi
// ---------------------------------------------------------------------------
export function orthopedicPrescription(report: OrthopedicReport): string {
  const names = { DÜZ_TABANLIK: 'Düz Taban Destekli Ortopedik Tabanlık (₺420)', DESTEK_TABANLIK: 'Medial Destekli Ortopedik Tabanlık (₺390)', SPOR_TABANLIK: 'Pro Sporcu Tabanlık (₺340)' };
  return `🛒 ${names[report.recommended]} önerildi → ${report.marketLink}`;
}

export function orthopedicGaitStatus(): string {
  return 'Ortopedi: 3 dk yürüyüş/koşu testi • kavis çökmesi • omurga dengesi • tabanlık reçetesi';
}
