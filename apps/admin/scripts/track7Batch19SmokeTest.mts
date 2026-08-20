// ============================================================================
// 🛠️ TRACK 7 — BATCH 19 SMOKE TESTİ (Adım 91-95) + TRACK 7 BÜTÜNLÜK
// Donanım Teslim • MRR • Çok Kiracı • Veli Bülteni • Adım 86-95
// Çalıştırma: node scripts/track7Batch19SmokeTest.mts
// ============================================================================
import { createLockerInventory, createSensorInventory, autoAssignForSession, markInUse, returnAsset, markNeedsInspection, inventorySummary } from '../src/app/lib/facility/hardwareCheckoutEngine.ts';
import { computeRevenueMetrics, forecastCashFlow, forecastSummary, type RevenueInput } from '../src/app/lib/finance/revenueAnalyticsEngine.ts';
import { createMultiTenantEngine, CLUB_TENANTS } from '../src/app/lib/tenant/multiTenantEngine.ts';
import { digestStats, personalizeText, buildPlainDigest, buildHtmlDigest, digestSummary, type ParentDigestInput } from '../src/app/lib/communication/parentDigestGenerator.ts';
// Track 7 bütünlük (Adım 86-95)
import { createCourtGrid, gridSummary, emergencyLockout } from '../src/app/lib/facility/courtOccupancyEngine.ts';
import { bookingsOverlap, type Booking } from '../src/app/lib/facility/courtBookingScheduler.ts';
import { sessionEarnings } from '../src/app/lib/finance/coachPayrollEngine.ts';
import { prorateMembership, type Membership } from '../src/app/lib/finance/membershipTierEngine.ts';
import { clearanceStatus, type MedicalClearance } from '../src/app/lib/legal/digitalWaiverEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 91: AKILLI DOLAP & DONANIM TESLİM ────────────────────────────────────
const lockers = createLockerInventory(12);
check('91a. 12 dolap tamamı AVAILABLE', lockers.length === 12 && lockers.every((l) => l.state === 'AVAILABLE'));
const sensors = createSensorInventory(4, 4);
check('91b. 8 tabanlık + 4 HRM', sensors.filter((s) => s.kind === 'insole').length === 8 && sensors.filter((s) => s.kind === 'hrm').length === 4);

let assets = [...lockers, ...sensors];
const assign = autoAssignForSession(assets, 'at-1', 'locker');
check('91c. Otomatik dolap ataması (LK-001 → at-1)', assign.asset?.serial === 'LK-001' && assign.asset?.state === 'CHECKED_OUT' && assign.asset?.assignedTo === 'at-1');
assets = assign.assets;
assets = markInUse(assets, 'locker-1');
check('91d. Kortta kullanım → IN_USE_ON_COURT', assets[0].state === 'IN_USE_ON_COURT');
assets = returnAsset(assets, 'locker-1');
check('91e. İade → CHARGING + teslim temiz', assets[0].state === 'CHARGING' && assets[0].assignedTo === undefined);
assets = markNeedsInspection(assets, 'locker-2');
check('91f. Denetim işareti', assets[1].state === 'NEEDS_INSPECTION');
const summary = inventorySummary(assets);
check('91g. Envanter özeti toplam doğru', Object.values(summary).reduce((a, b) => a + b, 0) === assets.length);

// ── ADIM 92: MRR / ARR / CHURN / TAHMİN ───────────────────────────────────────
const revInput: RevenueInput = { activeMembers: 120, avgMonthlyPrice: 120, churnedLastMonth: 6, privateSessionsPerMonth: 80, privateSessionPrice: 60, privateCoachSplitPct: 60, commissionPct: 25 };
const rev = computeRevenueMetrics(revInput);
check('92a. MRR $14,400 · ARR $172,800', rev.mrr === 14400 && rev.arr === 172800);
check('92b. Churn %4.8 · ARPU $120', rev.churnRatePct === 4.8 && rev.arpu === 120);
check('92c. Komisyon $1,200 · toplam $15,600', rev.coachingRevenue === 1200 && rev.totalMonthly === 15600);
const forecast = forecastCashFlow(14400, 2, 3);
check('92d. Tahmin: 1. ay $14,688 (%2 büyüme)', forecast[0].projectedMrr === 14688 && forecast[1].projectedMrr === 14981.76);
const sum = forecastSummary(14400, 2);
check('92e. 3 aylık tahmin ≈$44,951 · 6 aylık ≈$92,653', sum.threeMonth > 44900 && sum.threeMonth < 45000 && sum.sixMonth > 92600 && sum.sixMonth < 92700);

