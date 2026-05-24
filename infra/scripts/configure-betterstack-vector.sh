#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root, for example: sudo $0" >&2
  exit 1
fi

source_token="${SOURCE_TOKEN:-}"
if [[ -z "${source_token}" && -n "${SOURCE_TOKEN_FILE:-}" ]]; then
  source_token="$(tr -d '\r\n' <"${SOURCE_TOKEN_FILE}")"
fi

if [[ -z "${source_token}" ]]; then
  echo "Set SOURCE_TOKEN or SOURCE_TOKEN_FILE." >&2
  exit 1
fi

config_path="${VECTOR_CONFIG_PATH:-/etc/vector/vector.yaml}"
install -d -m 0755 "$(dirname "${config_path}")"

if [[ -f "${config_path}" ]]; then
  cp "${config_path}" "${config_path}.bak-$(date +%Y%m%d%H%M%S)"
fi

docker_present=false
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  docker_present=true
fi

curl -fsS \
  "https://telemetry.betterstack.com/vector-yaml/ubuntu/${source_token}?docker=${docker_present}" \
  -o "${config_path}"

chmod 0640 "${config_path}"
chown root:root "${config_path}"

vector validate --config "${config_path}"
systemctl enable vector
systemctl restart vector
systemctl --no-pager --full status vector >/dev/null

echo "Better Stack Vector configuration installed."
