// ============================================================================
// 🕵️ YETENEK SCOUT RAPORU & PDF ÜRETİCİ (Adım 77)
// Değerlendirme: Speed Grade (20-80), Reaktif Güç, Vuruş Mekaniği, Dayanıklılık,
// Mental Yorgunluk Direnci — profesyonel benchmarklara karşı radar profili.
// Tek tık print/PDF düzeni (kulüp markalı) + gizli scout notları.
// Deterministik; sıfır bağımlılık.
// ============================================================================

export interface ScoutMetrics {
  speedKmh: number;          // tepe hız
  reactivePower: number;     // RSI
  strikeMechanics: number;   // 0-100
  staminaIndex: number;      // 0-100
  mentalResilience: number;  // 0-100
}

export interface ScoutBenchmark {
  label: string;
  unit: string;
  pro: number;      // profesyonel referans değeri
  pctOfPro: number; // ham değerin pro yüzdesi → grade
}

export const SCOUT_BENCHMARKS: Record<keyof ScoutMetrics, ScoutBenchmark> = {
  speedKmh: { label: 'Hız', unit: 'km/h', pro: 30, pctOfPro: 100 },
  reactivePower: { label: 'Reaktif Güç', unit: 'RSI', pro: 2.5, pctOfPro: 100 },
  strikeMechanics: { label: 'Vuruş Mekaniği', unit: '%', pro: 90, pctOfPro: 100 },
  staminaIndex: { label: 'Dayanıklılık', unit: '%', pro: 85, pctOfPro: 100 },
  mentalResilience: { label: 'Mental Direnç', unit: '%', pro: 80, pctOfPro: 100 },
};

/** Ham değeri 20-80 scout skalasına dönüştürür (pro değeri → 80). */
export function scoutGrade(metric: keyof ScoutMetrics, value: number): number {
  const bench = SCOUT_BENCHMARKS[metric];
  const pct = bench.pro > 0 ? Math.min(1.5, value / bench.pro) : 0;
  return Math.max(20, Math.min(80, Math.round(20 + pct * 60)));
}

export interface ScoutGradeResult {
  metric: keyof ScoutMetrics;
  label: string;
  value: number;
  unit: string;
  grade: number; // 20-80
  tier: 'E' | 'D' | 'C' | 'B' | 'A';
}

export function tierForGrade(grade: number): 'E' | 'D' | 'C' | 'B' | 'A' {
  if (grade >= 75) return 'A';
  if (grade >= 65) return 'B';
  if (grade >= 50) return 'C';
  if (grade >= 35) return 'D';
  return 'E';
}

export function gradeAll(metrics: ScoutMetrics): ScoutGradeResult[] {
  return (Object.keys(metrics) as (keyof ScoutMetrics)[]).map((m) => {
    const grade = scoutGrade(m, metrics[m]);
    return { metric: m, label: SCOUT_BENCHMARKS[m].label, value: metrics[m], unit: SCOUT_BENCHMARKS[m].unit, grade, tier: tierForGrade(grade) };
  });
}

export interface ScoutReport {
  athleteName: string;
  club: string;
  date: string;
  grades: ScoutGradeResult[];
  overall: number;
  radar: Array<{ metric: string; grade: number; pro: number }>;
  risk: 'dusuk' | 'orta' | 'yuksek';
  summary: string;
  confidentialNotes: string;
}

/** Scout raporu derler: genel skor, radar profili, risk, özet + gizli notlar. */
export function buildScoutReport(input: { athleteName: string; club?: string; metrics: ScoutMetrics; notes?: string; date?: string }): ScoutReport {
  const grades = gradeAll(input.metrics);
  const overall = Math.round(grades.reduce((a, g) => a + g.grade, 0) / grades.length);
  const radar = grades.map((g) => ({ metric: g.label, grade: g.grade, pro: 80 }));
  const risk = overall >= 70 ? 'dusuk' : overall >= 55 ? 'orta' : 'yuksek';
  const top = [...grades].sort((a, b) => b.grade - a.grade)[0];
  const bottom = [...grades].sort((a, b) => a.grade - b.grade)[0];
  const summary = `${input.athleteName}: genel ${overall}/80 (${tierForGrade(overall)}). Güçlü alan: ${top.label} (${top.grade}). Gelişim alanı: ${bottom.label} (${bottom.grade}).`;
  return {
    athleteName: input.athleteName,
    club: input.club ?? 'Likya Akademi',
    date: input.date ?? new Date().toISOString().slice(0, 10),
    grades,
    overall,
    radar,
    risk,
    summary,
    confidentialNotes: input.notes ?? 'Gizli — yalnızca scout/teknik direktör görüntüleyebilir.',
  };
}

/** Print/PDF düzeni yapısı (bölümler + başlık + gizli notlar). */
export function reportPdfStructure(report: ScoutReport): { title: string; sections: Array<{ heading: string; rows: Array<[string, string]> }>; footer: string } {
  return {
    title: `${report.club} · Scout Raporu — ${report.athleteName}`,
    sections: [
      { heading: 'Değerlendirme (20-80 Skala)', rows: report.grades.map((g) => [g.label, `${g.grade} (${g.tier})`]) },
      { heading: 'Özet', rows: [['Genel Skor', `${report.overall}/80`], ['Risk', report.risk], ['Değerlendirme', report.summary]] },
      { heading: 'Gizli Scout Notları', rows: [['Not', report.confidentialNotes]] },
    ],
    footer: `Likya Scout AI · ${report.date}`,
  };
}

/** Markdown tabanlı yazdırılabilir rapor. */
export function reportMarkdown(report: ScoutReport): string {
  const gradeRows = report.grades.map((g) => `| ${g.label} | ${g.value} ${g.unit} | ${g.grade}/80 | ${g.tier} |`).join('\n');
  return `# 🕵️ Scout Raporu — ${report.athleteName}\n\n**Kulüp:** ${report.club} · **Tarih:** ${report.date} · **Risk:** ${report.risk}\n\n| Metrik | Değer | Skor | Tier |\n|---|---|---|---|\n${gradeRows}\n\n**Genel: ${report.overall}/80**\n\n> ${report.summary}\n\n## 🔒 Gizli Notlar\n${report.confidentialNotes}`;
}

export function scoutReportStatus(): string {
  return 'Scout Raporu: 20-80 skala • radar profil • PDF/print düzeni • gizli notlar';
}
