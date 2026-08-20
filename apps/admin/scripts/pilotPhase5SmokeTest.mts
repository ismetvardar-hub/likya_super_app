// ============================================================================
// 🚀 PİLOT FAZ 5 SMOKE TESTİ — TRACK 12 UÇTAN UCA (Adım 121-125)
// OpenRouter istek/yanıt serileştirme + çok-tier seçim • ardışık sağlayıcı
// kesintilerinde failover • günlük bütçe limiti + yerel kural motoru •
// semantik cache hit intercept ($0) • Ghost Avatar orkestratörü + Track 12
// bütünlüğü. Çalıştırma: node scripts/pilotPhase5SmokeTest.mts
// ============================================================================
import { existsSync } from 'node:fs';
import {
  GATEWAY_TIERS, GATEWAY_TIER_ORDER, primaryModel, fallbackModels, tierLatencyBudget,
  FAST_TACTICAL_LATENCY_BUDGET_MS, mockSportsCompletion, OpenRouterGateway,
} from '../src/app/lib/ai/openRouterGateway.ts';
import { AiCostTracker, ACADEMY_DAILY_BUDGET_USD, type TokenUsage } from '../src/app/lib/ai/aiCostTracker.ts';
import { OpenRouterCacheInterceptor } from '../src/app/lib/ai/openRouterCacheInterceptor.ts';
import { GhostAvatarOrchestrator } from '../src/app/lib/ai/ghostAvatarOrchestrator.ts';
import { SemanticQueryCache, type TelemetryProfile } from '../src/app/lib/ai/cache/semanticQueryCache.ts';
import { type FatigueModelInput } from '../src/app/lib/ai/inMatchFatigueAdvisor.ts';
import { SeasonMemoryBuffer } from '../src/app/lib/sports/avatar/seasonMemoryBuffer.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

const okResponse = { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: 'OK' } }], usage: { prompt_tokens: 40, completion_tokens: 15 } }) } as unknown as Response;
const fail503 = { ok: false, status: 503 } as Response;

// ── ADIM 121: OPENROUTER GATEWAY CLIENT ─────────────────────────────────────
check('121a. 3 tier + birincil modeller + FAST <400ms bütçe', GATEWAY_TIER_ORDER.length === 3 && primaryModel('FAST_TACTICAL') === 'google/gemini-2.0-flash-001' && primaryModel('DEEP_REASONING') === 'anthropic/claude-3.7-sonnet' && primaryModel('VISION_MULTIMODAL') === 'openai/gpt-4o' && FAST_TACTICAL_LATENCY_BUDGET_MS === 400 && tierLatencyBudget('FAST_TACTICAL') === 400 && tierLatencyBudget('VISION_MULTIMODAL') === 1500);
check('121b. Fallback dizileri: haiku/r1/gemini-pro-vision', fallbackModels('FAST_TACTICAL').includes('anthropic/claude-3.5-haiku') && fallbackModels('DEEP_REASONING').includes('deepseek/deepseek-r1') && fallbackModels('VISION_MULTIMODAL').includes('google/gemini-pro-vision'));

let capturedBody: Record<string, unknown> | null = null;
const captureGw = new OpenRouterGateway({ apiKey: 'sk-test', fetchFn: async (url, init) => { capturedBody = JSON.parse(String(init.body)); return okResponse; }, sleepFn: async () => {} });
const serialized = await captureGw.complete({ prompt: 'mola önerisi', systemPrompt: 'sistem', tier: 'DEEP_REASONING', maxTokens: 512 });
const msg = capturedBody?.messages as { role: string; content: string }[];
check('121c. İstek serileştirme: model + system/user + max_tokens + usage parse', capturedBody?.model === 'anthropic/claude-3.7-sonnet' && msg?.length === 2 && msg[0].role === 'system' && msg[1].content === 'mola önerisi' && capturedBody?.max_tokens === 512 && serialized.usage.totalTokens === 55 && serialized.simulated === false);

