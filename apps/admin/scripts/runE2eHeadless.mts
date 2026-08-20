// ============================================================================
// 🧪 E2E HEADLESS RUNNER (Adım 98) — Playwright tarayıcı akışlarının CI karşılığı
// Çalıştırma: node scripts/runE2eHeadless.mts
// ============================================================================
import { runE2EScenarios } from '../e2e/courtSessionE2E.spec.ts';

const results = await runE2EScenarios();
let pass = 0;
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'} - ${r.id} ${r.name} — ${r.detail}`);
  if (r.ok) pass++;
}
console.log(`\nE2E SONUCU: ${pass}/${results.length} senaryo geçti`);
process.exit(pass === results.length ? 0 : 1);
