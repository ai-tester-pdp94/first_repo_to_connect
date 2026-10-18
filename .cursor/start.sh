#!/usr/bin/env bash
set -euo pipefail

port=4317

port_open() {
  timeout 1 bash -c "echo >/dev/tcp/127.0.0.1/${port}" >/dev/null 2>&1
}

if port_open; then
  echo "Integration Error Book is already listening on 0.0.0.0:${port}."
  exit 0
fi

if [ -f .next/dev/lock ]; then
  pid="$(python3 -c 'import json; print(json.load(open(".next/dev/lock")).get("pid", ""))' 2>/dev/null || true)"
  if [ -n "${pid}" ] && kill -0 "${pid}" 2>/dev/null; then
    echo "Next.js is already starting (pid ${pid}); waiting for port ${port}."
    for _ in $(seq 1 30); do
      if port_open; then
        echo "Integration Error Book is listening on 0.0.0.0:${port}."
        exit 0
      fi
      sleep 1
    done
    echo "Existing Next.js process did not open port ${port}." >&2
    exit 1
  fi
  echo "Removing stale Next.js dev lock."
  rm -f .next/dev/lock
fi

exec npm run dev -- --hostname 0.0.0.0 --port "${port}"
