#!/bin/sh
set -e

cd /app
npx prisma migrate deploy --schema prisma/schema.prisma

if [ "$SEED" = "true" ]; then
  npx prisma db seed
fi

cd /app/apps/api
exec node dist/main
