// ============================================================================
// ⚙️ WORKFLOW RECIPE ENGINE — Ghost OS tarzı sıfır maliyetli otomasyon
// Recorder: Antrenörün çok adımlı iş akışını JSON recipe'ye derler
// Executor: Kayıtlı recipe'yi yeni telemetri üzerinde DETERMİNİSTİK oynatır ($0)
// LLM çağrısı YOK — tüm hesap yerel, her çalıştırma aynı girdide aynı çıktı
// ============================================================================
import { validateRecipe, type RecipeStep, type WorkflowRecipe, type RecipeCondition } from './workflowRecipeSchema';

export interface TelemetryContext {
  athlete: string;
  gctMs: number;
  rsi: number;
  hr: number;
  heelPct: number;
  loadingKnS: number;
  acwr: number;
  sessionMinutes: number;
  matchDate?: string;
}

export interface RecipeRunResult {
  recipeId: string;
  runtimeCost: number;
  startedAt: string;
  finishedAt: string;
  stepsExecuted: number;
  outputs: Record<string, unknown>;
  alerts: string[];
}

type RunBag = { ctx: TelemetryContext; outputs: Record<string, unknown>; alerts: string[] };

function handlerIngest(bag: RunBag, params: RecipeStep['params']): unknown {
  const source = String(params.source ?? 'sensor');
  bag.outputs['telemetry'] = { source, ...bag.ctx };
  return bag.outputs['telemetry'];
}
function handlerFilter(bag: RunBag): unknown {
  const t = bag.outputs['telemetry'] as TelemetryContext | undefined;
  if (!t) return null;
  const raw = t as unknown as Record<string, unknown>;
  return Object.fromEntries(Object.entries(raw).filter(([k]) => !['matchDate', 'sessionMinutes'].includes(k)));
}
function handlerBiomechanics(bag: RunBag): unknown {
  const t = (bag.outputs['telemetry'] ?? bag.ctx) as TelemetryContext;
  const calc = {
    gctMs: Math.round(t.gctMs),
    rsi: Math.round(t.rsi * 100) / 100,
    heelPct: t.heelPct,
    loadingKnS: Math.round(t.loadingKnS * 100) / 100,
    reactionQuality: t.gctMs <= 200 && t.rsi >= 1.5 ? 'GOOD' : 'POOR',
  };
  bag.outputs['biomechanics'] = calc;
  return calc;
}
function handlerReport(bag: RunBag): unknown {
  const b = bag.outputs['biomechanics'] as { gctMs: number; rsi: number; reactionQuality: string } | undefined;
  const t = (bag.outputs['telemetry'] ?? bag.ctx) as TelemetryContext;
  const report = `Rapor: ${t.athlete} — GCT ${b?.gctMs ?? t.gctMs}ms, RSI ${b?.rsi ?? t.rsi}, ${b?.reactionQuality ?? '-'}. ${t.acwr >= 1.2 ? 'Yuk korumasi onerilir.' : 'Yuk dengesi normal.'}`;
  bag.outputs['report'] = report;
  return report;
}
function handlerPdf(bag: RunBag): unknown {
  const report = String(bag.outputs['report'] ?? 'Rapor yok');
  const pdf = `PDF[${bag.ctx.athlete}]: ${report.length} karakter — sade dil sezon ozeti`;
  bag.outputs['pdf'] = pdf;
  return pdf;
}
function handlerNotification(bag: RunBag, params: RecipeStep['params']): unknown {
  const channel = String(params.channel ?? 'none');
  const message = String(params.message ?? 'Uyari');
  bag.alerts.push(`${channel.toUpperCase()}: ${message}`);
  return { channel, message };
}

const HANDLERS: Record<string, (bag: RunBag, params: RecipeStep['params']) => unknown> = {
  INGEST_TELEMETRY: handlerIngest,
  APPLY_FILTER: handlerFilter,
  CALCULATE_BIOMECHANICS: handlerBiomechanics,
  GENERATE_PLAIN_REPORT: handlerReport,
  EXPORT_PDF: handlerPdf,
  TRIGGER_NOTIFICATION: handlerNotification,
};

