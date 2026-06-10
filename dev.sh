#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
    echo ""
    echo "Stopping servers..."
    kill "$TWEETY_PID" "$GRAPH_GEN_PID" 2>/dev/null || true
    wait "$TWEETY_PID" "$GRAPH_GEN_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

TWEETY_DIR="/home/lars/TweetyProject"
TWEETY_INSTALLED="$HOME/.m2/repository/org/tweetyproject/web/1.30-SNAPSHOT/web-1.30-SNAPSHOT.jar"

if [ ! -f "$TWEETY_INSTALLED" ]; then
    echo "Installing TweetyProject to local Maven repo..."
    (cd "$TWEETY_DIR" && mvn install -Dgpg.skip=true -Dmaven.test.skip)
fi

echo "Starting TweetyProject server on :8080..."
#(cd "$TWEETY_DIR" && mvn spring-boot:run -pl org-tweetyproject-web) &
#TWEETY_PID=$!

GRAPH_GEN_VENV="$SCRIPT_DIR/graph-gen-server/.venv"
if [ ! -f "$GRAPH_GEN_VENV/bin/uvicorn" ]; then
    echo "Setting up graph-gen-server venv..."
    python3 -m venv "$GRAPH_GEN_VENV"
    "$GRAPH_GEN_VENV/bin/pip" install -q -r "$SCRIPT_DIR/graph-gen-server/requirements.txt"
fi

echo "Starting graph-gen server on :8000..."
(cd "$SCRIPT_DIR/graph-gen-server" && .venv/bin/uvicorn server:app --port 8000) &
GRAPH_GEN_PID=$!

echo "Starting dev server..."
cd "$SCRIPT_DIR" && npm run dev
