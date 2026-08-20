// ============================================================================
// 🛡️ ÜRETİM ORTAM DEĞİŞKENİ DOĞRULAYICI & ŞEMA KORUYUCU (Deployment Adım 3)
// Katı runtime ortam değişkeni doğrulayıcı: zorunlu anahtarlar
// (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENROUTER_API_KEY,
// KNX_GATEWAY_HOST, JWT_SECRET) uygulama açılışında hızlıca (fail-fast)
// doğrulanır; eksik/hatalı kritik sırlar için açıklayıcı insan-okur hata
// mesajları üretir. Yerel/CI test modu için güvenli mock varsayılanlar içerir.
// Saf/deterministik; sıfır bağımlılık.
// ============================================================================

export interface EnvRule {
  key: string;
  required: boolean;
  description: string;
  pattern?: RegExp;    // biçim doğrulama
  minLength?: number;  // sırlar için minimum uzunluk
  secret?: boolean;    // çıktıda maskelenir
  mockDefault?: string; // test modu için güvenli varsayılan
}

export const REQUIRED_ENV_RULES: EnvRule[] = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', required: true, description: 'Supabase proje URL (https://<ref>.supabase.co)', pattern: /^https:\/\/.+\.supabase\.co/, mockDefault: 'https://mock-project.supabase.co' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', required: true, secret: true, minLength: 20, description: 'Supabase service role anahtarı (sunucu tarafı — asla client bundle\'da değil)', mockDefault: 'mock-supabase-service-role-key-0123456789' },
  { key: 'OPENROUTER_API_KEY', required: true, secret: true, minLength: 16, description: 'OpenRouter AI gateway anahtarı (sk-or-...)', mockDefault: 'sk-or-mock-key-0123456789abcdef' },
  { key: 'KNX_GATEWAY_HOST', required: true, description: 'GVS KNX gateway host (IP veya host:port)', pattern: /^[a-zA-Z0-9.:-]+$/, mockDefault: '10.0.0.1:3671' },
  { key: 'JWT_SECRET', required: true, secret: true, minLength: 16, description: 'JWT imzalama sırrı (≥16 karakter)', mockDefault: 'mock-jwt-secret-0123456789abcdef' },
];

export type EnvMode = 'production' | 'test';

export interface EnvValidationResult {
  ok: boolean;
  missing: string[];
  malformed: string[];
  mockDefaults: string[]; // test modunda kullanılan güvenli varsayılanlar
  maskedSecrets: string[];
  errors: string[];
}

// ── Sır maskeleme (çıktıda ilk 4 + ...) ──────────────────────────────────────
export function maskSecret(value: string): string {
  if (!value) return '(boş)';
  if (value.length <= 8) return '•'.repeat(value.length);
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

// ── Katı doğrulama (fail-fast) ───────────────────────────────────────────────
export function validateEnv(
  env: Record<string, string | undefined>,
  rules: EnvRule[] = REQUIRED_ENV_RULES,
  mode: EnvMode = 'production',
): EnvValidationResult {
  const missing: string[] = [];
  const malformed: string[] = [];
  const mockDefaults: string[] = [];
  const maskedSecrets: string[] = [];
  const errors: string[] = [];

  for (const rule of rules) {
    let value = (env[rule.key] ?? '').trim();

    // Eksik / boş
    if (!value) {
      if (mode === 'test' && rule.mockDefault) {
        value = rule.mockDefault;
        mockDefaults.push(rule.key);
      } else {
        missing.push(rule.key);
        errors.push(`❌ ZORUNLU ORTAM DEĞİŞKENİ EKSİK: ${rule.key} — ${rule.description}`);
      }
    }

    if (!value) continue; // test modunda bile mock üretilemediyse atla

    // Biçim doğrulama
    if (rule.pattern && !rule.pattern.test(value)) {
      malformed.push(rule.key);
      errors.push(`⚠️ ORTAM DEĞİŞKENİ BİÇİM HATALI: ${rule.key}="${maskSecret(value)}" — ${rule.description}`);
    }
    // Minimum uzunluk
    if (rule.minLength && value.length < rule.minLength) {
      malformed.push(rule.key);
      errors.push(`⚠️ ORTAM DEĞİŞKENİ ÇOK KISA: ${rule.key} (${value.length} < ${rule.minLength} karakter) — ${rule.description}`);
    }
    if (rule.secret) maskedSecrets.push(rule.key);
  }

  return { ok: missing.length === 0 && malformed.length === 0, missing, malformed, mockDefaults, maskedSecrets, errors };
}

// ── Uygulama açılışında fail-fast (hata fırlatır) ────────────────────────────
export function assertEnvOrThrow(env: Record<string, string | undefined>, rules: EnvRule[] = REQUIRED_ENV_RULES): void {
  const result = validateEnv(env, rules, 'production');
  if (!result.ok) {
    throw new Error(
      `\n🚨 LİKYA ENV DOĞRULAMA BAŞARISIZ — uygulama başlatılmadı.\n${result.errors.join('\n')}\n` +
      `Sırlar (maskeli): ${result.maskedSecrets.length > 0 ? result.maskedSecrets.join(', ') : '—'}\n` +
      'Çözüm: eksik değerleri .env.prod dosyasına ekleyin veya Dokploy ortam değişkenlerini doldurun.',
    );
  }
}

// ── Güvenli okuma (mock fallback) ────────────────────────────────────────────
export function safeEnvGet(env: Record<string, string | undefined>, key: string, fallback: string): string {
  const value = (env[key] ?? '').trim();
  return value.length > 0 ? value : fallback;
}

export function envValidatorStatus(): string {
  return `Env Validator: ${REQUIRED_ENV_RULES.length} zorunlu anahtar • fail-fast + maskeli sırlar • test modunda güvenli mock`;
}
