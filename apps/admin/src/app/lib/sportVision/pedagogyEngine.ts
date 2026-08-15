// ============================================================================
// 🧒 LİKYA 360° HOLİSTİK ÇOCUK GELİŞİMİ — PEDİATRİK BİYOPSİKOSOSYAL TAKİP
// Çift Taraflı Pedagoji Anketi • Medikal OCR Kasası • Akademik Yük
// • Tesis İçi Sosyal & Tribün Analizi • Pozitif Ebeveynlik Karnesi
// ============================================================================

// ----------------------------------------------------------------------------
// 📋 ÇİFT TARAFLI PEDAGOJİ ANKETİ (Anne & Baba, Yılda 4 Çeyrek Q1-Q4)
// ----------------------------------------------------------------------------
export type PedagogyMetric = 'ozguven' | 'akran' | 'motivasyon' | 'yenilgi' | 'uyku';

export const METRIC_LABELS: Record<PedagogyMetric, string> = {
  ozguven: 'Özgüven',
  akran: 'Akran İletişimi',
  motivasyon: 'Motivasyon',
  yenilgi: 'Yenilgiye Tepki',
  uyku: 'Uyku & İştah',
};

export type ParentType = 'anne' | 'baba';

export interface QuarterlyScores {
  ozguven: number;   // 1-5
  akran: number;
  motivasyon: number;
  yenilgi: number;
  uyku: number;
}

export interface ParentSurvey {
  parent: ParentType;
  q1: QuarterlyScores;
  q2: QuarterlyScores;
  q3: QuarterlyScores;
  q4: QuarterlyScores;
}

export interface ChildPedagogyProfile {
  name: string;
  surveys: ParentSurvey[];
}

// Çeyrekler arası değişim (delta)
export function calculateDelta(prev: QuarterlyScores, next: QuarterlyScores): QuarterlyScores {
  return {
    ozguven: next.ozguven - prev.ozguven,
    akran: next.akran - prev.akran,
    motivasyon: next.motivasyon - prev.motivasyon,
    yenilgi: next.yenilgi - prev.yenilgi,
    uyku: next.uyku - prev.uyku,
  };
}

// Bir ebeveynin yıllık ortalama skoru (Q1→Q4 büyüme)
export function annualGrowth(q1: QuarterlyScores, q4: QuarterlyScores): QuarterlyScores {
  return calculateDelta(q1, q4);
}

export function averageScore(q: QuarterlyScores): number {
  return (q.ozguven + q.akran + q.motivasyon + q.yenilgi + q.uyku) / 5;
}

// ----------------------------------------------------------------------------
// 🩺 MEDİKAL & BİYOKİMYASAL VAULT (Tahlil değerleri + otomatik çıkarım)
// ----------------------------------------------------------------------------
export interface LabValues {
  ferritin: number;    // ng/mL (referans 30-300)
  vitaminD: number;    // ng/mL (referans 20-50)
  b12: number;         // pg/mL (referans 200-900)
  calcium: number;     // mg/dL (8.5-10.5)
  magnesium: number;   // mg/dL (1.7-2.2)
}

export interface LabWarning {
  param: string;
  value: number;
  ref: string;
  level: 'DUSUK' | 'NORMAL' | 'YUKSEK';
  advice: string;
}

// Deterministik tahlil yorumu — antrenman yoğunluğu + beslenme motoruna bağlar
export function interpretLab(vals: LabValues): { warnings: LabWarning[]; nutritionNotes: string[]; trainingAdvisory: string } {
  const warnings: LabWarning[] = [];
  const nutritionNotes: string[] = [];

  const check = (param: string, value: number, ref: string, low: number, high: number, lowAdvice: string, highAdvice: string) => {
    if (value < low) {
      warnings.push({ param, value, ref, level: 'DUSUK', advice: lowAdvice });
    } else if (value > high) {
      warnings.push({ param, value, ref, level: 'YUKSEK', advice: highAdvice });
    } else {
      warnings.push({ param, value, ref, level: 'NORMAL', advice: 'Değer referans aralığında.' });
    }
  };

  check('Ferritin (Demir)', vals.ferritin, '30-300 ng/mL', 30, 300,
    'Demir deposu düşük — dayanıklılık ve konsantrasyon düşebilir. Daze Chef: kırmızı et, mercimek, ıspanak, C vitamini ile emilim artırın.',
    'Ferritin yüksek — inflamasyon işareti olabilir; doktor kontrolü önerilir.');
  if (vals.ferritin < 30) nutritionNotes.push('🥩 Demir zengini menü (kırmızı et + C vitamini)');

  check('D Vitamini', vals.vitaminD, '20-50 ng/mL', 20, 50,
    'D vitamini düşük — kemik büyümesi ve kas fonksiyonu risk altında. Güneş + takviye + somon/süt önerilir.',
    'D vitamini yüksek — toksisite riski, doktora danışın.');
  if (vals.vitaminD < 20) nutritionNotes.push('☀️ D vitamini takviyesi + somon & süt');

  check('B12', vals.b12, '200-900 pg/mL', 200, 900,
    'B12 düşük — yorgunluk ve sinir sistemi etkilenir. Yumurta, süt, kırmızı et önerilir.',
    'B12 yüksek — genellikle zararsız, takviye dozunu gözden geçirin.');
  if (vals.b12 < 200) nutritionNotes.push('🥚 B12 kaynakları (yumurta, süt, kırmızı et)');

  check('Kalsiyum', vals.calcium, '8.5-10.5 mg/dL', 8.5, 10.5,
    'Kalsiyum düşük — büyüme plakası ve kemik sağlığı riski. Süt, yoğurt, badem önerilir.',
    'Kalsiyum yüksek — böbrek/paratiroid kontrolü önerilir.');
  if (vals.calcium < 8.5) nutritionNotes.push('🥛 Kalsiyum zengini (süt, yoğurt, badem)');

  check('Magnezyum', vals.magnesium, '1.7-2.2 mg/dL', 1.7, 2.2,
    'Magnezyum düşük — kramp ve uyku sorunları. Kaju, badem, ıspanak, bitter çikolata önerilir.',
    'Magnezyum yüksek — böbrek kontrolü önerilir.');
  if (vals.magnesium < 1.7) nutritionNotes.push('🌰 Magnezyum (kaju, badem, ıspanak)');

  const lowCount = warnings.filter((w) => w.level === 'DUSUK').length;
  const trainingAdvisory =
    lowCount >= 2
      ? `⚠️ ${lowCount} parametre düşük — antrenman şiddetini %30 azaltın, tekniğe ve oyuna ağırlık verin (zihinsel deşarj).`
      : lowCount === 1
        ? '⚠️ 1 parametre düşük — antrenman yükünü hafiflet, beslenme düzeltmesi sonrası tekrar ölçüm.'
        : '✅ Tahlil değerleri normal — antrenman planına devam.';

  return { warnings, nutritionNotes, trainingAdvisory };
}

