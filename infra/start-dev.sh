#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# infra/start-dev.sh
# Build and start all AI Resume Tailorer services, then tail logs.
# Usage:  ./infra/start-dev.sh [--no-cache]
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

# ── Ensure .env exists ────────────────────────────────────────────────────────
if [ ! -f "./infra/.env" ]; then
    echo ""
    echo "⚠️  No infra/.env found. Copying from infra/.env.example..."
    cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
    echo "✅  Created infra/.env — please fill in your GOOGLE_API_KEY before using AI features."
    echo ""
fi

# ── Build arguments ───────────────────────────────────────────────────────────
BUILD_ARGS=""
if [[ "${1:-}" == "--no-cache" ]]; then
    BUILD_ARGS="--no-cache"
    echo "🔨  Building all images WITHOUT cache..."
else
    echo "🔨  Building all images (use --no-cache to force full rebuild)..."
fi

# ── Build all images in parallel ──────────────────────────────────────────────
docker compose build --parallel $BUILD_ARGS

echo ""
echo "🚀  Starting all containers..."
docker compose up -d

echo ""
echo "⏳  Waiting for health checks..."
sleep 5

# ── Print status table ────────────────────────────────────────────────────────
echo ""
echo "────────────────────────────────────────────────"
printf "%-22s %-8s %s\n" "SERVICE" "PORT" "STATUS"
echo "────────────────────────────────────────────────"

check_service() {
    local name="$1"
    local url="$2"
    if curl -sf "$url" > /dev/null 2>&1; then
        printf "%-22s %-8s %s\n" "$name" "${url##*:}" "✅ healthy"
    else
        printf "%-22s %-8s %s\n" "$name" "${url##*:}" "⏳ starting..."
    fi
}

check_service "frontend"        "http://localhost:3000"
check_service "parser-api"      "http://localhost:3001/health"
check_service "jd-analyzer-api" "http://localhost:3002/health"
check_service "rewrite-api"     "http://localhost:3003/health"
check_service "scoring-api"     "http://localhost:3005/health"
check_service "export-api"      "http://localhost:3006/health"

echo "────────────────────────────────────────────────"
echo ""
echo "📋  Tailing logs (Ctrl+C to stop watching)..."
echo "    Containers will continue running in the background."
echo ""
docker compose logs -f
