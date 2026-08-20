// ============================================================================
// 🤖 AI TAKTİK DRILL REÇETE MOTORU (Adım 39)
// Biyomekanik/fizyolojik eksikleri Drill Vault ile eşleştirir:
//  • Yüksek GCT + Düşük RSI → Plyometric Drop Jumps + Fast-feet Ladder
//  • Asimetri >%10 → Unilateral Balance Drilleri
//  • Yüksek CDL → Aktif Toparlanma + Düşük Etkili Driller
// Çıktı: antrenörler için sade dilde, yapılandırılmış çalışma planı.
// Deterministik kurallar; LLM gerektirmez.
// ============================================================================

import { getDrill, DRILL_VAULT, type Drill } from './drillVaultEngine.ts';

export interface DeficitMetrics {
  gctMs: number;
  rsi: number;
  asymPct: number;
  cdl: number;
  loadingRateKnS: number;
  forefootPct: number;
  hrvStress: boolean;
}

export type PrescriptionPriority = 'KRITIK' | 'ONCELIKLI' | 'ISTEGE_BAGLI';

export interface DrillPrescription {
  priority: PrescriptionPriority;
  deficit: string;
  drill: Drill;
  reason: string;
  coachTip: string;
}

export interface WorkoutPlan {
  prescriptions: DrillPrescription[];
  sessionOrder: string[];
  summary: string;
}

// Referans eşikler
export const REF = {
  GCT_MAX: 225,       // ms (yüksek temas eşiği)
  RSI_MIN: 1.8,       // düşük reaktif güç eşiği
  ASYM_MAX: 10,       // % asimetri eşiği
  CDL_MAX: 10,        // m/s fren yükü eşiği
  LOADING_MAX: 2.5,   // kN/s
  FOREFOOT_MIN: 65,   // % önayak itişi
};

/** Eksikleri Drill Vault'a bağlar; öncelik sıralı reçete listesi üretir. */
export function prescribeDrills(metrics: DeficitMetrics): DrillPrescription[] {
  const out: DrillPrescription[] = [];
  const highGct = metrics.gctMs > REF.GCT_MAX;
  const lowRsi = metrics.rsi < REF.RSI_MIN;

  // Yüksek GCT + Düşük RSI → plyometrik + hızlı ayak
  if (highGct && lowRsi) {
    const drop = getDrill('drop-jumps')!;
    const ladder = getDrill('fast-feet-ladder')!;
    out.push({
      priority: 'KRITIK',
      deficit: `GCT ${metrics.gctMs}ms (>${REF.GCT_MAX}) + RSI ${metrics.rsi} (<${REF.RSI_MIN})`,
      drill: drop,
      reason: 'Uzayan temas reaktif gücü tüketiyor — plyometrik kısa temas çalışması şart',
      coachTip: 'Drop-jumps setleri arasında ladder ile temas ritmini pekiştirin; 3dk tam dinlenme.',
    });
    out.push({ priority: 'ONCELIKLI', deficit: 'Temas süresi', drill: ladder, reason: 'Fast-feet zeminde kalma süresini kısaltır', coachTip: '15sn seriler halinde, topuk vurgusuz.' });
  }

  // Asimetri > %10 → unilateral
  if (metrics.asymPct > REF.ASYM_MAX) {
    out.push({
      priority: 'ONCELIKLI',
      deficit: `L/R asimetri %${metrics.asymPct} (>%${REF.ASYM_MAX})`,
      drill: getDrill('unilateral-balance')!,
      reason: 'Tek taraflı yük dağılımı sakatlık riski — denge + tek bacak kuvvet',
      coachTip: 'Zayıf tarafa ekstra 2 tekrar; göz kapalı denge ile propriosepsiyon.',
    });
  }

  // Yüksek CDL → aktif toparlanma + düşük etkili
  if (metrics.cdl > REF.CDL_MAX) {
    out.push({
      priority: 'ONCELIKLI',
      deficit: `CDL ${metrics.cdl} m/s (>${REF.CDL_MAX})`,
      drill: getDrill('active-recovery')!,
      reason: 'Birikmiş deselerasyon yükü diz/patella stresi — toparlanma öncelikli',
      coachTip: 'Aktif toparlanma günü; yüksek darbe içeren drilleri iptal edin.',
    });
    out.push({ priority: 'ISTEGE_BAGLI', deficit: 'Fren yükü', drill: getDrill('low-impact-cycle')!, reason: 'Eklem koruyucu alternatif kardiyo', coachTip: 'Düşük etkili bisiklet 15-20dk.' });
  }

  // Yüksek yükleme oranı → yumuşak iniş
  if (metrics.loadingRateKnS > REF.LOADING_MAX) {
    out.push({
      priority: 'ONCELIKLI',
      deficit: `Yükleme ${metrics.loadingRateKnS} kN/s (>${REF.LOADING_MAX})`,
      drill: getDrill('soft-landings')!,
      reason: 'Darbe yükleme oranı Aşil/kemik stresini artırıyor',
      coachTip: 'Sessiz iniş odaklı seriler; temas sesini azaltın.',
    });
  }

  // Düşük önayak itişi → ankraj drilleri
  if (metrics.forefootPct < REF.FOREFOOT_MIN) {
    out.push({
      priority: 'ISTEGE_BAGLI',
      deficit: `Önayak %${metrics.forefootPct} (<%${REF.FOREFOOT_MIN})`,
      drill: getDrill('ankle-push')!,
      reason: 'İtiş fazında güç kaybı — önayak yüklenmesi artırılmalı',
      coachTip: 'Hız yerine itiş kalitesi; kısa sprint temposu.',
    });
  }

  // HRV stres → toparlanma
  if (metrics.hrvStress) {
    out.push({
      priority: 'KRITIK',
      deficit: 'HRV stres işareti',
      drill: getDrill('active-recovery')!,
      reason: 'Otonom sistem dengesiz — yük eklemek riskli',
      coachTip: 'Aktif toparlanma + uyku hijyeni; ertesi gün HRV kontrolü.',
    });
  }

  // Eksik yoksa bakım
  if (out.length === 0) {
    out.push({ priority: 'ISTEGE_BAGLI', deficit: 'Bakım', drill: getDrill('hip-mobility')!, reason: 'Tüm metrikler hedef bölgede — koruyucu devre', coachTip: '2×10 mobilite devresi.' });
  }
  return out;
}

/** Antrenöre sade dilde yapılandırılmış seans planı üretir. */
export function buildWorkoutPlan(metrics: DeficitMetrics): WorkoutPlan {
  const prescriptions = prescribeDrills(metrics);
  const order: Record<PrescriptionPriority, number> = { KRITIK: 0, ONCELIKLI: 1, ISTEGE_BAGLI: 2 };
  const sorted = [...prescriptions].sort((a, b) => order[a.priority] - order[b.priority]);
  const sessionOrder = sorted.map((p) => `${p.drill.name} (${p.drill.setsReps})`);
  const summary = sorted.length > 0
    ? `Seans planı: ${sorted.map((p) => p.drill.name).join(' → ')}. ${sorted.filter((p) => p.priority === 'KRITIK').length} kritik öncelik tespit edildi.`
    : 'Seans planı yok.';
  return { prescriptions: sorted, sessionOrder, summary };
}

export function aiDrillPrescriptionStatus(): string {
  return `AI Drill Reçete: ${DRILL_VAULT.length} drill ile eksik eşleştirme • GCT/RSI/asimetri/CDL/yükleme`;
}
