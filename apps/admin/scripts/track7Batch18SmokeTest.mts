// ============================================================================
// 🛠️ TRACK 7 — BATCH 18 SMOKE TESTİ (Adım 86-90)
// Kort Doluluğu • Rezervasyon Zamanlayıcı • Koç Bordro • Üyelik Tier • Feragat
// Çalıştırma: node scripts/track7Batch18SmokeTest.mts
// ============================================================================
import { createCourtGrid, setCourtStatus, emergencyLockout, reallocateCourt, gridSummary, countdownLabel } from '../src/app/lib/facility/courtOccupancyEngine.ts';
import { bookingsOverlap, findConflicts, addBooking, isCourtAvailable, nextFreeSlot, recurringBooking, type Booking } from '../src/app/lib/facility/courtBookingScheduler.ts';
import { sessionEarnings, computeMonthlyPayroll, payrollToCsv, payrollToJson, DEFAULT_RATE_CARD, type PayrollSession } from '../src/app/lib/finance/coachPayrollEngine.ts';
import { MEMBERSHIP_TIERS, getTier, membershipStatus, renewalDate, prorateMembership } from '../src/app/lib/finance/membershipTierEngine.ts';
import { clearanceStatus, blockSessionEntry, validateWaiver, signWaiver, type MedicalClearance } from '../src/app/lib/legal/digitalWaiverEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 86: ÇOK KORTLU CANLI DOLULUK ─────────────────────────────────────────
const grid = createCourtGrid(12);
check('86a. 12 kort, 4 durum dağılımı (3/3/3/3)', grid.length === 12 && gridSummary(grid).active === 3 && gridSummary(grid).booked === 3 && gridSummary(grid).maintenance === 3 && gridSummary(grid).vacant === 3);
const locked = emergencyLockout(grid, 'court-1');
check('86b. Acil kilit → MAINTENANCE + seans durduruldu', locked[0].status === 'MAINTENANCE' && locked[0].playerCount === 0 && locked[0].countdownSec === 0);
const reassigned = reallocateCourt(grid, 'court-1', 'Yeni Koç');
check('86c. Yeniden atama → ACTIVE_SESSION + koç', reassigned[0].status === 'ACTIVE_SESSION' && reassigned[0].coach === 'Yeni Koç');
check('86d. Durum değiştirme', setCourtStatus(grid, 'court-2', 'VACANT')[1].status === 'VACANT');
check('86e. Geri sayım etiketleri', countdownLabel(2550) === '42:30' && countdownLabel(3730) === '01:02:10');
check('86f. Aktif kort ortalama HR >0', gridSummary(grid).avgActiveHr > 0);

// ── ADIM 87: REZERVASYON ÇAKIŞMA & TAMPON ─────────────────────────────────────
const a: Booking = { id: 'a', courtId: 'c1', startMin: 0, durationMin: 60, coachId: 'k1' };
const b: Booking = { id: 'b', courtId: 'c1', startMin: 50, durationMin: 30, coachId: 'k2' };
check('87a. Çakışan rezervasyon tespiti', bookingsOverlap(a, b) === true);
const c: Booking = { id: 'c', courtId: 'c1', startMin: 70, durationMin: 30, coachId: 'k3' };
check('87b. 10dk tampon + 70>60 → çakışma yok', bookingsOverlap(a, c, 10) === false && bookingsOverlap(a, c, 0) === false);
const coachConflict: Booking = { id: 'd', courtId: 'c2', startMin: 10, durationMin: 60, coachId: 'k1' };
const conflicts = findConflicts([a, coachConflict]);
check('87c. Aynı koç farklı kortta çakışma', conflicts.some((x) => x.reason === 'coach'));
const added = addBooking([a], { id: 'e', courtId: 'c1', startMin: 20, durationMin: 30, coachId: 'k9' });
check('87d. Çakışan ekleme reddedilir', added.ok === false && added.conflicts.length > 0);
check('87e. Müsaitlik + boş slot', isCourtAvailable([a], 'c1', 120, 60) === true && nextFreeSlot([a], 'c1', 60, 0) >= 0);
const recurring = recurringBooking('junior', 'c3', 360, 90, 4, 'k1', 'cohort-j');
check('87f. Tekrarlayan takım rezervasyonu (4 hafta)', recurring.length === 4 && recurring[1].startMin === recurring[0].startMin + 7 * 24 * 60);

