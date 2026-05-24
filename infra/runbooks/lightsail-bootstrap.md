# Lightsail Bootstrap Runbook

Use this after Terraform creates the QA or production Lightsail host.

Current QA host:

- instance: `ecom-qa-medusa`
- public IP: keep the live value in private operator notes.
- Tailscale IP: keep the live value in private operator notes.
- SSH user: `ubuntu`
- SSH key: `~/.ssh/id_ed25519_ecom_lightsail`

## Bootstrap

Copy and run the committed bootstrap script:

```sh
scp -i ~/.ssh/id_ed25519_ecom_lightsail infra/scripts/bootstrap-lightsail.sh ubuntu@<qa-public-ip>:/tmp/bootstrap-lightsail.sh
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@<qa-public-ip> 'sudo bash /tmp/bootstrap-lightsail.sh'
```

Then connect the host to Tailscale:

```sh
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@<qa-public-ip> 'sudo tailscale up --ssh --hostname=ecom-qa-medusa'
```

Open the Tailscale login URL printed by the command and approve the device.

## Verify

```sh
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@<qa-public-ip> 'docker --version'
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@<qa-public-ip> 'docker compose version'
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@<qa-public-ip> 'systemctl is-active caddy'
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@<qa-public-ip> 'tailscale status'
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@<qa-public-ip> 'swapon --show'
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@<qa-public-ip> 'cat /proc/sys/vm/swappiness'
```

After Tailscale SSH is verified from the operator machine, public SSH must be closed:

```sh
mise exec -- terraform -chdir=infra/terraform/environments/qa plan \
  -var aws_profile=personal \
  -var lightsail_ssh_public_key_path=~/.ssh/id_ed25519_ecom_lightsail.pub \
  -var 'lightsail_temporary_ssh_cidrs=[]' \
  -out qa-close-public-ssh.tfplan
```

Review and apply that plan only after Tailscale access works.

Current QA has already been bootstrapped and public SSH is closed. Routine SSH:

```sh
ssh ubuntu@<tailscale-ip-or-magicdns-name>
```

## Notes

- Bootstrap does not deploy Medusa.
- Bootstrap does not contain live secrets.
- Vector is installed but disabled until the Better Stack source token and final Vector config are available from SSM.
- Host Node.js is not installed; Medusa uses Node inside the Docker image.

## Better Stack Vector Logs

The Better Stack source token is stored in SSM, not in Git.

Current QA source:

- Better Stack source: `ecom-qa-medusa-logs`
- source ID: `source-id`
- platform: `ubuntu`
- data region: `germany` because this Better Stack account currently rejects `singapore`
- SSM parameter: `/ecom/qa/host/BETTER_STACK_SOURCE_TOKEN`

To install or refresh the Vector config on QA:

```sh
scp infra/scripts/configure-betterstack-vector.sh ubuntu@<tailscale-ip-or-magicdns-name>:/tmp/configure-betterstack-vector.sh
AWS_PROFILE=personal aws ssm get-parameter \
  --region ap-southeast-1 \
  --name /ecom/qa/host/BETTER_STACK_SOURCE_TOKEN \
  --with-decryption \
  --query Parameter.Value \
  --output text \
  | ssh ubuntu@<tailscale-ip-or-magicdns-name> 'umask 077; cat >/tmp/betterstack-source-token; sudo SOURCE_TOKEN_FILE=/tmp/betterstack-source-token bash /tmp/configure-betterstack-vector.sh; rm -f /tmp/betterstack-source-token'
```

Verify:

```sh
ssh ubuntu@<tailscale-ip-or-magicdns-name> 'systemctl is-active vector'
ssh ubuntu@<tailscale-ip-or-magicdns-name> 'sudo journalctl -u vector -n 50 --no-pager'
```

Then check Better Stack Telemetry live tail for the source.
