// ============================================================================
// 💰 DİNAMİK MODEL COST & TOKEN BÜTÇE TAKİPÇİSİ (OpenRouter Gateway)
// Prompt/completion token'ları, tahmini USD maliyetler ve sağlayıcı gecikmesini
// izler. Kulüp/akademi bazında günlük token bütçe limitleri uygular → beklenmedik
// fatura sıçramalarını önler. Saf/deterministik; sıfır bağımlılık.
// ============================================================================

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export const DEFAULT_DAILY_BUDGET_USD = 5.0;

// OpenRouter üzerindeki model başına milyon token fiyatı (USD)
export const MODEL_PRICES: Record<string, { inputPerM: number; outputPerM: number }> = {
  'google/gemini-2.0-flash-001': { inputPerM: 0.1, outputPerM: 0.4 },
  'anthropic/claude-3.5-haiku': { inputPerM: 0.8, outputPerM: 4.0 },
  'anthropic/claude-3.7-sonnet': { inputPerM: 3.0, outputPerM: 15.0 },
  'deepseek/deepseek-r1': { inputPerM: 0.55, outputPerM: 2.19 },
  'deepseek/deepseek-chat': { inputPerM: 0.27, outputPerM: 1.1 },
  'openai/gpt-4o': { inputPerM: 2.5, outputPerM: 10.0 },
  'google/gemini-pro-vision': { inputPerM: 0.31, outputPerM: 1.16 },
  'meta-llama/llama-3.3-70b-instruct:free': { inputPerM: 0, outputPerM: 0 },
  'google/gemini-2.0-flash-exp:free': { inputPerM: 0, outputPerM: 0 },
};

export function modelPrice(model: string): { inputPerM: number; outputPerM: number } {
  return MODEL_PRICES[model] ?? { inputPerM: 0.5, outputPerM: 1.5 }; // bilinmeyen model için ortalama tahmin
}

// ── Token tahmini (~4 karakter/token) — gerçek usage yokken deterministik ────
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil((text?.length ?? 0) / 4));
}

export interface CostQuote {
  model: string;
  promptCostUsd: number;
  completionCostUsd: number;
  totalCostUsd: number;
}

export function costForModel(model: string, usage: TokenUsage): CostQuote {
  const { inputPerM, outputPerM } = modelPrice(model);
  const promptCostUsd = (usage.promptTokens / 1_000_000) * inputPerM;
  const completionCostUsd = (usage.completionTokens / 1_000_000) * outputPerM;
  return {
    model,
    promptCostUsd: Math.round(promptCostUsd * 1_000_000) / 1_000_000,
    completionCostUsd: Math.round(completionCostUsd * 1_000_000) / 1_000_000,
    totalCostUsd: Math.round((promptCostUsd + completionCostUsd) * 1_000_000) / 1_000_000,
  };
}

export interface ScopeUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  calls: number;
  avgLatencyMs: number;
  lastModel: string;
  exceeded: boolean;
}

export interface DailyBudgetResult {
  scopeId: string;
  usedUsd: number;
  capUsd: number;
  remainingUsd: number;
  exceeded: boolean;
}

export class AiCostTracker {
  private readonly scopes = new Map<string, ScopeUsage>();
  private readonly budgets = new Map<string, number>();

  setDailyBudget(scopeId: string, capUsd: number): void {
    this.budgets.set(scopeId, Math.max(0, capUsd));
  }

  dailyCapUsd(scopeId: string): number {
    return this.budgets.get(scopeId) ?? DEFAULT_DAILY_BUDGET_USD;
  }

  recordUsage(scopeId: string, model: string, usage: TokenUsage, latencyMs = 0): { costUsd: number; scope: ScopeUsage } {
    const quote = costForModel(model, usage);
    const prev = this.scopes.get(scopeId) ?? { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0, calls: 0, avgLatencyMs: 0, lastModel: '', exceeded: false };
    const totalTokens = usage.promptTokens + usage.completionTokens;
    const calls = prev.calls + 1;
    const avgLatencyMs = calls === 1 ? latencyMs : Math.round((prev.avgLatencyMs * prev.calls + latencyMs) / calls);
    const costUsd = Math.round((prev.costUsd + quote.totalCostUsd) * 1_000_000) / 1_000_000;
    const cap = this.dailyCapUsd(scopeId);
    const scope: ScopeUsage = {
      promptTokens: prev.promptTokens + usage.promptTokens,
      completionTokens: prev.completionTokens + usage.completionTokens,
      totalTokens: prev.totalTokens + totalTokens,
      costUsd,
      calls,
      avgLatencyMs,
      lastModel: model,
      exceeded: costUsd > cap,
    };
    this.scopes.set(scopeId, scope);
    return { costUsd: quote.totalCostUsd, scope };
  }

  usage(scopeId: string): ScopeUsage | null {
    return this.scopes.get(scopeId) ?? null;
  }

  dailyBudget(scopeId: string): DailyBudgetResult {
    const used = this.scopes.get(scopeId)?.costUsd ?? 0;
    const capUsd = this.dailyCapUsd(scopeId);
    return { scopeId, usedUsd: used, capUsd, remainingUsd: Math.round(Math.max(0, capUsd - used) * 1000) / 1000, exceeded: used > capUsd };
  }

  activeScopes(): string[] {
    return Array.from(this.scopes.keys());
  }

  reset(): void {
    this.scopes.clear();
  }
}

export function aiCostTrackerStatus(): string {
  return `Cost Tracker: ${Object.keys(MODEL_PRICES).length} model fiyatı • günlük bütçe ${DEFAULT_DAILY_BUDGET_USD}$ (scope başına)`;
}
