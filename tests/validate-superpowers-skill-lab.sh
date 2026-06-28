#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
node --experimental-strip-types ./extensions/superpowers-skill-lab/skill-lab.test.mjs
