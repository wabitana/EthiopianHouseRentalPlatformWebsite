#!/bin/sh
set -e

echo "Starting Ethiopian House Rental Backend Entrypoint..."

# Run Prisma schema sync with database
echo "Syncing Prisma schema with database..."
npx prisma db push --accept-data-loss

# Run database seed (ignoring failure if already seeded)
echo "Seeding initial data if needed..."
npx ts-node --transpile-only prisma/seed.ts || echo "Seeding completed or already present."

echo "Starting node server..."
exec node dist/server.js
