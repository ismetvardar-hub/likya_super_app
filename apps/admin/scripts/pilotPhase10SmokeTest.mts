// ============================================================================
// 🚀 PİLOT FAZ 10 SMOKE TESTİ — TRACK 17 UÇTAN UCA (Adım 146-150)
// Franchise koltuk limitleri + telif matematiği • sponsor izlenim + denetim •
// CRDT edge replikasyon + çakışma çözümü • çok para birimi VAT/KDV +
// döviz çevrimi • FINAL 150/150 MILESTONE. Çalıştırma:
// node scripts/pilotPhase10SmokeTest.mts
// ============================================================================
import { existsSync, readFileSync } from 'node:fs';
import {
  FranchiseGovernanceEngine, validateSeatAllocation, calculateMonthlyRoyalty, licenseIsActive,
  type FranchiseBranch,
} from '../src/app/lib/enterprise/franchiseGovernanceEngine.ts';
import {
  SponsorImpressionEngine, auditChecksum,
} from '../src/app/lib/enterprise/sponsorImpressionEngine.ts';
import {
  EdgeTelemetryReplicator, TelemetryCrdtStore, nearestEdgeRegion, replicationLatencyMs,
  type TelemetryPacket,
} from '../src/app/lib/sync/edgeTelemetryReplicator.ts';
import {
  convertCurrency, vatRateFor, digitalServiceTaxRateFor, computeInvoice, exportPdfInvoice,
  DEFAULT_RATES, applyRateUpdate,
} from '../src/app/lib/finance/multiCurrencyTaxEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 146: FRANCHISE YÖNETİŞİM ───────────────────────────────────────────
const branch: FranchiseBranch = {
  branchId: 'br-x', name: 'Antalya Central', city: 'Antalya', country: 'TR', status: 'ACTIVE',
  seatLimits: { coaches: 2, courts: 4, insolePairs: 6 }, seatUsage: { coaches: 2, courts: 3, insolePairs: 5 },
  license: { licenseKey: 'LKY-TR-001', issuedAt: '2026-01-01T00:00:00Z', expiresAt: '2027-01-01T00:00:00Z', royaltyModel: 'revenue_share', royaltyRatePct: 8, fixedFeeMonthlyUsd: 0 },
};
check('146a. Koltuk limiti: dolu koç +1 → red · lisans aktif', validateSeatAllocation(branch, 'coaches', 1).valid === false && validateSeatAllocation(branch, 'coaches', 1).issues[0].includes('limit aşıldı') && licenseIsActive(branch, Date.now()) === true);
const royalty = calculateMonthlyRoyalty(branch, '2026-08', 25000);
const fixedRoyalty = calculateMonthlyRoyalty({ ...branch, license: { ...branch.license, royaltyModel: 'fixed_fee', fixedFeeMonthlyUsd: 1500 } }, '2026-08', 25000);
check('146b. Telif: ciro payı %8 → 2000$ · sabit ücret → 1500$', royalty.totalDueUsd === 2000 && royalty.method === 'revenue_share' && fixedRoyalty.totalDueUsd === 1500 && fixedRoyalty.method === 'fixed_fee');
const gov = new FranchiseGovernanceEngine();
gov.addBranch(branch);
check('146c. Tahsis: limit üstü red · tabanlık -1 kabul', gov.allocateSeat('br-x', 'coaches', 1).ok === false && gov.allocateSeat('br-x', 'insolePairs', -1).ok === true && gov.branch('br-x')?.seatUsage.insolePairs === 4);
check('146d. Şube bütünlük doğrulaması geçerli', gov.validateBranch('br-x', Date.now()).valid === true);

