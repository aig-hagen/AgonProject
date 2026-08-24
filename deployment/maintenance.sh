#!/usr/bin/env bash
#
# Toggle AgonProject maintenance mode on the running container.
# While the flag file exists, Caddy serves maintenance.html (HTTP 503) for
# every request. Takes effect immediately, no restart needed.
#
# Usage:
#   ./maintenance.sh on      # show the maintenance page
#   ./maintenance.sh off     # back to normal
#   ./maintenance.sh status  # report current state
#
# Run from the directory containing compose.yml.
set -euo pipefail

SERVICE="agonproject"
FLAG="/opt/app/dist/maintenance.flag"

exec_in() { docker compose exec -u www-data "$SERVICE" "$@"; }

case "${1:-}" in
	on)
		exec_in touch "$FLAG"
		echo "Maintenance mode ENABLED."
		;;
	off)
		exec_in rm -f "$FLAG"
		echo "Maintenance mode DISABLED."
		;;
	status)
		if exec_in test -f "$FLAG"; then
			echo "Maintenance mode is ON."
		else
			echo "Maintenance mode is OFF."
		fi
		;;
	*)
		echo "Usage: $0 {on|off|status}" >&2
		exit 1
		;;
esac
