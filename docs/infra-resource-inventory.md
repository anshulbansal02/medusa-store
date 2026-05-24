# Infrastructure Resource Inventory

Status: preflight template
Last reviewed: 2026-05-24

Use this file during Phase 0 of `docs/infra-terraform-implementation-plan.md`.

Do not paste secrets, tokens, connection strings, private keys, or customer data here. Record resource names, IDs, regions, URLs, owners, and deletion/import decisions only.

## Summary

| Area | Status | Notes |
| --- | --- | --- |
| Vercel | pending | Inventory projects, domains, env vars, deploy hooks. |
| Railway | pending | Replace/delete any app hosting, databases, Redis, variables, domains, and workflows if present. |
| Cloudflare | pending | Inventory zone, DNS, R2 buckets, Access apps, Turnstile widgets, Web Analytics. |
| AWS | in progress | Terraform state bucket created in `ap-southeast-1`; obsolete DynamoDB lock table removed after switching to native S3 lockfiles. Production Lightsail resources were removed after the QA-first sequencing decision. QA Lightsail, the first non-secret QA SSM runtime parameters, and GitHub Actions OIDC/QA SSM read IAM are Terraform-managed. Continue inventory for billing alerts. |
| Neon | pending | Inventory projects, branches, roles, databases, restore posture. |
| Upstash | pending | Inventory Redis databases and regions. |
| Better Stack | pending | Inventory monitors, log sources, alert channels. |
| Sentry | pending | Inventory organizations, projects, DSNs, alert rules. |
| GitHub | pending | Inventory workflows, environments, variables, secrets, branch protection. |
| Razorpay | pending | Inventory test/live keys, webhooks, capture settings. |
| Resend | pending | Inventory domains, sender config, API-key ownership. |

## Decisions

Use one row per external resource.

Classification values:

- `keep`: resource remains manual and intentionally unmanaged for now.
- `import`: resource should be imported into Terraform or another declared management path.
- `replace`: resource will be recreated in the accepted target stack.
- `delete`: resource should be removed after explicit approval where needed.
- `deleted`: resource has already been removed.
- `ignore`: resource is unrelated sandbox/history and does not affect production, QA, DNS, billing, or secrets.

