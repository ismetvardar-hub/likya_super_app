// ============================================================================
// 🚀 OPENROUTER GATEWAY SMOKE TESTİ
// Tier model yönlendirme + custom fallback • mock offline tamamlama + token
// bütçe takibi • semantik cache hit bypass ($0 token). Çalıştırma:
// node scripts/openRouterGatewaySmokeTest.mts
// ============================================================================
import {
  GATEWAY_TIERS, GATEWAY_TIER_ORDER, primaryModel, fallbackModels, resolveModelChain,
  mockSportsCompletion, OpenRouterGateway, OPENROUTER_BASE_URL,
} from '../src/app/lib/ai/openRouterGateway.ts';
import {
  AiCostTracker, costForModel, estimateTokens, DEFAULT_DAILY_BUDGET_USD,
  type TokenUsage,
} from '../src/app/lib/ai/aiCostTracker.ts';
import { SemanticQueryCache, type TelemetryProfile } from '../src/app/lib/ai/cache/semanticQueryCache.ts';
import { fatigueTacticalInsight, type FatigueModelInput } from '../src/app/lib/ai/inMatchFatigueAdvisor.ts';
import { SeasonMemoryBuffer } from '../src/app/lib/sports/avatar/seasonMemoryBuffer.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── 1. TIER MODEL YÖNLENDİRME ────────────────────────────────────────────────
check('1a. 3 tier preset + birincil modeller', GATEWAY_TIER_ORDER.length === 3 && GATEWAY_TIERS.FAST_TACTICAL !== undefined && primaryModel('FAST_TACTICAL') === 'google/gemini-2.0-flash-001' && primaryModel('DEEP_REASONING') === 'anthropic/claude-3.7-sonnet' && primaryModel('VISION_MULTIMODAL') === 'openai/gpt-4o');
check('1b. Fallback zincirleri: haiku/deepseek-r1/gemini-pro-vision', fallbackModels('FAST_TACTICAL').includes('anthropic/claude-3.5-haiku') && fallbackModels('DEEP_REASONING').includes('deepseek/deepseek-r1') && fallbackModels('VISION_MULTIMODAL').includes('google/gemini-pro-vision'));
check('1c. Custom fallback override + base URL', resolveModelChain('DEEP_REASONING', ['custom/model-x']).join(',') === 'anthropic/claude-3.7-sonnet,custom/model-x' && OPENROUTER_BASE_URL === 'https://openrouter.ai/api/v1');

// ── 2. OTOMATİK FAILOVER (rate-limit → fallback, üstel backoff) ──────────────
const okResponse = { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: 'FAILOVER OK' } }], usage: { prompt_tokens: 20, completion_tokens: 10 } }) } as unknown as Response;
const failResponse = { ok: false, status: 429 } as Response;
const failoverQueue: (() => Promise<Response>)[] = [() => Promise.resolve(failResponse), () => Promise.resolve(okResponse)];
const gw = new OpenRouterGateway({ apiKey: 'sk-test', fetchFn: () => failoverQueue.shift()!(), sleepFn: async () => {}, backoffBaseMs: 1 });
const failover = await gw.complete({ prompt: 'set arası öneri', tier: 'FAST_TACTICAL' });
check('2a. 429 → fallback: attempts 2, model haiku, içerik FAILOVER OK', failover.attempts === 2 && failover.model === 'anthropic/claude-3.5-haiku' && failover.content === 'FAILOVER OK' && failover.simulated === false && failover.fallbackLog.length === 1 && failover.fallbackLog[0].includes('http_429'));
const customQueue: (() => Promise<Response>)[] = [() => Promise.resolve(failResponse), () => Promise.resolve(okResponse)];
const gwCustom = new OpenRouterGateway({ apiKey: 'sk-test', fetchFn: () => customQueue.shift()!(), sleepFn: async () => {}, backoffBaseMs: 1 });
const custom = await gwCustom.complete({ prompt: 'scout raporu', tier: 'DEEP_REASONING', customFallback: ['custom/model-x'] });
check('2b. Custom fallback zinciri: birincil başarısız → custom model devrede', custom.attempts === 2 && custom.model === 'custom/model-x' && custom.fallbackLog.length === 1);
// ── 3. MOCK OFFLINE TAMAMLAMA + TOKEN BÜTÇE TAKİBİ ──────────────────────────
const mockGw = new OpenRouterGateway({ forceMock: true });
const mockResult = await mockGw.complete({ prompt: 'drill sonrası öneri', tier: 'FAST_TACTICAL' });
check('3a. Mock sandbox: simüle + deterministik marker + ok', mockResult.simulated === true && mockResult.ok === true && mockResult.content.includes('[Sandbox Mock · FAST_TACTICAL]') && mockResult.model === 'google/gemini-2.0-flash-001' && mockResult.attempts === 1);
check('3b. Tier bazlı mock içerik: DEEP/VISION marker', mockSportsCompletion('x', 'DEEP_REASONING').includes('[Sandbox Mock · DEEP_REASONING]') && mockSportsCompletion('x', 'VISION_MULTIMODAL').includes('[Sandbox Mock · VISION_MULTIMODAL]'));
const usage: TokenUsage = { promptTokens: 1000, completionTokens: 500, totalTokens: 1500 };
check('3c. Cost hesabı: gpt-4o 1000+500 token → $0.0075 · ücretsiz model → $0', costForModel('openai/gpt-4o', usage).totalCostUsd === 0.0075 && costForModel('meta-llama/llama-3.3-70b-instruct:free', usage).totalCostUsd === 0 && estimateTokens('abcdefgh') === 2);
const tracker = new AiCostTracker();
tracker.setDailyBudget('antalya', 0.02);
tracker.recordUsage('antalya', 'openai/gpt-4o', usage, 120);
tracker.recordUsage('antalya', 'openai/gpt-4o', usage, 80);
const budgetAfter = tracker.dailyBudget('antalya');
const exceeded = tracker.recordUsage('antalya', 'openai/gpt-4o', usage, 60);
check('3d. Günlük bütçe: 0.015$ < 0.02$ kapsamda · 3. çağrıda 0.0225$ → exceeded', budgetAfter.exceeded === false && exceeded.scope.exceeded === true && tracker.dailyBudget('antalya').exceeded === true && DEFAULT_DAILY_BUDGET_USD === 5);
check('3e. Token + gecikme toplama: 4500 token, ortalama 87ms, 3 çağrı', tracker.usage('antalya')?.totalTokens === 4500 && tracker.usage('antalya')?.avgLatencyMs === 87 && tracker.usage('antalya')?.calls === 3 && tracker.usage('antalya')?.lastModel === 'openai/gpt-4o');
// ── 4. SEMANTİK CACHE HIT BYPASS ($0 TOKEN) ─────────────────────────────────
const cache = new SemanticQueryCache();
const prof: TelemetryProfile = { athleteId: 'a1', metrics: { gct: 220, trimp: 150 } };
const profKey = cache.fingerprint(prof);
await cache.set(profKey, { key: profKey, interpretation: 'yorum', insight: 'içgörü', generatedAt: '2026-08-20', tokensSaved: 120 });
const cachedHit = await cache.get(profKey);
check('4a. Cache set → get: hit + tokensSaved + hitRate %100', cachedHit?.interpretation === 'yorum' && cache.stats().hits === 1 && cache.stats().tokensSaved === 120 && cache.stats().hitRatePct === 100);

