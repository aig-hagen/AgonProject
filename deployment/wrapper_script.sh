#!/bin/bash

# Follows https://docs.docker.com/engine/containers/multi-service_container/

# Start the first process
java -jar ./web.jar --logging.config=./logback.xml --server.port=8081 &

# Start the second process
/opt/graph-gen-venv/bin/uvicorn server:app --app-dir /opt/graph-gen-server --host 127.0.0.1 --port 8082 &

# Start the third process
./caddy run --config ./Caddyfile &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