// ── ADIM 147: SPONSOR İZLENİM & ROI ──────────────────────────────────────────
const sponsor = new SponsorImpressionEngine();
for (let i = 0; i < 100; i++) {
  sponsor.recordImpression({ sponsorId: 'sp-1', surface: i % 2 === 0 ? 'broadcast_hud' : 'tournament_bracket', tsMs: i * 1000, viewablePct: i % 4 === 0 ? 30 : 80, interacted: i % 10 === 0 });
}
const sponsorSummary = sponsor.summary('sp-1');
check('147a. İzlenim: 100 toplam · 75 görünür · 10 etkileşim · CTR %10', sponsorSummary.impressions === 100 && sponsorSummary.viewableImpressions === 75 && sponsorSummary.interactions === 10 && sponsorSummary.ctrPct === 10);
check('147b. CPM: 10000 izlenim / 200$ → 20$', sponsor.computeCpm(10000, 200) === 20);
const roi = sponsor.roiReport('sp-1', 100, 0.004, 0.5);
check('147c. ROI: 75×0.004 + 10×0.5 = 5.3$ değer · ROI %5.3 · doğrulandı', roi.totalValueUsd === 5.3 && roi.roiPct === 5.3 && roi.verified === true && roi.impressions === 100);
const audit = sponsor.auditVerification('sp-1');
const tampered = sponsor.impressionsFor('sp-1').map((i) => ({ ...i, viewablePct: 100 }));
check('147d. Denetim: sağlama toplamı deterministik + kurcalama tespiti', audit.verified === true && audit.impressionCount === 100 && auditChecksum(sponsor.impressionsFor('sp-1')) === audit.checksum && auditChecksum(tampered) !== audit.checksum);
// ── ADIM 148: EDGE REPLİKASYON & CRDT ───────────────────────────────────────
check('148a. En yakın edge: İstanbul→IST1 · Frankfurt→FRA1 · Dubai→DUB1', nearestEdgeRegion(41.0, 29.0) === 'IST1' && nearestEdgeRegion(50.1, 8.7) === 'FRA1' && nearestEdgeRegion(25.2, 55.3) === 'DUB1');
const istFra = replicationLatencyMs('IST1', 'FRA1');
check('148b. Replikasyon gecikmesi: IST1→FRA1 pozitif tam sayı ms', istFra > 0 && Number.isInteger(istFra) && replicationLatencyMs('FRA1', 'FRA1') === 0);
const storeA = new TelemetryCrdtStore('node-a');
const storeB = new TelemetryCrdtStore('node-b');
storeA.apply({ streamId: 's', seq: 1, tsMs: 100, payload: { gct: 220 } }, 'node-a');
storeB.apply({ streamId: 's', seq: 1, tsMs: 200, payload: { gct: 230 } }, 'node-b');
storeA.merge(storeB);
check('148c. CRDT LWW: aynı anahtar → yeni tsMs kazanır (220→230)', storeA.get('s', 1)?.value.gct === 230 && storeA.get('s', 1)?.tsMs === 200);
const replicator = new EdgeTelemetryReplicator();
const pkt1: TelemetryPacket = { streamId: 'match1-left', seq: 1, tsMs: 1000, payload: { grf: 1.2 } };
const pkt2: TelemetryPacket = { streamId: 'match1-left', seq: 2, tsMs: 1010, payload: { grf: 1.4 } };
replicator.replicateToAll(pkt1, 'IST1');
replicator.replicateToAll(pkt2, 'IST1');
const consistency = replicator.consistencyCheck();
const resolved = replicator.resolveConflicts();
check('148d. Aktif-aktif tutarlılık: 3 bölge = 2 paket · sapma 0 · merge 2', consistency.consistent === true && consistency.maxDivergence === 0 && consistency.totalPackets === 2 && resolved.merged === 2 && replicator.regionCount('DUB1') === 2);
const disorder = new TelemetryCrdtStore('x');
disorder.apply({ streamId: 's2', seq: 1, tsMs: 2000, payload: {} }, 'x');
disorder.apply({ streamId: 's2', seq: 2, tsMs: 1500, payload: {} }, 'x'); // seq2 daha erken ts → sıra dışı
check('148e. Paket sıralaması: merge sonrası ts sıralı + sıra dışı tespiti', disorder.orderedPackets().sorted.length === 2 && disorder.orderedPackets().outOfOrder === 1 && resolved.canonical.orderedPackets().sorted[0].seq === 1);

