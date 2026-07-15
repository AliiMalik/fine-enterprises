#!/usr/bin/env bash
set -e

# Create DB tables if missing (idempotent)
npx prisma db push --schema server/src/prisma/schema.prisma

# Repopulate demo data (needed on Render free tier: ephemeral disk).
# For persistent-disk deployments, remove the line below after first boot.
npm run seed

exec node server/dist/index.js
