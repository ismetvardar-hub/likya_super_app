// ============================================================================
// 🚀 ÜRETİM DAĞITIM SMOKE TESTİ (Deployment Adım 5)
// Env şeması parsing + eksik anahtar reddi • Docker Compose söz dizimi +
// healthcheck yapılandırması • /api/health uyumluluğu • CI/CD & Dokümanlar.
// Çalıştırma: node scripts/productionDeploymentSmokeTest.mts
// ============================================================================
import { existsSync, readFileSync } from 'node:fs';
import {
  validateEnv, assertEnvOrThrow, maskSecret, safeEnvGet, REQUIRED_ENV_RULES,
} from '../src/app/lib/config/envValidator.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── 1. ENV DOĞRULAYICI ───────────────────────────────────────────────────────
const validEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://abc123.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service-role-key-1234567890',
  OPENROUTER_API_KEY: 'sk-or-v1-1234567890abcdef',
  KNX_GATEWAY_HOST: '10.0.0.1:3671',
  JWT_SECRET: 's3cret-key-abcdef-0123456789',
};

const okResult = validateEnv(validEnv);
check('1a. Geçerli env → ok + 3 sır maskelenir', okResult.ok === true && okResult.missing.length === 0 && okResult.maskedSecrets.length === 3 && okResult.errors.length === 0);

const missingJwt = validateEnv({ ...validEnv, JWT_SECRET: '' });
check('1b. Eksik JWT_SECRET → ok:false + insan-okur hata', missingJwt.ok === false && missingJwt.missing.includes('JWT_SECRET') && missingJwt.errors[0].includes('ZORUNLU ORTAM DEĞİŞKENİ EKSİK') && missingJwt.errors[0].includes('JWT_SECRET'));

const badUrl = validateEnv({ ...validEnv, NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321' });
check('1c. Hatalı Supabase URL (pattern) → malformed', badUrl.ok === false && badUrl.malformed.includes('NEXT_PUBLIC_SUPABASE_URL'));

const shortKey = validateEnv({ ...validEnv, OPENROUTER_API_KEY: 'short' });
check('1d. Kısa sır (minLength) → malformed', shortKey.ok === false && shortKey.malformed.includes('OPENROUTER_API_KEY'));

const testMode = validateEnv({}, REQUIRED_ENV_RULES, 'test');
check('1e. Test modu: boş env → 5 güvenli mock varsayılan + ok', testMode.ok === true && testMode.mockDefaults.length === 5 && testMode.missing.length === 0);

let threw = false;
try {
  assertEnvOrThrow({});
} catch (e) {
  threw = true;
}
check('1f. assertEnvOrThrow fail-fast hata fırlatır', threw === true);
check('1g. maskSecret + safeEnvGet', maskSecret('supersecretvalue123') === 'supe…e123' && safeEnvGet({}, 'NEXT_PUBLIC_SUPABASE_URL', 'fallback') === 'fallback');

// ── 2. DOCKER COMPOSE & HEALTHCHECK ──────────────────────────────────────────
const compose = readFileSync('docker-compose.prod.yml', 'utf8');
check('2a. Compose: sportvisionx-app + supabase-edge-sync-agent + redis-cache servisleri', /^\s{2}sportvisionx-app:/m.test(compose) && /^\s{2}supabase-edge-sync-agent:/m.test(compose) && /^\s{2}redis-cache:/m.test(compose));
check('2b. Healthcheck: /api/health + 10s + 3 retry', compose.includes('/api/health') && compose.includes('interval: 10s') && compose.includes('retries: 3'));
check('2c. Traefik: TLS certresolver + HTTPS yönlendirme + WebSocket', compose.includes('certresolver=letsencrypt') && compose.includes('redirectscheme.scheme=https') && compose.includes('Upgrade=websocket') && compose.includes('traefik.enable=true'));
check('2d. Redis: healthcheck ping + volume', compose.includes('redis-cli') && compose.includes('redis_data'));

// ── 3. DOCKERFILE MULTI-STAGE ────────────────────────────────────────────────
const dockerfile = readFileSync('Dockerfile', 'utf8');
check('3a. Multi-stage: deps/builder/runner + node:20-alpine', /FROM node:20-alpine AS deps/.test(dockerfile) && /FROM node:20-alpine AS builder/.test(dockerfile) && /FROM node:20-alpine AS runner/.test(dockerfile));
check('3b. Runner: non-root nextjs + EXPOSE 3000 + HEALTHCHECK + /api/health', /USER nextjs/.test(dockerfile) && /EXPOSE 3000/.test(dockerfile) && dockerfile.includes('HEALTHCHECK') && dockerfile.includes('/api/health'));
check('3c. Builder: standalone + devDep prune', dockerfile.includes('.next/standalone') && dockerfile.includes('npm prune --omit=dev'));
// ── 4. CI/CD WORKFLOW & ALTYAPI DOSYALARI ───────────────────────────────────
const workflow = readFileSync('../../.github/workflows/production-deploy.yml', 'utf8');
check('4a. CI/CD: tag v* + main tetikleme + tsc + master verify + build', workflow.includes("tags: ['v*']") && workflow.includes('branches: [main]') && workflow.includes('npx tsc --noEmit') && workflow.includes('master100StepVerification.mts') && workflow.includes('npm run build'));
check('4b. CI/CD: Dokploy webhook veya Vercel --prod dağıtımı', workflow.includes('DOKPLOY_WEBHOOK_URL') && workflow.includes('vercel@latest deploy') && workflow.includes('--prod'));
check('4c. .dockerignore + .env hariç + node_modules hariç', existsSync('.dockerignore') && (() => { const d = readFileSync('.dockerignore', 'utf8'); return d.includes('node_modules') && d.includes('.env'); })());
check('4d. /api/health route mevcut (container healthcheck hedefi)', existsSync('src/app/api/health/route.ts'));
check('4e. DEPLOYMENT_OPERATIONS dokümanı mevcut', existsSync('../../docs/DEPLOYMENT_OPERATIONS.md'));
check('4f. Env validator status + 5 zorunlu anahtar', REQUIRED_ENV_RULES.length === 5 && REQUIRED_ENV_RULES.map((r) => r.key).join(',') === 'NEXT_PUBLIC_SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,OPENROUTER_API_KEY,KNX_GATEWAY_HOST,JWT_SECRET');

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

