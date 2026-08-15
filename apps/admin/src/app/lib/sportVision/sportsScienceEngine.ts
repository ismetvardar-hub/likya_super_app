// ============================================================================
// 📚 LİKYA SPORT VISION — SPOR BİLİMLERİ & BESYO KÜTÜPHANESİ
// Tüm hesaplamalar DETERMİNİSTİK matematik formülleridir (LLM yok, halüsinasyon yok).
// Modüller: Biomechanics • Conditioning • InjuryPrevention • CoachPedagogy • Stats
// ============================================================================

// ----------------------------------------------------------------------------
// 📊 KUSURSUZ İSTATİSTİK & HESAPLAMA MOTORU (saf fonksiyonlar)
// ----------------------------------------------------------------------------

// Kalori: MET yöntemi — kcal = MET * kg * saat
export function caloriesBurned(met: number, weightKg: number, minutes: number): number {
  return Math.round(met * weightKg * (minutes / 60) * 10) / 10;
}

// Vuruş / fırlatma hızı (km/s): hız = mesafe / süre
export function strikeSpeed(distanceM: number, timeMs: number): number {
  const seconds = timeMs / 1000;
  if (seconds <= 0) return 0;
  return Math.round((distanceM / seconds) * 3.6 * 10) / 10; // m/s → km/s
}

// Saha kapsama alanı (m²): koşu genişliği x mesafe
export function coverageArea(avgSpeedKmh: number, durationMin: number, laneWidthM: number): number {
  const distanceM = (avgSpeedKmh / 3.6) * durationMin * 60;
  return Math.round(distanceM * laneWidthM);
}

// İsabet oranı (%): isabet / deneme
export function hitRate(hits: number, attempts: number): number {
  if (attempts <= 0) return 0;
  return Math.round((hits / attempts) * 1000) / 10;
}

// Güç / kuvvet çıkışı (Watt): P = F * v
export function powerOutput(forceN: number, velocityMs: number): number {
  return Math.round(forceN * velocityMs);
}

// VO2Max — Cooper testi: VO2max = (d - 504.9) / 44.73
export function vo2maxCooper(distanceMeters: number): number {
  return Math.round(((distanceMeters - 504.9) / 44.73) * 10) / 10;
}

// Laktat eşiği (bpm) — maks HR'nin %85'i
export function lactateThreshold(hrMax: number): number {
  return Math.round(hrMax * 0.85);
}

// HRV değişiminden aşırı yüklenme riski (%0-100)
export function overtrainingRisk(hrvToday: number, hrvBaseline: number, restingHr: number): number {
  const hrvDrop = hrvBaseline > 0 ? Math.max(0, ((hrvBaseline - hrvToday) / hrvBaseline) * 100) : 0;
  const hrRatio = restingHr > 0 ? Math.max(0, (restingHr - 60) / 40) * 100 : 0;
  return Math.round(Math.min(100, hrvDrop * 0.6 + hrRatio * 0.4));
}

// Asimetri (%) — sol/sağ fark
export function asymmetry(left: number, right: number): number {
  const avg = (left + right) / 2;
  if (avg <= 0) return 0;
  return Math.round((Math.abs(left - right) / avg) * 1000) / 10;
}

// Ekleme yükü indeksi (vücut ağırlığının katı): F = m * g * darbeFaktörü
export function jointLoadIndex(weightKg: number, impactFactor: number): number {
  return Math.round(weightKg * 9.81 * impactFactor * 10) / 10; // Newton
}

// Antrenman yükü (TRIMP benzeri): dk * HR oranı
export function trainingLoad(minutes: number, hrAvg: number, hrRest: number, hrMax: number): number {
  const zone = (hrAvg - hrRest) / (hrMax - hrRest);
  if (zone <= 0) return 0;
  return Math.round(minutes * zone * 100);
}

