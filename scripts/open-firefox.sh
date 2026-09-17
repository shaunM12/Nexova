#!/usr/bin/env bash
set -euo pipefail

PORT=3456
URL="http://127.0.0.1:${PORT}"

open -a Firefox "$URL"
