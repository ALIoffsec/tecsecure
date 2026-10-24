#!/usr/bin/env bash
# Serverda ishlatiladi: bash scripts/deploy.sh  (/var/www/tecsecure/platform ichidan)
set -euo pipefail
cd "$(dirname "$0")/.."

git pull --ff-only
set -a; . ./.env.production; set +a

mkdir -p "$HOME/backups"
pg_dump "${DATABASE_URL%%\?*}" | gzip > "$HOME/backups/db-pre-deploy-$(date +%F-%H%M).sql.gz"

npm ci
npx prisma generate
npm run db:migrate
# 1GB RAM + swap: default Node heap (~490MB) is too small for next build type-check
NODE_OPTIONS="--max-old-space-size=1536" npm run build

sudo systemctl restart tecsecure-web tecsecure-worker
sleep 3
systemctl is-active tecsecure-web tecsecure-worker
curl -fsS -o /dev/null -w "site: %{http_code}\n" http://127.0.0.1:3001/ || echo "site tekshiruvi muvaffaqiyatsiz"
