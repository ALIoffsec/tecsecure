#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/var/www/tecsecure"
PLATFORM_DIR="$APP_DIR/platform"
STATE_DIR="/var/lib/tecsecure-deploy"
SUCCESS_MARKER="$STATE_DIR/successful-commit"

mkdir -p "$STATE_DIR"
exec 9>"$STATE_DIR/deploy.lock"
if ! flock -n 9; then
  echo "Deployment check skipped: another deployment is already running."
  exit 0
fi

on_error() {
  local exit_code=$?
  trap - ERR
  echo "Deployment failed at line ${BASH_LINENO[0]:-unknown} (exit $exit_code)." >&2
  git -C "$APP_DIR" status --short --untracked-files=all >&2 || true
  sudo -n /bin/systemctl status tecsecure-web tecsecure-worker --no-pager -l >&2 || true
  sudo -n /bin/journalctl -u tecsecure-web -u tecsecure-worker -n 50 --no-pager >&2 || true
  exit "$exit_code"
}
trap on_error ERR

cd "$APP_DIR"
if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "Deployment aborted: server checkout is not on the main branch." >&2
  exit 1
fi

# npm may rewrite optional-dependency metadata in its own worktree. Restore only
# this generated file; never discard other tracked, staged, or untracked changes.
git restore --worktree -- platform/package-lock.json
if git ls-files --error-unmatch platform/next-env.d.ts >/dev/null 2>&1; then
  git restore --worktree -- platform/next-env.d.ts
fi

if [[ -n "$(git status --porcelain --untracked-files=all)" ]]; then
  echo "Deployment blocked: unexpected local changes remain in the server checkout:" >&2
  git status --short --untracked-files=all >&2
  exit 1
fi

git fetch --prune origin main
TARGET_COMMIT="$(git rev-parse origin/main)"
CURRENT_COMMIT="$(git rev-parse HEAD)"
if [[ "$CURRENT_COMMIT" != "$TARGET_COMMIT" ]]; then
  git merge --ff-only "$TARGET_COMMIT"
fi
if [[ "$(git rev-parse HEAD)" != "$TARGET_COMMIT" ]]; then
  echo "Deployment aborted: checkout does not exactly match origin/main." >&2
  exit 1
fi

# Keep the deploy runner versioned with the application. Refresh it before
# building so future deployment fixes take effect on the next poll.
if [[ -f "$PLATFORM_DIR/scripts/tecsecure-auto-deploy.sh" ]] &&
  ! cmp -s "$PLATFORM_DIR/scripts/tecsecure-auto-deploy.sh" /usr/local/sbin/tecsecure-deploy; then
  sudo -n install -o root -g root -m 0755 \
    "$PLATFORM_DIR/scripts/tecsecure-auto-deploy.sh" /usr/local/sbin/tecsecure-deploy
  exec /usr/local/sbin/tecsecure-deploy
fi

SUCCESSFUL_COMMIT="$(cat "$SUCCESS_MARKER" 2>/dev/null || true)"
if [[ "$SUCCESSFUL_COMMIT" == "$TARGET_COMMIT" ]] &&
  systemctl is-active --quiet tecsecure-web &&
  systemctl is-active --quiet tecsecure-worker &&
  curl --fail --silent --show-error http://127.0.0.1:3001/api/health >/dev/null; then
  echo "Deployment already healthy at $TARGET_COMMIT."
  exit 0
fi

cd "$PLATFORM_DIR"
set -a
. ./.env.production
set +a

mkdir -p "$HOME/backups"
pg_dump "${DATABASE_URL%%\?*}" | gzip > "$HOME/backups/db-pre-deploy-$(date +%F-%H%M).sql.gz"
ls -1t "$HOME"/backups/db-pre-deploy-*.sql.gz | tail -n +11 | xargs -r rm --

npm ci
git -C "$APP_DIR" restore --worktree -- platform/package-lock.json
npx prisma generate
NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}" npm run build
if [[ ! -s .next/standalone/server.js ]]; then
  echo "Deployment aborted: standalone server.js was not produced by the build." >&2
  exit 1
fi

npx prisma migrate deploy

sudo -n install -d -o root -g root -m 0755 /usr/local/libexec
sudo -n install -o root -g root -m 0755 \
  scripts/ensure-standalone-build.sh /usr/local/libexec/tecsecure-ensure-standalone-build
sudo -n install -o root -g root -m 0644 \
  scripts/tecsecure-web.service /etc/systemd/system/tecsecure-web.service
sudo -n install -d -o root -g root -m 0755 \
  /etc/systemd/system/tecsecure-web.service.d
sudo -n install -o root -g root -m 0644 \
  scripts/tecsecure-web-recovery.conf \
  /etc/systemd/system/tecsecure-web.service.d/standalone-recovery.conf
sudo -n /bin/systemctl daemon-reload
sudo -n /bin/systemctl reset-failed tecsecure-web
sudo -n /bin/systemctl restart tecsecure-web tecsecure-worker

for attempt in {1..15}; do
  if systemctl is-active --quiet tecsecure-web &&
    systemctl is-active --quiet tecsecure-worker &&
    curl --fail --silent --show-error http://127.0.0.1:3001/api/health >/dev/null; then
    printf '%s\n' "$TARGET_COMMIT" > "$SUCCESS_MARKER"
    echo "Deployment completed and healthy: $TARGET_COMMIT"
    exit 0
  fi
  sleep 2
done

echo "Deployment health check failed." >&2
exit 1
