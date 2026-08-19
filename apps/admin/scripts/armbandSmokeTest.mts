// ============================================================================
// ⌚ ARMBAND x SPORTVISIONX SMOKE TESTİ
// Çalıştırma: npx tsx scripts/armbandSmokeTest.mts
// Donanım yok — deterministik mock-first doğrulama.
// ============================================================================
import { listBands, onTapAccess, posSwipeCanteen, reportLost, processReturn, initMockBands, smartArmbandEngineStatus } from '../src/app/lib/hardware/smartArmbandEngine';
import { matchPlayerToBeacon, startCourtSession, recordTelemetry, buildDailyPerformance, recordCoaching, fatigueRisk, armbandCoachingBridgeStatus } from '../src/app/lib/sports/armbandCoachingBridge';

initMockBands();

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// 1) Bant & Turnike
const bands = listBands('FAM-1');
check(bands.length === 2, `Mock bantlar yüklendi (${bands.length})`, bands.map((b) => `${b.id}:${b.status}`).join(' '));

const access = onTapAccess('NFC-8A3F21');
check(access.allowed, 'Turnike — aktif bant geçiş izni', access.reason);

// 2) BLE eşleşme köprüsü (aktif bantla — iade/kayıp işleminden ÖNCE)
const match = matchPlayerToBeacon('TRK-004', 'BLE-7C91-E2', listBands());
check(match.matched && match.playerId === 'Efe', 'Kamera BBox ↔ BLE eşleşmesi', `güven %${match.confidencePct}`);

// 3) POS + ebeveyn onayı (>150₺)
const pos = posSwipeCanteen('BND-001', 190, 'Menü');
check(pos.parentalNotice, 'Kantin POS ₺190 — veli onayı tetiklendi', `${pos.state}`);

// 4) Kayıp → kilitle + irat
const lost = reportLost('BND-002');
const tapLost = onTapAccess('NFC-44D9B0');
check(lost.band.status === 'LOST' && !tapLost.allowed, 'Kayıp bant anında kilitli', `irat ₺${lost.forfeitedTl}`);

// 5) İade → depozito
const ret = processReturn('BND-001');
check(ret.ok && ret.refundTl === 500, 'Sağlam bant iadesi ₺500', ret.message);

// 6) BLE eşleşme iade sonrası engellenir (beklenen davranış)
const after = matchPlayerToBeacon('TRK-004', 'BLE-7C91-E2', listBands());
check(!after.matched, 'İade edilen bantla eşleşme engellendi');

// 7) Otomatik seans + yoklama
const session = startCourtSession('Efe', 'BLE-7C91-E2', 'Padel Kort A');
check(session.attendanceMarked && session.active, 'Kort girişi → seans + yoklama', session.court);

// 8) Telemetri analitiği
const t = recordTelemetry('Efe', 24);
check(t.shots === 24 && t.fatiguePct > 0, 'Telemetri örneği', `${t.armAccelGs}G • ${t.swingSpeedKmh} km/h • %${Math.round(t.fatiguePct)} yorgunluk`);

// 9) Günün karnesi
const perf = buildDailyPerformance('Efe');
check(perf.accuracyPct > 0 && perf.calories > 0, 'Otomatik performans karnesi', `${perf.shots} şut • %${perf.accuracyPct} isabet • ${perf.calories} kcal`);

// 10) Antrenör modu + yorgunluk
const coach = recordCoaching('CO-1', 'Kort A', 45, 4);
check(coach.attentionPerPlayerMin === 11.3, 'Antrenör ilgilenme analitiği', `${coach.activeMinutes} dk → ${coach.attentionPerPlayerMin} dk/sporcu`);
const risk = fatigueRisk();
check(typeof risk.riskActive === 'boolean', 'Yorgunluk eşiği radarı', risk.riskActive ? '⚠️ eşik aşıldı' : '💚 normal');

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/12 geçti`);
console.log(smartArmbandEngineStatus());
console.log(armbandCoachingBridgeStatus());
process.exit(pass === 12 ? 0 : 1);
