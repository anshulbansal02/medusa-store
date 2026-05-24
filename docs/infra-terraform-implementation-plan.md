# Infrastructure And Terraform Implementation Plan

Status: implementation planning guide
Last reviewed: 2026-05-24

This document defines the implementation order for the accepted infrastructure and Terraform decisions in `docs/infra-terraform-decisions.md`.

Use this as the execution guide for future agents. Do not reinterpret architecture decisions here. If an implementation step conflicts with a canonical decision, stop and ask before changing direction.

This is a clean infrastructure replacement plan. Do not preserve the old Railway-oriented infrastructure shape, create compatibility layers for it, or keep legacy resources alive unless they are explicitly listed as retained during the preflight inventory.

## Target Stack

```txt
Storefront:
  Vercel Pro
  Next.js App Router
  Cloudflare Web Analytics
  Sentry frontend project

Backend compute:
  AWS Lightsail 4 GB
  Singapore
  Ubuntu 22.04 LTS
  Docker Compose
  Caddy
  Tailscale
  Vector log shipper

Backend data:
  Neon Postgres Singapore
  Upstash Redis Singapore, pay-as-you-go
  Separate QA Neon branch
  Separate QA Upstash Redis

Media:
  Cloudflare R2
  media subdomain
  Manual R2 S3 credentials stored in SSM

Security:
  Cloudflare authoritative DNS
  Cloudflare proxied API/admin records
  Cloudflare Access email OTP for admin
  Cloudflare Turnstile for public forms
  Conservative Cloudflare WAF/security baseline
  Tailscale SSH/deploy access

Observability:
  Better Stack uptime checks and logs
  Sentry app error tracking
  /health liveness endpoint
  /ready readiness endpoint

IaC:
  Terraform
  Local plan/apply
  S3 remote state
  Native S3 lockfiles
  Separate prod and QA environments
```

## Existing State And Cleanup Policy

The repo previously documented a Vercel + Railway-oriented baseline. That baseline is obsolete for production infrastructure. The accepted target is Vercel + AWS Lightsail + Neon + Upstash + Cloudflare + Better Stack + Sentry.

Before implementing, create an inventory of existing external resources. The inventory must classify each resource as `keep`, `import`, `replace`, `delete`, or `ignore`.

Expected classification:

- Keep/import:
  - Existing Vercel project only if it is already the correct storefront project and can be cleanly managed/imported without preserving bad config.
  - Existing Cloudflare zone only if it owns the intended production domain.
  - Existing GitHub repository.
  - Existing Razorpay and Resend accounts/config, if already correct for the brand.
- Replace/delete:
  - Railway app hosting, Railway Postgres, Railway Redis, Railway deployment variables, and Railway domains if they exist.
  - Any old Medusa backend deployment that points to Railway data services.
  - Any stale DNS records pointing production or QA traffic at Railway or other rejected hosts.
  - Any obsolete CI/CD workflows that deploy to Railway or assume Railway-provided services.
- Ignore:
  - Historical research docs under `docs/fashion-commerce-platform-research.md` and `docs/external-researches/` unless a current canonical doc explicitly points back to them.
  - Manual sandbox/test resources that do not affect production, QA, DNS, billing, or secrets.

Cleanup rules:

- Prefer a clean setup over preserving old provider-specific wiring.
- Do not add backward compatibility for Railway, Railway environment names, Railway URLs, Railway database URLs, or Railway Redis URLs.
- Do not keep duplicate production paths. There should be one production backend host, one production Postgres, one production Redis, one production media bucket/domain, and one production deployment path.
- If an existing resource is worth keeping, import or document it deliberately; do not leave it as an unmanaged hidden dependency.
- If deleting a paid or production-facing resource might affect data, DNS, payments, email, or active traffic, stop and get explicit approval before deletion.
- If no real production traffic/data exists yet, prefer replacing/recreating the resource cleanly instead of bending the new Terraform around old mistakes.

## Implementation Principles

- Build infrastructure before deployments.
- Keep Terraform for durable infrastructure, not application releases.
- Keep GitHub Actions for builds, deploys, health checks, and migrations.
- Keep Terraform state in S3 and treat it as secret-bearing.
- Keep production data out of Lightsail.
- Keep QA data, Redis, secrets, and payment credentials separate from production.
- Prefer official provider resources where stable.
- If a provider is weak or ambiguous, pause and document the fallback before implementing.
- Never commit live secrets, `.env` files, private keys, provider tokens, or generated secret values.

