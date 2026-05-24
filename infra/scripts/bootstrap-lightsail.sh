#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root, for example: sudo $0" >&2
  exit 1
fi

if [[ -r /etc/os-release ]]; then
  # shellcheck disable=SC1091
  . /etc/os-release
fi

if [[ "${ID:-}" != "ubuntu" || "${VERSION_CODENAME:-}" != "jammy" ]]; then
  echo "This bootstrap is intended for Ubuntu 22.04 LTS (jammy)." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

install -m 0755 -d /etc/apt/keyrings

# Remove any stale vendor repository entries before the first apt update.
rm -f \
  /etc/apt/sources.list.d/caddy-stable.list \
  /etc/apt/sources.list.d/tailscale.list

apt-get update
apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  debian-archive-keyring \
  debian-keyring \
  gnupg \
  jq \
  lsb-release \
  ufw \
  unzip

# Docker Engine official APT repository.
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
cat >/etc/apt/sources.list.d/docker.list <<EOF
deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable
EOF

# Caddy official APT repository.
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key \
  | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
chmod a+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt \
  -o /etc/apt/sources.list.d/caddy-stable.list

# Tailscale official APT repository.
curl -fsSL "https://pkgs.tailscale.com/stable/ubuntu/${VERSION_CODENAME}.noarmor.gpg" \
  -o /usr/share/keyrings/tailscale-archive-keyring.gpg
chmod a+r /usr/share/keyrings/tailscale-archive-keyring.gpg
curl -fsSL "https://pkgs.tailscale.com/stable/ubuntu/${VERSION_CODENAME}.tailscale-keyring.list" \
  -o /etc/apt/sources.list.d/tailscale.list

apt-get update
apt-get install -y \
  caddy \
  containerd.io \
  docker-buildx-plugin \
  docker-ce \
  docker-ce-cli \
  docker-compose-plugin \
  tailscale

vector_version="${VECTOR_VERSION:-0.55.0-1}"
case "$(dpkg --print-architecture)" in
  amd64) vector_arch="amd64" ;;
  arm64) vector_arch="arm64" ;;
  armhf) vector_arch="armhf" ;;
  *)
    echo "Unsupported architecture for Vector: $(dpkg --print-architecture)" >&2
    exit 1
    ;;
esac
vector_deb="/tmp/vector_${vector_version}_${vector_arch}.deb"
curl --proto '=https' --tlsv1.2 --fail --location \
  "https://apt.vector.dev/pool/v/ve/vector_${vector_version}_${vector_arch}.deb" \
  -o "${vector_deb}"
dpkg -i "${vector_deb}"
rm -f "${vector_deb}"

install -d -m 0755 /home/ubuntu/ecom
install -d -m 0755 /home/ubuntu/ecom/{releases,shared,compose}
install -d -m 0750 /home/ubuntu/ecom/shared/env
chown -R ubuntu:ubuntu /home/ubuntu/ecom

usermod -aG docker ubuntu

cat >/etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "5"
  }
}
EOF

systemctl enable docker
systemctl restart docker

cat >/etc/caddy/Caddyfile <<'EOF'
{
  admin localhost:2019
}

:80 {
  respond "ecom QA host ready" 200
}
EOF

systemctl enable caddy
systemctl reload caddy || systemctl restart caddy

systemctl enable tailscaled
systemctl start tailscaled

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow in on tailscale0
if [[ "${ALLOW_TEMPORARY_PUBLIC_SSH:-true}" == "true" ]]; then
  ufw allow 22/tcp
fi
ufw --force enable

# Vector is installed during bootstrap. Keep it stopped until the Better Stack
# source token and final config are available from SSM.
usermod -aG docker,adm vector || true
systemctl disable --now vector || true

if [[ ! -f /swapfile ]]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
fi

if ! grep -qE '^/swapfile\s+' /etc/fstab; then
  echo '/swapfile none swap sw 0 0' >>/etc/fstab
fi

swapon --show=NAME --noheadings | grep -qx /swapfile || swapon /swapfile
cat >/etc/sysctl.d/99-ecom.conf <<'EOF'
vm.swappiness=10
EOF
sysctl --system >/dev/null

cat >/etc/ssh/sshd_config.d/99-ecom.conf <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
EOF

systemctl reload ssh || systemctl reload sshd

echo "Bootstrap complete."
echo "Next: run 'sudo tailscale up --ssh --hostname=ecom-qa-medusa' and complete the browser login."