// ── Koşul değerlendirme (deterministik) ─────────────────────────────────────
export function evalCondition(cond: RecipeCondition, bag: RunBag): boolean {
  const t = bag.ctx as unknown as Record<string, unknown>;
  const b = bag.outputs['biomechanics'] as Record<string, unknown> | undefined;
  const source: Record<string, unknown> = { ...t, ...(b ?? {}) };
  const actual = source[cond.metric];
  if (actual === undefined) return false;
  switch (cond.operator) {
    case 'EQ': return String(actual) === String(cond.value);
    case 'NE': return String(actual) !== String(cond.value);
    case 'GT': return Number(actual) > Number(cond.value);
    case 'GTE': return Number(actual) >= Number(cond.value);
    case 'LT': return Number(actual) < Number(cond.value);
    case 'LTE': return Number(actual) <= Number(cond.value);
    default: return false;
  }
}

// ── EXECUTOR — recipe'yi deterministik oynatır (LLM yok, maliyet $0) ────────
export function executeRecipe(recipe: WorkflowRecipe | string, ctx: TelemetryContext): RecipeRunResult {
  const parsed = typeof recipe === 'string' ? JSON.parse(recipe) : recipe;
  const validation = validateRecipe(parsed);
  if (!validation.ok || !validation.recipe) throw new Error(`Gecersiz recipe: ${validation.errors.join('; ')}`);

  const bag: RunBag = { ctx, outputs: {}, alerts: [] };
  const startedAt = new Date().toISOString();
  for (const step of validation.recipe.steps) {
    const handler = HANDLERS[step.action];
    if (!handler) continue;
    handler(bag, step.params);
    for (const cond of step.conditions ?? []) {
      if (evalCondition(cond, bag) && cond.thenAction) {
        const trigger = HANDLERS[cond.thenAction];
        if (trigger) trigger(bag, cond.thenParams ?? { channel: cond.metric, message: `Kosul ${cond.metric} saglandi (${String(cond.value)})` });
      }
    }
  }
  return {
    recipeId: validation.recipe.id,
    runtimeCost: 0,
    startedAt,
    finishedAt: new Date().toISOString(),
    stepsExecuted: validation.recipe.steps.length,
    outputs: bag.outputs,
    alerts: bag.alerts,
  };
}

// ── RECORDER — antrenör iş akışını JSON recipe'ye derler ────────────────────
export class RecipeRecorder {
  private steps: RecipeStep[] = [];
  private seq = 0;
  constructor(private readonly name: string, private readonly description = '') {}

  recordStep(action: RecipeStep['action'], label: string, params: RecipeStep['params'], conditions?: RecipeCondition[]): this {
    this.steps.push({ id: `step-${++this.seq}`, action, label, params, conditions });
    return this;
  }
  compileRecipe(): WorkflowRecipe {
    return { id: `recipe-${this.name.toLowerCase().replace(/\s+/g, '-')}`, name: this.name, version: '1.0.0', description: this.description, runtimeCost: 'FREE', steps: [...this.steps] };
  }
  toJson(pretty = true): string {
    return JSON.stringify(this.compileRecipe(), null, pretty ? 2 : 0);
  }
  get stepCount(): number {
    return this.steps.length;
  }
}

// ── HAZIR RECIPE'LER ────────────────────────────────────────────────────────
import quickMatchRecap from './recipes/quick_match_recap_recipe.json';
import injuryScreen from './recipes/injury_screen_recipe.json';

export const BUILT_IN_RECIPES: WorkflowRecipe[] = [quickMatchRecap as WorkflowRecipe, injuryScreen as WorkflowRecipe];

export function getRecipeById(id: string): WorkflowRecipe | undefined {
  return BUILT_IN_RECIPES.find((r) => r.id === id);
}

export function workflowRecipeEngineStatus(): string {
  return `Recipe Motoru: ${BUILT_IN_RECIPES.length} hazir recipe, executor $0 maliyet, deterministik`;
}

