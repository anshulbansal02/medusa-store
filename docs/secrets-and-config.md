# Secrets And Config

Status: canonical v1 secrets and configuration guide
Last reviewed: 2026-05-24

## Principles

- Secrets must never be committed.
- Runtime configuration must be explicit per app and per environment.
- Browser-exposed values must be treated as public.
- QA and production must not share secrets.
- Local development should be simple, but not loose.
- AWS SSM Parameter Store is the source of truth for long-lived operator credentials and hosted runtime secrets.

## File Layout

Use app-local environment files.

```txt
apps/storefront/.env.example
apps/storefront/.env.local        ignored

apps/medusa/.env.example
apps/medusa/.env                  ignored
```

Rules:

- Do not use a root `.env` for application secrets.
- A root `.env` may exist only as an ignored local operator bootstrap file while setting up infrastructure. Mirror long-lived values into SSM and do not treat the local file as canonical.
- Commit only `.env.example` files.
- Keep `.env.example` current when adding or removing config.
- Do not put real credentials, tokens, database URLs, or webhook secrets in docs.

## Environments

Use two hosted environments:

- QA from `dev`.
- Production from `main`.

Rules:

- Vercel stores storefront QA/prod environment variables.
- Production Medusa runtime variables are stored in AWS SSM Parameter Store and written to the approved Lightsail deployment path by GitHub Actions during deploy.
- QA Medusa runtime variables are stored in separate AWS SSM Parameter Store paths and written to the approved Lightsail deployment path by GitHub Actions during QA deploy/start.
- QA and production use separate Razorpay keys, webhook secrets, database URLs, admin credentials, JWT secrets, cookie secrets, and object storage credentials.
- QA must not write to production data stores.
- Local uses portless for UI app URLs, direct fixed nonstandard API ports, Docker Compose Postgres/Redis, and local app env files.

## Medusa Runtime Access Controls

Production Medusa compute runs on AWS Lightsail. GitHub Actions fetches runtime config/secrets from AWS SSM Parameter Store and writes runtime env files during deploy.

Rules:

- Do not commit production `.env` files.
- Do not paste production secrets into docs, chat, issue trackers, or Terraform variables committed to Git.
- Keep the Lightsail SSH surface narrow and key-based.
- Keep production runtime secrets readable only by the deployment user/process.
- Keep QA and production runtime variables separate.
- Terraform may manage SSM parameters and Vercel env vars, including secret values, after provider behavior is reviewed.
- Treat Terraform remote state as secret-bearing and restrict access accordingly.
- Use GitHub environment protection/approval for production deploys.
- Vercel environment variables are managed by Terraform where practical; secret values require provider behavior review and secret-bearing state controls.

## AWS SSM Parameter Store

Use AWS SSM Parameter Store as the central runtime config and secret store for Medusa, and as the operator source of truth for provider tokens needed to run infrastructure tasks.

Path layout:

```txt
/ecom/shared/operator/*
/ecom/prod/medusa/*
/ecom/qa/medusa/*
```

Rules:

- Store secrets as `SecureString`.
- Keep QA and production under separate paths.
- Store shared operator/provider credentials under `/ecom/shared/operator/*`; do not grant deploy roles read access to that path.
- GitHub Actions may read only the environment path needed for the current deploy.
- GitHub Actions uses AWS OIDC short-lived credentials for SSM reads. Do not create long-lived AWS access keys for deploy jobs.
- The QA deploy AWS role is `arn:aws:iam::123456789012:role/ecom-qa-github-actions-deploy`.
- Terraform may manage parameter values after provider behavior is reviewed.
- Prefer write-only SSM value support where available.
- Terraform state may contain secret values and must be protected like a secret store.
- Do not commit SSM parameter values to Git, Terraform variables, docs, or workflow logs.
- Commit only non-secret Terraform tfvars; never commit secret values in tfvars.
- GitHub environment secrets should hold only deploy/bootstrap credentials needed to run Terraform, read SSM, and access Lightsail, not duplicate the full Medusa app secret set.

Current shared operator parameters:

- `/ecom/shared/operator/cloudflare/account_id`
- `/ecom/shared/operator/cloudflare/zone_id`
- `/ecom/shared/operator/cloudflare/api_token`
- `/ecom/shared/operator/cloudflare/r2/api_token`
- `/ecom/shared/operator/cloudflare/r2/access_key_id`
- `/ecom/shared/operator/cloudflare/r2/secret_access_key`
- `/ecom/shared/operator/cloudflare/r2/endpoint`
- `/ecom/shared/operator/cloudflare/access/qa_admin_allowed_emails`
- `/ecom/shared/operator/vercel/api_token`
- `/ecom/shared/operator/neon/api_key`
- `/ecom/shared/operator/upstash/email`
- `/ecom/shared/operator/upstash/api_key`
- `/ecom/shared/operator/tailscale/oauth_client_id`
- `/ecom/shared/operator/tailscale/audience`
- `/ecom/shared/operator/medusa/qa_admin_email`
- `/ecom/shared/operator/medusa/qa_admin_password`

QA Medusa deploy requires these GitHub `qa` environment values:

- Variables:
  - `AWS_DEPLOY_ROLE_ARN`: `arn:aws:iam::123456789012:role/ecom-qa-github-actions-deploy`.
  - `QA_LIGHTSAIL_TAILSCALE_HOST`: QA host Tailscale IP or MagicDNS name.
  - `QA_LIGHTSAIL_SSH_KNOWN_HOSTS`: pinned SSH known-hosts line for the QA host.
