// ============================================================================
// 🚑 OTOMATİK ACİL SAKATLIK TANI & TRİYAJ DAĞITICISI (Adım 134)
// Anında kort içi tıbbi olay koordinatörü: akut deselerasyon sıçramaları
// (>7.0 m/s²), asimetrik yük kayması (>%35) veya ani kinetik duruşla tetiklenir.
// Standart spor hekimliği ilk yardım protokolü (PEACE & LOVE / RICE) üretir ve
// ortopedik konsültasyon için zaman damgalı GRF + kinematik darbe telemetrisiyle
// yapılandırılmış tıbbi olay raporu hazırlar. Saf/deterministik.
// ============================================================================

export const DECEL_SPIKE_THRESHOLD = 7.0;      // m/s²
export const ASYMMETRY_THRESHOLD_PCT = 35;
export const CESSATION_VELOCITY_THRESHOLD = 0.4; // m/s
export const CESSATION_DROP_RATIO = 0.85;

export type TriageKind = 'NONE' | 'DECEL_SPIKE' | 'LOAD_ASYMMETRY' | 'KINETIC_CESSATION';
export type TriageSeverity = 'info' | 'warning' | 'emergency';
export type ProtocolKind = 'NONE' | 'PEACE_LOVE' | 'RICE';

export interface TelemetryFrameSnapshot {
  tsMs: number;
  grfBw: number;
  decelAccel: number;   // m/s²
  leftLoadPct: number;
  rightLoadPct: number;
  velocityZ: number;    // m/s
}

export interface TriageResult {
  triage: TriageKind;
  severity: TriageSeverity;
  triggers: string[];
  protocol: ProtocolKind;
}

export interface MedicalIncidentReport {
  reportId: string;
  athleteId: string;
  tsMs: number;
  triage: TriageKind;
  severity: TriageSeverity;
  triggers: string[];
  impact: {
    grfBw: number;
    decelAccel: number;
    leftLoadPct: number;
    rightLoadPct: number;
    asymmetryPct: number;
    velocityZ: number;
  };
  protocol: { protocol: ProtocolKind; steps: string[] };
  generatedAt: string;
}

// ── Tetikleyiciler ───────────────────────────────────────────────────────────
export function loadAsymmetryPct(leftLoadPct: number, rightLoadPct: number): number {
  const total = leftLoadPct + rightLoadPct;
  if (total <= 0) return 0;
  return Math.round((Math.abs(leftLoadPct - rightLoadPct) / total) * 1000) / 10;
}

export function evaluateTriage(frame: TelemetryFrameSnapshot, prev?: TelemetryFrameSnapshot): TriageResult {
  const triggers: string[] = [];
  const asymmetry = loadAsymmetryPct(frame.leftLoadPct, frame.rightLoadPct);

  if (frame.decelAccel > DECEL_SPIKE_THRESHOLD) {
    triggers.push(`Akut deselerasyon sıçraması: ${frame.decelAccel.toFixed(1)} m/s² (eşik >${DECEL_SPIKE_THRESHOLD})`);
  }
  if (asymmetry > ASYMMETRY_THRESHOLD_PCT) {
    triggers.push(`Asimetrik yük kayması: %${asymmetry} (eşik >%${ASYMMETRY_THRESHOLD_PCT})`);
  }
  if (prev && prev.velocityZ > 3.0 && frame.velocityZ < CESSATION_VELOCITY_THRESHOLD && frame.velocityZ < prev.velocityZ * (1 - CESSATION_DROP_RATIO)) {
    triggers.push(`Ani kinetik duruş: hız ${prev.velocityZ.toFixed(1)} → ${frame.velocityZ.toFixed(1)} m/s`);
  }

  // Öncelik: DECEL_SPIKE > KINETIC_CESSATION > LOAD_ASYMMETRY > NONE
  let triage: TriageKind = 'NONE';
  let severity: TriageSeverity = 'info';
  let protocol: ProtocolKind = 'NONE';
  if (triggers.some((t) => t.includes('deselerasyon'))) {
    triage = 'DECEL_SPIKE';
    severity = 'emergency';
    protocol = 'PEACE_LOVE';
  } else if (triggers.some((t) => t.includes('kinetik duruş'))) {
    triage = 'KINETIC_CESSATION';
    severity = 'emergency';
    protocol = 'RICE';
  } else if (triggers.some((t) => t.includes('Asimetrik'))) {
    triage = 'LOAD_ASYMMETRY';
    severity = 'warning';
    protocol = 'RICE';
  }
  return { triage, severity, triggers, protocol };
}

