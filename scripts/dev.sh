#!/usr/bin/env bash
set -euo pipefail

PORT=3456
URL="http://127.0.0.1:${PORT}"

# Free the port if a previous Next process is still holding it
EXISTING="$(lsof -t -iTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true)"
if [ -n "${EXISTING}" ]; then
  echo "Port ${PORT} busy (PID ${EXISTING}) — stopping it..."
  kill ${EXISTING} 2>/dev/null || true
  sleep 1
fi

# Explicit line Cursor/VS Code port detection looks for in terminal output
echo "Local: http://localhost:${PORT}"
echo "Nexova listening on port ${PORT}"

# Open Firefox once the server responds (system Firefox, not Cursor browser)
(
  for _ in $(seq 1 80); do
    if curl -sf -o /dev/null "$URL"; then
      open -a Firefox "$URL"
      exit 0
    fi
    sleep 0.25
  done
) &

# Bind localhost so local port detection can see it cleanly
exec npx next dev -p "$PORT" -H 127.0.0.1