## Execution Order At A Glance

Implement in this order:

1. Preflight and provider audit.
2. Terraform skeleton and pinned providers.
3. S3 Terraform state bootstrap.
4. Prod/QA Terraform environment roots.
5. AWS Lightsail, SSM, IAM, and snapshot baseline.
6. Cloudflare DNS, R2, Access, WAF baseline, Turnstile, and Web Analytics.
7. Upstash prod/QA Redis.
8. Neon prod/QA Postgres, or documented manual fallback if provider audit fails.
9. Vercel project, domains, and environment config.
10. Better Stack and Sentry observability.
11. Lightsail host bootstrap script and runbooks.
12. Medusa Docker runtime files and health endpoints.
13. GitHub Actions deploy workflows.
14. Manual provider setup for Razorpay, Resend, R2 credentials, GitHub repo protection, and provider tokens.
15. Security hardening.
16. Backup/recovery verification.
17. Cost and usage alerts.
18. QA smoke testing.
19. Production cutover.
20. Post-launch hardening.

This order intentionally provisions stable shared infrastructure before app deploy mechanics. Do not start production DNS cutover, live payment setup, or production migrations until QA has passed with separate QA data, Redis, secrets, and payment keys.

## Manual Inputs Needed

Collect these before starting implementation. Store real values in the operator password manager or approved secret store, not in docs.

Accounts:

- AWS account with permission for Lightsail, S3, IAM, SSM Parameter Store, and billing alerts.
- Cloudflare account with the domain zone.
- Vercel account/team/project access.
- Neon account.
- Upstash account.
- Better Stack account.
- Sentry account.
- GitHub repository admin access.
- Tailscale account.
- Razorpay account.
- Resend account.

Domain:

- Production domain name.
- Decision on exact brand domain values for:
  - `brand.com`
  - `www.brand.com`
  - `api.brand.com`
  - `admin.brand.com`
  - `media.brand.com`
  - `qa.brand.com`
  - `qa-api.brand.com`
  - `qa-admin.brand.com`

Access identities:

- Cloudflare Access admin email allowlist.
- Tailscale user/device identities.
- GitHub Actions deploy identity/tag policy for Tailscale.

Secrets/config values:

- Neon API key for Terraform provider auth, then Neon connection details after Terraform/provider setup or manual fallback.
- Upstash Redis URLs after Terraform setup.
- Razorpay QA and production key IDs/secrets/webhook secrets.
- Resend API key and sender domain details.
- R2 access key ID and secret access key.
- JWT and cookie secrets.
- Better Stack source token.
- Sentry DSNs/tokens.
- Vercel token and project/team IDs if needed for deployment.

## Phase 0: Preflight And Provider Audit

Goal: confirm the implementation path before writing Terraform resources that may be hard to unwind.

Steps:

1. Read current canonical docs:
   - `docs/infra-terraform-decisions.md`
   - `docs/architecture.md`
   - `docs/secrets-and-config.md`
   - `docs/cost-model.md`
   - `docs/launch-checklist.md`

2. Create an existing-resource inventory:
   - Vercel projects, domains, environment variables, and deploy hooks.
   - Railway projects, services, databases, variables, domains, and deploy workflows.
   - Cloudflare zones, DNS records, R2 buckets, Access apps, Turnstile widgets, and Web Analytics sites.
   - AWS resources, especially Lightsail, S3, SSM, IAM, and billing alerts.
   - Neon projects, branches, roles, and databases.
   - Upstash Redis databases.
   - Better Stack monitors/sources.
   - Sentry projects.
   - GitHub Actions workflows, environments, variables, and secrets.
   - Razorpay webhooks and keys.
   - Resend domains and API keys.

3. Classify every existing resource as `keep`, `import`, `replace`, `delete`, or `ignore`.

4. Remove or plan removal for obsolete resources:
   - Remove Railway deployment paths from the repo if present.
   - Remove Railway-specific environment variable assumptions from docs/workflows if present.
   - Remove stale DNS records pointing to rejected hosts before cutover, or schedule deletion at cutover if traffic still depends on them.
   - Cancel/delete paid unused resources after confirming they do not hold needed data.

5. Confirm local tooling:
   - Terraform CLI installed at the pinned version selected during implementation.
   - AWS CLI available for identity checks.
   - Cloudflare/Vercel/Upstash/Neon provider credentials available locally. For Neon, create an API key; the CLI OAuth login is not enough for Terraform.
   - Node/pnpm repo tooling remains aligned with project rules.