// ----------------------------------------------------------------------------
// 🧬 BİYOMEKANİK & HAREKET ANALİZİ (BiomechanicsAnalysis)
// ----------------------------------------------------------------------------
export interface BiomechanicsInput {
  angleDeg: number;       // vuruş/duruş açısı (°)
  optimalAngle: number;   // ideal açı
  leftStrength: number;   // sol taraf kuvveti (ör. kg)
  rightStrength: number;  // sağ taraf kuvveti
  weightKg: number;       // vücut ağırlığı
  impactFactor: number;   // zemin darbe faktörü (koşu 2.5-3, yürüyüş 1.2)
}

export interface BiomechanicsReport {
  angleEfficiency: number;   // % açı verimi
  balanceScore: number;      // % denge
  asymmetryScore: number;    // % asimetri
  jointLoadN: number;        // eklem yükü (N)
  verdict: string;           // analiz yorumu
}

export function biomechanicsAnalysis(input: BiomechanicsInput): BiomechanicsReport {
  const angleDiff = Math.abs(input.angleDeg - input.optimalAngle);
  const angleEfficiency = Math.max(0, Math.min(100, Math.round(100 - angleDiff * 2.5)));
  const asymmetryScore = asymmetry(input.leftStrength, input.rightStrength);
  const balanceScore = Math.max(0, Math.min(100, Math.round(100 - asymmetryScore * 2)));
  const jointLoadN = jointLoadIndex(input.weightKg, input.impactFactor);

  let verdict: string;
  if (asymmetryScore > 15) {
    verdict = '⚠️ Sol/sağ asimetri %' + asymmetryScore.toFixed(1) + ' — sakatlık riski artıyor. Asimetriyi giderici tek taraflı çalışma önerilir.';
  } else if (angleEfficiency < 60) {
    verdict = '📉 Vuruş/duruş açısı idealin dışında (%' + angleEfficiency + ') — teknik düzeltme gerekli.';
  } else if (jointLoadN > input.weightKg * 9.81 * 3) {
    verdict = '🦵 Eklem yükü çok yüksek (' + Math.round(jointLoadN) + 'N) — darbe emici ayakkabı ve güçlendirme önerilir.';
  } else {
    verdict = '✅ Biyomekanik dengesi iyi: açı verimi %' + angleEfficiency + ', denge %' + balanceScore + '.';
  }

  return { angleEfficiency, balanceScore, asymmetryScore, jointLoadN: Math.round(jointLoadN), verdict };
}

// ----------------------------------------------------------------------------
// 🏋️ KONDİSYON & YÜKLENME MOTORU (ConditioningEngine)
// ----------------------------------------------------------------------------
export interface ConditioningInput {
  cooperDistanceM: number;  // 12 dk Cooper testi mesafesi
  minutes: number;
  hrAvg: number;
  hrRest: number;
  hrMax: number;
  weeklySessions: number;   // haftalık antrenman sayısı
}

export interface ConditioningReport {
  vo2max: number;          // mL/kg/dk
  trainingLoadScore: number;
  intensityZone: string;   // hafif / orta / yüksek
  periodization: string;   // haftalık periyodizasyon önerisi
  verdict: string;
}

export function conditioningAnalysis(input: ConditioningInput): ConditioningReport {
  const vo2max = vo2maxCooper(input.cooperDistanceM);
  const trainingLoadScore = trainingLoad(input.minutes, input.hrAvg, input.hrRest, input.hrMax);

  let intensityZone: string;
  if (trainingLoadScore > 450) intensityZone = '🔴 Yüksek — aşırı yüklenme riski';
  else if (trainingLoadScore > 250) intensityZone = '🟡 Orta — gelişim bölgesi';
  else intensityZone = '🟢 Hafif — toparlanma bölgesi';

  let periodization: string;
  if (input.weeklySessions >= 6) {
    periodization = '6+ seans yoğun — 1 tam dinlenme günü + 2 gün düşük şiddet (aktif toparlanma) önerilir.';
  } else if (input.weeklySessions >= 4) {
    periodization = '4-5 seans dengeli — zor-orta-kolay döngüsü ile periyodize et.';
  } else {
    periodization = 'Düşük frekans — hacim artırma dönemi için 1 ek seans ekleyin.';
  }

  const verdict =
    vo2max < 35
      ? '📈 VO2Max düşük (' + vo2max + ') — tempo koşuları ve interval ile geliştirin.'
      : vo2max < 48
        ? '✅ VO2Max orta (' + vo2max + ') — plato aşımı için haftada 1 interval.'
        : '🏆 VO2Max üstün (' + vo2max + ') — korumaya yönelik antrenman yeterli.';

  return { vo2max, trainingLoadScore, intensityZone, periodization, verdict };
}


