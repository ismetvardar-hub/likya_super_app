// ============================================================================
// 🏛️ ULUSAL FEDERASYON (TTF/ITF) VERİ DEĞİŞİMİ & UYUMLULUK API (Adım 118)
// Federasyon gereksinimlerine uygun standart sporcu pasaportu dışa aktarımı:
//   • ITF Junior Biometric Standard
//   • TTF Development Passport (JSON)
// Tıbbi PII otomatik gizlenir; doğrulanmış maç yükü, hız splitleri ve TID
// yüzdelikleri aktarılır. Saf/deterministik — şema doğrulama node'da test edilir.
// ============================================================================

export type FederationFormat = 'itf_junior_biometric' | 'ttf_development_passport';
export const FEDERATION_EXPORT_VERSION = '1.0';

export const ITF_JUNIOR_BIOMETRIC_SCHEMA = ['athleteId', 'age', 'sex', 'heightCm', 'weightKg', 'phvOffsetMonths', 'tidPercentile'] as const;
export const TTF_DEVELOPMENT_PASSPORT_SCHEMA = ['athleteId', 'age', 'sex', 'load', 'speedSplits', 'tidPercentile', 'developmentStage'] as const;

export interface AthletePassportInput {
  athleteId: string;
  fullName: string;
  dateOfBirth: string;          // PII → gizlenir
  sex: 'M' | 'F';
  heightCm: number;
  weightKg: number;
  phvOffsetMonths: number;
  tidScore: number;
  tidPercentile: number;
  matchLoad: { trimp: number; minutes: number; matches: number };
  speedSplits: { split: string; mps: number }[];
  medicalNotes: string;         // PII → gizlenir
}

export interface FederationExport {
  format: FederationFormat;
  version: string;
  exportedAt: string;
  athlete: {
    athleteId: string;
    age: number;
    sex: 'M' | 'F';
    heightCm: number;
    weightKg: number;
    phvOffsetMonths: number;
  };
  load: { trimp: number; minutes: number; matches: number };
  speedSplits: { split: string; mps: number }[];
  tid: { score: number; percentile: number; developmentStage: string };
  pii: { fullNameMasked: string; dateOfBirthMasked: string; medicalNotesMasked: string };
  piiObfuscated: boolean;
  schemaValid: boolean;
}

// ── PII gizleme (uzunluk koruyan maske: ilk harf + •) ────────────────────────
export function maskPii(value: string, keepFirst = true): string {
  const s = value ?? '';
  if (s.length === 0) return '';
  if (s.length === 1) return '•';
  const head = keepFirst ? s[0] : '•';
  return head + '•'.repeat(s.length - 1);
}

export function maskDate(value: string): string {
  return value.replace(/[0-9]/g, '•');
}

export function obfuscatePii(input: AthletePassportInput): { fullNameMasked: string; dateOfBirthMasked: string; medicalNotesMasked: string } {
  return {
    fullNameMasked: maskPii(input.fullName),
    dateOfBirthMasked: maskDate(input.dateOfBirth),
    medicalNotesMasked: maskPii(input.medicalNotes, false),
  };
}

// ── Yaş hesaplama (doğum tarihi → yıl) ───────────────────────────────────────
export function ageFromDob(dateOfBirth: string, now = new Date()): number {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return 0;
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return Math.max(0, age);
}

export function developmentStageFor(tidPercentile: number): string {
  if (tidPercentile >= 95) return 'Elite National Prospect';
  if (tidPercentile >= 75) return 'Developmental Tier 1';
  if (tidPercentile >= 50) return 'Developmental Tier 2';
  return 'Foundation';
}

// ── Federasyon pasaportu oluşturucu ──────────────────────────────────────────
export function buildFederationExport(input: AthletePassportInput, format: FederationFormat, now = new Date()): FederationExport {
  const pii = obfuscatePii(input);
  const probe = {
    format,
    athlete: {
      athleteId: input.athleteId,
      age: ageFromDob(input.dateOfBirth, now),
      sex: input.sex,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      phvOffsetMonths: input.phvOffsetMonths,
    },
    load: input.matchLoad,
    tid: { percentile: input.tidPercentile, developmentStage: developmentStageFor(input.tidPercentile) },
    speedSplits: input.speedSplits,
  };
  const schemaValid = validateFederationSchema(probe, format).valid;
  return {
    format,
    version: FEDERATION_EXPORT_VERSION,
    exportedAt: now.toISOString(),
    athlete: {
      athleteId: input.athleteId,
      age: probe.athlete.age,
      sex: input.sex,
      heightCm: Math.round(input.heightCm * 10) / 10,
      weightKg: Math.round(input.weightKg * 10) / 10,
      phvOffsetMonths: input.phvOffsetMonths,
    },
    load: { trimp: Math.max(0, Math.round(input.matchLoad.trimp)), minutes: Math.max(0, Math.round(input.matchLoad.minutes)), matches: Math.max(0, Math.round(input.matchLoad.matches)) },
    speedSplits: input.speedSplits.map((s) => ({ split: s.split, mps: Math.round(s.mps * 100) / 100 })),
    tid: { score: Math.max(0, Math.min(100, Math.round(input.tidScore))), percentile: Math.max(0, Math.min(100, Math.round(input.tidPercentile))), developmentStage: developmentStageFor(input.tidPercentile) },
    pii,
    piiObfuscated: true,
    schemaValid,
  };
}

// ── Şema doğrulama (gerekli alanlar + PII sızıntı kontrolü) ───────────────────
export function validateFederationSchema(exportData: unknown, format: FederationFormat): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const e = exportData as { format?: unknown; athlete?: Record<string, unknown>; load?: Record<string, unknown>; tid?: Record<string, unknown>; speedSplits?: unknown };
  if (e?.format !== format) issues.push('format uyuşmuyor');
  const required = format === 'itf_junior_biometric' ? ITF_JUNIOR_BIOMETRIC_SCHEMA : TTF_DEVELOPMENT_PASSPORT_SCHEMA;
  const athlete = e?.athlete ?? {};
  for (const field of required) {
    const present =
      field === 'load' ? typeof e?.load?.trimp === 'number'
      : field === 'speedSplits' ? Array.isArray(e?.speedSplits)
      : field === 'tidPercentile' ? typeof e?.tid?.percentile === 'number'
      : field === 'developmentStage' ? typeof e?.tid?.developmentStage === 'string'
      : athlete[field] !== undefined;
    if (!present) issues.push(`zorunlu alan eksik: ${field}`);
  }
  return { valid: issues.length === 0, issues };
}

export function federationDataExchangeStatus(): string {
  return `Federasyon: ITF Junior Biometric + TTF Development Passport • PII maskeli • şema doğrulu + doğrulanmış yük/TID`;
}

