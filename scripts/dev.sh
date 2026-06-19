#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

echo "Starting share server on :8001..."
(cd "$SHARE_DIR" && npm run dev) &
SHARE_PID=$!

echo "Starting TweetyProject server on :8080..."
(cd "$SCRIPT_DIR/../third-party/TweetyProjectTeam/TweetyProject" && mvn spring-boot:run -pl org-tweetyproject-web -q) &
TWEETY_PID=$!

echo "Starting dev server..."
cd "$SCRIPT_DIR/.." && npm run dev
