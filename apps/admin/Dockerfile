# ============================================================================
# 🐳 LİKYA SPORTVISIONX — ÜRETİM MULTI-STAGE DOCKER BUILD (Next.js standalone)
# Aşamalar:
#   1. deps    → Node Alpine + NPM cache (pnpm/npm)
#   2. builder → TS derleme + devDependency prune + .next/standalone üretimi
#   3. runner  → root olmayan kullanıcı (nextjs), minimal imaj, EXPOSE 3000
# HEALTHCHECK: /api/health (Adım 101) — orkestratör (Dokploy/Traefik) kullanır.
# ============================================================================

# ── 1. BAĞIMLILIK AŞAMASI (NPM cache'li) ──────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
# Önce yalnızca manifest'ler — katman önbelleği için (bağımlılıklar değişmedikçe npm ci atlanır)
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ── 2. DERLEME AŞAMASI (standalone + devDependency prune) ─────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
# Next.js standalone çıktısı (server.js + minimal node_modules)
RUN npm run build && npm prune --omit=dev

# ── 3. ÇALIŞTIRMA AŞAMASI (non-root, minimal imaj <180MB) ─────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Root olmayan kullanıcı (Alpine: nodejs grubu + nextjs kullanıcısı)
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Yalnızca gerekli artefaktlar kopyalanır — imaj boyutu minimal kalır
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# Sağlık denetimi → /api/health (Adım 101): 200 OK = hazır
HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=15s \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]

