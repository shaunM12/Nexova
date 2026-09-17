#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REGISTRY="$ROOT/config/ports.json"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required for npm run ports"
  exit 1
fi

python3 - <<PY
import json, subprocess, urllib.request

with open("$REGISTRY") as f:
    data = json.load(f)

def listening(port: int) -> bool:
    try:
        out = subprocess.check_output(
            ["lsof", "-nP", f"-iTCP:{port}", "-sTCP:LISTEN"],
            stderr=subprocess.DEVNULL,
            text=True,
        )
        return bool(out.strip())
    except subprocess.CalledProcessError:
        return False

print("")
print("Nexova local services")
print("=" * 56)
for s in data["services"]:
    port = s["port"]
    up = listening(port)
    state = "UP  " if up else "DOWN"
    planned = s.get("status", "")
    tag = f"{state}" if planned == "active" or up else f"{state} ({planned})"
    print(f"  [{tag}]  {port:<5}  {s['label']}")
    print(f"           {s['url']}")
    if s.get("notes"):
        print(f"           {s['notes']}")
    print("")
print("Tip: public + backoffice share port 3456 (different routes).")
print("     Cursor Ports panel is unreliable on local Mac folders;")
print("     use this registry when you have multiple processes.")
print("")
PY