6. Audit provider support:
   - AWS provider supports Lightsail instance, static IP, firewall/public ports, S3, SSM, IAM.
   - Cloudflare provider supports DNS, R2 bucket/custom domain, Turnstile widget, and Web Analytics site. Access and WAF/ruleset resources require separate policy review before live wiring.
   - Upstash provider supports Redis database creation in Singapore.
   - Vercel provider supports project, domains, and environment variables without mixing incompatible env-var resource modes.
   - Better Stack provider supports uptime monitors and log/telemetry sources needed for v1.
   - Sentry provider supports projects and basic alert rules needed for v1.
   - Neon provider is reviewed before use. Check source, registry docs, import behavior, sensitive outputs, Singapore region ID, branch lifecycle, role/database management, and pooled/direct connection output.
   - Verify current official docs for prices, region names, provider resource behavior, and any limits that affect Terraform code.

Stop/go gate:

- If the Neon provider audit fails, use the documented fallback: create Neon manually and document/import stable resources later.
- If any non-Neon provider lacks stable support for a resource, keep that resource manual only after documenting the reason in `docs/infra-terraform-decisions.md`.
- If existing Railway resources contain real production data, stop before deleting and decide whether data export is needed.
- If any existing resource is already production-facing, stop before replacement unless the replacement/cutover order is documented.

Verification:

- Existing-resource inventory exists.
- Obsolete resources have either been deleted, scheduled for deletion, or explicitly marked as ignored.
- Record provider versions to pin.
- Record any manual fallback before implementation starts.
- Record the exact Terraform CLI version selected for the repo.

## Phase 1: Terraform Skeleton

Goal: create repo structure and basic quality gates.

Create:

```txt
infra/
  terraform/
    bootstrap/
    environments/
      prod/
      qa/
    modules/
      lightsail-medusa/
      cloudflare-site/
      upstash-redis/
      vercel-storefront/
      observability/
      neon-postgres/      # only if audit passes
      ssm-config/
```

Add root-module conventions:

- `versions.tf`
- `providers.tf`
- `variables.tf`
- `outputs.tf`
- `main.tf`
- `terraform.tfvars.example`
- committed non-secret `*.tfvars` where useful

Add scripts later during implementation:

- `terraform fmt` for all Terraform files.
- `terraform validate` for bootstrap/prod/qa root modules after init.

Rules:

- Pin Terraform CLI with `required_version`.
- Pin provider versions with `required_providers`.
- Commit `.terraform.lock.hcl`.
- Do not commit `.terraform/`, local state, plans, provider credentials, or secret tfvars.

Verification:

- `terraform fmt -check -recursive infra/terraform`
- `terraform init` and `terraform validate` in bootstrap after backend resources are defined.

## Phase 2: Terraform State Bootstrap

Goal: create the remote state backend.

Implement `infra/terraform/bootstrap` with local state only for:

- S3 state bucket.
- S3 bucket versioning.
- S3 bucket encryption, preferably SSE-KMS if the extra key setup is acceptable.
- S3 block public access.
- Bucket policy/IAM restrictions.
- Native S3 lockfile support in the environment backends.

Rules:

- Bootstrap local state must be treated carefully and not used for app/provider resources.
- The main prod/QA environments must use S3 remote state from their first real apply.
- Terraform state is secret-bearing because Terraform may manage SSM/Vercel secret values.

Manual inputs:

- AWS profile/account.
- State bucket name.
- AWS region for state resources.

Verification:

- S3 bucket exists.
- Versioning enabled.
- Encryption enabled.
- Public access blocked.
- Environment roots initialize with the S3 backend and `use_lockfile = true`.
- A test plan can acquire state lock.

## Phase 3: Core Terraform Environments

Goal: initialize prod and QA environment roots with remote state.

Implement:

```txt
infra/terraform/environments/prod/backend.tf
infra/terraform/environments/qa/backend.tf
```

Rules:

- Separate state keys for prod and QA.
- No Terraform workspaces for environment separation.
- Local `terraform plan/apply` only for v1.
- GitHub Actions may later run fmt/validate only, not apply.

Verification:

- `terraform init` succeeds in prod and QA.
- `terraform validate` succeeds.
- Running plan does not attempt to use local state.

## Phase 4: AWS Core Infrastructure

Goal: create QA Lightsail and AWS support resources first, while keeping production instantiation deferred until QA is set up and tested.

