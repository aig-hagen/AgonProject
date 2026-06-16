#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
    echo ""
    echo "Stopping servers..."
    kill "$GRAPH_GEN_PID" 2>/dev/null || true
    wait "$GRAPH_GEN_PID" 2>/dev/null || true
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

echo "Starting dev server..."
cd "$SCRIPT_DIR/.." && npm run dev
