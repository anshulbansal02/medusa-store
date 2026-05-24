# Manual Infrastructure Actions

Status: operator input needed
Last reviewed: 2026-05-24

Use this file for external setup that cannot be completed safely from the repo
or current tokens. Do not paste secret values here. Add values only to the
ignored root `.env` file, then tell the agent to continue.

## Active Manual Inputs

### Cloudflare API Token Permissions

Why: Terraform can manage DNS and R2 with the current token, but Cloudflare
rejected both Zero Trust Access app creation and Web Analytics site creation
with `403 Authentication error`.

Latest attempt: after the token was updated and stored in SSM as version `2`,
Terraform still received `403 Authentication error` from
`/accounts/{account_id}/rum/site_info` while creating Web Analytics sites.
Do not retry Web Analytics until the token is confirmed to have the required
Cloudflare RUM/Web Analytics account permission.

Needed when we resume security/analytics:

- Update or replace `CLOUDFLARE_API_TOKEN` in `.env`.
- Keep existing DNS and R2 permissions.
- Add permission to create/manage Cloudflare Zero Trust Access applications.
- Add permission to create/manage Cloudflare Web Analytics/RUM sites. The failed
  endpoint is account-level RUM site creation, not zone DNS.
- Keep scope limited to the current account and `neonfold.com` zone where
  Cloudflare allows that.

After updating `.env`, the agent should store the new token in SSM:

- `/ecom/shared/operator/cloudflare/api_token`

Non-blocking for now: yes. Core QA storefront/backend/media setup can continue
without this.

### Better Stack

Why: Observability phase needs uptime monitors, alert contacts, log shipping,
and error tracking. The initial Better Stack API token and account metadata
are present in the local ignored `.env` for Terraform-managed uptime monitors.

Add to `.env` when ready:

```txt
BETTER_STACK_API_TOKEN=
BETTER_STACK_EMAIL=
BETTER_STACK_TEAM_ID=
```

If Better Stack gives a separate log source token after source creation, add:

```txt
BETTER_STACK_SOURCE_TOKEN=
```

Current QA log source `ecom-qa-medusa-logs` has been created through the
Better Stack Telemetry API. Its source token is stored in AWS SSM at
`/ecom/qa/host/BETTER_STACK_SOURCE_TOKEN`.

Non-blocking for core QA: log shipping is now configured for QA; alert delivery
and Better Stack error tracking still need separate verification.

### Razorpay

Why: Payment setup is intentionally at the end after core QA infra. It needs
dashboard keys and webhook setup.

Add QA/test values to `.env` when ready:

```txt
RAZORPAY_QA_KEY_ID=
RAZORPAY_QA_KEY_SECRET=
RAZORPAY_QA_WEBHOOK_SECRET=
```

Later, add production/live values separately:

```txt
RAZORPAY_PROD_KEY_ID=
RAZORPAY_PROD_KEY_SECRET=
RAZORPAY_PROD_WEBHOOK_SECRET=
```

Dashboard setup needed:

- QA webhook URL: `https://qa-api.neonfold.com/hooks/payment/razorpay_razorpay`
- Events: `order.paid`, `payment.captured`, `payment.authorized`,
  `payment.failed`
- Automatic capture enabled for QA.

Non-blocking for core QA infra: yes, but required for checkout smoke tests.

### Resend

Why: Email setup is intentionally at the end after core QA infra.

Add to `.env` when ready:

```txt
RESEND_QA_API_KEY=
RESEND_QA_FROM_EMAIL=
RESEND_OWNER_NOTIFICATION_EMAIL=
```

Later, add production values separately:

```txt
RESEND_PROD_API_KEY=
RESEND_PROD_FROM_EMAIL=
```

Dashboard/domain setup needed:

- Verify sender domain.
- Configure SPF/DKIM/DMARC records.

Non-blocking for core QA infra: yes, but required for email smoke tests.

## Completed Manual Inputs

- R2 QA S3 credentials were added to `.env`, stored in SSM, deployed to QA
  Medusa, and verified with an upload/read smoke test.
- QA Medusa admin email and generated password are stored in local `.env` and
  SSM. Do not print the password.