// ── ADIM 88: KOÇ BORDRO (rate + kesintiler) ────────────────────────────────────
const priv = sessionEarnings({ type: 'private', hours: 1, sessions: 10 });
check('88a. Özel ders: 10×1s @$40 = $400', priv.total === 400 && priv.base === 400);
const squad = sessionEarnings({ type: 'squad', hours: 1, sessions: 10 });
check('88b. Takım: $28/saat + 15×10 bonus = $430', squad.total === 430 && squad.groupBonus === 150);
const ot = sessionEarnings({ type: 'private', hours: 1, sessions: 2, overtimeHours: 1 });
check('88c. Fazla mesai: +$40 (1.5x fark ×2)', ot.overtime === 40 && ot.total === 120);
const wkd = sessionEarnings({ type: 'private', hours: 1, sessions: 10, weekend: true });
check('88d. Hafta sonu %20 ek = $80', wkd.weekendBonus === 80 && wkd.total === 480);

const sessions: PayrollSession[] = [
  { type: 'private', hours: 1, sessions: 10 },
  { type: 'squad', hours: 1, sessions: 10 },
];
const payroll = computeMonthlyPayroll('coach-1', sessions, DEFAULT_RATE_CARD, 20);
check('88e. Brüt $830, vergi %15=$124.5, kesinti $20 → net $685.5', payroll.gross === 830 && payroll.tax === 124.5 && payroll.deductions === 20 && payroll.net === 685.5);
check('88f. Kalemli (2 seans türü)', payroll.itemized.length === 2);
const csv = payrollToCsv(payroll);
const json = payrollToJson(payroll);
check('88g. CSV + JSON ihracat', csv.includes('net,685.5') && JSON.parse(json).coachId === 'coach-1');

// ── ADIM 89: ÜYELİK TIER & ORANLI HESAP ───────────────────────────────────────
check('89a. 4 tier + fiyatlar', MEMBERSHIP_TIERS.length === 4 && getTier('elite-performance-pro').monthlyPrice === 240 && getTier('family-pass').monthlyPrice === 180);
check('89b. Ödeme durumu (5g Active / 35g Past Due / 50g Suspended)', membershipStatus(new Date(Date.now() - 5 * 86_400_000).toISOString(), 30) === 'Active' && membershipStatus(new Date(Date.now() - 35 * 86_400_000).toISOString(), 30) === 'Past Due' && membershipStatus(new Date(Date.now() - 50 * 86_400_000).toISOString(), 30) === 'Suspended');
check('89c. Yenileme tarihi +30 gün', renewalDate('2026-08-01T00:00:00Z', 30).slice(0, 10) === '2026-08-31');
const up = prorateMembership({ memberId: 'm1', tierId: 'competitive-academy', startDate: '2026-01-01', billingCycleDays: 30, lastPayment: '', status: 'Active' }, 'elite-performance-pro', 12, 30);
const down = prorateMembership({ memberId: 'm1', tierId: 'elite-performance-pro', startDate: '2026-01-01', billingCycleDays: 30, lastPayment: '', status: 'Active' }, 'competitive-academy', 12, 30);
check('89d. Oranlı yükseltme: +$72 (120→240, 18 gün kalan)', up.chargeOrCredit === 72 && up.nextMonthly === 240);
check('89e. Oranlı indirme: −$72 kredi', down.chargeOrCredit === -72 && down.nextMonthly === 120);

// ── ADIM 90: TIBBİ İZİN & FERAGAT ─────────────────────────────────────────────
const pending: MedicalClearance = { signedAt: null, expiresAt: null, healthDocUploaded: false };
const expired: MedicalClearance = { signedAt: '2025-01-01T00:00:00Z', expiresAt: '2025-12-31T00:00:00Z', healthDocUploaded: true };
const valid: MedicalClearance = { signedAt: '2026-01-01T00:00:00Z', expiresAt: '2027-01-01T00:00:00Z', healthDocUploaded: true, emergencyContact: '+905551234567' };
const now = new Date('2026-08-01T00:00:00Z').getTime();
check('90a. Durum: PENDING/EXPIRED/VALID', clearanceStatus(pending, now) === 'PENDING' && clearanceStatus(expired, now) === 'EXPIRED' && clearanceStatus(valid, now) === 'VALID');
check('90b. Seans girişi kilidi', blockSessionEntry(pending, now) === true && blockSessionEntry(expired, now) === true && blockSessionEntry(valid, now) === false);
check('90c. Doğrulama gerekçeleri', validateWaiver(expired, now).reason.includes('süresi doldu') && validateWaiver(valid, now).ok === true);
const signed = signWaiver(pending, 'dijital-imza', '2027-01-01T00:00:00Z');
check('90d. Dijital imza sonrası VALID (belge yoksa PENDING)', clearanceStatus({ ...signed, healthDocUploaded: true }, now) === 'VALID' && clearanceStatus(signed, now) === 'PENDING');

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

