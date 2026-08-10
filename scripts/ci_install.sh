#!/usr/bin/env bash
set -euo pipefail

CI_LOG_DIR="ci_logs"
mkdir -p "$CI_LOG_DIR"

# Dump environment and npm info for diagnostics
echo "--- ENV ---" > "$CI_LOG_DIR/env.txt"
env >> "$CI_LOG_DIR/env.txt" 2>&1 || true

echo "--- NODE & NPM VERSIONS ---" > "$CI_LOG_DIR/node_npm_versions.txt"
node --version >> "$CI_LOG_DIR/node_npm_versions.txt" 2>&1 || true
npm --version >> "$CI_LOG_DIR/node_npm_versions.txt" 2>&1 || true

echo "--- NPM CONFIG LIST ---" > "$CI_LOG_DIR/npm_config.txt"
npm config list >> "$CI_LOG_DIR/npm_config.txt" 2>&1 || true

# Try to install up to 5 times to mitigate transient network errors
MAX_ATTEMPTS=5
ATTEMPT=1
EXIT_CODE=0

while [ "$ATTEMPT" -le "$MAX_ATTEMPTS" ]; do
  echo "Attempt $ATTEMPT of $MAX_ATTEMPTS" > "$CI_LOG_DIR/npm_install_attempt_$ATTEMPT.log"
  if [ -f package-lock.json ]; then
    echo "Using npm ci" >> "$CI_LOG_DIR/npm_install_attempt_$ATTEMPT.log"
    npm ci --prefer-offline --no-audit --no-fund >> "$CI_LOG_DIR/npm_install_attempt_$ATTEMPT.log" 2>&1 && EXIT_CODE=0 || EXIT_CODE=$?
  else
    echo "Using npm install (no lockfile)" >> "$CI_LOG_DIR/npm_install_attempt_$ATTEMPT.log"
    npm install --prefer-offline --no-audit --no-fund >> "$CI_LOG_DIR/npm_install_attempt_$ATTEMPT.log" 2>&1 && EXIT_CODE=0 || EXIT_CODE=$?
  fi

  if [ "$EXIT_CODE" -eq 0 ]; then
    echo "Install succeeded on attempt $ATTEMPT"
    break
  fi

  echo "Install failed on attempt $ATTEMPT with exit code $EXIT_CODE" >> "$CI_LOG_DIR/npm_install_attempt_$ATTEMPT.log"
  ATTEMPT=$((ATTEMPT+1))
  sleep 3
done

if [ "$EXIT_CODE" -ne 0 ]; then
  echo "All install attempts failed. See $CI_LOG_DIR for logs"
  exit $EXIT_CODE
fi

# If no package-lock exists, create one deterministically (no network changes expected)
if [ ! -f package-lock.json ]; then
  npm install --package-lock-only >> "$CI_LOG_DIR/package_lock_generation.log" 2>&1 || true
fi
