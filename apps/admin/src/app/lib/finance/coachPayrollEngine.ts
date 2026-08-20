// ============================================================================
// 💰 KOÇ SEANS BORDROSU, RATE KARTLARI & OTOMATİK FATURALAMA (Adım 88)
// Rate tipleri: Saatlik Özel Ders • Takım Grup Bonusu • Fazla Mesai Çarpanı • Hafta Sonu Ek Ücreti
// Aylık kazanç + otomatik kesinti/vergi kalemleri + JSON/CSV ihracatı.
// Deterministik; sıfır bağımlılık.
// ============================================================================

export interface CoachRateCard {
  hourlyRate: number;                 // özel ders saatlik
  squadGroupBonusPerSession: number;  // takım seansı başına bonus
  squadRateFactor: number;            // takım saatlik çarpanı (varsayılan 0.7)
  overtimeMultiplier: number;         // fazla mesai çarpanı (varsayılan 1.5)
  weekendSurchargePct: number;        // hafta sonu ek yüzdesi (varsayılan 20)
  taxRatePct: number;                 // gelir vergisi (varsayılan 15)
}

export const DEFAULT_RATE_CARD: CoachRateCard = {
  hourlyRate: 40,
  squadGroupBonusPerSession: 15,
  squadRateFactor: 0.7,
  overtimeMultiplier: 1.5,
  weekendSurchargePct: 20,
  taxRatePct: 15,
};

export type PayrollSessionType = 'private' | 'squad';

export interface PayrollSession {
  type: PayrollSessionType;
  hours: number;
  sessions: number;
  weekend?: boolean;
  overtimeHours?: number;
}

export interface SessionEarnings {
  type: PayrollSessionType;
  base: number;
  groupBonus: number;
  overtime: number;
  weekendBonus: number;
  total: number;
}

/** Tek seans türünün kazancını hesaplar (bonus + mesai + hafta sonu). */
export function sessionEarnings(session: PayrollSession, rates: CoachRateCard = DEFAULT_RATE_CARD): SessionEarnings {
  const hourly = session.type === 'private' ? rates.hourlyRate : rates.hourlyRate * rates.squadRateFactor;
  const base = session.hours * hourly * session.sessions;
  const groupBonus = session.type === 'squad' ? rates.squadGroupBonusPerSession * session.sessions : 0;
  const overtime = (session.overtimeHours ?? 0) * rates.hourlyRate * (rates.overtimeMultiplier - 1) * session.sessions;
  const weekendBonus = session.weekend ? base * (rates.weekendSurchargePct / 100) : 0;
  return { type: session.type, base: round2(base), groupBonus, overtime: round2(overtime), weekendBonus: round2(weekendBonus), total: round2(base + groupBonus + overtime + weekendBonus) };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export interface PayrollSummary {
  coachId: string;
  period: string;
  itemized: SessionEarnings[];
  gross: number;
  tax: number;
  deductions: number;
  net: number;
}

/** Aylık bordro özeti: brüt, vergi, kesinti kalemleri, net. */
export function computeMonthlyPayroll(coachId: string, sessions: PayrollSession[], rates: CoachRateCard = DEFAULT_RATE_CARD, fixedDeductions = 0): PayrollSummary {
  const itemized = sessions.map((s) => sessionEarnings(s, rates));
  const gross = round2(itemized.reduce((a, e) => a + e.total, 0));
  const tax = round2(gross * (rates.taxRatePct / 100));
  const deductions = round2(fixedDeductions);
  const net = round2(gross - tax - deductions);
  const period = new Date().toISOString().slice(0, 7);
  return { coachId, period, itemized, gross, tax, deductions, net };
}

/** CSV ihracatı. */
export function payrollToCsv(summary: PayrollSummary): string {
  const header = 'type,base,groupBonus,overtime,weekendBonus,total';
  const rows = summary.itemized.map((e) => `${e.type},${e.base},${e.groupBonus},${e.overtime},${e.weekendBonus},${e.total}`);
  return [header, ...rows, `gross,${summary.gross}`, `tax,${summary.tax}`, `deductions,${summary.deductions}`, `net,${summary.net}`].join('\n');
}

/** JSON ihracatı. */
export function payrollToJson(summary: PayrollSummary): string {
  return JSON.stringify(summary, null, 2);
}

export function coachPayrollStatus(): string {
  return 'Koç Bordro: özel/takım • bonus • mesai 1.5x • hafta sonu % • vergi + CSV/JSON';
}
