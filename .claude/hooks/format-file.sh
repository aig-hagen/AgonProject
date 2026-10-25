#!/usr/bin/env bash
# PostToolUse hook: lint-fix and format the single file Claude just edited.
set -u

command -v jq >/dev/null || exit 0
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
file=$(jq -r '.tool_input.file_path // empty')
[ -n "$file" ] && [ -f "$file" ] || exit 0

rel="${file#"$root"/}"
[ "$rel" != "$file" ] || exit 0
case "$rel" in
  node_modules/* | third-party/* | dist/* | docs/ideas/* | */node_modules/*) exit 0 ;;
esac

bin="$root/node_modules/.bin"
cd "$root" || exit 0

case "$rel" in
  *.ts | *.mts | *.vue)
    if ! out=$("$bin/eslint" --fix --cache "$rel" 2>&1); then
      echo "eslint found issues it could not fix in $rel:" >&2
      echo "$out" >&2
      status=2
    fi
    case "$rel" in src/*) "$bin/prettier" --write --log-level warn "$rel" >&2 ;; esac
    ;;
  src/*.css)
    "$bin/prettier" --write --log-level warn "$rel" >&2
    ;;
  *.md)
    case "$rel" in
      */* ) case "$rel" in docs/* | servers/*/README.md) ;; *) exit 0 ;; esac ;;
    esac
    "$bin/prettier" --write --log-level warn "$rel" >&2
    ;;
esac

exit "${status:-0}"
