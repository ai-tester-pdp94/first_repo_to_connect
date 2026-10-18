#!/bin/sh
set -eu

data="${ERROR_BOOK_DATA_DIR:-/data}"

# A file uploaded as restore.db replaces the book before the app opens it.
# Swapping a live SQLite file under a running server can corrupt it, so the
# swap only happens here. The old files are kept next to it.
if [ -f "$data/restore.db" ]; then
  kept="$data/replaced-$(date -u +%Y%m%dT%H%M%SZ)"
  mkdir -p "$kept"
  for name in ledger.db ledger.db-wal ledger.db-shm; do
    if [ -f "$data/$name" ]; then
      mv "$data/$name" "$kept/$name"
    fi
  done
  mv "$data/restore.db" "$data/ledger.db"
  echo "Restored the book from restore.db. Previous files are in $kept."
fi

exec node node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port "${PORT:-8080}"
