// ============================================================================
// 🩺 DAZE VISION — PEDAGOJİK YAŞAM KOÇU & MENTAL REÇETE MOTORU
// 1) FailureAnxietyPrescription : "Ya yanlış yaparsam?" / yetersizlik → süreç
//    ve emek odaklı teşhis + telafi adımları.
// 2) CrisisManagementProtocol  : 8 adımlı kriz yatıştırma + yapıcı empati dili
//    ("Seni dinliyorum", "Hissettiğin şeyi fark ediyorum") — öğüt vermeden.
// 3) BoundaryAssertivenessGuide: "Hayır" diyemeyen / aşırı uyumlu çocuklar için
//    7 davranış matrisi + güçlendirme reçetesi.
// Deterministik; Plan Z güvenli; asla throw etmez.
// ============================================================================

export type AnxietyPattern = 'fear-of-mistake' | 'inadequacy' | 'self-sufficient';

export interface MentalPrescription {
  id: string;
  pattern: AnxietyPattern;
  diagnosis: string;
  reframe: string;          // yeni bakış açısı (süreç/emek odaklı)
  steps: string[];          // telafi adımları
  affirmation: string;      // günlük onay cümlesi
}

const PRESCRIPTIONS: Record<AnxietyPattern, Omit<MentalPrescription, 'id' | 'pattern'>> = {
  'fear-of-mistake': {
    diagnosis: '"Ya yanlış yaparsam?" — hata korkusu performansı donduruyor; mükemmeliyetçilik gelişimi engelliyor.',
    reframe: 'Hata = geri bildirim. Süreç ve emek öğrenmenin kendisidir; sonuç değil, deneme sayısı gelişimi getirir.',
    steps: [
      'Küçük deneme: bilerek "eksik" bir işi tamamla ve sonucu değerlendir',
      'Hata günlüğü: her denemede "Ne öğrendim?" sorusunu yanıtla',
      'Süreç kutlaması: sonuç değil, bugünkü çabayı öv',
      'Yeniden çerçevele: "yanlış yaptım" yerine "veri topladım" de',
    ],
    affirmation: 'Ben süreçte büyüyorum; her deneme beni güçlendiriyor.',
  },
  inadequacy: {
    diagnosis: 'Yetersizlik hissi — başkalarıyla karşılaştırma, koşulsuz değer duygusunu zayıflatıyor.',
    reframe: 'Değerin koşulsuzdur; ilerleme kutlanır, kişi yargılanmaz.',
    steps: [
      'İlerleme listesi: son 30 günde geliştirdiğin 5 beceriyi yaz',
      'İç ses değişimi: "yetersizim" yerine "şu an öğreniyorum"',
      'Küçük kazanım hedefi: bugün bir şeyi %10 daha iyi yap',
      'Güçlü yanını göster: bir arkadaşına bildiğin bir konuyu öğret',
    ],
    affirmation: 'Ben yeterliyim; gelişim benim doğal hâlim.',
  },
  'self-sufficient': {
    diagnosis: '"Ben kendim hallederim" — yardım istememek; izolasyon ve tıkanma riski.',
    reframe: 'İpuçlu otonomi: kendi kararını ver ama bir kişiden destek iste — güçlülük, yardım isteyebilmektir.',
    steps: [
      'Süre sınırı koy: 10 dk kendin dene, sonra birine sor',
      'İpucu hakkı: yanıtı almak yerine ilk adım için ipucu iste',
      'Otonomi logu: bugün kendi başına çözdüğün şeyi kaydet',
      'Karşılıklılık: başka birine de yardım et — denge kur',
    ],
    affirmation: 'Yardım istemek güçtür; ben yalnız değilim.',
  },
};

export function prescribeMentalReçete(pattern: AnxietyPattern, studentName = 'Sporcu'): MentalPrescription {
  const base = PRESCRIPTIONS[pattern];
  return { id: `PR-${Date.now().toString(36)}-${pattern.slice(0, 3)}`, pattern, ...base };
}

// ── 2) 8 ADIMLI KRİZ YATIŞTIRMA PROTOKOLÜ ───────────────────────────────────
export interface CrisisStep {
  order: number;
  title: string;
  script: string;
}

