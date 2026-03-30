#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/opt/ecclesia/app

echo "==> Fixing unterminated string literal in storage.ts..."
cd "$APP_DIR"
perl -0777 -i -pe 's/his reward\."\n/his reward." /g' server/storage.ts
echo "==> Fixed"

echo "==> Building and starting app..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "============================================"
echo "  Ecclesia Basilikos is live!"
echo "  https://ecclesiabasilikos.org"
echo "============================================"
