// ============================================================================
// 📜 WORKFLOW RECIPE ŞEMASI — Ghost OS tarzı deterministik otomasyon
// Action Type • Params (dinamik + doğrulama) • Conditions (eşik kuralları)
// ============================================================================

export const ACTION_TYPES = [
  'INGEST_TELEMETRY',
  'APPLY_FILTER',
  'CALCULATE_BIOMECHANICS',
  'GENERATE_PLAIN_REPORT',
  'EXPORT_PDF',
  'TRIGGER_NOTIFICATION',
] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export const CONDITION_OPERATORS = ['EQ', 'NE', 'GT', 'GTE', 'LT', 'LTE'] as const;
export type ConditionOperator = (typeof CONDITION_OPERATORS)[number];

// ── Param doğrulama kuralları ───────────────────────────────────────────────
export type ParamSchema = {
  key: string;
  type: 'string' | 'number' | 'boolean';
  required?: boolean;
  min?: number;
  max?: number;
};

export interface RecipeCondition {
  metric: string;           // örn: 'injuryRisk', 'gctMs', 'acwr'
  operator: ConditionOperator;
  value: string | number | boolean;
  thenAction?: ActionType;  // koşul sağlanırsa ek tetikleme
  thenParams?: RecipeStep['params']; // tetikleme parametreleri (kanal/mesaj)
}

export interface RecipeStep {
  id: string;
  action: ActionType;
  label: string;
  params: Record<string, string | number | boolean>;
  conditions?: RecipeCondition[];
}

export interface WorkflowRecipe {
  id: string;
  name: string;
  version: string;
  description: string;
  runtimeCost: 'FREE' | 'LOCAL';
  steps: RecipeStep[];
}

// ── Param doğrulama ─────────────────────────────────────────────────────────
export function validateParams(params: Record<string, unknown>, schema: ParamSchema[]): string[] {
  const errors: string[] = [];
  for (const rule of schema) {
    const v = params[rule.key];
    if (v === undefined || v === null || v === '') {
      if (rule.required) errors.push(`Eksik zorunlu param: ${rule.key}`);
      continue;
    }
    if (rule.type === 'number' && typeof v !== 'number') errors.push(`${rule.key} sayı olmalı`);
    if (rule.type === 'string' && typeof v !== 'string') errors.push(`${rule.key} metin olmalı`);
    if (rule.type === 'boolean' && typeof v !== 'boolean') errors.push(`${rule.key} boolean olmalı`);
    if (typeof v === 'number' && rule.min !== undefined && v < rule.min) errors.push(`${rule.key} min ${rule.min}`);
    if (typeof v === 'number' && rule.max !== undefined && v > rule.max) errors.push(`${rule.key} max ${rule.max}`);
  }
  return errors;
}

// ── Recipe JSON doğrulama (parse + şema kontrolü) ───────────────────────────
export function validateRecipe(raw: unknown): { ok: boolean; recipe?: WorkflowRecipe; errors: string[] } {
  const errors: string[] = [];
  if (typeof raw !== 'object' || raw === null) return { ok: false, errors: ['Recipe JSON obje değil'] };
  const r = raw as Partial<WorkflowRecipe>;
  if (typeof r.id !== 'string' || !r.id) errors.push('id zorunlu');
  if (typeof r.name !== 'string' || !r.name) errors.push('name zorunlu');
  if (!Array.isArray(r.steps) || r.steps.length === 0) errors.push('en az 1 adım');
  for (const s of r.steps ?? []) {
    if (!ACTION_TYPES.includes(s.action as ActionType)) errors.push(`Geçersiz action: ${s.action}`);
    if (typeof s.id !== 'string' || !s.id) errors.push('adım id zorunlu');
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, recipe: r as WorkflowRecipe, errors };
}
