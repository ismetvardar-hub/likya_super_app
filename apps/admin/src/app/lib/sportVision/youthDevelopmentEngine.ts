// ============================================================================
// 🧬 LİKYA SPORT VISION — GELİŞİM LİGİ & BİYOMETRİK BÜYÜME MOTORU
// (Youth Athlete Maturation & Anthropometry)
//
// Bilimsel temel:
//  • Mirwald et al. (2002) — Maturity Offset (Peak Height Velocity tahmini)
//  • Tanner Mid-Parental Yöntemi — yetişkin boy tahmini (Khamis-Roche tarzı)
//  • Ape Index — kulaç/boy oranı (mekanik erişim avantajı)
//
// ⚠️ NOT: Bu modül eğitim/performans amaçlıdır; tıbbi tanı ve tedavi önerisi DEĞİLDİR.
//     Kesin kemik yaşı için röntgen (TW3/Greulich-Pyle) gerekir.
// ============================================================================

export type Gender = 'erkek' | 'kiz';

export interface YouthAthlete {
  ad: string;
  dogumTarihi: string;     // ISO
  gender: Gender;
  boy: number;             // cm
  kilo: number;            // kg
  kolUzunlugu: number;     // kulaç / arm span (cm)
  bacakBoyu: number;       // leg length (cm)
  oturmaYuksekligi: number;// sitting height (cm)
  ayakNumarasi: number;    // TR numara
  anneBoyu: number;        // cm
  babaBoyu: number;        // cm
}

// Kronolojik yaş (yıl olarak, ondalıklı)
export function ageYears(dogumTarihi: string): number {
  const birth = new Date(dogumTarihi);
  const now = new Date();
  return (now.getTime() - birth.getTime()) / (365.25 * 24 * 3600 * 1000);
}

// ----------------------------------------------------------------------------
// 📏 Ape Index — kulaç / boy oranı (1.0 = nötr, >1.0 pozitif avantaj)
// ----------------------------------------------------------------------------
export function calculateApeIndex(armSpan: number, height: number): number {
  if (height <= 0) return 0;
  return Math.round((armSpan / height) * 100) / 100;
}

export function apeAdvantage(apeIndex: number): string {
  if (apeIndex > 1.03) return '🟢 Yüksek erişim avantajı — yüzme/tenis/padel/basketbolda kaldıraç üstünlüğü';
  if (apeIndex >= 0.98) return '🟡 Nötr oran — normal erişim profili';
  return '🔵 Kısa kulaç — yakın mesafe ve düşük merkezli sporlarda avantaj';
}

// ----------------------------------------------------------------------------
// 📏 Tanner Mid-Parental Yetişkin Boy Tahmini (cm) — Khamis-Roche yaklaşımı
// Erkek: (Baba + Anne + 13) / 2   •   Kız: (Baba + Anne − 13) / 2
// ----------------------------------------------------------------------------
export function calculatePredictedAdultHeight(gender: Gender, anneBoyu: number, babaBoyu: number): number {
  if (gender === 'erkek') return Math.round((babaBoyu + anneBoyu + 13) / 2);
  return Math.round((babaBoyu + anneBoyu - 13) / 2);
}

// Khamis-Roche adıyla (kullanıcı istediği için) — mevcut boy/kilo ile hassaslaştırılmış sürüm
export function calculateKhamisRochePredictedHeight(a: YouthAthlete): number {
  const midParental = calculatePredictedAdultHeight(a.gender, a.anneBoyu, a.babaBoyu);
  // Mevcut boydaki sapmanın %20'si hedefe yansıtılır (büyüme eğrisi çekmesi)
  const drift = (a.boy - midParental) * 0.2;
  return Math.round(midParental + drift);
}

// ----------------------------------------------------------------------------
// 📈 MIRWALD MATURITY OFFSET (2002) — PHV'ye yıllar (negatif = PHV öncesi)
// ----------------------------------------------------------------------------
export function calculateMirwaldOffset(a: YouthAthlete): number {
  const age = ageYears(a.dogumTarihi);
  const LL = a.bacakBoyu;   // cm
  const SH = a.oturmaYuksekligi; // cm
  const W = a.kilo;         // kg
  const H = a.boy;          // cm
  const WH = (W / H) * 100;

  if (a.gender === 'erkek') {
    return (
      -9.236 +
      0.0002708 * LL * SH -
      0.001663 * age * LL +
      0.007216 * age * SH +
      0.02292 * WH
    );
  }
  return (
    -9.376 +
    0.0001882 * LL * SH +
    0.0022 * age * LL +
    0.005841 * age * SH -
    0.002658 * age * W +
    0.07693 * WH
  );
}

