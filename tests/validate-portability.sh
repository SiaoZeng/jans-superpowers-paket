#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLASS=""

usage() {
  cat >&2 <<'EOF'
usage: validate-portability.sh --class <all>
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --class)
      CLASS="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "unknown argument: $1" >&2
      usage
      exit 2
      ;;
  esac
done

if [[ "$CLASS" != "all" ]]; then
  usage
  exit 2
fi

node "$ROOT_DIR/tests/validate-public-sanitization.mjs"
echo "PORTABILITY_OK"
