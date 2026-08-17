// ============================================================================
// 🛡️ AI SAFETY & RELIABILITY GUARDRAILS
// Prompt Injection mitigation • Jailbreak kalkanı • Rate Limiting •
// Verification Loops • doğrulanabilir JSON çıktı kontrolörü.
// TÜM kontroller sessiz/fail-safe — meşru istek asla engellenmez. Plan Z.
// ============================================================================

export interface GuardrailResult {
  ok: boolean;
  checks: number;
  flagged: string[];
  action: 'allow' | 'flag' | 'block' | 'sanitize';
  sanitized: string;
}

// ── 1. PROMPT INJECTION KALIBI (zararsız hale getirilir) ──
const INJECTION_PATTERNS = [/ignore (all )?(previous|prior) instructions/i, /system prompt/i, /developer message/i, /forget everything/i, /new instructions:/i, /role:\s*system/i, /you are now/i, /act as (a )?(admin|root|god)/i];

// ── 2. JAILBREAK KALIBI (flag) ──
const JAILBREAK_PATTERNS = [/dan\b|do anything now/i, /jailbreak/i, /bypass (safety|filters)/i, /uncensored mode/i, /override (all )?rules/i, /reveal your (system )?prompt/i, /no restrictions/i];

// ── 3. RATE LIMITING (bellek sayaçları — dakika bazlı) ──
const RATE_LIMITS: Record<string, { windowMs: number; max: number }> = {
  default: { windowMs: 60000, max: 30 },
  finance: { windowMs: 60000, max: 10 },
  code: { windowMs: 60000, max: 6 },
};
let callLog: { key: string; ts: number }[] = [];

export function rateLimitCheck(key = 'default'): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const cfg = RATE_LIMITS[key] ?? RATE_LIMITS.default;
  callLog = callLog.filter((c) => now - c.ts < cfg.windowMs);
  const used = callLog.filter((c) => c.key === key).length;
  const allowed = used < cfg.max;
  if (allowed) callLog.push({ key, ts: now });
  return { allowed, remaining: Math.max(0, cfg.max - used) };
}

// ── 4. PROMPT SÜZGECİ (injection sanitize + jailbreak flag) ──
export function scanPrompt(input: string): GuardrailResult {
  let sanitized = input;
  const flagged: string[] = [];
  INJECTION_PATTERNS.forEach((re, i) => {
    if (re.test(sanitized)) { flagged.push(`injection#${i + 1}`); sanitized = sanitized.replace(re, '[yönlendirme kaldırıldı]'); }
  });
  JAILBREAK_PATTERNS.forEach((re, i) => {
    if (re.test(sanitized)) { flagged.push(`jailbreak#${i + 1}`); sanitized = sanitized.replace(re, '[kısıtlı]'); }
  });
  const action: GuardrailResult['action'] = flagged.some((f) => f.startsWith('jailbreak')) ? 'block' : flagged.length ? 'sanitize' : 'allow';
  return { ok: action !== 'block', checks: INJECTION_PATTERNS.length + JAILBREAK_PATTERNS.length, flagged, action, sanitized };
}

// ── 5. DOĞRULANABİLİR JSON ÇIKTI KONTROLÖRÜ (Zod/Pydantic benzeri) ──
export interface JsonFieldRule { key: string; type: 'string' | 'number' | 'boolean' | 'array'; required?: boolean }

export function validateJsonOutput(raw: string, rules: JsonFieldRule[]): { ok: boolean; data: Record<string, unknown> | null; errors: string[] } {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const errors: string[] = [];
    for (const rule of rules) {
      const val = parsed[rule.key];
      if (val === undefined) {
        if (rule.required) errors.push(`${rule.key} eksik`);
        continue;
      }
      if (rule.type === 'array' && !Array.isArray(val)) errors.push(`${rule.key} dizi değil`);
      else if (rule.type === 'string' && typeof val !== 'string') errors.push(`${rule.key} metin değil`);
      else if (rule.type === 'number' && typeof val !== 'number') errors.push(`${rule.key} sayı değil`);
      else if (rule.type === 'boolean' && typeof val !== 'boolean') errors.push(`${rule.key} mantıksal değil`);
    }
    return { ok: errors.length === 0, data: parsed, errors };
  } catch (e) {
    return { ok: false, data: null, errors: ['Geçersiz JSON: ' + (e instanceof Error ? e.message : String(e))] };
  }
}

// ── 6. VERIFICATION LOOP (çıktıyı yeniden doğrula — 2. pas) ──
export function verificationLoop<T>(producer: () => T, validator: (t: T) => boolean, maxRetries = 2): { value: T; retries: number; ok: boolean } {
  let value: T;
  let retries = 0;
  for (let i = 0; i <= maxRetries; i++) {
    value = producer();
    if (validator(value)) return { value, retries, ok: true };
    retries++;
  }
  return { value: producer(), retries, ok: false };
}

export function aiSafetyStatus(): string {
  return `AI Safety [injection+jailbreak+rate-limit+json-validate+verification • fail-safe]`;
}
