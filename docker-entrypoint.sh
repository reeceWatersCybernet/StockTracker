#!/bin/sh
set -e

echo "==> Applying database migrations (prisma migrate deploy)"
npx prisma migrate deploy

echo "==> Starting Cybernet Stock Tracker on port ${PORT:-3000}"
exec npm run start -- --hostname 0.0.0.0 --port "${PORT:-3000}"
