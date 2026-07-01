#!/usr/bin/env bash
set -euo pipefail


REMOTE="${1:?❌ Error: REMOTE is missing (arg 1, e.g. user@example.com)}"
TARGET_TAG="${2:?❌ Error: TARGET_TAG is missing (arg 2, e.g. v0.0.1)}"

function upload_image {
  local source_image=$1
  local target_image=$2

  docker tag "${source_image}" "${target_image}"
  echo "📤 Uploading ${source_image} as ${target_image} to ${REMOTE}."
  docker image save "${target_image}" \
  | gzip -9 \
  | ssh "${REMOTE}" "gunzip | docker image load"

  echo "✅ Uploaded ${source_image} as ${target_image} to ${REMOTE}."
}

upload_image "aig-hagen/AgonProject:latest" "aig-hagen/AgonProject:${TARGET_TAG}"
