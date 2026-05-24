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
| Cloudflare | pending inputs | Terraform module support is prepared and validated for DNS, R2 bucket/custom domain, Turnstile, and Web Analytics. Live planning is blocked until Cloudflare API token, account ID, zone ID, production domain, QA hostnames, and admin email allowlist are provided. Access/WAF remain under review before wiring. |
| AWS | in progress | Terraform state bucket created in `ap-southeast-1`; obsolete DynamoDB lock table removed after switching to native S3 lockfiles. Production Lightsail resources were removed after the QA-first sequencing decision. QA Lightsail, QA SSM runtime parameters, and GitHub Actions OIDC/QA/prod SSM read IAM are Terraform-managed. Continue inventory for billing alerts. |
| Neon | in progress | QA/prod project shell and QA branch/database/role/endpoint are Terraform-managed. Terraform uses the account-supported history retention limit of `21600` seconds and leaves endpoint suspend interval unset. Production migration remains deferred. |
| Upstash | in progress | QA Redis is Terraform-managed as Upstash Global Redis with Singapore primary region. Production Redis is deferred until production setup. |
| Better Stack | pending | Inventory monitors, log sources, alert channels. |
| Sentry | pending | Inventory organizations, projects, DSNs, alert rules. |
| GitHub | in progress | QA environment has Lightsail deploy variables/secrets and is restricted to manual `dev` deployments. Production environment is restricted to manual `main` deployments, has a required reviewer gate, and stores the production AWS deploy role ARN. `dev` allows direct pushes for active development; `main` remains PR-gated for production releases. Obsolete Railway QA secret was removed. |
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
| Cloudflare | production zone | prod | global | pending | pending | Cloudflare DNS is accepted target if zone owns the brand domain. | Provide Cloudflare API token, account ID, zone ID, domain name, existing DNS inventory, QA/prod hostname decisions, and admin email allowlist before Terraform wiring. | yes for DNS cutover |
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
| AWS | `/ecom/qa/medusa/STORE_CORS` SSM parameter | qa | ap-southeast-1 | Terraform qa | keep/import | Non-secret allowed storefront origins for domainless QA bootstrap. | Replace IP/local origins with QA domain origins after domain setup. | no |
| AWS | `/ecom/qa/medusa/ADMIN_CORS` SSM parameter | qa | ap-southeast-1 | Terraform qa | keep/import | Non-secret allowed admin origins for domainless QA bootstrap. | Replace IP/local origins with QA admin domain origins after domain setup. | no |
| AWS | `/ecom/qa/medusa/AUTH_CORS` SSM parameter | qa | ap-southeast-1 | Terraform qa | keep/import | Non-secret allowed auth origins for domainless QA bootstrap. | Replace IP/local origins with QA auth domain origins after domain setup. | no |
| AWS | `/ecom/qa/medusa/MEDUSA_BACKEND_URL` SSM parameter | qa | ap-southeast-1 | Terraform qa | keep/import | Non-secret external Medusa backend URL for domainless QA bootstrap. | Replace with QA API/admin domain URL after domain setup. | no |
| AWS | `/ecom/qa/medusa/DATABASE_URL` SSM parameter | qa | ap-southeast-1 | Terraform qa | keep/import | Secret Neon Postgres pooler URL for QA Medusa, stored as `SecureString`, with `sslmode=verify-full`. | Keep under QA Terraform and do not print value in logs. | no |
| AWS | `/ecom/qa/medusa/REDIS_URL` SSM parameter | qa | ap-southeast-1 | Terraform qa | keep/import | Secret Redis TLS URL for QA Medusa, stored as `SecureString`. | Keep under QA Terraform and do not print value in logs. | no |
| AWS | `/ecom/qa/medusa/JWT_SECRET` SSM parameter | qa | ap-southeast-1 | Terraform qa | keep/import | Terraform-generated Medusa JWT signing secret for QA, stored as `SecureString`. | Keep under QA Terraform and protect remote state as secret-bearing. | no |
| AWS | `/ecom/qa/medusa/COOKIE_SECRET` SSM parameter | qa | ap-southeast-1 | Terraform qa | keep/import | Terraform-generated Medusa cookie signing secret for QA, stored as `SecureString`. | Keep under QA Terraform and protect remote state as secret-bearing. | no |
| AWS | `token.actions.githubusercontent.com` IAM OIDC provider | shared | global | Terraform shared | keep/import | GitHub Actions OIDC provider for short-lived AWS credentials. Client ID is `sts.amazonaws.com`; ARN is `arn:aws:iam::174766597237:oidc-provider/token.actions.githubusercontent.com`. | Use from deploy roles; do not create long-lived AWS keys for GitHub Actions. | no |
| AWS | `ecom-qa-github-actions-deploy` IAM role | qa | global | Terraform shared | keep/import | GitHub Actions QA deploy role. Trust is scoped to `repo:anshulbansal02/medusa-store:environment:qa` and `aud=sts.amazonaws.com`; ARN is `arn:aws:iam::174766597237:role/ecom-qa-github-actions-deploy`. | Store ARN as a GitHub QA environment variable for deploy workflow use. | no |
| AWS | `ecom-qa-github-actions-deploy-ssm-read` IAM policy | qa | ap-southeast-1 | Terraform shared | keep/import | Read-only SSM access for QA deploys. Allows `ssm:GetParameter`, `ssm:GetParameters`, and `ssm:GetParametersByPath` only on `/ecom/qa/medusa` and `/ecom/qa/medusa/*`. | Keep attached only to the QA deploy role. | no |
| AWS | `ecom-prod-github-actions-deploy` IAM role | prod | global | Terraform shared | keep/import | No-cost production deploy role. Trust is scoped to `repo:anshulbansal02/medusa-store:environment:production` and `aud=sts.amazonaws.com`; ARN is `arn:aws:iam::174766597237:role/ecom-prod-github-actions-deploy`. | Use only from the protected GitHub production environment. | no |
| AWS | `ecom-prod-github-actions-deploy-ssm-read` IAM policy | prod | ap-southeast-1 | Terraform shared | keep/import | Read-only SSM policy for production deploys. Allows `ssm:GetParameter`, `ssm:GetParameters`, and `ssm:GetParametersByPath` only on `/ecom/prod/medusa` and `/ecom/prod/medusa/*`. | Keep attached only to the production deploy role. | no |
| Neon | `ecom-medusa` project | prod/qa | aws-ap-southeast-1 | Terraform qa | keep/import | Accepted database project. Project ID `patient-leaf-89100055`; PostgreSQL 17; history retention `21600` seconds; default branch is named `prod` with default database/role shape for later production setup. | Keep under QA Terraform for now; do not run production migrations until production setup is explicitly approved. | no |
| Neon | `qa` branch | qa | aws-ap-southeast-1 | Terraform qa | keep/import | QA database branch. Branch ID `br-icy-meadow-aolzunse`; database and role are both `medusa_qa`. | Keep separate from production data and use only for QA Medusa. | no |
| Neon | `qa` endpoint | qa | aws-ap-southeast-1 | Terraform qa | keep/import | QA read-write endpoint. Endpoint ID `ep-wispy-cloud-aob2x5co`; SSM uses the pooler host output after enabling pooling. | Keep pooler enabled for runtime connection string. | no |
| Upstash | `ecom-qa-medusa` Redis database | qa | global, primary `ap-southeast-1` | Terraform qa | keep/import | QA Medusa Redis. Database ID `ab3b521d-ea04-4db6-8c3b-a1e29bb6055a`; endpoint `thorough-cow-135355.upstash.io`; TLS enabled; budget guardrail `$20`; no read regions. | Keep under QA Terraform; monitor usage after QA deploy. | no |
| Upstash | production Redis | prod | Singapore | pending | pending | Accepted target Redis. | Confirm provider region ID and pricing mode. | no |
| GitHub | `qa` environment variables | qa | global | GitHub CLI/manual | keep/import | `AWS_DEPLOY_ROLE_ARN`, `QA_LIGHTSAIL_TAILSCALE_HOST`, `QA_LIGHTSAIL_SSH_KNOWN_HOSTS`, and `MEDUSA_BACKEND_URL` are set for the QA deploy path. `MEDUSA_BACKEND_URL` now points to the Lightsail static IP instead of Railway. | Keep until domain setup replaces IP-based URL values. | no |
| GitHub | `qa` deployment environment policy | qa | global | GitHub CLI/manual | keep/import | QA environment uses a custom deployment branch policy allowing only branch `dev`. QA deploys are manual workflow dispatch, not automatic on every `dev` push. | Keep QA deploys tied to `dev`; do not broaden to feature branches unless the deployment decision changes. | no |
| GitHub | `production` deployment environment policy | prod | global | GitHub CLI/manual | keep/import | Production environment uses a custom deployment branch policy allowing only branch `main` and has required reviewer `anshulbansal02`. `prevent_self_review` is false because this is currently a single-admin personal repo. | Keep production deploys manual, approval-gated, and released through PR merge into `main`. Add a second reviewer and enable self-review prevention when another maintainer is available. | no |
| GitHub | `production` environment variables | prod | global | GitHub CLI/manual | keep/import | `AWS_DEPLOY_ROLE_ARN` points to `arn:aws:iam::174766597237:role/ecom-prod-github-actions-deploy`. Vercel org/project IDs are also set for production storefront deploys. | Keep deploy/bootstrap values here; keep app runtime secrets in SSM. | no |
| GitHub | `qa` environment secret `RAILWAY_PROJECT_ID` | qa | global | GitHub CLI | deleted | Railway deployment path is obsolete. | Removed on 2026-05-24. | no |
| GitHub | `qa` environment deploy secrets | qa | global | GitHub CLI/manual | keep/import | `QA_LIGHTSAIL_SSH_PRIVATE_KEY`, `TS_OAUTH_CLIENT_ID`, and `TS_AUDIENCE` are set. They support GitHub Actions joining Tailscale with `tag:ci` and deploying over SSH. | Keep app runtime secrets in SSM, not GitHub. | no |
| Tailscale | `tag:ci` ACL policy | qa | global | Tailscale admin | keep/import | Tailnet policy allows GitHub Actions nodes tagged `tag:ci` to reach only nodes tagged `tag:ecom-qa-medusa` on TCP 22 and to SSH only as `ubuntu`. QA Lightsail is tagged `tag:ecom-qa-medusa`. | Keep least-privilege; do not restore wildcard tailnet access for CI. | no |
| Tailscale | GitHub Actions federated identity | qa | global | Tailscale admin | keep/import | OIDC trust credential scoped to repo `anshulbansal02/medusa-store` and GitHub environment `qa`; values are stored as GitHub QA secrets. | Keep scope limited to auth key creation for `tag:ci`. | no |

## Manual Inputs Needed

Collect these outside Git:

- Production domain and exact hostnames for apex, `www`, `api`, `admin`, `media`, `qa`, `qa-api`, and `qa-admin`.
- AWS account/profile, state bucket name, and state region.
- Cloudflare account ID, zone ID, and admin email allowlist.
- Vercel team/project identifiers.
- Upstash, Better Stack, and Sentry account/API-token availability.
- Neon API key for Terraform provider auth is stored only in the local uncommitted `.env` file as `NEON_KEY`; CLI OAuth login is not sufficient for Terraform.
- Tailscale admin/operator identities for SSH and GitHub Actions deploy access.
- Razorpay QA/live keys and webhook setup ownership.
- Resend sender domain and API-key ownership.

## Current Repo Cleanup

- Railway deployment workflow: removed from the repo.
- Medusa `railway.json`: removed from the repo.
- Medusa Railway package scripts: removed from the repo.