- Secrets:
  - `QA_LIGHTSAIL_SSH_PRIVATE_KEY`: private key matching the QA Lightsail authorized public key.
  - `TS_OAUTH_CLIENT_ID`: Tailscale federated identity client ID.
  - `TS_AUDIENCE`: Tailscale federated identity audience.

## Public Vs Secret Values

Storefront variables prefixed with `NEXT_PUBLIC_` are public because they are bundled for the browser.

Rules:

- Put only browser-safe values in `NEXT_PUBLIC_*`.
- Never expose private API keys, webhook secrets, database URLs, admin credentials, JWT secrets, cookie secrets, or storage secrets through `NEXT_PUBLIC_*`.
- Prefer server-side API routes or Medusa server calls when a secret is required.

## Secret Categories

Expected secret/config groups:

- Medusa database URL.
- Medusa Redis URL.
- Medusa JWT and cookie secrets.
- Medusa CORS origins.
- Storefront URL and Medusa backend URL.
- Razorpay key ID, key secret, and webhook secret.
- Razorpay Dashboard payment capture setting and webhook endpoint per environment.
- Resend API key and sender domain config.
- Owner new-order notification email address.
- R2 account, bucket, endpoint, access key, and secret key.
- Storefront image host allow-list for Medusa/R2 media domains.
- Cloudflare Turnstile keys if enabled.
- Cloudflare Access configuration if enabled.
- Cloudflare Web Analytics site token for the storefront.

Database:

- Production `DATABASE_URL` points to Neon Postgres in Singapore.
- Production SSM scaffolding currently contains only no-cost baseline parameters: `NODE_ENV`, `MEDUSA_WORKER_MODE`, `S3_REGION`, `JWT_SECRET`, and `COOKIE_SECRET`.
- Prefer Neon pooled runtime connection strings unless Medusa or Neon guidance requires direct connections for a specific command.
- QA/staging must use a separate Neon branch with separate credentials and must not write to production data.

Redis:

- Production `REDIS_URL` points to Upstash Redis in Singapore.
- Start production Redis on Upstash pay-as-you-go pricing.
- QA/staging `REDIS_URL` points to a separate Upstash Global Redis database with Singapore as the primary region.
- Start QA/staging Redis on Upstash pay-as-you-go pricing with the provider/API minimum budget guardrail.
- QA/staging must not share production Redis.

R2:

- Terraform manages R2 buckets `your-qa-media-bucket` and `your-prod-media-bucket`, plus media custom domains `qa-media.example.com` and `media.example.com`.
- R2 S3 access credentials are created manually in Cloudflare.
- Store R2 access key ID and secret access key in SSM `SecureString` parameters.
- Rotate R2 credentials through a documented manual runbook.

QA/staging compute:

- QA Medusa runs on a separate QA Lightsail instance during the QA-first setup.
- QA containers must stay stopped by default.
- QA must use separate secrets from production even when sharing compute.

## Rotation

Rotate secrets when:

- A secret may have been exposed.
- A team member or vendor no longer needs access.
- Moving from test mode to production mode.
- Launching after a long staging period.

Rules:

- Rotate one integration at a time.
- Update hosted env vars first, then redeploy.
- Verify checkout, email, media upload, and admin access after rotation.
- Do not paste secrets into chat or issue trackers.

## Vercel Storefront Deployment Notes

- Vercel QA project: `your-storefront-qa-project`.
- Vercel production project: `your-storefront-prod-project`.
- Interim domains: `qa.example.com` for QA storefront, `qa-api.example.com` for QA Medusa API, `www.example.com` for future production storefront, and `example.com` as an apex redirect.
- Terraform manages the Vercel project/configuration where provider support is reliable.
- GitHub Actions owns storefront deployment; Vercel Git auto-deploys are not required.
- `dev` pushes run CI only. QA storefront deploy is manual workflow dispatch.
- Production storefront deployment is manual workflow dispatch from `main` for v1.
- The deploy workflow uses `vercel deploy --prod --cwd ./apps/storefront`; Vercel performs the remote build for the project ID configured on the selected GitHub environment.
- QA uses a production deployment inside the separate QA Vercel project so `qa.example.com` is the stable QA hostname without mixing preview aliases into production.
- Terraform manages Vercel environment variables where practical. QA `MEDUSA_BACKEND_URL` targets `https://qa-api.example.com`, browser-safe `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is Terraform-managed, and `NEXT_PUBLIC_IMAGE_HOSTNAMES` is derived from the configured media domains. Secret values require provider behavior review and secret-bearing state controls.
- Terraform manages the QA and production Vercel storefront projects. Keep both projects unlinked from GitHub so deploys remain manual GitHub Actions dispatches.
- GitHub environment variables/secrets hold deploy credentials and any deployment-only values not managed by Terraform:
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  - `VERCEL_TOKEN`

## Local Handling

- Use `.env.example` as the source of required variable names.
- Use local test credentials only.
- Prefer short-lived or test-mode provider credentials locally.
- Do not use production Razorpay, R2, Resend, or database credentials locally unless debugging a production incident.
- If production debugging is unavoidable, document the incident and clean up local env files afterward.

## Agent Rules

- Agents may create and update `.env.example`.
- Agents must not create real `.env`, `.env.local`, or secret files with live credentials.
- Agents must not print secrets in terminal output, docs, or final messages.
- Agents should flag missing required config with clear setup instructions instead of hardcoding fallbacks.
