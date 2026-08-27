#!/bin/sh
set -e

echo "=============================="
echo "  Teleplay - Starting...    "
echo "=============================="
echo ""

echo "Environment:"
echo "   NODE_ENV  : ${NODE_ENV:-not set}"
echo "   PORT  : ${PORT:-not set}"
echo "   API_URL   : ${API_URL:-not set}"
if [ -n "$DATABASE_URL" ]; then
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):\([0-9]*\)/.*|\1|p')
  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):\([0-9]*\)/.*|\2|p')
  DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
  echo "   DB_HOST   : $DB_HOST"
  echo "   DB_PORT   : $DB_PORT"
  echo "   DB_NAME   : $DB_NAME"
fi
echo "=============================="
echo ""

exec "$@"