const outageQueue = [503, 503, 200];
let outageIdx = 0;
const outageGw = new OpenRouterGateway({ apiKey: 'sk-test', fetchFn: async () => { const c = outageQueue[outageIdx++]; return c === 200 ? okResponse : fail503; }, sleepFn: async () => {}, backoffBaseMs: 1 });
const retried = await outageGw.complete({ prompt: 'x', tier: 'FAST_TACTICAL' });
const allDownGw = new OpenRouterGateway({ apiKey: 'sk-test', fetchFn: async () => fail503, sleepFn: async () => {}, backoffBaseMs: 1 });
const allDown = await allDownGw.complete({ prompt: 'x', tier: 'FAST_TACTICAL' });
check('121d. Ardışık 503 kesintilerinde failover: 3. denemede başarı + 3/3 kapalı → mock sandbox', retried.attempts === 3 && retried.model === 'meta-llama/llama-3.3-70b-instruct:free' && retried.fallbackLog.length === 2 && allDown.simulated === true && allDown.attempts === 3 && allDown.fallbackLog.length === 3 && allDown.content.includes('[Sandbox Mock'));
// ── ADIM 122: TOKEN/GECİKME/COST + GÜNLÜK BÜTÇE ─────────────────────────────
const bigUsage: TokenUsage = { promptTokens: 200_000, completionTokens: 100_000, totalTokens: 300_000 };
const tracker = new AiCostTracker();
tracker.setDailyBudget('lara', 2.0); // $2.00/gün akademi limiti
const c1 = tracker.recordUsage('lara', 'openai/gpt-4o', bigUsage, 180); // $1.50
const c2 = tracker.recordUsage('lara', 'openai/gpt-4o', bigUsage, 220); // $3.00 → limit aşıldı
check('122a. Akademi limiti $2.00: 1. çağrı içinde, 2. çağrıda exceeded', c1.scope.exceeded === false && c2.scope.exceeded === true && tracker.dailyBudget('lara').capUsd === 2 && tracker.dailyBudget('lara').usedUsd === 3 && tracker.usage('lara')?.avgLatencyMs === 200 && tracker.usage('lara')?.totalTokens === 600_000 && ACADEMY_DAILY_BUDGET_USD === 2);

let budgetNetCalls = 0;
const budgetTracker = new AiCostTracker();
budgetTracker.setDailyBudget('belek', 2.0);
budgetTracker.recordUsage('belek', 'openai/gpt-4o', { promptTokens: 500_000, completionTokens: 250_000, totalTokens: 750_000 }, 150); // $3.75 > $2
const budgetGw = new OpenRouterGateway({ apiKey: 'sk-test', fetchFn: async () => { budgetNetCalls++; return okResponse; }, sleepFn: async () => {} }, budgetTracker);
const budgetBlocked = await budgetGw.complete({ prompt: 'x', tier: 'FAST_TACTICAL', scopeId: 'belek' });
check('122b. Bütçe aşımı → dış çağrı YAPILMAZ, yerel kural motoru devreye girer', budgetBlocked.simulated === true && budgetBlocked.fallbackLog[0].includes('yerel kural motoru') && budgetNetCalls === 0 && budgetGw.callCount() === 0);

// ── ADIM 123: SIFIR-MALİYET SEMANTİK CACHE INTERCEPT ────────────────────────
const interceptorGw = new OpenRouterGateway({ forceMock: true });
const interceptor = new OpenRouterCacheInterceptor(interceptorGw, new SemanticQueryCache());
const twinProfile: TelemetryProfile = { athleteId: 'at-1', version: 1, metrics: { gct: 221, trimp: 160 } };
const missRes = await interceptor.interpret(twinProfile, { tier: 'FAST_TACTICAL' }, 'yorum isteği', 'lara');
const hitRes = await interceptor.interpret(twinProfile, { tier: 'FAST_TACTICAL' }, 'yorum isteği', 'lara');
check('123a. Intercept: miss → gateway + cache yaz · hit → $0 / 0ms bypass', missRes.hit === false && missRes.tokensSpent > 0 && hitRes.hit === true && hitRes.tokensSpent === 0 && hitRes.costUsd === 0 && hitRes.model === 'semantic-cache' && interceptor.stats().hits === 1 && interceptor.stats().bypassedExternalCalls === 1 && interceptor.stats().misses === 1);
const interceptorGw2 = new OpenRouterGateway({ forceMock: true });
const interceptor2 = new OpenRouterCacheInterceptor(interceptorGw2, new SemanticQueryCache());
const miss2 = await interceptor2.interpret({ athleteId: 'a2', version: 1, metrics: { x: 1 } }, { tier: 'VISION_MULTIMODAL' }, 'kare yorumu');
check('123b. Tier aktarımı: VISION_MULTIMODAL mock içeriği korunur', miss2.hit === false && miss2.interpretation.includes('VISION_MULTIMODAL'));
// ── ADIM 124: GHOST AVATAR & TAKTİK DANIŞMAN ÇOK-MODELLİ ORKESTRASYON ───────
const fatigueInput: FatigueModelInput = { gctBaselineMs: 214, gctCurrentMs: 238, gctElongationVelocityMsPerSet: 3, activeDecelsPerSet: 20, cardioDriftBpm: 12, setMinutesPlayed: 20 };
const orch = new GhostAvatarOrchestrator({ gateway: new OpenRouterGateway({ forceMock: true }), academyScopeId: 'lara' });
const m1 = await orch.matchTacticalInsight(fatigueInput);
const m2 = await orch.matchTacticalInsight(fatigueInput);
check('124a. Yorgunluk → FAST_TACTICAL + cache-first (hit → $0)', m1.fromCache === false && m1.tier === 'FAST_TACTICAL' && m1.text.includes('FAST_TACTICAL') && m2.fromCache === true && m2.tokensSpent === 0 && orch.interceptorStats().hits === 1);

