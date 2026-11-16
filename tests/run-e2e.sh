#!/usr/bin/env bash
# Full local test: fresh Postgres DB, migrations, production build, server, end-to-end checks.
# Needs: psql + a Postgres server reachable via DATABASE_URL.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${DATABASE_URL:?set DATABASE_URL}"
export AUTH_SECRET="${AUTH_SECRET:-test-secret-test-secret-test-secret-1234}"

npx prisma migrate deploy
npm run build
# Bundle the room content so the test can build real answers.
npx -y esbuild@0.25 lib/rooms/index.ts --bundle --format=esm --platform=node --outfile=.test-build/rooms.mjs --log-level=warning
npx -y esbuild@0.25 lib/scenarios/index.ts --bundle --format=esm --platform=node --outfile=.test-build/scenarios.mjs --log-level=warning

PAYWALL=on STRIPE_WEBHOOK_SECRET=whsec_test_bunker ADMIN_EMAILS=admin@example.com EMAIL_DEV_LOG=1 APP_URL=http://localhost:3000 RESEND_API_KEY= PORT=3000 npm start > /tmp/next.log 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
for i in $(seq 1 60); do curl -sf http://localhost:3000/ >/dev/null && break; sleep 1; done

STRIPE_WEBHOOK_SECRET=whsec_test_bunker node tests/e2e.mjs
if [ "${UI_TESTS:-0}" = "1" ]; then node tests/ui-place.mjs && node tests/ui-scenario.mjs; fi
