# Lightsail Recovery Runbook

Use Terraform and the bootstrap runbook as the primary recovery path.

For QA, the host can be recreated from Terraform if disposable state remains external. The QA instance must not hold production database, Redis, media, payment, or order state.

For production later, Lightsail automatic snapshots are host recovery convenience only. Durable data lives in Neon, Upstash, R2, GHCR, Terraform state, and deployment automation.

Recovery outline:

1. Confirm the target environment and avoid touching production unless explicitly approved.
2. Review Terraform plan for the affected environment.
3. Recreate or replace the Lightsail host through Terraform.
4. Run `infra/runbooks/lightsail-bootstrap.md`.
5. Redeploy Medusa through the approved GitHub Actions deployment path.
6. Verify health checks, Caddy, Tailscale, Docker, logs, and external data connectivity.
