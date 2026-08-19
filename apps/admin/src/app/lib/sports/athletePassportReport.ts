// ============================================================================
// 📄 AŞAMA 15 — SPORCU PERFORMANS PASAPORTU & PDF GELİŞİM RAPORU
// U8-U16 gelişim grafiği, sprint süreleri ve şut yüzdesini veli/antrenör için
// tek sayfalık rapora dönüştürür (metin tablosu + grafik verisi → PDF bağlanır).
// Deterministik; Plan Z güvenli.
// ============================================================================

export interface SprintRecord { date: string; distanceM: number; seconds: number; }
export interface ShootingRecord { date: string; attempts: number; makes: number; }

export interface AthletePassport {
  athlete: string;
  ageGroup: string;                 // U8..U16
  verticalJumpCm: number[];         // aylık dikey sıçrama
  sprints: SprintRecord[];
  shooting: ShootingRecord[];
  monthlyScore: number[];           // genel gelişim skoru 0-100
}

export interface PassportReport {
  athlete: string;
  ageGroup: string;
  bestSprint60m: number | null;
  avgShotPct: number;
  verticalTrend: number;            // son ay değişim (cm)
  overallScore: number;
  lines: string[];                  // tek sayfa PDF içeriği
  svgSparkline: string;             // satır içi SVG grafiği
}

export function buildAthletePassport(p: AthletePassport): PassportReport {
  const bestSprint60m = p.sprints.filter((s) => s.distanceM === 60).reduce<number | null>((min, s) => min === null || s.seconds < min ? s.seconds : min, null);
  const totalAttempts = p.shooting.reduce((a, s) => a + s.attempts, 0);
  const totalMakes = p.shooting.reduce((a, s) => a + s.makes, 0);
  const avgShotPct = totalAttempts > 0 ? Math.round((totalMakes / totalAttempts) * 100) : 0;
  const verticalTrend = p.verticalJumpCm.length >= 2 ? Math.round((p.verticalJumpCm[p.verticalJumpCm.length - 1] - p.verticalJumpCm[p.verticalJumpCm.length - 2]) * 10) / 10 : 0;
  const overallScore = Math.round((avgShotPct * 0.4 + (p.verticalJumpCm[p.verticalJumpCm.length - 1] ?? 20) * 1.6) * 10) / 10;

  const svgSparkline = renderSparkline(p.monthlyScore);

  const lines = [
    `SPORTVISIONX — SPORCU PERFORMANS PASAPORTU`,
    `Sporcu: ${p.athlete} | Yaş Grubu: ${p.ageGroup}`,
    `En iyi 60m sprint: ${bestSprint60m !== null ? bestSprint60m.toFixed(2) + ' sn' : 'kayıt yok'}`,
    `Şut isabeti: %${avgShotPct} (${totalMakes}/${totalAttempts})`,
    `Dikey sıçrama: ${p.verticalJumpCm[p.verticalJumpCm.length - 1] ?? '—'} cm (son değişim ${verticalTrend >= 0 ? '+' : ''}${verticalTrend} cm)`,
    `Genel gelişim skoru: ${overallScore}/100`,
    `Grafik: ${svgSparkline}`,
    `PDF üretimi: tarayıcı print / sunucu PDF lib bağlanır.`,
  ];

  return { athlete: p.athlete, ageGroup: p.ageGroup, bestSprint60m, avgShotPct, verticalTrend, overallScore, lines, svgSparkline };
}

function renderSparkline(values: number[]): string {
  if (values.length < 2) return 'yetersiz veri';
  const w = 120, h = 40;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="#00f2fe" stroke-width="2"/></svg>`;
}

export function athletePassportReportStatus(): string {
  return 'Sporcu Pasaportu [sprint • şut % • dikey trend • SVG sparkline → tek sayfa PDF]';
}
