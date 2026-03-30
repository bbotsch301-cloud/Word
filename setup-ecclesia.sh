#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/opt/ecclesia/app

# Install Docker Compose plugin if missing
if ! docker compose version > /dev/null 2>&1; then
    echo "==> Installing Docker Compose plugin..."
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    echo "==> Docker Compose installed: $(docker compose version)"
fi

# Create .env only if it doesn't exist
if [ ! -f "$APP_DIR/.env" ]; then
    echo "==> Creating .env file..."
    SECRET=$(head -c 32 /dev/urandom | base64)
    cat > "$APP_DIR/.env" << ENVFILE
DATABASE_URL=postgresql://neondb_owner:npg_W0dtvcBreFk2@ep-holy-surf-anam51nd-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SESSION_SECRET=$SECRET
BASE_URL=https://ecclesiabasilikos.org
NODE_ENV=production
PORT=5000
ENVFILE
    chmod 600 "$APP_DIR/.env"
    echo "==> .env created"
else
    echo "==> .env already exists, preserving"
fi

echo "==> Building and starting app..."
cd "$APP_DIR"
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "============================================"
echo "  Ecclesia Basilikos is live!"
echo "  https://ecclesiabasilikos.org"
echo "============================================"
