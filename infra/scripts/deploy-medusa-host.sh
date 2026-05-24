#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/ecom}"
COMPOSE_FILE="${COMPOSE_FILE:-${APP_DIR}/compose/docker-compose.qa.yml}"
ENV_FILE="${ENV_FILE:-${APP_DIR}/shared/env/medusa.qa.env}"
IMAGE="${MEDUSA_IMAGE:?Set MEDUSA_IMAGE to the immutable GHCR image tag}"

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  echo "Compose file not found: ${COMPOSE_FILE}" >&2
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Medusa env file not found: ${ENV_FILE}" >&2
  exit 1
fi

install -d -m 0755 "${APP_DIR}/shared"
release_env="${APP_DIR}/shared/release.env"
cat >"${release_env}" <<EOF
MEDUSA_IMAGE=${IMAGE}
MEDUSA_ENV_FILE=${ENV_FILE}
EOF
chmod 0600 "${release_env}"

docker compose --env-file "${release_env}" -f "${COMPOSE_FILE}" --profile migrate run --rm medusa-migrate
docker compose --env-file "${release_env}" -f "${COMPOSE_FILE}" up -d medusa-server medusa-worker

sudo tee /etc/caddy/Caddyfile >/dev/null <<'EOF'
{
  admin localhost:2019
}

:80 {
  reverse_proxy 127.0.0.1:29181
}
EOF
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy

for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:29181/health >/dev/null; then
    docker image prune -af >/dev/null
    echo "Medusa deploy completed."
    exit 0
  fi
  sleep 5
done

echo "Medusa did not become healthy on 127.0.0.1:29181." >&2
docker compose --env-file "${release_env}" -f "${COMPOSE_FILE}" ps >&2
docker compose --env-file "${release_env}" -f "${COMPOSE_FILE}" logs --tail=200 medusa-server >&2
exit 1
