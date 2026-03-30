#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/opt/ecclesia/app
cd "$APP_DIR"

# --- 1. Fix unterminated string literals ---
echo "==> Fixing string literals in storage.ts..."
git checkout -- server/storage.ts
perl -0777 -i -pe 's/\."\n(\s*[^\s\}\]\,])/.\" $1/g' server/storage.ts
git add server/storage.ts
git commit -m "Fix unterminated string literals in seed data"

# --- 2. Add GitHub Actions auto-deploy workflow ---
echo "==> Adding auto-deploy workflow..."
mkdir -p .github/workflows
cat > .github/workflows/deploy.yml << 'WORKFLOW'
name: Deploy to Hetzner

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: 5.78.180.9
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/ecclesia/app
            git pull origin main
            docker compose -f docker-compose.prod.yml up -d --build
WORKFLOW
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions auto-deploy to Hetzner"

# --- 3. Push to GitHub ---
echo "==> Pushing to GitHub..."
git push origin main

# --- 4. Rebuild ---
echo "==> Rebuilding app..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "============================================"
echo "  Done! Changes pushed and app rebuilt."
echo ""
echo "  NEXT: Add SSH key to GitHub secrets:"
echo "  1. On the server, run: cat ~/.ssh/id_ed25519"
echo "     (or generate one: ssh-keygen -t ed25519)"
echo "  2. Go to github.com/bbotsch301-cloud/Ecclesia_Basilikos/settings/secrets/actions"
echo "  3. Add secret named SSH_PRIVATE_KEY with the key contents"
echo "  4. After that, every push to main auto-deploys!"
echo "============================================"
