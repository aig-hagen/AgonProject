#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Usage analytics is off in dev by default. Enable it for a run without touching
# .env by passing ANALYTICS=1:  ANALYTICS=1 ./scripts/dev.sh
case "${ANALYTICS:-}" in
    1 | true | yes)
        export VITE_ANALYTICS_ENABLED=true
        echo "Usage analytics: ENABLED for this run"
        ;;
    *)
        echo "Usage analytics: off (run with ANALYTICS=1 to enable)"
        ;;
esac

cleanup() {
    echo ""
    echo "Stopping servers..."
    kill "$GRAPH_GEN_PID" 2>/dev/null || true
    kill "$SHARE_PID" 2>/dev/null || true
    kill "$TWEETY_PID" 2>/dev/null || true
    wait "$GRAPH_GEN_PID" 2>/dev/null || true
    wait "$SHARE_PID" 2>/dev/null || true
    wait "$TWEETY_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Preflight: fail fast with a clear message if a port the dev stack needs is
# already held — usually an orphaned server from a run that was killed hard
# (its cleanup trap never fired). Set KILL_STALE=1 to reap the holders instead.
check_ports() {
    local stale=""
    for entry in "8000:graph-gen" "8001:share" "8080:TweetyProject" "5173:vite"; do
        local port="${entry%%:*}" name="${entry##*:}"
        local pid
        pid="$(ss -ltnpH "sport = :$port" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1)"
        [ -z "$pid" ] && continue
        if [ "${KILL_STALE:-}" = "1" ]; then
            echo "Port $port ($name) held by PID $pid — killing (KILL_STALE=1)"
            kill "$pid" 2>/dev/null || true
        else
            echo "  port $port ($name) is in use by PID $pid" >&2
            stale=1
        fi
    done
    if [ -n "$stale" ]; then
        echo "" >&2
        echo "A previous dev stack is still running. Stop it (e.g. 'kill <PID>')" >&2
        echo "or re-run with KILL_STALE=1 to clear these ports automatically." >&2
        exit 1
    fi
}
check_ports

GRAPH_GEN_VENV="$SCRIPT_DIR/../servers/graph-gen/.venv"
if [ ! -f "$GRAPH_GEN_VENV/bin/uvicorn" ]; then
    echo "Setting up graph-gen server venv..."
    python3 -m venv "$GRAPH_GEN_VENV"
    "$GRAPH_GEN_VENV/bin/pip" install -q -r "$SCRIPT_DIR/../servers/graph-gen/requirements.txt"
fi

echo "Starting graph-gen server on :8000..."
(cd "$SCRIPT_DIR/../servers/graph-gen" && .venv/bin/uvicorn server:app --port 8000) &
GRAPH_GEN_PID=$!

SHARE_DIR="$SCRIPT_DIR/../servers/share"
if [ ! -d "$SHARE_DIR/node_modules" ]; then
    echo "Installing share server dependencies..."
    (cd "$SHARE_DIR" && npm install -q)
fi

# Default a dev stats token so GET /stats works out of the box; override by
# exporting STATS_TOKEN before running this script.
STATS_TOKEN="${STATS_TOKEN:-devtest}"

echo "Starting share server on :8001 (stats token: $STATS_TOKEN)..."
(cd "$SHARE_DIR" && STATS_TOKEN="$STATS_TOKEN" npm run dev) &
SHARE_PID=$!

echo "Starting TweetyProject server on :8080..."
(cd "$SCRIPT_DIR/../third-party/TweetyProjectTeam/TweetyProject" && mvn spring-boot:run -pl org-tweetyproject-web -q) &
TWEETY_PID=$!

echo "Starting dev server..."
cd "$SCRIPT_DIR/.." && npm run dev
