#!/usr/bin/env bash

# ============================================================================
# LİKYA SUPER-APP AUTOMATED BACKUP & RESTORE TOOL
# ============================================================================

set -e

BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
ACTION="${1:-backup}"

if [ "$ACTION" = "backup" ]; then
    echo "📦 Creating Likya Super-App Backup in $BACKUP_DIR..."
    mkdir -p "$BACKUP_DIR"
    
    # 1. Backup SQL migrations & seeds
    cp -r supabase "$BACKUP_DIR/"
    
    # 2. Backup environment templates
    cp .env.example "$BACKUP_DIR/"
    cp apps/admin/.env.example "$BACKUP_DIR/admin.env.example"
    
    echo "✅ Backup successfully created in $BACKUP_DIR"
    exit 0
elif [ "$ACTION" = "restore" ]; then
    TARGET_BACKUP="${2}"
    if [ -z "$TARGET_BACKUP" ] || [ ! -d "$TARGET_BACKUP" ]; then
        echo "❌ Error: Please specify a valid backup directory path."
        echo "Usage: ./scripts/backup_restore.sh restore backups/YYYYMMDD_HHMMSS"
        exit 1
    fi
    echo "♻️ Restoring Likya Super-App from $TARGET_BACKUP..."
    cp -r "$TARGET_BACKUP/supabase" ./
    echo "✅ Restore completed successfully."
    exit 0
else
    echo "Usage: ./scripts/backup_restore.sh [backup|restore] [path]"
    exit 1
fi
