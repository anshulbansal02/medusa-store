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

required_env_keys=(
  DATABASE_URL
  REDIS_URL
  JWT_SECRET
  COOKIE_SECRET
  MEDUSA_BACKEND_URL
  MEDUSA_ADMIN_URL
  STORE_CORS
  ADMIN_CORS
  AUTH_CORS
)

install -d -m 0755 "${APP_DIR}/shared"
release_env="${APP_DIR}/shared/release.env"
cat >"${release_env}" <<EOF
MEDUSA_IMAGE=${IMAGE}
MEDUSA_ENV_FILE=${ENV_FILE}
EOF
chmod 0600 "${release_env}"

read_env_value() {
  local key="$1"
  awk -F= -v key="${key}" '$1 == key { print $2; exit }' "${ENV_FILE}" \
    | tr -d '\r' \
    | sed -e 's/^"//' -e 's/"$//'
}

for key in "${required_env_keys[@]}"; do
  if [[ -z "$(read_env_value "${key}")" ]]; then
    echo "Required Medusa env key is missing or empty: ${key}" >&2
    exit 1
  fi
done

url_to_host() {
  local url="$1"
  if [[ "${url}" == https://* ]]; then
    url="${url#https://}"
    printf '%s\n' "${url%%/*}"
  fi
}

caddy_sites=()
for url in "$(read_env_value MEDUSA_BACKEND_URL)" "$(read_env_value MEDUSA_ADMIN_URL)"; do
  host="$(url_to_host "${url}")"
  if [[ -n "${host}" && ! " ${caddy_sites[*]} " =~ " ${host} " ]]; then
    caddy_sites+=("${host}")
  fi
done

caddy_site=":80"
if [[ "${#caddy_sites[@]}" -gt 0 ]]; then
  caddy_site="${caddy_sites[0]}"
  for ((i = 1; i < ${#caddy_sites[@]}; i++)); do
    caddy_site="${caddy_site}, ${caddy_sites[$i]}"
  done
fi

docker compose --env-file "${release_env}" -f "${COMPOSE_FILE}" --profile migrate run --rm medusa-migrate
docker compose --env-file "${release_env}" -f "${COMPOSE_FILE}" up -d medusa-server medusa-worker

sudo tee /etc/caddy/Caddyfile >/dev/null <<'EOF'
{
  admin localhost:2019
}
EOF
sudo tee -a /etc/caddy/Caddyfile >/dev/null <<EOF

${caddy_site} {
  reverse_proxy 127.0.0.1:29181
}
EOF
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy

for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:29181/health >/dev/null && curl -fsS http://127.0.0.1:29181/ready >/dev/null; then
    docker image prune -af >/dev/null
    echo "Medusa deploy completed."
    exit 0
  fi
  sleep 5
done

echo "Medusa did not become healthy and ready on 127.0.0.1:29181." >&2
docker compose --env-file "${release_env}" -f "${COMPOSE_FILE}" ps >&2
docker compose --env-file "${release_env}" -f "${COMPOSE_FILE}" logs --tail=200 medusa-server >&2
exit 1