// ----------------------------------------------------------------------------
// 👁️ TESİS İÇİ SOSYAL & TRİBÜN ANALİZİ
// ----------------------------------------------------------------------------
export interface SocialObservation {
  sosyallik: number;  // 0-100 arkadaşlarıyla etkileşim
  liderlik: number;   // 0-100 liderlik davranışı
  izolasyon: number;  // 0-100 yalnız kalma eğilimi
}

export interface StandObservation {
  tutum: 'destekleyici' | 'baskici' | 'ilgisiz';
  not: string;
}

// Sosyal gelişim indeksi (izolasyon düşük iyi)
export function socialDevelopmentIndex(o: SocialObservation): number {
  return Math.max(0, Math.min(100, Math.round(o.sosyallik * 0.5 + o.liderlik * 0.35 + (100 - o.izolasyon) * 0.15)));
}

// Tribün davranışından ebeveyne pozitif rehberlik
export function standGuidance(s: StandObservation): string {
  if (s.tutum === 'destekleyici') return '👏 Tribün tutumu mükemmel — yapıcı alkış sporcunun karar özgüvenini artırıyor. Devam edin!';
  if (s.tutum === 'baskici') return '📢 Tribünden taktik vermek yerine sadece çabasını alkışlamak, sporcunun karar verme özgüvenini ~%28 artıracaktır. Müdahaleyi azaltın.';
  return '🪑 İlgisiz tutum fark edildi — maç sonrası 5 dakikalık "nasıl geçti?" sohbeti bile aidiyeti belirgin güçlendirir.';
}

// ----------------------------------------------------------------------------
// 📊 360° GELİŞİM İNDEKSİ (Zihinsel + Fiziksel + Sosyal)
// ----------------------------------------------------------------------------
export function developmentIndex(mental: number, physical: number, social: number): number {
  return Math.round(mental * 0.4 + physical * 0.35 + social * 0.25);
}

// ----------------------------------------------------------------------------
// 🏅 POZİTİF DESTEKLEYİCİ EBEVEYNLİK KARNESİ + PEDAGOJİK VELİ REHBERİ
// ----------------------------------------------------------------------------
export function buildParentReportCard(profile: ChildPedagogyProfile, social: SocialObservation, stand: StandObservation): string {
  const lines: string[] = [];
  lines.push(`👨‍👩‍👧‍👦 POZİTİF DESTEKLEYİCİ EBEVEYNLİK KARNESİ — ${profile.name}`);
  lines.push('━━━━━━━━━━━━━━━━━━━━━');

  for (const survey of profile.surveys) {
    const mom = survey.parent === 'anne';
    const g = annualGrowth(survey.q1, survey.q4);
    lines.push(`\n${mom ? '👩 Anne' : '👨 Baba'} perspektifi (Q1→Q4):`);
    (Object.keys(METRIC_LABELS) as PedagogyMetric[]).forEach((m) => {
      const d = g[m];
      lines.push(`  • ${METRIC_LABELS[m]}: ${d > 0 ? `▲ +${d}` : d < 0 ? `▼ ${d}` : '= 0'}`);
    });
  }

  lines.push(`\n🧑‍🤝‍🧑 Tesis içi sosyal gelişim indeksi: %${socialDevelopmentIndex(social)}`);
  lines.push(`🎪 ${standGuidance(stand)}`);
  return lines.join('\n');
}

export function buildNutritionLabReport(lab: LabValues): string {
  const { warnings, nutritionNotes, trainingAdvisory } = interpretLab(lab);
  const lines = ['🩺 BESLENME & TAHLİL UYARI RAPORU', '━━━━━━━━━━━━━━━━━━'];
  warnings.forEach((w) => {
    const icon = w.level === 'DUSUK' ? '🔻' : w.level === 'YUKSEK' ? '🔺' : '✅';
    lines.push(`${icon} ${w.param}: ${w.value} (ref: ${w.ref}) — ${w.advice}`);
  });
  if (nutritionNotes.length) lines.push(`\n🍽️ Daze Chef menüsü: ${nutritionNotes.join(' • ')}`);
  lines.push(`\n🏋️ Antrenör tavsiyesi: ${trainingAdvisory}`);
  return lines.join('\n');
}