Terraform-managed:

- QA Lightsail instance in Singapore, defaulting to a 2 GB bundle for QA cost control.
- Ubuntu 22.04 LTS blueprint.
- Static IP.
- Static IP attachment.
- Lightsail firewall/public ports:
  - `80/tcp` open publicly for launch.
  - `443/tcp` open publicly for launch.
  - `22/tcp` only for bootstrap if needed, then closed after Tailscale access is verified.
- Automatic Lightsail snapshots for active Medusa Lightsail hosts, starting with QA.
- SSM Parameter Store hierarchy:
  - `/ecom/prod/medusa/*`
  - `/ecom/qa/medusa/*`
  - Start with non-secret QA `String` runtime parameters managed by Terraform.
  - Add real `SecureString` secrets only after the provider/state write workflow is reviewed.
- IAM policies/users/roles needed for local Terraform and deploy-time SSM reads:
  - GitHub Actions uses OIDC and short-lived AWS credentials, not long-lived AWS access keys.
  - QA deploy role trust is scoped to `repo:anshulbansal02/medusa-store:environment:qa`.
  - QA deploy role may read only `/ecom/qa/medusa/*`.
- Billing/usage alerts where AWS supports them cleanly.

Manual/fallback:

- If Lightsail firewall IP restriction support is insufficient in Terraform, document the Terraform/provider limitation and handle post-launch Cloudflare-only origin restriction through the best supported path.

Rules:

- Do not put Postgres, Redis, or media on Lightsail disk.
- Public `22` must not remain open after Tailscale is verified.
- Lightsail snapshots are host recovery only, not data backup.

Verification:

- Instance created in Singapore.
- Static IP attached.
- `80/443` reachable before DNS cutover.
- Snapshot setting enabled.
- SSM paths exist.
- QA non-secret SSM parameters exist at `/ecom/qa/medusa/NODE_ENV`, `/ecom/qa/medusa/MEDUSA_WORKER_MODE`, and `/ecom/qa/medusa/S3_REGION`.
- GitHub Actions QA deploy IAM role exists and can only read `/ecom/qa/medusa/*`.
- State reflects resources.

## Phase 5: Cloudflare Foundation

Goal: make Cloudflare authoritative and configure the public edge.

Terraform-managed:

- DNS records:
  - apex redirect target/config where applicable.
  - `www`
  - `api`
  - `admin`
  - `media`
  - `qa`
  - `qa-api`
  - `qa-admin`
- `api` and `admin` proxied through Cloudflare.
- Full end-to-end HTTPS posture; never use Flexible SSL.
- R2 bucket and supported settings.
- Media DNS/custom-domain resources where provider support is reliable.
- Cloudflare Access application for `admin.brand.com`.
- Cloudflare Access policy using email OTP and approved admin email allowlist.
- Conservative WAF/security baseline.
- Turnstile widgets for QA and production public forms.
- Cloudflare Web Analytics config if provider support is reliable; otherwise document manual setup.
- Billing/usage alerts where available.

Manual:

- Domain nameserver cutover if the domain is currently Shopify-managed.
- R2 S3 access key/secret generation in Cloudflare dashboard.
- Store R2 credentials in SSM SecureString.

Rules:

- Do not enable global Bot Fight Mode at launch.
- Do not add aggressive country blocks or broad API challenges at launch.
- Cloudflare Access protects admin, but Medusa Admin auth remains required.
- Turnstile tokens must be verified server-side in app code.

Verification:

- Cloudflare is authoritative before production cutover.
- `api` and `admin` records are proxied.
- Access blocks unauthenticated `admin`.
- Email OTP allowlist works.
- Caddy origin still serves valid HTTPS.
- R2 bucket exists.
- Media domain resolves and serves test object when configured.
- Turnstile sitekeys/secrets are stored/configured per environment.

## Phase 6: Upstash Redis

Goal: provision production and QA Redis.

Terraform-managed:

- Production Upstash Redis in Singapore.
- QA Upstash Redis in Singapore.
- Use Upstash Global Redis with Singapore as the primary region because Regional Redis is legacy/deprecated.
- Use the provider/API minimum `$20` budget guardrail.
- Pay-as-you-go pricing initially.
- Outputs/SSM params for Redis URLs if provider behavior supports secure handling.
- Usage/billing alert if available.

Rules:

- QA must never share production Redis.
- Redis is not source of truth.
- No separate Redis backup/export plan for v1.
- Review pay-as-you-go usage after QA and early production.