export type GrowthPhase = 'PHV_ONESI' | 'PHV_HIZLI' | 'PHV_SONRASI' | 'OLGUN';

export function determineGrowthPhase(offset: number): { phase: GrowthPhase; label: string; risk: 'DUSUK' | 'ORTA' | 'YUKSEK'; desc: string } {
  if (offset < -0.5) return { phase: 'PHV_ONESI', label: '📉 Büyüme Öncesi (Denge)', risk: 'DUSUK', desc: 'Sporcu büyüme atağına hazırlanıyor; temel hareket becerileri dönemi.' };
  if (offset < 0.5) return { phase: 'PHV_HIZLI', label: '🚀 HIZLI BÜYÜME (PHV)', risk: 'YUKSEK', desc: 'En hızlı uzama evresi — sakatlık riski yüksek, yük yönetimi kritik.' };
  if (offset < 2) return { phase: 'PHV_SONRASI', label: '📈 Büyüme Sonrası (Olgunlaşma)', risk: 'ORTA', desc: 'Uzama yavaşladı; kuvvet/kondisyon kazancı dönemi.' };
  return { phase: 'OLGUN', label: '🏆 Olgun Sporcu', risk: 'DUSUK', desc: 'Büyüme tamamlandı; yetişkin antrenman yüklerine geçiş.' };
}

// ----------------------------------------------------------------------------
// 🥗 GENÇ SPORCU BESLENME & BÜYÜME REÇETESİ
// Büyüme payı (growth allowance) + antrenman harcaması toplamı hesaplanır.
// ----------------------------------------------------------------------------
export interface NutritionPlan {
  phase: GrowthPhase;
  dailyCalories: number;
  proteinG: number;     // g/gün
  calciumMg: number;    // mg/gün (kemik kalkanı)
  waterMl: number;      // ml/gün (boy-kilo oranına göre)
  electrolytesG: number;// g (maç öncesi/sonrası)
  note: string;
}

export function calculateNutritionPlan(a: YouthAthlete, phase: GrowthPhase, trainingMinutesPerWeek = 300): NutritionPlan {
  const age = ageYears(a.dogumTarihi);

  // 1) Temel metabolizma (Mifflin-St Jeor benzeri basitleştirme)
  const basal = a.gender === 'erkek'
    ? 10 * a.kilo + 6.25 * a.boy - 5 * age + 5
    : 10 * a.kilo + 6.25 * a.boy - 5 * age - 161;

  // 2) Antrenman harcaması (MET 6 × kg × saat)
  const trainingKcal = Math.round(6 * a.kilo * (trainingMinutesPerWeek / 60));

  // 3) BÜYÜME PAYI (growth allowance) — PHV evresinde en yüksek
  const growthFactor = phase === 'PHV_HIZLI' ? 1.15 : phase === 'PHV_ONESI' ? 1.08 : phase === 'PHV_SONRASI' ? 1.05 : 1.0;
  const growthKcal = Math.round(basal * (growthFactor - 1));

  const dailyCalories = Math.round((basal + trainingKcal / 7 + growthKcal) / 10) * 10;

  // 4) Protein — büyüme evresinde vücut ağırlığına göre yüksek
  const proteinG = Math.round(a.kilo * (phase === 'PHV_HIZLI' ? 1.9 : 1.6));

  // 5) Kalsiyum — PHV dönemi kemik kalkanı (1000-1300 mg)
  const calciumMg = phase === 'PHV_HIZLI' ? 1300 : phase === 'PHV_ONESI' ? 1200 : 1000;

  // 6) Hidrasyon — 35-45 ml/kg (büyüme evresinde artırılır)
  const waterMl = Math.round(a.kilo * (phase === 'PHV_HIZLI' ? 45 : 40) * 10) / 10;

  // 7) Elektrolit — çocuklarda terleme farklı; 0.4-0.6 g tuz eşdeğeri
  const electrolytesG = Math.round(a.kilo * 0.008 * 10) / 10;

  const note =
    phase === 'PHV_HIZLI'
      ? '🚀 Hızlı büyüme dönemi: kalsiyum-D3-magnezyum-kolajen odaklı mikro beslenme + yeterli uyku şart.'
      : '🧬 Büyüme dengesi: kalori/enerji kısıtlaması YASAK — RED-S riski kalkandır.';

  return { phase, dailyCalories, proteinG, calciumMg, waterMl, electrolytesG, note };
}

