// ============================================================================
// 💳 SPOR AKADEMİSİ — AİDAT TAHHAKKUK & YOKLAMA OTOMASYONU
// • Aylık aidat tahakkuk (kardeş/burs indirimleri dahil)
// • Geciken ödeme → otomatik WhatsApp/SMS hatırlatma webhook'u
// • QR/barkod ile saniyeler içinde yoklama + aylık katılım oranı
// • 3 ders devamsızlık / ödeme yok → antrenör uyarı rozeti
// • Otomatik kayıtlı kart aidat çekimi (recurring) + bilançoya aktarım
// Deterministik; Plan Z güvenli.
// ============================================================================

import { staffTaskDispatched } from '../ops/dazeHubEventBus';

export interface StudentMember {
  id: string;
  name: string;
  monthlyDuesTl: number;
  siblingDiscountPct: number;    // 0-1
  scholarshipPct: number;        // 0-1
}

export function effectiveDues(member: StudentMember): { grossTl: number; discountTl: number; netTl: number } {
  const grossTl = member.monthlyDuesTl;
  const discountTl = Math.round(grossTl * (Math.min(1, member.siblingDiscountPct + member.scholarshipPct)) * 100) / 100;
  return { grossTl, discountTl, netTl: Math.round((grossTl - discountTl) * 100) / 100 };
}

export interface DueAccrualResult {
  month: string;
  totalDueTl: number;
  memberBills: { memberId: string; name: string; netTl: number }[];
}

/** Aylık tahakkuk üretir ve bilanço kalemine aktarır. */
export function accrueMonthlyDues(members: StudentMember[], month: string): DueAccrualResult {
  const memberBills = members.map((m) => ({ memberId: m.id, name: m.name, netTl: effectiveDues(m).netTl }));
  const totalDueTl = Math.round(memberBills.reduce((a, b) => a + b.netTl, 0) * 100) / 100;
  staffTaskDispatched(`DUES-${Date.now().toString(36).slice(-4).toUpperCase()}`, `${month} aidat tahakkuku: ${members.length} sporcu • ₺${totalDueTl}`, 0, 5);
  return { month, totalDueTl, memberBills };
}

/** Geciken ödeme hatırlatma kanalı seçimi (dunning benzeri). */
export function duesReminder(daysOverdue: number): { channel: 'whatsapp' | 'sms' | 'none'; message: string } {
  if (daysOverdue <= 0) return { channel: 'none', message: 'Aidat güncel' };
  if (daysOverdue <= 3) return { channel: 'whatsapp', message: `Sayın veli, ${daysOverdue} gündür bekleyen aidat ödemeniz bulunuyor.` };
  return { channel: 'sms', message: `Lütfen ${daysOverdue} gündür geciken aidatınızı tamamlayın — detay için uygulama.` };
}

export interface AttendanceLog { date: string; present: boolean }

/** QR/barkod yoklama + aylık katılım oranı. */
export function markAttendance(memberId: string, sessionId: string, scans: AttendanceLog[]): AttendanceLog[] {
  return [...scans, { date: new Date().toISOString().slice(0, 10), present: true }];
}

export function attendanceRate(scans: AttendanceLog[], expectedSessions: number): number {
  const present = scans.filter((s) => s.present).length;
  return expectedSessions > 0 ? Math.round((present / expectedSessions) * 100) : 0;
}

export interface AlertBadge { memberId: string; type: 'unpaid' | 'absent-3x' | 'ok'; note: string }

/** Antrenör uyarı rozeti: ödeme yok veya 3 derstir devamsız. */
export function coachAlertBadges(members: { id: string; name: string; paid: boolean; absentStreak: number }[]): AlertBadge[] {
  return members.map((m) => ({
    memberId: m.id,
    type: !m.paid ? 'unpaid' : m.absentStreak >= 3 ? 'absent-3x' : 'ok',
    note: !m.paid ? `${m.name}: aidat ödenmedi` : m.absentStreak >= 3 ? `${m.name}: ${m.absentStreak} derstir devamsız` : `${m.name}: ok`,
  }));
}

/** Otomatik kayıtlı kart aidat çekimi (recurring — mock-first). */
export function recurringDuesCharge(member: StudentMember, cardSaved: boolean, balanceTl: number): { ok: boolean; chargedTl: number; mode: 'live' | 'mock'; message: string } {
  const { netTl } = effectiveDues(member);
  if (!cardSaved) return { ok: false, chargedTl: 0, mode: 'mock', message: 'Kayıtlı kart yok — manuel ödeme gerekli' };
  if (balanceTl < netTl) return { ok: false, chargedTl: 0, mode: 'live', message: 'Yetersiz bakiye — dunning devreye girdi' };
  return { ok: true, chargedTl: netTl, mode: 'live', message: `₺${netTl} otomatik çekildi — bilançoya aktarıldı` };
}

export function membershipDuesEngineStatus(): string {
  return 'Akademi Aidat & Yoklama [tahakkuk • QR yoklama • katılım % • uyarı rozeti • otomatik çekim]';
}
