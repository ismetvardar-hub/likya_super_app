// ============================================================================
// 🏆 LIVE PERFORMANCE HUB + POST-SESSION RAPOR SMOKE TESTİ
// Çalıştırma: npx tsx scripts/performanceHubSmokeTest.mts
// ============================================================================
import { generateLiveHubSnapshot, livePerformanceHubStatus } from '../src/app/lib/sports/livePerformanceHub';
import { generatePostSessionReport, deltaPct, postSessionReportStatus } from '../src/app/lib/sports/postSessionReport';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// 1) Live Hub — 6 bölge şeması
const hub = generateLiveHubSnapshot(3);
check(hub.athlete.name === 'Arda G.' && hub.elapsed.h === '00', 'Sporcu + maç süresi', `${hub.athlete.name} • ${hub.elapsed.h}:${hub.elapsed.m}:${hub.elapsed.s}`);
check(hub.kinetic.speedKmh > 0 && hub.kinetic.jumpCm > 0, 'Kinetik bölge', `${hub.kinetic.speedKmh} km/h • ${hub.kinetic.jumpCm} cm`);
check(hub.insole.forefootPct > hub.insole.heelPct, 'Tabanlık basınç (ön baskın)', `%${hub.insole.forefootPct}/%${hub.insole.heelPct}`);
check(hub.physiology.heartRate > 150 && hub.physiology.energyPct > 0, 'Fizyolojik bölge', `${hub.physiology.heartRate} bpm • %${hub.physiology.energyPct}`);
check(hub.comparison.rsi > 0 && hub.comparison.gctMs > 0, 'Kıyas bölgesi', `RSI ${hub.comparison.rsi} • GCT ${hub.comparison.gctMs}ms`);
check(hub.coordination.shots > 0 && hub.coordination.armSpeedKmh > 0, 'Koordinasyon bölgesi', `${hub.coordination.armSpeedKmh} km/h • ${hub.coordination.shots} vuruş`);
check(hub.fatigue.riskSafe === true || hub.fatigue.injuryRisk === 'ORTA', 'Yorgunluk bölgesi', `Risk ${hub.fatigue.injuryRisk}`);

// 2) Post-Session rapor
const rep = generatePostSessionReport(2);
check(rep.header.trimp > 0 && rep.header.sessionType.includes('Tenis'), 'Rapor başlığı', `TRIMP ${rep.header.trimp} • ${rep.header.sessionType}`);
check(rep.performance.length === 3, '3 performans bloğu', rep.performance.map((p) => `%${p.scorePct}`).join(' '));
check(rep.injury.risk === 'DÜŞÜK' || rep.injury.risk === 'ORTA', 'Sakatlık riski bloğu', rep.injury.risk);
check(rep.development.aiAdvice.includes('Gelecek antrenmanlarda'), 'AI tavsiye metni', rep.development.aiAdvice.slice(0, 44));
check(rep.trends.length === 3 && rep.trends[0].today.length > 0, 'Tarihsel kıyas tablosu', rep.trends.map((t) => t.label.split(' ')[0]).join(' • '));
check(rep.notification.includes('SportVisionX'), 'Telefon bildirim metni', rep.notification.slice(0, 40));

// 3) Trend delta
check(deltaPct(191, 210) === -9, 'Delta yüzde hesabı', `${deltaPct(191, 210)}% (GCT azalma = çeviklik)`);

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/14 geçti`);
console.log(livePerformanceHubStatus());
console.log(postSessionReportStatus());
process.exit(pass === 14 ? 0 : 1);
