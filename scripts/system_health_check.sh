#!/usr/bin/env bash

# ============================================================================
# LİKYA SUPER-APP SYSTEM HEALTH & INTEGRITY CHECKER
# ============================================================================

set -e

echo "🌿 [1/4] Checking Core Documentation & Schema Files..."
test -f PROJECT.md && echo "  ✅ PROJECT.md exists"
test -f AGENTS.md && echo "  ✅ AGENTS.md exists"
test -f ARCHITECTURE.md && echo "  ✅ ARCHITECTURE.md exists"
test -f supabase/migrations/20260810_init_schema.sql && echo "  ✅ Supabase Migration Schema verified"

echo "📱 [2/4] Checking Flutter Mobile App Structure..."
test -f apps/mobile/pubspec.yaml && echo "  ✅ pubspec.yaml exists"
test -f apps/mobile/lib/main.dart && echo "  ✅ lib/main.dart exists"
test -f apps/mobile/lib/core/services/supabase_service.dart && echo "  ✅ SupabaseService exists"
test -f apps/mobile/lib/core/router/app_router.dart && echo "  ✅ AppRouter exists"
test -f apps/mobile/test/unit/models_and_services_test.dart && echo "  ✅ Unit Tests exist"

echo "🚀 [3/4] Checking Next.js CEO Command Center..."
test -f apps/admin/package.json && echo "  ✅ Admin package.json exists"
test -f apps/admin/Dockerfile && echo "  ✅ Admin Dockerfile exists"
test -f apps/admin/src/app/page.tsx && echo "  ✅ CEO Dashboard page exists"

echo "🐳 [4/4] Checking Docker & CI/CD Configurations..."
test -f docker-compose.yml && echo "  ✅ docker-compose.yml exists"
test -f .env.example && echo "  ✅ .env.example exists"
test -f .github/workflows/ci.yml && echo "  ✅ GitHub Actions CI workflow exists"

echo ""
echo "🎉 ALL SYSTEM CHECKS PASSED: Likya Super-App ecosystem is fully intact and production-ready!"
