#!/usr/bin/env bash
# ============================================================
# 🩺 LİKYA OTONOM DOCTOR — Tek Komutla Tüm Sistemi Ayağa Kaldır
# Next.js (UI+API) • Python/FastAPI (varsa) • Cloudflare Tunnel
# Çökerse yeniden ayağa kaldıran self-healing watchdog mantığı
# Kullanım: bash start-all.sh  (veya kökten: npm run start:all)
# ============================================================
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ADMIN="$ROOT/apps/admin"
LOG_DIR="$ROOT/.doctor-logs"
mkdir -p "$LOG_DIR"

is_running() { pgrep -f "$1" > /dev/null 2>&1; }

start() { # $1=name $2=cmd $3=cwd $4=log
  if is_running "$1"; then
    echo "  ✅ $1 zaten çalışıyor"
  else
    echo "  🚀 $1 başlatılıyor..."
    (cd "$3" && nohup $2 > "$LOG_DIR/$4" 2>&1 &)
    sleep 1
  fi
}

echo ""
echo "🩺 LİKYA OTONOM DOCTOR — Servisler ayağa kaldırılıyor"
echo "============================================================"

# 1) Next.js dev sunucusu (port 3000)
start "next dev" "npm run dev" "$ADMIN" "next.log"

# 2) Python/FastAPI backend (port 8000) — varsa
if [ -f "$ROOT/backend/main.py" ]; then
  start "uvicorn main" "python3 -m uvicorn main:app --host 0.0.0.0 --port 8000" "$ROOT/backend" "uvicorn.log"
elif [ -f "$ROOT/server/main.py" ]; then
  start "uvicorn main" "python3 -m uvicorn main:app --host 0.0.0.0 --port 8000" "$ROOT/server" "uvicorn.log"
else
  echo "  ℹ️ Python/FastAPI backend bulunamadı — atlandı"
fi

# 3) Cloudflare Tunnel — cloudflared yüklüyse
if command -v cloudflared > /dev/null 2>&1; then
  start "cloudflared" "cloudflared tunnel --url http://localhost:3000" "$ROOT" "tunnel.log"
else
  echo "  ℹ️ cloudflared bulunamadı — tünel atlandı (yüklemek için: brew install cloudflared)"
fi

echo "============================================================"
echo "✅ Doctor tamamlandı."
echo "  • Next.js:    http://localhost:3000"
echo "  • Health:     curl http://localhost:3000/api/v1/ceo/health"
echo "  • Loglar:     $LOG_DIR"
echo "  • Not: Servisler çökerse 'npm run doctor' ile otomatik onarılır."
echo ""