// ----------------------------------------------------------------------------
// 💬 3 TARAFLI PEDAGOJİK BİLDİRİM MOTORU (Sporcu • Veli • Antrenör)
// ----------------------------------------------------------------------------
export interface ThreeWayReport {
  athlete: string;   // motive edici
  parent: string;    // beslenme/uyku/büyüme ağrısı rehberi
  coach: string;     // yük azaltma/artırma (overtraining kalkanı)
}

export function buildThreeWayReport(a: YouthAthlete, offset: number, apeIndex: number, growthLastMonthCm: number): ThreeWayReport {
  const phase = determineGrowthPhase(offset);
  const ape = apeIndex.toFixed(2);

  // 👦 SPORCU
  let athlete: string;
  if (phase.phase === 'PHV_HIZLI') {
    athlete = `${a.ad}, bu ay ${growthLastMonthCm.toFixed(1)} cm uzadın — vücudun yeni boyuna alışıyor! Kulaç oranın ${ape}: topa artık daha yukarıdan vurabilirsin. Harika gidiyorsun! 🚀`;
  } else if (growthLastMonthCm > 1.2) {
    athlete = `${a.ad}, kulaç boyun ${growthLastMonthCm.toFixed(1)} cm uzadı, servislerinde topa daha yukarıdan vuruyorsun. Devam! 💪`;
  } else {
    athlete = `${a.ad}, bugün antrenmanda gösterdiğin odak mükemmeldi. Küçük adımlar büyük şampiyonluklar kurar — çalışmaya devam! 🎯`;
  }

  // 👨‍👩‍👦 VELİ
  let parent: string;
  if (phase.phase === 'PHV_HIZLI') {
    parent = `${a.ad} büyüme atağında (PHV). ${growthLastMonthCm.toFixed(1)} cm uzadı; diz/kas ağrıları normal olabilir. Bu hafta kalsiyum menüsü uygulayın (süt, yoğurt, badem), gece uykusunu en az 9 saate çıkarın. Uzama sırasında ayakkabı/tabanlık baskısını kontrol edin.`;
  } else if (offset < 0.5 && offset > -0.5) {
    parent = `${a.ad} büyüme eşiğinde; beslenme ve uyku düzeni kritik. Boy ${a.boy} cm, tahmini yetişkin boyu: ${calculateKhamisRochePredictedHeight(a)} cm.`;
  } else {
    parent = `${a.ad} gelişimi sağlıklı seyrediyor. Haftalık büyüme: ${growthLastMonthCm.toFixed(1)} cm. Dengeli beslenme + düzenli uyku yeterli.`;
  }

  // 📋 ANTRENÖR
  let coach: string;
  if (phase.phase === 'PHV_HIZLI') {
    coach = `${a.ad} PHV büyüme atağında — sakatlık riski YÜKSEK. Plyometrik sıçrama yükünü %30 azaltın, eklem ağrısı sinyallerini günlük izleyin, teknik antrenmana ağırlık verin. Şiddetli (stres) antrenman yapmayın.`;
  } else if (phase.phase === 'PHV_SONRASI') {
    coach = `${a.ad} büyüme sonrası dönemde — kuvvet ve kondisyon kazancı için uygun pencere. Yükü kademeli %5/hafta artırın.`;
  } else {
    coach = `${a.ad} dengeli gelişim döneminde. Temel motor beceriler + oyun temelli antrenman en verimli yaklaşım. Yük artışı: haftalık %5.`;
  }

  return { athlete, parent, coach };
}

