#!/usr/bin/env bash
# Serverda ishlatiladi: bash scripts/deploy.sh  (/var/www/tecsecure/platform ichidan)
set -euo pipefail
cd "$(dirname "$0")/.."

git pull --ff-only
set -a; . ./.env.production; set +a

mkdir -p "$HOME/backups"
pg_dump "${DATABASE_URL%%\?*}" | gzip > "$HOME/backups/db-pre-deploy-$(date +%F-%H%M).sql.gz"
# keep only the 10 newest pre-deploy backups so the disk does not fill up
ls -1t "$HOME"/backups/db-pre-deploy-*.sql.gz | tail -n +11 | xargs -r rm --

npm ci
# server npm rewrites package-lock.json; keep the working tree clean for auto-deploy
git checkout -- package-lock.json
npx prisma generate
# 1GB RAM + swap: default Node heap (~490MB) is too small for next build type-check
NODE_OPTIONS="--max-old-space-size=1536" npm run build
if [[ ! -s .next/standalone/server.js ]]; then
  echo "Deployment aborted: standalone server.js was not produced by the build." >&2
  exit 1
fi

npm run db:migrate

sudo install -d -o root -g root -m 0755 /usr/local/libexec
sudo install -o root -g root -m 0644 scripts/ensure-standalone-build.sh /usr/local/libexec/tecsecure-ensure-standalone-build
sudo install -o root -g root -m 0644 scripts/tecsecure-web.service /etc/systemd/system/tecsecure-web.service
sudo install -d -o root -g root -m 0755 /etc/systemd/system/tecsecure-web.service.d
sudo install -o root -g root -m 0644 scripts/tecsecure-web-recovery.conf /etc/systemd/system/tecsecure-web.service.d/standalone-recovery.conf
sudo systemctl daemon-reload
sudo systemctl reset-failed tecsecure-web

sudo systemctl restart tecsecure-web tecsecure-worker

for attempt in {1..10}; do
  if systemctl is-active --quiet tecsecure-web &&
    systemctl is-active --quiet tecsecure-worker &&
    curl -fsS -o /dev/null http://127.0.0.1:3001/api/health; then
    echo "Deployment healthy."
    exit 0
  fi
  sleep 3
done

systemctl status tecsecure-web tecsecure-worker --no-pager -l || true
journalctl -u tecsecure-web -u tecsecure-worker -n 50 --no-pager
echo "Deployment health check failed." >&2
exit 1