const fatigueInput: FatigueModelInput = { gctBaselineMs: 214, gctCurrentMs: 238, gctElongationVelocityMsPerSet: 3, activeDecelsPerSet: 20, cardioDriftBpm: 12, setMinutesPlayed: 20 };
const fatigueCache = new SemanticQueryCache();
const fatigueGw = new OpenRouterGateway({ forceMock: true });
const insight1 = await fatigueTacticalInsight(fatigueInput, { gateway: fatigueGw, cache: fatigueCache });
const insight2 = await fatigueTacticalInsight(fatigueInput, { gateway: fatigueGw, cache: fatigueCache });
check('4b. Yorgunluk içgörüsü: miss → gateway (token harcandı), hit → $0 bypass', insight1.fromCache === false && insight1.tokensSpent > 0 && insight2.fromCache === true && insight2.tokensSpent === 0 && insight2.costUsd === 0 && insight2.model === 'semantic-cache' && fatigueCache.stats().misses === 1 && fatigueCache.stats().hits === 1);

const buffer = new SeasonMemoryBuffer();
buffer.recordSession('at-1');
buffer.recordFlaw('at-1', 'Yüksek GCT');
const seasonCache = new SemanticQueryCache();
const seasonGw = new OpenRouterGateway({ forceMock: true });
const season1 = await buffer.seasonInsightWithGateway('at-1', { gateway: seasonGw, cache: seasonCache });
const season2 = await buffer.seasonInsightWithGateway('at-1', { gateway: seasonGw, cache: seasonCache });
check('4c. Sezon hafıza entegrasyonu: DEEP_REASONING miss → hit ($0)', season1.fromCache === false && season1.text.includes('DEEP_REASONING') && season2.fromCache === true && season2.tokensSpent === 0 && seasonCache.stats().hits === 1);

// ── 5. GATEWAY SCOPE COST KAYDI ──────────────────────────────────────────────
const costGw = new OpenRouterGateway({ apiKey: 'sk-test', fetchFn: () => Promise.resolve(okResponse), sleepFn: async () => {} });
await costGw.complete({ prompt: 'kort 4 öneri', tier: 'FAST_TACTICAL', scopeId: 'lara' });
const laraUsage = costGw.costTracker().usage('lara');
check('5a. Gateway → cost tracker kaydı (scope lara): çağrı + model + token', laraUsage?.calls === 1 && laraUsage?.lastModel === 'google/gemini-2.0-flash-001' && laraUsage?.totalTokens === 30 && costGw.callCount() === 1);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);