export const CRISIS_PROTOCOL_8: CrisisStep[] = [
  { order: 1, title: 'Ortamı güvenli kıl', script: 'Önce sessiz ve özel bir alan sağla; göz hizasında dur.' },
  { order: 2, title: 'Dinle (öğüt yok)', script: '"Seni dinliyorum" — kesmeden, yargılamadan dinle.' },
  { order: 3, title: 'Duyguyu yansıt', script: '"Hissettiğin şeyi fark ediyorum: hayal kırıklığı gibi görünüyor."' },
  { order: 4, title: 'İhtiyacı adlandır', script: '"Şu an sana ne iyi gelirdi? Sen karar ver."' },
  { order: 5, title: 'Birlikte planla', script: '"Bununla baş etmek için iki seçenek var: A veya B."' },
  { order: 6, title: 'Küçük adım al', script: '"İlk adım sadece şu: bir dakika nefes, sonra devam ederiz."' },
  { order: 7, title: 'Özür yerine empati', script: '"Bunu yaşamak zor olmalı" — hatayı sahiplen ama suçlama.' },
  { order: 8, title: 'Güveni tazele', script: '"Bu geçecek ve ben buradayım. Birlikte çözeceğiz."' },
];

export function runCrisisProtocol(kind: 'match-stress' | 'home-argument' | 'training-fail'): { steps: CrisisStep[]; opening: string } {
  const openingMap = {
    'match-stress': 'Maç stresi krizinde: "Kazanmak değil, birlikte oynamak önemli."',
    'home-argument': 'Ev içi gerginlikte: "Burada ikimiz de varız; önce nefes, sonra konuşalım."',
    'training-fail': 'Antrenman başarısızlığında: "Bugünün sonucu sen değilsin; antrenmanın başlangıcı."',
  } as const;
  return { steps: CRISIS_PROTOCOL_8, opening: openingMap[kind] };
}

// ── 3) SINIR / HAYIR DIYEMEME GÜÇLENDİRME KILAVUZU ──────────────────────────
export type BoundaryBehavior = 'göz-kaçırma' | 'fazla-öneri-kabulü' | 'yorgun-ama-evet' | 'zayıf-ses' | 'kendini-geri-çekme' | 'aşırı-özür' | 'karşı-güçlüyken-evet';

export interface BoundaryAssessment {
  score: number;              // 0-100 (100 = en güçlü sınır)
  activePatterns: BoundaryBehavior[];
  prescription: string[];
}

const BOUNDARY_MATRIX: Record<BoundaryBehavior, { points: number; advice: string }> = {
  'göz-kaçırma': { points: 5, advice: 'Göz teması pratiği: aynaya bakarak "Hayır" cümlesini 5 kez söyle.' },
  'fazla-öneri-kabulü': { points: 5, advice: '"Bir dakika düşüneyim" cümlesini kalıp hâline getir — her öneriye evet deme.' },
  'yorgun-ama-evet': { points: 5, advice: 'Bedeni dinle: yorgunken hayır demek kendine saygıdır.' },
  'zayıf-ses': { points: 4, advice: 'Ses tonu pratiği: güvenli ve net bir "Hayır" (kararlı ama nazik).' },
  'kendini-geri-çekme': { points: 4, advice: 'Sessiz kalmak yerine "Şimdi buna hazır değilim" de.' },
  'aşırı-özür': { points: 4, advice: '"Üzgünüm" yerine "Hayır, teşekkür ederim" — özür hakkını ayır.' },
  'karşı-güçlüyken-evet': { points: 4, advice: 'Otoriteye de sınır konabilir: saygılı ama net bir duruş.' },
};

export function assessBoundaryAssertiveness(patterns: BoundaryBehavior[]): BoundaryAssessment {
  const penalty = patterns.reduce((acc, p) => acc + (BOUNDARY_MATRIX[p]?.points ?? 0), 0);
  const score = Math.max(0, 100 - penalty);
  const activePatterns = patterns.filter((p) => BOUNDARY_MATRIX[p]);
  return {
    score,
    activePatterns,
    prescription: activePatterns.length > 0
      ? activePatterns.map((p) => BOUNDARY_MATRIX[p].advice)
      : ['Sınırların güçlü — kendini koruyor ve saygıyla ifade ediyorsun.'],
  };
}

export function pedagogicalCoachEngineStatus(): string {
  return 'Pedagojik Koç [3 reçete • 8 adım kriz protokolü • 7 davranış sınır matrisi]';
}

