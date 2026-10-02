#!/bin/sh
set -e

echo "==> Running Prisma Database Sync..."
npx prisma db push --skip-generate || true

echo "==> Starting Next.js Production Server..."
exec node server.js
