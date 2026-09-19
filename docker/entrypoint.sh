#!/usr/bin/env bash
set -euo pipefail
cd /app
npm install
npx prisma generate
npx prisma migrate deploy
npm run import
exec npm run dev
