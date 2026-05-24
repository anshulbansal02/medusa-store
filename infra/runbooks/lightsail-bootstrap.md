# Lightsail Bootstrap Runbook

Use this after Terraform creates the QA or production Lightsail host.

Current QA host:

- instance: `ecom-qa-medusa`
- public IP: `52.77.164.161`
- Tailscale IP: `100.71.144.128`
- SSH user: `ubuntu`
- SSH key: `~/.ssh/id_ed25519_ecom_lightsail`

## Bootstrap

Copy and run the committed bootstrap script:

```sh
scp -i ~/.ssh/id_ed25519_ecom_lightsail infra/scripts/bootstrap-lightsail.sh ubuntu@52.77.164.161:/tmp/bootstrap-lightsail.sh
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@52.77.164.161 'sudo bash /tmp/bootstrap-lightsail.sh'
```

Then connect the host to Tailscale:

```sh
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@52.77.164.161 'sudo tailscale up --ssh --hostname=ecom-qa-medusa'
```

Open the Tailscale login URL printed by the command and approve the device.

## Verify

```sh
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@52.77.164.161 'docker --version'
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@52.77.164.161 'docker compose version'
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@52.77.164.161 'systemctl is-active caddy'
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@52.77.164.161 'tailscale status'
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@52.77.164.161 'swapon --show'
ssh -i ~/.ssh/id_ed25519_ecom_lightsail ubuntu@52.77.164.161 'cat /proc/sys/vm/swappiness'
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
ssh ubuntu@100.71.144.128
```

## Notes

- Bootstrap does not deploy Medusa.
- Bootstrap does not contain live secrets.
- Vector is installed but disabled until the Better Stack source token and final Vector config are available from SSM.
- Host Node.js is not installed; Medusa uses Node inside the Docker image.