Verification:

- Production Redis reachable from local test client.
- QA Redis separate from prod.
- Medusa env uses the right URL per environment.

## Phase 7: Neon Postgres

Goal: provision or document production and QA Postgres.

If provider audit passes, Terraform-managed:

- Neon project in AWS Singapore (`aws-ap-southeast-1`).
- Production branch/database/role.
- QA branch/database/role.
- Outputs/SSM params for pooled/direct connection details if safe.
- Branch lifecycle and reset/refresh rules documented.
- Usage/billing alert if available.

If provider audit fails:

- Create Neon project manually in Singapore.
- Create production DB/role manually.
- Create QA branch/role manually.
- Store connection strings in SSM.
- Document the manual resources and whether future import is possible.

Rules:

- Production uses Neon Singapore.
- Prefer pooled runtime connection strings unless Medusa/Neon guidance requires direct connection for a specific command.
- QA must use a Neon branch with separate credentials.
- Verify restore before launch.
- No external `pg_dump` backup for v1.

Verification:

- Production connection works.
- QA connection works and points to QA branch.
- Restore workflow tested in non-production context.
- SSM parameters populated.

## Phase 8: Vercel Storefront Infrastructure

Goal: manage storefront platform config while keeping deploys in GitHub Actions.

Terraform-managed where provider support is reliable:

- Vercel project.
- Domains.
- Environment variables.
- Production/preview environment values.

GitHub Actions-managed:

- Storefront deployment.
- Manual production workflow dispatch.

Rules:

- Do not mix Vercel project inline `environment` config with standalone environment variable resources.
- Secret env vars may enter Terraform state; state must remain locked down.
- `NEXT_PUBLIC_*` values must be browser-safe.
- Vercel deployments are not Terraform applies.

Verification:

- Vercel project exists.
- Domains connected.
- Preview/prod env vars configured.
- QA storefront deploy still works.
- Production deploy remains manual workflow dispatch.

## Phase 9: Observability Infrastructure

Goal: configure monitoring, alerts, logs, and error tracking.

Terraform-managed where stable:

- Better Stack uptime monitors:
  - storefront
  - `api` `/health`
  - admin hostname/access path where appropriate
  - SSL/domain expiry checks where supported
- Better Stack telemetry/log source.
- Sentry frontend project.
- Sentry backend project.
- Basic Sentry alert rules.

Manual bootstrap:

- Better Stack account and API token.
- Better Stack mobile app/push setup.
- Sentry account and API token.

Server bootstrap later configures:

- Vector log shipping to Better Stack.
- Docker log rotation.

Rules:

- Better Stack alerts use email + mobile push only.
- No Slack for v1.
- No custom WhatsApp/Telegram/Signal alert bridge for v1.
- No public Better Stack status page for v1.
- No worker heartbeat until a real worker-emitted signal exists.

Verification:

- Better Stack monitors exist.
- Test alert fires to email/mobile push.
- Sentry projects receive test events.
- Logs from Caddy/Docker/Medusa appear in Better Stack after server bootstrap.

## Phase 10: Lightsail Host Bootstrap

Goal: configure the VM after Terraform creates it.

Create under `infra/`:

```txt
infra/
  scripts/
    bootstrap-lightsail.sh
  runbooks/
    lightsail-bootstrap.md
    lightsail-recovery.md
    r2-credential-rotation.md
```

Bootstrap installs/configures:

- System updates.
- Docker Engine.
- Docker Compose plugin.
- Caddy.
- Tailscale.
- Vector.
- 2 GB swap file with low swappiness, such as `10`.
- Deployment user/directories.
- `/home/ubuntu/ecom` or chosen deployment root.
- Caddy base config.
- Docker daemon log rotation.
- Basic host hardening:
  - key-only SSH if SSH remains temporarily enabled.
  - public SSH closed after Tailscale is verified.
  - least practical sudo/deploy permissions.

Rules:

- Bootstrap scripts must not contain live secrets.
- App deployments do not happen in bootstrap.
- Host Node.js is not required for Medusa runtime.
- Node 24 is inside the Docker image.

Manual inputs:

- Initial access method: Lightsail browser SSH or temporary IP-restricted SSH.
- Tailscale auth/setup details.
- Better Stack Vector source token from SSM.

Verification:

- Docker works.
- `docker compose version` works.
- Caddy starts.
- Tailscale is connected.
- SSH over Tailscale works from operator device.
- GitHub Actions can reach the host over Tailscale before public SSH is closed.
- Vector sends a test log.
- Swap exists and swappiness is low.
- Public `22` closed after Tailscale verification.

## Phase 11: Medusa Docker Runtime Files

Goal: create production runtime files without secrets.

Add to repo:

- Medusa Dockerfile using official Node 24 Debian slim.
- Multi-stage build.
- `.dockerignore`.
- `infra/compose/docker-compose.prod.yml`.
- `infra/compose/docker-compose.qa.yml`.
- Caddyfile template or managed config.
- Health/readiness endpoints in Medusa:
  - `/health` shallow liveness.
  - `/ready` dependency readiness for Postgres/Redis.

Compose requirements:

- `medusa-server` service.
- `medusa-worker` service.
- Production services use `restart: unless-stopped`.
- QA services use the same restart policy on the dedicated QA Lightsail host.
- Containers are stateless.
- Images come from private GHCR.
- Use immutable image tags for production.
- Compose files require `MEDUSA_IMAGE` and `MEDUSA_ENV_FILE` at deploy time.
- Docker hard memory limits deferred until QA usage is observed.

Rules:

- No real env files committed.
- Runtime env files are generated on the server from SSM during deployment.
- No secrets in Docker image layers.

Verification:

- Local/CI Docker build succeeds.
- Medusa starts with test env.
- `/health` returns OK without DB dependency.
- `/ready` fails/succeeds appropriately based on dependency connectivity.
- Compose config validates with explicit `MEDUSA_IMAGE` and `MEDUSA_ENV_FILE` values.

## Phase 12: GitHub Actions Deployment

Goal: build, push, and deploy app images without Terraform applies.

Workflows:

- Lean CI:
  - format/lint where configured.
  - typecheck.
  - storefront production build.
  - Medusa production build.
  - Terraform fmt/validate later without apply permissions.
- Storefront QA deploy manual workflow dispatch from `dev`.
- Storefront production deploy manual workflow dispatch from `main`.
- Medusa QA deploy/start manual workflow dispatch from `dev`.
- Medusa production deploy manual workflow dispatch.

Remove or replace:

- Any workflow that deploys Medusa to Railway.
- Any workflow that assumes Railway-provided `DATABASE_URL`, `REDIS_URL`, domains, or service variables.
- Any workflow that deploys production automatically from `main` without manual dispatch/approval.

Medusa deploy flow:

1. Check CI prerequisites.
2. Build Medusa Docker image.
3. Push private GHCR image with immutable tag.
4. Join Tailscale from GitHub Actions deploy job.
5. SSH to Lightsail over Tailscale.
6. Fetch SSM parameters for target environment.
7. Write `.env.prod` or `.env.qa` with restrictive permissions.
8. Pull selected GHCR image.
9. Run QA migration automatically only against QA DB if selected.
10. Production migration requires explicit approval gate.
11. `docker compose up -d`.
12. Health check `/health`.
13. Readiness check `/ready` after dependencies should be available.
14. Report deployed tag.

Rollback:

- Redeploy previous immutable image tag.
- Do not rely on `latest`.
- Rollback app first; database rollback is separate and requires careful Neon restore/branch process.

Rules:

- GitHub repository settings/secrets/environments are manual for v1.
- GitHub Actions does not run Terraform apply.
- Direct pushes to `dev` run CI only and do not deploy automatically.
- Production releases go through PR merge into `main`.
- Production deploys are manual workflow dispatch.
- Production migrations require explicit approval.
- Do not use Watchtower/auto-updaters.
- Add `docker-rollout` later only after baseline deploy is stable.

Verification:

- QA deploy succeeds.
- Production dry run or smoke deploy succeeds before launch.
- Rollback runbook tested against QA.
- Deploy jobs can read only the target environment's SSM parameter path.
- Deploy jobs cannot mutate Terraform infrastructure.

## Phase 13: Manual Provider Setup

Goal: complete setup that is intentionally outside Terraform.

Manual:

- Razorpay:
  - QA/test keys.
  - Production/live keys.
  - Webhook URLs:
    - `{MEDUSA_BACKEND_URL}/hooks/payment/razorpay_razorpay`
  - Events:
    - `order.paid`
    - `payment.captured`
    - `payment.authorized`
    - `payment.failed`
  - Automatic capture setting verified.
  - Store keys/secrets in SSM.

