// ============================================================================
// 🛠️ TRACK 8 — BATCH 20 SMOKE TESTİ (Adım 96-100)
// Güvenlik Headers • Sanitizer/Rate Limit • PWA Stratejileri • Bundle Bütçe • E2E
// Çalıştırma: node scripts/track8Batch20SmokeTest.mts
// ============================================================================
import { defaultSecurityHeaders, buildCsp, auditSecurityHeaders } from '../src/app/lib/security/securityHeadersEngine.ts';
import { isSqlInjectionRisk, sanitizeSql, sanitizeHtml, sanitizePrototypePollution, TokenBucketRateLimiter } from '../src/app/lib/security/inputSanitizer.ts';
import { strategyFor, buildCachePolicy, registerServiceWorker, PWA_CACHE_ROUTES } from '../src/app/lib/pwa/pwaServiceWorkerManager.ts';
import { computeBundleReport, verifyBundleBudget, BUNDLE_BUDGET_KB } from '../src/app/lib/ui/bundleOptimizationReport.ts';
import { runE2EScenarios } from '../e2e/courtSessionE2E.spec.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 96a: GÜVENLİK HEADERS ────────────────────────────────────────────────
const headers = defaultSecurityHeaders();
check('96a. 6 strict başlık + CSP/HSTS içerik', Object.keys(headers).length === 6 && headers['Content-Security-Policy'].includes("default-src 'self'") && headers['Strict-Transport-Security'].includes('preload') && headers['X-Frame-Options'] === 'DENY');
const csp = buildCsp({ frameAncestors: ["'none'"] });
check('96b. Özel CSP direktifleri', csp.includes("frame-ancestors 'none'") && csp.includes('object-src') && csp.includes('base-uri'));
const audit = auditSecurityHeaders({ 'Content-Security-Policy': headers['Content-Security-Policy'] });
check('96c. Eksik başlık denetimi + tam set pass', audit.missing.length === 5 && auditSecurityHeaders(headers).pass === true);

// ── ADIM 96b: SANİTIZER + RATE LIMIT ──────────────────────────────────────────
check('96d. SQLi risk tespiti + sanitizasyon', isSqlInjectionRisk('SELECT * FROM users') === true && sanitizeSql("x'; DROP TABLE--") === "x'' DROP TABLE");
check('96e. XSS escape', sanitizeHtml('<script>alert(1)</script>') === '&lt;script&gt;alert(1)&lt;/script&gt;');
check('96f. Prototype pollution temizliği', JSON.stringify(sanitizePrototypePollution(JSON.parse('{"a":1,"__proto__":{"polluted":true}}'))) === JSON.stringify({ a: 1 }));
const limiter = new TokenBucketRateLimiter(3, 0);
check('96g. Token bucket: 3 kabul + 4. red', limiter.tryConsume() === true && limiter.tryConsume() === true && limiter.tryConsume() === true && limiter.tryConsume() === false && limiter.stats().rejected === 1);

// ── ADIM 97: PWA STRATEJİLERİ ─────────────────────────────────────────────────
check('97a. 3 cache rotası', PWA_CACHE_ROUTES.length === 3 && strategyFor('app.js')?.strategy === 'cache-first' && strategyFor('/api/v1/roster')?.strategy === 'network-first' && strategyFor('/')?.strategy === 'stale-while-revalidate');
const policy = buildCachePolicy('/assets/foot.glb');
check('97b. Cache policy notu (3D statik)', policy.strategy === 'cache-first' && policy.ttlSec === 86_400 && policy.note.includes('3D'));
check('97c. SW kaydı node ortamında güvenli no-op', registerServiceWorker().ok === true && registerServiceWorker().registered === false);

// ── ADIM 99: BUNDLE BÜTÇE ─────────────────────────────────────────────────────
const report = computeBundleReport();
check('99a. 4 ağır modül lazy, 250KB tasarruf', report.lazyModules === 4 && report.lazySavedKb === 250);
check(`99b. Başlangıç bundle ${report.initialBundleKb}KB < ${BUNDLE_BUDGET_KB}KB`, report.underBudget === true && report.initialBundleKb === 144);
const budget = verifyBundleBudget();
check('99c. Bütçe denetimi ok', budget.ok === true && budget.message.includes('lazy-load'));

// ── ADIM 98: E2E SENARYOLAR ───────────────────────────────────────────────────
const e2e = await runE2EScenarios();
check('98a. 3 E2E senaryo (Koç/Veli/Offline Sync)', e2e.every((s) => s.ok) && e2e.length === 3, `${e2e.filter((s) => s.ok).length}/3`);

// ── ADIM 100: RUNBOOK + MASTER VERIFY MEVCUT ──────────────────────────────────
const { existsSync } = await import('node:fs');
check('100a. Runbook + master verification dosyaları', existsSync('../../docs/PRODUCTION_OPERATIONS_RUNBOOK.md') && existsSync('scripts/master100StepVerification.mts') && existsSync('scripts/runE2eHeadless.mts'));

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);
