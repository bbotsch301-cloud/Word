#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/opt/ecclesia/app

echo "==> Fixing all unterminated string literals in storage.ts..."
cd "$APP_DIR"

# Re-clone fresh to undo partial fixes
git checkout -- server/storage.ts

# Fix ALL cases: any line ending with ." followed by continuation text on next line
# These are Bible verses in single-quoted strings that span multiple lines
perl -0777 -i -pe 's/\."\n(\s*[^\s\}\]\,])/.\" $1/g' server/storage.ts

echo "==> Fixed"

echo "==> Building and starting app..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "============================================"
echo "  Ecclesia Basilikos is live!"
echo "  https://ecclesiabasilikos.org"
echo "============================================"
