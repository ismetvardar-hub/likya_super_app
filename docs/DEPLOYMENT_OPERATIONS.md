# 🚀 LİKYA SPORTVISIONX — ÜRETİM DAĞITIM & OPERASYON KILAVUZU

> **150/150 yol haritası %100** · v1.0.0-production-launch + Pilot Faz 1-10 · Dokploy / Docker / Traefik / Vercel.

---

## 1. Üretim Multi-Stage Docker Build (`apps/admin/Dockerfile`)

Üç aşamalı optimize Next.js standalone build:

| Aşama | Temel | İş |
|---|---|---|
| `deps` | `node:20-alpine` | Yalnızca manifest kopyalanır → `npm ci` (katman önbelleği) |
| `builder` | `node:20-alpine` | `npm run build` + `npm prune --omit=dev` → `.next/standalone` |
| `runner` | `node:20-alpine` | **Non-root `nextjs` (uid 1001)**, minimal artefaktlar, `EXPOSE 3000` |

- **HEALTHCHECK:** `fetch('http://127.0.0.1:3000/api/health')` → 200 OK (10s aralık, 3 retry, 15s start).
- **`apps/admin/.dockerignore`:** `node_modules`, `.next`, `.env.*`, `docs`, `data` imaja girmez (gizlilik + boyut <180MB).

```bash
docker build -t sportvisionx:latest apps/admin
docker run -p 3000:3000 --env-file .env.prod sportvisionx:latest
```

---

## 2. Dokploy & Traefik Compose Stack (`apps/admin/docker-compose.prod.yml`)

Üç servis:

| Servis | Rol |
|---|---|
| `sportvisionx-app` | Next.js standalone (port 3000) |
| `supabase-edge-sync-agent` | Çok-bölgeli edge telemetri senkron (FRA1/IST1/DUB1) |
| `redis-cache` | Gerçek zamanlı rate limiting + CRDT edge replikasyon tamponu (Redis 7, AOF, 256MB LRU) |

**Traefik etiketleri:**
- Otomatik **Let's Encrypt TLS** (`certresolver=letsencrypt`) + `websecure` giriş noktası
- **HTTP → HTTPS** yönlendirme (redirectscheme)
- **WebSocket passthrough** (canlı telemetri/WebRTC — Upgrade/Connection başlıkları)
- Healthcheck → `/api/health`, 10s aralık, 3 retry

```bash
cp .env.prod.example .env.prod
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

---

## 3. Ortam Değişkeni Doğrulayıcı (`apps/admin/src/app/lib/config/envValidator.ts`)

Uygulama açılışında **fail-fast** doğrulama — kritik sırlar eksikse uygulama **başlatılmaz**:

| Anahtar | Kontrol |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` biçimi |
| `SUPABASE_SERVICE_ROLE_KEY` | ≥20 karakter (sunucu tarafı — client bundle yok) |
| `OPENROUTER_API_KEY` | ≥16 karakter (`sk-or-...`) |
| `KNX_GATEWAY_HOST` | `IP[:port]` biçimi |
| `JWT_SECRET` | ≥16 karakter |

- Hatalar **insan-okur Türkçe** mesajlarla raporlanır; sırlar çıktıda **maskelenir** (`supe…123`).
- **Test/CI modu:** eksik anahtarlar için **güvenli mock varsayılanlar** (`validateEnv(env, rules, 'test')` → ok, 5 mock).

```ts
import { assertEnvOrThrow } from '@/lib/config/envValidator';
assertEnvOrThrow(process.env); // boot'ta kritik sırlar doğrulanır
```

---

## 4. CI/CD Pipeline (`.github/workflows/production-deploy.yml`)

| Tetikleyici | İş |
|---|---|
| `push` tag `v*` veya `main` / manuel | ① `verify-build`: `tsc --noEmit` → `master100StepVerification` (30 batch + E2E + roadmap 150/150) → `productionDeploymentSmokeTest` → `npm run build` ② `deploy` (green): **Dokploy webhook** veya **Vercel `--prod`** |

GitHub Secrets: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENROUTER_API_KEY`, `DOKPLOY_WEBHOOK_URL` (veya `VERCEL_TOKEN`/`VERCEL_ORG_ID`/`VERCEL_PROJECT_ID`).

---

## 5. Doğrulama

```bash
cd apps/admin
node scripts/productionDeploymentSmokeTest.mts   # 20/20
npx tsc --noEmit                                  # 0 hata
npm run build                                     # EXIT 0
node scripts/master100StepVerification.mts        # 69/69
```

---

## 6. Operasyon Notları

- **Loglar:** `docker compose -f docker-compose.prod.yml logs -f sportvisionx-app`
- **Sağlık:** `curl https://${DOMAIN}/api/health` → `healthy: true` (DB + Storage + SW).
- **Canlı çalışan servis durdurulursa:** `restart: always` otomatik başlatır; kalıcı arıza → runbook (PRODUCTION_OPERATIONS_RUNBOOK.md) olay müdahale prosedürleri.
- **Redis verisi:** `redis_data` volume'ü — silmeyin (CRDT tamponu/rate limit sayaçları).

**🎉 ÜRETİM ALTYAPISI HAZIR — 150/150 + Docker/Dokploy/Traefik/CI-CD 🚀**
