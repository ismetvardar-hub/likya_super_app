// ============================================================================
// 💬 SADE DİL KATMANI + PORTAL MOTORLARI SMOKE TESTİ
// Çalıştırma: npx tsx scripts/customerPortalsSmokeTest.mts
// ============================================================================
import { gctPlain, footStrikePlain, rsiPlain, loadingRatePlain, hrvDropPlain, heartRatePlain, plainLanguageStatus } from '../src/app/lib/sports/plainLanguage';
import { generateLiveHubSnapshot } from '../src/app/lib/sports/livePerformanceHub';
import { generatePostSessionReport } from '../src/app/lib/sports/postSessionReport';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// 1) GCT < 200 → Patlayıcı
const g1 = gctPlain(185);
check(g1.title.includes('Patlayıcı') && g1.level === 'ELIT', 'GCT <200ms → 🚀 Patlayıcı Basış', g1.title);
// 2) Heel > 50 → Diz riski
const f1 = footStrikePlain(60);
check(f1.title.includes('Topuk') && f1.level === 'DIKKAT', 'Topuk >%50 → ⚠️ diz riski', f1.title);
// 3) RSI > 2.0 → Elit
const r1 = rsiPlain(2.3);
check(r1.title.includes('Elit') && r1.level === 'ELIT', 'RSI >2.0 → ⭐ Elit', r1.title);
// 4) Loading > 2.5 → Yumuşak adımla
const l1 = loadingRatePlain(2.8);
check(l1.title.includes('Zemin Darbesi Yüksek') && l1.level === 'RISK', 'Loading >2.5 → 🟡 yumuşak adımla', l1.title);
// 5) HRV drop > 20% → Mola
const h1 = hrvDropPlain(36, 50);
check(h1.title.includes('Mola') && h1.level === 'RISK', 'HRV drop >%20 → 🔋 mola', h1.title);
// 6) Canlı hub + sade çeviri birlikte çalışır
const hub = generateLiveHubSnapshot(2);
const g2 = gctPlain(hub.comparison.gctMs);
check(g2.detail.includes('ms'), 'Canlı hub → sade dil akışı', `${g2.emoji} ${g2.title} (${hub.comparison.gctMs}ms)`);
// 7) Portal veri kaynakları
const rep = generatePostSessionReport(1);
check(rep.development.aiAdvice.length > 20, 'Antrenör rapor onayı kaynağı', rep.development.aiAdvice.slice(0, 40));
// 8) Nabız zonları
const hr = heartRatePlain(172);
check(hr.title.includes('Anaerobik') || hr.title.includes('Maksimum'), 'Nabız sade zon', `${hr.emoji} ${hr.title}`);

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/8 geçti`);
console.log(plainLanguageStatus());
process.exit(pass === 8 ? 0 : 1);
