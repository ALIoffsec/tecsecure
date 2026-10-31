#!/usr/bin/env bash
set -euo pipefail

artifact=".next/standalone/server.js"

if [[ -s "$artifact" ]]; then
  exit 0
fi

echo "Standalone server is missing; rebuilding the production application."
NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}" npm run build

if [[ ! -s "$artifact" ]]; then
  echo "Startup aborted: production build did not produce $artifact." >&2
  exit 1
fi

echo "Standalone server build is ready."
