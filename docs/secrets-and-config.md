# Secrets And Config

Status: canonical v1 secrets and configuration guide
Last reviewed: 2026-05-15

## Principles

- Secrets must never be committed.
- Runtime configuration must be explicit per app and per environment.
- Browser-exposed values must be treated as public.
- QA and production must not share secrets.
- Local development should be simple, but not loose.

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
- Commit only `.env.example` files.
- Keep `.env.example` current when adding or removing config.
- Do not put real credentials, tokens, database URLs, or webhook secrets in docs.

## Environments

Use two hosted environments:

- QA from `dev`.
- Production from `main`.

Rules:

- Vercel stores storefront QA/prod environment variables.
- Railway stores Medusa QA/prod environment variables.
- QA and production use separate Razorpay keys, webhook secrets, database URLs, admin credentials, JWT secrets, cookie secrets, and object storage credentials.
- QA must not write to production data stores.
- Local uses portless for UI app URLs, direct fixed nonstandard API ports, Docker Compose Postgres/Redis, and local app env files.

## Railway Auth And Access Controls (Phase 1)

Use Railway’s built-in access controls instead of custom auth:

- Keep the workspace/project membership tight:
  - Workspace roles: Admin, Member, Deployer.
  - Project roles: Owner, Editor, Viewer.
- Prefer assigning only the minimum role needed for each teammate.
- Avoid workspace-level account sharing and do not reuse personal accounts.
- Require team MFA:
  - Enable 2FA for all workspace members from workspace People settings.
  - Keep account MFA enabled in user security settings.
- Use short-lived token types for CI:
  - Use a Project Token for deployment workflows (scoped to one project environment).
  - Avoid using account tokens in CI.
- Use Railway-provided domains for QA until custom domains exist.
- Keep secrets in Railway Variables (and project scoped when needed), not in code.
- Restrict who can view variables:
  - Viewer role cannot access environment variables.
- For QA security only:
  - Do not rotate production keys into QA.
  - Keep CORS and JWT/cookie secrets separate.

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
- Resend API key and sender domain config.
- Owner new-order notification email address.
- R2 account, bucket, endpoint, access key, and secret key.
- Storefront image host allow-list for Medusa/R2 media domains.
- Cloudflare Turnstile keys if enabled.
- Cloudflare Access configuration if enabled.
- Cloudflare Web Analytics site token for the storefront.

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

## Railway Operational Security Notes

- Use Project Tokens in GitHub Actions for Railway deploys instead of account/workspace tokens.
- For the QA Medusa service, use Railway reference variables for database access, such as `DATABASE_URL=${{Postgres.DATABASE_URL}}`, instead of copying rendered database credentials.
- Keep `NODE_ENV=production`, `MEDUSA_WORKER_MODE=shared`, `JWT_SECRET`, `COOKIE_SECRET`, `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, and `MEDUSA_BACKEND_URL` configured on the Railway QA Medusa service.
- Keep audit logs enabled by workspace plan; use them before changing secrets/variables or redeploying.
- Keep project and environment boundaries explicit:
  - `qa` environment only for now.
  - Production environment values should be configured but not used until rollout.

## Vercel Storefront Deployment Notes

- Vercel project: `medusa-store-storefront`.
- Current QA preview URL: `https://medusa-store-storefront-okdjppru3-anshul-bansal-s-projects.vercel.app`.
- GitHub Actions owns storefront deployment; Vercel Git auto-deploys are not required.
- `dev` pushes run the QA deploy workflow.
- Production storefront deployment is manual through workflow dispatch until production rollout.
- The deploy workflow uses `vercel deploy --cwd ./apps/storefront`; Vercel performs the remote build for the linked storefront project.
- Vercel preview deployments are currently protected by Vercel SSO. Keep QA private unless the team explicitly needs public QA access.
- Vercel Git repository connection is pending because the Vercel account needs a GitHub login connection added in the Vercel dashboard. This is optional while GitHub Actions owns deployments.
- GitHub environment variables hold non-secret deployment config:
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  - `MEDUSA_BACKEND_URL`
  - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
  - `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`
- GitHub environment secrets hold deploy credentials:
  - `VERCEL_TOKEN`
- Pending QA config:
  - Add `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` from Medusa Admin/API key settings.
  - Add `NEXT_PUBLIC_RAZORPAY_KEY_ID` when Razorpay test mode is configured.
  - Add `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` when Cloudflare Web Analytics is configured.
- Pending production config:
  - Add production Vercel environment variables and secrets only when production rollout starts.

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