// ── İlk yardım protokolleri ──────────────────────────────────────────────────
export function peaceAndLoveProtocol(): string[] {
  return [
    'P — Koruma (Protection): 1-3 gün ağrılı harekette koruma, tam hareketsizlik değil',
    'E — Yükseltme (Elevation): bölgeyi kalp seviyesinin üzerinde tutun',
    'A — Ağrı kesiciye dikkat (Avoid anti-inflammatories): NSAID kullanımı iyileşmeyi yavaşlatabilir',
    'C — Sıkıştırma (Compression): şişliği sınırlamak için elastik bandaj',
    'E — Eğitim (Education): ağrı ve yük yönetimi hakkında bilgilendirme',
    'L — Yükleme (Load): tolerans izin verdiğinde kademeli yükleme',
    'O — İyimserlik (Optimism): pozitif beklenti iyileşmeyi hızlandırır',
    'V — Vaskülarizasyon (Vascularization): ağrısız kan dolaşımı artırıcı hareket',
    'E — Egzersiz (Exercise): aktif iyileşme programı',
  ];
}

export function riceProtocol(): string[] {
  return [
    'R — Dinlenme (Rest): yükten kaçınma',
    'I — Buz (Ice): 15-20 dk aralıklı soğuk uygulama',
    'C — Sıkıştırma (Compression): elastik bandajla şişlik kontrolü',
    'E — Yükseltme (Elevation): bölgeyi yukarıda tutma',
  ];
}

export function firstAidProtocol(kind: ProtocolKind): { protocol: ProtocolKind; steps: string[] } {
  if (kind === 'PEACE_LOVE') return { protocol: 'PEACE_LOVE', steps: peaceAndLoveProtocol() };
  if (kind === 'RICE') return { protocol: 'RICE', steps: riceProtocol() };
  return { protocol: 'NONE', steps: [] };
}

// ── Yapılandırılmış tıbbi olay raporu ────────────────────────────────────────
let reportSeq = 0;

export function buildMedicalIncidentReport(frame: TelemetryFrameSnapshot, athleteId: string, triage: TriageResult): MedicalIncidentReport {
  reportSeq++;
  return {
    reportId: `inc_${frame.tsMs.toString(36)}_${reportSeq.toString(36)}`,
    athleteId,
    tsMs: frame.tsMs,
    triage: triage.triage,
    severity: triage.severity,
    triggers: triage.triggers,
    impact: {
      grfBw: frame.grfBw,
      decelAccel: frame.decelAccel,
      leftLoadPct: frame.leftLoadPct,
      rightLoadPct: frame.rightLoadPct,
      asymmetryPct: loadAsymmetryPct(frame.leftLoadPct, frame.rightLoadPct),
      velocityZ: frame.velocityZ,
    },
    protocol: firstAidProtocol(triage.protocol),
    generatedAt: new Date().toISOString(),
  };
}

// ── Kort içi triyaj koordinatörü (ardışık çerçeve takibi) ────────────────────
export class EmergencyTriageCoordinator {
  private lastFrame: TelemetryFrameSnapshot | null = null;
  private readonly incidentHistory: MedicalIncidentReport[] = [];

  ingest(frame: TelemetryFrameSnapshot, athleteId: string): { triage: TriageResult; report: MedicalIncidentReport | null } {
    const triage = evaluateTriage(frame, this.lastFrame ?? undefined);
    this.lastFrame = frame;
    if (triage.triage !== 'NONE') {
      const report = buildMedicalIncidentReport(frame, athleteId, triage);
      this.incidentHistory.push(report);
      return { triage, report };
    }
    return { triage, report: null };
  }

  history(): MedicalIncidentReport[] {
    return [...this.incidentHistory];
  }

  reset(): void {
    this.lastFrame = null;
    this.incidentHistory.length = 0;
  }
}

export function emergencyTriageStatus(): string {
  return `Acil Triyaj: desel >${DECEL_SPIKE_THRESHOLD} m/s² • asimetri >%${ASYMMETRY_THRESHOLD_PCT} • ani duruş • PEACE&LOVE/RICE + olay raporu`;
}

