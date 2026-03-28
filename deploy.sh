#!/bin/bash
set -e

# ============================================
# LEXICA VPS Deployment Script
# Run this on your Hetzner VPS as root
# Usage: curl -sL <url> | bash
# Or: ssh root@5.78.180.9 'bash -s' < deploy.sh
# ============================================

echo "=== LEXICA Deployment ==="
echo ""

# --- 1. System setup ---
echo "[1/8] Installing system dependencies..."
apt-get update -qq
apt-get install -y -qq curl git nginx certbot python3-certbot-nginx ufw \
    build-essential python3 > /dev/null

# --- 2. Install Node.js 20 ---
if ! command -v node &> /dev/null || [[ $(node -v | cut -d. -f1 | tr -d v) -lt 20 ]]; then
    echo "[2/8] Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt-get install -y -qq nodejs > /dev/null
else
    echo "[2/8] Node.js $(node -v) already installed"
fi

# Install PM2 globally
npm install -g pm2 > /dev/null 2>&1
echo "  PM2 installed"

# --- 3. Create app user and directory ---
echo "[3/8] Setting up app directory..."
id -u lexica &>/dev/null || useradd -m -s /bin/bash lexica
mkdir -p /opt/lexica
chown lexica:lexica /opt/lexica

# --- 4. Clone or pull the repo ---
echo "[4/8] Fetching code..."
if [ -d /opt/lexica/.git ]; then
    cd /opt/lexica
    sudo -u lexica git fetch origin
    sudo -u lexica git checkout main
    sudo -u lexica git pull origin main
else
    sudo -u lexica git clone https://github.com/bbotsch301-cloud/Word.git /opt/lexica
    cd /opt/lexica
    sudo -u lexica git checkout main
fi

# --- 5. Install dependencies and build ---
echo "[5/8] Installing dependencies (this takes a few minutes)..."
cd /opt/lexica
sudo -u lexica npm ci --production=false 2>&1 | tail -1

echo "[5/8] Building Next.js..."
sudo -u lexica npm run build 2>&1 | tail -3

# --- 6. Environment setup ---
echo "[6/8] Setting up environment..."
if [ ! -f /opt/lexica/.env.local ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    cat > /opt/lexica/.env.local << ENVEOF
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=http://5.78.180.9
NODE_ENV=production
ENVEOF
    chown lexica:lexica /opt/lexica/.env.local
    chmod 600 /opt/lexica/.env.local
    echo "  Created .env.local with generated NEXTAUTH_SECRET"
else
    echo "  .env.local already exists, skipping"
fi

# --- 7. Check if database exists ---
echo "[7/8] Checking database..."
if [ ! -f /opt/lexica/data/lexica.db ]; then
    echo "  WARNING: lexica.db not found!"
    echo "  You need to build it. Run:"
    echo "    cd /opt/lexica && sudo -u lexica npm run db:rebuild"
    echo "  This downloads sources and builds the database (~30 min)"
    echo ""
    echo "  OR copy an existing lexica.db to /opt/lexica/data/lexica.db"
    mkdir -p /opt/lexica/data
    chown lexica:lexica /opt/lexica/data
else
    echo "  lexica.db found ($(du -h /opt/lexica/data/lexica.db | cut -f1))"
fi

# --- 8. PM2 setup ---
echo "[8/8] Starting app with PM2..."
cd /opt/lexica
sudo -u lexica pm2 delete lexica 2>/dev/null || true
sudo -u lexica pm2 start npm --name lexica -- start
sudo -u lexica pm2 save
pm2 startup systemd -u lexica --hp /home/lexica > /dev/null 2>&1

# --- Nginx config ---
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/lexica << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files cache
    location /_next/static/ {
        proxy_pass http://127.0.0.1:5000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/lexica /etc/nginx/sites-enabled/lexica
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# --- Firewall ---
echo "Configuring firewall..."
ufw allow OpenSSH > /dev/null 2>&1
ufw allow 'Nginx Full' > /dev/null 2>&1
echo "y" | ufw enable > /dev/null 2>&1

echo ""
echo "============================================"
echo "  LEXICA deployed!"
echo "  http://5.78.180.9"
echo "============================================"
echo ""
if [ ! -f /opt/lexica/data/lexica.db ]; then
    echo "NEXT STEP: Build the database:"
    echo "  ssh root@5.78.180.9"
    echo "  cd /opt/lexica && sudo -u lexica npm run db:rebuild"
    echo "  sudo -u lexica pm2 restart lexica"
    echo ""
fi
echo "To add a domain + SSL later:"
echo "  1. Point your domain DNS A record to 5.78.180.9"
echo "  2. Edit /etc/nginx/sites-available/lexica — change server_name"
echo "  3. Run: certbot --nginx -d yourdomain.com"
echo ""
echo "To update the app:"
echo "  cd /opt/lexica && git pull origin main && npm ci && npm run build && pm2 restart lexica"
echo ""