- Resend:
  - Domain verification.
  - SPF/DKIM/DMARC.
  - API key.
  - Sender email.
  - Store secret/config in SSM.

- Cloudflare R2 credentials:
  - Create R2 S3 access credentials manually.
  - Scope least privilege to media bucket where possible.
  - Store access key ID and secret in SSM.
  - Document rotation.

- GitHub repository:
  - Branch protection for `dev` and `main`.
  - Actions environments.
  - Deploy credentials needed for Tailscale/GHCR/Vercel/SSM access.
  - Manual production approvals.
  - Removal of obsolete Railway variables, deploy keys, and environments after the new deploy path works.

- Railway, if it exists:
  - Confirm no required production data remains.
  - Export any data only if explicitly approved.
  - Delete or stop old app/database/cache services after DNS and deploy cutover.
  - Remove stale Railway domains and deployment variables.

Verification:

- Razorpay webhook test passes.
- Resend test email sends.
- R2 upload/read via Medusa provider works.
- GitHub deployment environment approvals work.

## Phase 14: Security Hardening

Goal: move from working setup to production posture.

Actions:

- Confirm Cloudflare Access protects admin.
- Confirm Medusa Admin auth remains enabled.
- Confirm public SSH is closed after Tailscale works.
- Confirm `api` and `admin` are Cloudflare-proxied.
- Confirm Caddy uses valid origin HTTPS.
- Confirm Cloudflare SSL mode is not Flexible.
- Confirm conservative Cloudflare WAF/security baseline is enabled.
- Confirm Bot Fight Mode and aggressive challenges are not enabled at launch.
- Confirm Turnstile server-side verification exists for public forms.
- Confirm CORS is exact, no wildcard production origins.
- Confirm no secrets in logs.
- Confirm no raw payment tokens/customer-sensitive data in logs.
- Confirm Docker log rotation.
- Confirm state bucket is private, encrypted, versioned, and restricted.

Post-stability hardening:

- Restrict Lightsail `80/443` origin access to Cloudflare IP ranges after DNS/TLS/deploy path is stable and the supported implementation path is clear.

Verification:

- Admin inaccessible without Cloudflare Access.
- API works through Cloudflare.
- Direct origin access posture matches launch/hardening phase.
- Tailscale deploy path works.

## Phase 15: Backup And Recovery Verification

Goal: prove recovery paths before launch.

Verify:

- Neon restore workflow in non-production context.
- QA branch reset/refresh process.
- Lightsail snapshot exists and recovery process is understood.
- GHCR immutable image rollback.
- Terraform state bucket versioning.
- R2 originals are organized outside app.
- R2 credential rotation runbook exists.
- No separate Redis backup is required.

Runbooks:

- Restore Neon to branch or point-in-time equivalent.
- Redeploy previous GHCR tag.
- Rebuild Lightsail host from Terraform + bootstrap + deploy.
- Rotate R2 credentials.
- Rotate JWT/cookie secrets.
- Rotate Razorpay webhook secret.

## Phase 16: Cost And Usage Alerts

Goal: catch surprise usage early.

Configure where provider support exists:

- AWS Lightsail and snapshot spend.
- Neon compute/storage/branch usage.
- Upstash command spend approaching fixed plan cost.
- Vercel usage/overage.
- Cloudflare R2 storage/operations.
- Better Stack log/monitor limits.
- Sentry event volume.

Rules:

- Use low v1 thresholds.
- Prefer Terraform-managed alerts where provider support is stable.
- Manual alerts are acceptable when Terraform support is weak.
- Review after first production month.

Verification:

- Test alert path where practical.
- Document where each alert lives.

## Phase 17: QA Smoke Testing

Goal: validate the full stack before production cutover.

QA checks:

- QA storefront loads.
- QA API reachable.
- QA admin reachable through appropriate protection.
- QA uses Neon QA branch.
- QA uses separate Upstash Redis.
- QA uses Razorpay test keys.
- QA uses separate secrets.
- Product catalog loads.
- Add to cart works.
- Checkout test payment succeeds/fails correctly.
- Order appears in Medusa Admin.
- Resend email test works if configured.
- R2 media upload/read works.
- Turnstile verification works on public forms.
- Better Stack receives logs and uptime signals.
- Sentry receives test errors.
- QA containers can be stopped after testing.

Stop/go gate:

- Do not proceed to production cutover if QA writes to production data, uses production Redis, or uses live payment keys.

## Phase 18: Production Cutover

Goal: safely expose production.