const seasonMemory = new SeasonMemoryBuffer();
seasonMemory.recordSession('at-1');
seasonMemory.recordFlaw('at-1', 'Yüksek GCT');
const orchSeason = new GhostAvatarOrchestrator({ gateway: new OpenRouterGateway({ forceMock: true }), seasonMemory });
const s1 = await orchSeason.seasonDevelopmentSummary('at-1');
const s2 = await orchSeason.seasonDevelopmentSummary('at-1');
check('124b. Sezon hafıza → DEEP_REASONING (miss → hit, $0)', s1.tier === 'DEEP_REASONING' && s1.text.includes('DEEP_REASONING') && s2.fromCache === true && s2.tokensSpent === 0);
const sc = await orchSeason.scoutingSummary('at-1', { speedKmh: 28, reactivePower: 2.1, strikeMechanics: 78, staminaIndex: 72, mentalResilience: 80 });
check('124c. Scout raporu → DEEP_REASONING + cache-first', sc.tier === 'DEEP_REASONING' && sc.text.includes('DEEP_REASONING') && sc.fromCache === false);

let budgetNetCalls2 = 0;
const budgetOrch = new GhostAvatarOrchestrator({
  gateway: new OpenRouterGateway({ apiKey: 'sk-test', fetchFn: async () => { budgetNetCalls2++; return okResponse; }, sleepFn: async () => {} }),
  academyScopeId: 'belek',
  academyDailyBudgetUsd: 0.000001,
});
await budgetOrch.matchTacticalInsight(fatigueInput); // ağ çağrısı 1 → maliyet limiti aşar
const budgeted = await budgetOrch.matchTacticalInsight({ ...fatigueInput, gctElongationVelocityMsPerSet: 5 }); // yeni profil → cache miss → bütçe bloğu
check('124d. Bütçe aşımı → yerel kural motoru (ağ çağrısı yapılmaz)', budgeted.fromCache === false && budgeted.budgetEnforced === true && budgetNetCalls2 === 1 && budgetOrch.budgetStatus().exceeded === true);

// ── ADIM 125: TRACK 12 UÇTAN UCA BÜTÜNLÜK ───────────────────────────────────
const track12Files = [
  'src/app/lib/ai/openRouterGateway.ts',
  'src/app/lib/ai/aiCostTracker.ts',
  'src/app/lib/ai/openRouterCacheInterceptor.ts',
  'src/app/lib/ai/ghostAvatarOrchestrator.ts',
  'src/app/lib/ai/cache/semanticQueryCache.ts',
  'scripts/pilotPhase5SmokeTest.mts',
];
check('125a. Track 12 dosyaları: gateway + cost + interceptor + orkestratör mevcut', track12Files.every((f) => existsSync(f)));
const cross = missRes.hit === false && hitRes.hit === true && retried.attempts === 3 && allDown.simulated === true && tracker.dailyBudget('lara').exceeded === true && m1.tier === 'FAST_TACTICAL' && s1.tier === 'DEEP_REASONING' && sc.tier === 'DEEP_REASONING';
check('125b. Track 12 veri hattı: gateway + bütçe + cache + orkestratör uçtan uca', cross === true);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);