// ── ADIM 93: ÇOK KİRACILI İZOLASYON ───────────────────────────────────────────
const tenant = createMultiTenantEngine('antalya-tenis');
const records = [
  { clubId: 'antalya-tenis', label: 'Efe (ATK)' },
  { clubId: 'lara-akademi', label: 'Zeynep (Lara)' },
  { clubId: 'belek-performance', label: 'Arda (Belek)' },
  { clubId: 'antalya-tenis', label: 'Elif (ATK)' },
];
check('93a. Varsayılan kulüp + 3 kulüp', tenant.getCurrentClub().id === 'antalya-tenis' && CLUB_TENANTS.length === 3);
const scoped = tenant.scopeData(records);
check('93b. Kiracı sınırı: yalnızca ATK verisi', scoped.length === 2 && scoped.every((r) => r.clubId === 'antalya-tenis'));
check('93c. Kulüp değiştirme + geçersiz reddi', tenant.switchClub('belek-performance') === true && tenant.switchClub('nonexistent') === false);
const scopedBelek = tenant.scopeData(records);
check('93d. Belek kapsamı 1 kayıt', scopedBelek.length === 1 && scopedBelek[0].clubId === 'belek-performance');
check('93e. isAccessible sınırı', tenant.isAccessible({ clubId: 'belek-performance' }) === true && tenant.isAccessible({ clubId: 'lara-akademi' }) === false);

// ── ADIM 94: VELİ HAFTALIK BÜLTENİ ────────────────────────────────────────────
const digestInput: ParentDigestInput = {
  athleteName: 'Efe', parentName: 'Ayşe', weekStart: '2026-08-17',
  sessions: [
    { date: '2026-08-17', durationMin: 90, trimp: 120, rsi: 1.9, gctMs: 200 },
    { date: '2026-08-19', durationMin: 60, trimp: 80, rsi: 2.1, gctMs: 190 },
    { date: '2026-08-21', durationMin: 75, trimp: 100, rsi: 2.0, gctMs: 195 },
  ],
  nextWeekSchedule: ['Pzt 16:00 Kort 2', 'Çar 17:00 Kort 5'],
  highlights: ['Yeni RSI rekoru 2.1', 'GCT <200ms hedefi'],
};
const stats = digestStats(digestInput.sessions, 1.8);
check('94a. Haftalık istatistikler (3 seans, 300 TRIMP, RSI best 2.1)', stats.sessionCount === 3 && stats.totalTrimp === 300 && stats.rsiBest === 2.1 && stats.avgRsi === 2);
check('94b. Kişiselleştirme etiketi', personalizeText('Merhaba {{parentName}}, {{athleteName}} · {{sessionCount}} seans', stats, digestInput) === 'Merhaba Ayşe, Efe · 3 seans');
const plain = buildPlainDigest(digestInput, 1.8);
check('94c. Düz metin: isim + TRIMP + RSI rekoru', plain.includes('Efe') && plain.includes('300') && plain.includes('Yeni RSI rekoru'));
const html = buildHtmlDigest(digestInput, 1.8);
check('94d. HTML bülten: mobil + kartlar + program', html.includes('<div') && html.includes('Efe Haftalık Özet') && html.includes('Pzt 16:00'));
check('94e. Kısa özet (WhatsApp)', digestSummary(digestInput, 1.8).includes('3 seans') && digestSummary(digestInput, 1.8).includes('300'));

// ── TRACK 7 BÜTÜNLÜK (Adım 86-95) ─────────────────────────────────────────────
check('86. Kort doluluğu özet', gridSummary(createCourtGrid(12)).active === 3);
check('87. Rezervasyon çakışması', bookingsOverlap({ id: 'x', courtId: 'c', startMin: 0, durationMin: 60, coachId: 'k' }, { id: 'y', courtId: 'c', startMin: 30, durationMin: 30, coachId: 'k' }) === true);
check('88. Koç bordro: özel ders $400', sessionEarnings({ type: 'private', hours: 1, sessions: 10 }).total === 400);
const m: Membership = { memberId: 'm', tierId: 'competitive-academy', startDate: '', billingCycleDays: 30, lastPayment: '', status: 'Active' };
check('89. Oranlı yükseltme +$72', prorateMembership(m, 'elite-performance-pro', 12, 30).chargeOrCredit === 72);
const validClearance: MedicalClearance = { signedAt: '2026-01-01T00:00:00Z', expiresAt: '2027-01-01T00:00:00Z', healthDocUploaded: true };
check('90. Feragat geçerli', clearanceStatus(validClearance, new Date('2026-08-01T00:00:00Z').getTime()) === 'VALID');
check('91-94. Donanım/MRR/kiracı/bülten yukarıda doğrulandı', assign.asset !== null && rev.mrr > 0 && scoped.length > 0 && stats.sessionCount > 0);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