Pre-cutover:

- Cloudflare authoritative DNS active.
- Vercel production domain configured.
- API/admin/media records configured.
- Caddy production routes configured.
- Production SSM parameters populated.
- Production Neon/Upstash/R2/Resend/Razorpay configured.
- Better Stack/Sentry configured.
- Launch checklist reviewed.
- Obsolete Railway or other rejected deployment paths are disabled, deleted, or explicitly scheduled for deletion.
- DNS has no conflicting active records for the same production hostnames.

Cutover:

1. Deploy production storefront manually.
2. Deploy production Medusa manually.
3. Run approved production migrations if required.
4. Verify `/health`.
5. Verify `/ready`.
6. Verify product browsing.
7. Verify cart.
8. Verify Razorpay live-mode smoke path according to Razorpay runbook.
9. Verify admin behind Access.
10. Verify logs/errors/alerts.
11. Verify media.

Post-cutover:

- Keep close watch on Better Stack, Sentry, Vercel, Neon, Upstash, Cloudflare, Razorpay, Resend.
- Review costs after first day and first month.
- Track Cloudflare-only origin restriction as post-stability hardening.

## Phase 19: Post-Launch Hardening

Do after the launch path is stable:

- Delete remaining obsolete paid resources that were intentionally left until cutover safety was proven.
- Remove stale provider tokens and GitHub secrets that belonged only to the old infrastructure path.
- Confirm docs no longer describe Railway as an active production component outside historical research/decision context.
- Restrict Lightsail origin `80/443` to Cloudflare IP ranges if implementation support is reliable.
- Consider `docker-rollout` for near-zero-downtime `medusa-server` deploys.
- Tune Docker memory limits after observing QA/production usage.
- Review Upstash pay-as-you-go vs Fixed 250 MB.
- Review Better Stack/Sentry event/log volume.
- Review Lightsail snapshot cost.
- Review Cloudflare WAF/rate-limit rules based on actual traffic.
- Review whether Algolia should be added for best-in-class search.
- Review whether SES should replace Resend if email volume/cost justifies it.

## Agent Stop Conditions

Future agents must stop and ask before proceeding if:

- A provider cannot manage a resource that this plan expects Terraform to manage.
- Terraform would require committing or logging a secret.
- Neon provider audit fails and the fallback needs user approval.
- A manual account setup is blocked by missing credentials or dashboard access.
- A production deploy, migration, DNS cutover, or payment configuration step requires live credentials or business approval.
- Any step would alter production data, payment settings, DNS authority, or public admin access.
- Actual provider pricing/limits differ materially from the cost model.
- Terraform plan shows replacement or deletion of an existing production resource that is not covered by the resource inventory and cleanup policy.
- Vercel, Cloudflare, Neon, Upstash, Better Stack, or Sentry imports are ambiguous and could create duplicate production resources.

## Required Final Verification For Implementation

Before marking implementation complete, verify:

- Existing resource inventory was completed.
- Obsolete Railway/rejected infrastructure was removed, disabled, or explicitly marked ignored with reason.
- No active workflow deploys to Railway or depends on Railway data/cache variables.
- No active production DNS record points to rejected infrastructure.
- `terraform fmt` passes.
- `terraform validate` passes for bootstrap, prod, and QA roots.
- Terraform state is remote for prod/QA.
- State bucket is protected.
- Lightsail is reachable through Tailscale.
- Public SSH is closed after Tailscale verification.
- Caddy routes API/admin.
- Cloudflare Access protects admin.
- Medusa server and worker run separately.
- `/health` and `/ready` work.
- Logs reach Better Stack.
- Sentry receives test events.
- QA uses separate Neon/Upstash/secrets/payment keys.
- Production deploy is manual dispatch.
- Production migrations require explicit approval.
- Rollback by immutable GHCR tag is documented and tested in QA.
- Launch checklist is updated for any implementation-specific findings.

## References Checked During Planning

- Terraform S3 backend: https://developer.hashicorp.com/terraform/language/backend/s3
- AWS Lightsail firewall: https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-firewall-and-port-mappings-in-amazon-lightsail.html
- AWS Lightsail static IP behavior: https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-public-ip-and-private-ip-addresses-in-amazon-lightsail.html
- Cloudflare R2 Terraform example: https://developers.cloudflare.com/r2/examples/terraform/
- Vercel Terraform environment variables: https://registry.terraform.io/providers/vercel/vercel/latest/docs/resources/project_environment_variable