// ── ADIM 149: ÇOK PARA BİRİMLİ VERGİ ─────────────────────────────────────────
check('149a. Döviz çevrimi: 100$→92€ · 100€→108.7$ · 100$→3350₺', convertCurrency(100, 'USD', 'EUR') === 92 && Math.round(convertCurrency(100, 'EUR', 'USD') * 100) / 100 === 108.7 && convertCurrency(100, 'USD', 'TRY') === 3350);
const updated = applyRateUpdate(DEFAULT_RATES, 'EUR', 0.95);
check('149b. ECB/CBRT kur güncellemesi: 100$→95€ (yeni EUR kuru)', convertCurrency(100, 'USD', 'EUR', updated) === 95);
check('149c. Vergi oranları: TR KDV %20 + DST %7.5 · AE VAT %5 + DST %0', vatRateFor('TR') === 20 && vatRateFor('AE') === 5 && digitalServiceTaxRateFor('TR') === 7.5 && digitalServiceTaxRateFor('AE') === 0);
const invoiceUsd = computeInvoice('inv-1', 'USD', 'TR', [{ description: 'Sporcu lisansı', quantity: 1, unitPriceUsd: 1000 }]);
const invoiceEur = computeInvoice('inv-2', 'EUR', 'TR', [{ description: 'Sporcu lisansı', quantity: 1, unitPriceUsd: 1000 }]);
check('149d. Fatura: TR 1000$ → KDV 200$ + DST 75$ = 1275$ · EUR 920/1173€', invoiceUsd.vatAmount === 200 && invoiceUsd.dstAmount === 75 && invoiceUsd.total === 1275 && invoiceEur.subtotal === 920 && invoiceEur.total === 1173 && invoiceEur.currency === 'EUR');
check('149e. PDF fatura dışa aktarımı deterministik', invoiceEur.pdfExport.includes('LİKYA SPORTVISIONX') && invoiceEur.pdfExport.includes('TOTAL') && exportPdfInvoice(invoiceUsd).includes('1275 USD'));
// ── ADIM 150: TRACK 17 BÜTÜNLÜK + FINAL 150/150 ──────────────────────────────
const track17Files = [
  'src/app/lib/enterprise/franchiseGovernanceEngine.ts',
  'src/app/lib/enterprise/sponsorImpressionEngine.ts',
  'src/app/lib/sync/edgeTelemetryReplicator.ts',
  'src/app/lib/finance/multiCurrencyTaxEngine.ts',
  'src/modules/enterprise/FranchiseGovernanceView.tsx',
  'src/modules/enterprise/SponsorRoiDashboard.tsx',
  'scripts/pilotPhase10SmokeTest.mts',
];
check('150a. Track 17 dosyaları: 4 motor + 2 komponent + smoke mevcut', track17Files.every((f) => existsSync(f)));
const roadmap = readFileSync('../../docs/100_STEP_EXECUTION_ROADMAP.md', 'utf8');
const roadmapChecked = (roadmap.match(/^\| \d{2,3} \|.*\[x\]/gm) ?? []).length;
check('150b. FINAL MILESTONE: roadmap 150/150 [x]', roadmapChecked >= 150, `${roadmapChecked} [x]`);
const cross = royalty.totalDueUsd === 2000 && sponsorSummary.impressions === 100 && consistency.consistent === true && invoiceUsd.total === 1275 && convertCurrency(100, 'USD', 'EUR') === 92;
check('150c. Track 17 veri hattı: franchise + sponsor + edge + vergi uçtan uca', cross === true);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);