// ----------------------------------------------------------------------------
// 🛡️ SAKATLIK ÖNLEME & REJENERASYON (InjuryPrevention)
// ----------------------------------------------------------------------------
export interface InjuryInput {
  hrvToday: number;
  hrvBaseline: number;
  restingHr: number;
  asymmetryScore: number;
}

export interface InjuryReport {
  overtrainingRiskPct: number;
  riskLevel: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK';
  regeneration: string;   // dinlenme/esneme önerisi
  verdict: string;
}

export function injuryPreventionAnalysis(input: InjuryInput): InjuryReport {
  const overtrainingRiskPct = overtrainingRisk(input.hrvToday, input.hrvBaseline, input.restingHr);
  const combined = Math.min(100, overtrainingRiskPct + input.asymmetryScore * 0.5);

  const riskLevel = combined > 60 ? 'YÜKSEK' : combined > 30 ? 'ORTA' : 'DÜŞÜK';

  let regeneration: string;
  if (combined > 60) {
    regeneration = '🧊 48s aktif dinlenme + soğuk su terapisi + hedefli esneme (asimetri bölgesi). Rejenerasyon zorunlu.';
  } else if (combined > 30) {
    regeneration = '🛌 1 gün hafif + 10 dk statik esneme + miyofasiyal gevşetme önerilir.';
  } else {
    regeneration = '🌱 Toparlanma iyi — normal antrenman planına devam.';
  }

  return {
    overtrainingRiskPct,
    riskLevel,
    regeneration,
    verdict: riskLevel + ' risk seviyesi — aşırı yüklenme %' + Math.round(combined) + '.',
  };
}

// ----------------------------------------------------------------------------
// 🎓 ANTENÖR PEDAGOJİSİ & KOÇLUK (CoachPedagogy)
// ----------------------------------------------------------------------------
export interface PedagogyInput {
  hitRatePct: number;
  angleEfficiency: number;
  athleteMood: 'motivasyon-düşük' | 'motivasyon-yüksek';
}

export interface PedagogyReport {
  tacticalAdvice: string;
  athleteDevelopment: string;
  nextStep: string;
}

export function coachPedagogy(input: PedagogyInput): PedagogyReport {
  let tacticalAdvice: string;
  if (input.hitRatePct < 50) {
    tacticalAdvice = 'İsabet %' + input.hitRatePct + ' — vuruş öncesi ayak yerleşimini sabitle; raket başını 10 cm daha yüksek tut.';
  } else if (input.angleEfficiency < 60) {
    tacticalAdvice = 'Açı verimi %' + input.angleEfficiency + ' — gövde rotasyonunu 15° artırarak vuruş açısını genişlet.';
  } else {
    tacticalAdvice = 'Teknik temel sağlam — taktik varyasyon (drop-shot + deep) ekleyerek oyun zekasını geliştir.';
  }

  const athleteDevelopment =
    input.athleteMood === 'motivasyon-düşük'
      ? 'Sporcunun motivasyonu düşük: küçük kazanımları ödüllendir, antrenmanı oyunlaştır. Kısa net hedefler belirle.'
      : 'Sporcu motivasyonu yüksek: yeni beceri blokları ile meydan okuma düzeyini kademeli artır.';

  return {
    tacticalAdvice,
    athleteDevelopment,
    nextStep: '🎯 Sonraki adım: 3 tekrarlı hedefli drill + hafta sonu ölçüm yenileme.',
  };
}