| Provider | Resource | Environment | Region | Current owner | Classification | Reason | Required action | Approval needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vercel | storefront project | QA/prod | global | pending | pending | Confirm whether existing project is correct. | Inventory project ID, domains, env vars. | no |
| Railway | Medusa app/services | QA/prod | pending | pending | replace/delete | Railway production path is obsolete. | Confirm no production data or active traffic before deletion. | yes if data/traffic exists |
| Cloudflare | production zone | prod | global | pending | pending | Cloudflare DNS is accepted target if zone owns the brand domain. | Inventory nameservers and DNS records. | yes for DNS cutover |
| AWS | `ecom-terraform-state-174766597237-ap-southeast-1` S3 bucket | shared | ap-southeast-1 | Terraform bootstrap | keep/import | Created by bootstrap for secret-bearing Terraform remote state. Versioning, AES256 encryption, public access block, and HTTPS-only policy verified. | Keep under bootstrap local state; use as prod/QA remote backend. | no |
| AWS | `ecom-terraform-locks` DynamoDB table | shared | ap-southeast-1 | Terraform bootstrap | deleted | Created by the first bootstrap pass for Terraform state locking, but DynamoDB locking is deprecated for the S3 backend. | Removed by Terraform on 2026-05-24 after switching environment backends to `use_lockfile = true`. | no |
| AWS | `ecom-prod-medusa` Lightsail instance | prod | ap-southeast-1a | Terraform prod | deleted | Production instantiation is deferred until QA is set up and tested. | Removed by Terraform on 2026-05-24. Recreate later by enabling production Lightsail in prod Terraform. | no |
| AWS | `ecom-prod-medusa-static-ip` Lightsail static IP | prod | ap-southeast-1 | Terraform prod | deleted | Production instantiation is deferred until QA is set up and tested. | Removed by Terraform on 2026-05-24. Recreate later by enabling production Lightsail in prod Terraform. | no |
| AWS | `ecom-prod-medusa-key` Lightsail key pair | prod | ap-southeast-1 | Terraform prod | deleted | Production instantiation is deferred until QA is set up and tested. | Removed by Terraform on 2026-05-24. Reuse the same local public key path for production later if still appropriate. | no |
| AWS | `ecom-qa-medusa` Lightsail instance | qa | ap-southeast-1a | Terraform qa | keep/import | QA-first Medusa compute host. Ubuntu 22.04, `small_3_0` 2 GB, automatic snapshots enabled at `20:00` UTC. Bootstrapped with Docker, Caddy, Tailscale, Vector, swap, log rotation, and deployment directories. Tailscale IPv4 is `100.71.144.128`. | Continue with SSM/runtime config, DNS, and Medusa deployment setup. | no |
| AWS | `ecom-qa-medusa-static-ip` Lightsail static IP | qa | ap-southeast-1 | Terraform qa | keep/import | Static origin IP for QA Medusa API/admin DNS. Current IPv4 is `52.77.164.161`, attached to `ecom-qa-medusa`. | Use for QA Cloudflare DNS later. | no |
| AWS | `ecom-qa-medusa-key` Lightsail key pair | qa | ap-southeast-1 | Terraform qa | keep/import | Public key imported from local `~/.ssh/id_ed25519_ecom_lightsail.pub`; private key stays outside Terraform and Git. | Keep for emergency/browser-assisted access; routine SSH uses Tailscale. | no |
| AWS | `/ecom/qa/medusa/NODE_ENV` SSM parameter | qa | ap-southeast-1 | Terraform qa | keep/import | Non-secret Medusa runtime config for QA; value is `production`. | Keep under QA Terraform; consumed by deploy env-file generation later. | no |
| AWS | `/ecom/qa/medusa/MEDUSA_WORKER_MODE` SSM parameter | qa | ap-southeast-1 | Terraform qa | keep/import | Non-secret Medusa runtime config for QA; value is `shared` for the single-host QA service. | Keep under QA Terraform; consumed by deploy env-file generation later. | no |
| AWS | `/ecom/qa/medusa/S3_REGION` SSM parameter | qa | ap-southeast-1 | Terraform qa | keep/import | Non-secret S3-compatible region value for Cloudflare R2 integration; value is `auto`. | Keep under QA Terraform; consumed by deploy env-file generation later. | no |
| AWS | `token.actions.githubusercontent.com` IAM OIDC provider | shared | global | Terraform shared | keep/import | GitHub Actions OIDC provider for short-lived AWS credentials. Client ID is `sts.amazonaws.com`; ARN is `arn:aws:iam::174766597237:oidc-provider/token.actions.githubusercontent.com`. | Use from deploy roles; do not create long-lived AWS keys for GitHub Actions. | no |
| AWS | `ecom-qa-github-actions-deploy` IAM role | qa | global | Terraform shared | keep/import | GitHub Actions QA deploy role. Trust is scoped to `repo:anshulbansal02/medusa-store:environment:qa` and `aud=sts.amazonaws.com`; ARN is `arn:aws:iam::174766597237:role/ecom-qa-github-actions-deploy`. | Store ARN as a GitHub QA environment variable for deploy workflow use. | no |
| AWS | `ecom-qa-github-actions-deploy-ssm-read` IAM policy | qa | ap-southeast-1 | Terraform shared | keep/import | Read-only SSM access for QA deploys. Allows `ssm:GetParameter`, `ssm:GetParameters`, and `ssm:GetParametersByPath` only on `/ecom/qa/medusa/*`. | Keep attached only to the QA deploy role. | no |
| Neon | production Postgres | prod | aws-ap-southeast-1 | pending | pending | Accepted target database. | Audit Terraform provider or document manual fallback. | yes before production migration |
| Upstash | production Redis | prod | Singapore | pending | pending | Accepted target Redis. | Confirm provider region ID and pricing mode. | no |

## Manual Inputs Needed

Collect these outside Git:

- Production domain and exact hostnames for apex, `www`, `api`, `admin`, `media`, `qa`, `qa-api`, and `qa-admin`.
- AWS account/profile, state bucket name, and state region.
- Cloudflare account ID, zone ID, and admin email allowlist.
- Vercel team/project identifiers.
- Neon, Upstash, Better Stack, and Sentry account/API-token availability.
- Tailscale admin/operator identities for SSH and GitHub Actions deploy access.
- Razorpay QA/live keys and webhook setup ownership.
- Resend sender domain and API-key ownership.

## Current Repo Cleanup

- Railway deployment workflow: removed from the repo.
- Medusa `railway.json`: removed from the repo.
- Medusa Railway package scripts: removed from the repo.
