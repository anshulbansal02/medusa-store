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
- R2 account, bucket, endpoint, access key, and secret key.
- Cloudflare Turnstile keys if enabled.
- Cloudflare Access configuration if enabled.
- Analytics site token/config if required.

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
