// ============================================================================
// ⚙️ WORKFLOW RECIPE ENGINE SMOKE TESTİ
// Recorder • JSON parse • Deterministik exec • Koşul tetikleme • $0 maliyet
// Çalıştırma: npx tsx scripts/workflowRecipeSmokeTest.mts
// ============================================================================
import { RecipeRecorder, executeRecipe, getRecipeById, BUILT_IN_RECIPES, workflowRecipeEngineStatus } from '../src/app/lib/sports/automation/workflowRecipeEngine';
import { validateRecipe } from '../src/app/lib/sports/automation/workflowRecipeSchema';
import type { TelemetryContext } from '../src/app/lib/sports/automation/workflowRecipeEngine';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// ── 1. RECORDER: antrenör iş akışını JSON recipe'ye derle ──────────────────
const rec = new RecipeRecorder('Maç Sonrası Analiz', 'Veli raporu zinciri');
rec.recordStep('INGEST_TELEMETRY', 'Veri topla', { source: 'insole' })
  .recordStep('CALCULATE_BIOMECHANICS', 'GCT/RSI hesapla', {})
  .recordStep('EXPORT_PDF', 'PDF çıkar', {})
  .recordStep('TRIGGER_NOTIFICATION', 'Veliyi uyar', { channel: 'whatsapp' }, [{ metric: 'rsi', operator: 'LT', value: 1.5, thenAction: 'TRIGGER_NOTIFICATION' }]);
const json = rec.toJson();
check(rec.stepCount === 4, 'Recorder 4 adım kaydetti', `${rec.stepCount} adım`);

// ── 2. JSON PARSE + ŞEMA DOĞRULAMA ─────────────────────────────────────────
const parsed = JSON.parse(json);
const v = validateRecipe(parsed);
check(v.ok === true, 'Kaydedilen recipe JSON parse + geçerli', `id: ${parsed.id}`);
check(parsed.steps[0].action === 'INGEST_TELEMETRY' && parsed.steps[3].conditions?.length === 1, 'Action + condition şeması korundu', '');
const invalid = validateRecipe({ id: 'x', steps: [{ id: 's', action: 'HACK_LLM', params: {} }] });
check(invalid.ok === false, 'Geçersiz action reddedildi', invalid.errors[0]);

// ── 3. DETERMİNİSTİK EXECUTOR (aynı girdi → aynı çıktı) ─────────────────────
const ctx: TelemetryContext = { athlete: 'Arda G.', gctMs: 208, rsi: 1.4, hr: 172, heelPct: 56, loadingKnS: 2.6, acwr: 1.6, sessionMinutes: 45 };
const r1 = executeRecipe(parsed, ctx);
const r2 = executeRecipe(parsed, ctx);
check(r1.runtimeCost === 0, 'Runtime maliyeti $0 (LLM çağrısı yok)', `$${r1.runtimeCost}`);
check(JSON.stringify(r1.outputs) === JSON.stringify(r2.outputs), 'Deterministik: 2 çalıştırma aynı çıktı', '');
check(r1.stepsExecuted === 4, '4 adım çalıştı', `${r1.stepsExecuted} adım`);
check(r1.outputs['pdf'] !== undefined, 'PDF çıktısı üretildi', String(r1.outputs['pdf']).slice(0, 40));
check(r1.alerts.length >= 1, 'Koşul tetiklendi (RSI<1.5 → ekstra alarm)', `${r1.alerts.length} alarm`);

// ── 4. HAZIR RECIPE'LER ─────────────────────────────────────────────────────
check(BUILT_IN_RECIPES.length === 2, '2 hazır recipe yüklendi', BUILT_IN_RECIPES.map((r) => r.id).join(', '));
const screen = getRecipeById('injury_screen_recipe')!;
const risky = executeRecipe(screen, { athlete: 'Efe', gctMs: 190, rsi: 1.8, hr: 160, heelPct: 30, loadingKnS: 2.9, acwr: 1.7, sessionMinutes: 60 });
check(risky.alerts.some((a) => a.includes('AUDIO')), 'Injury screen: yüksek risk → sesli alarm', risky.alerts.join(' | '));
const safe = executeRecipe(screen, { athlete: 'Efe', gctMs: 185, rsi: 1.9, hr: 150, heelPct: 25, loadingKnS: 1.9, acwr: 0.9, sessionMinutes: 60 });
check(safe.alerts.length === 0, 'Düşük risk → alarm yok', `${safe.alerts.length} alarm`);

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/12 geçti`);
console.log(workflowRecipeEngineStatus());
process.exit(pass === 12 ? 0 : 1);
