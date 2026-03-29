#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/opt/ecclesia/app

echo "==> Creating .env file..."
cat > "$APP_DIR/.env" << 'ENVFILE'
DATABASE_URL=postgresql://neondb_owner:npg_W0dtvcBreFk2@ep-holy-surf-anam51nd-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SESSION_SECRET=PLACEHOLDER
BASE_URL=https://ecclesiabasilikos.org
NODE_ENV=production
PORT=5000
ENVFILE

SECRET=$(head -c 32 /dev/urandom | base64)
sed -i "s|PLACEHOLDER|$SECRET|" "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"
echo "==> .env created"

echo "==> Building and starting app..."
cd "$APP_DIR"
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "============================================"
echo "  Ecclesia Basilikos is live!"
echo "  https://ecclesiabasilikos.org"
echo "============================================"
