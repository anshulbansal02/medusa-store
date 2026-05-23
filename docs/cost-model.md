# Cost Model

Status: v1 cost guardrail
Last reviewed: 2026-05-15

Target: keep recurring operating cost around USD 50/month or lower where practical, excluding payment gateway transaction fees and domain renewal.

## Assumptions

- Vercel Pro account is acceptable.
- AWS Lightsail 4 GB is accepted for production Medusa compute.
- Existing domain is already purchased through Shopify.
- Existing AWS account is available, but AWS is not the default for v1.
- Production Postgres is Neon in Singapore.
- Production Redis is Upstash in Singapore, pay-as-you-go initially.
- Avoid extra paid services unless they clearly reduce complexity or risk.

## Expected V1 Services

| Service | Purpose | Expected Cost Posture |
| --- | --- | --- |
| Vercel Pro | Next.js storefront | Already acceptable; storefront host |
| AWS Lightsail 4 GB | Production Medusa compute | Predictable single-instance app-host cost |
| Lightsail snapshots | Host recovery convenience | Extra snapshot storage cost; review after first month |
| Neon Postgres | Production database | Managed Postgres in Singapore |
| Upstash Redis | Production cache/events/workflows | Pay-as-you-go initially; review for Fixed 250 MB after real usage |
| Cloudflare R2 | Product/media storage | Low at initial image/catalog scale |
| Cloudflare DNS | Authoritative DNS | Free/low-cost DNS management; registrar transfer not required |
| Cloudflare Web Analytics | Basic website analytics | Free |
| Better Stack | Uptime checks and alerts | Free/low-cost tier expected initially; verify commercial-use terms |
| Sentry | Application error tracking | Free/low-cost tier expected initially |
| Resend | Transactional email | Free plan expected to be enough initially |
| Razorpay | Payments | Transaction fees; excluded from infra target |
| Domain | Existing domain | Renewal cost; excluded from monthly infra target |

## Cost Guardrails

- Do not switch Redis to a fixed plan until measured usage or billing needs justify it.
- Do not add paid analytics in v1.
- Do not add a CMS in v1.
- Do not add a dedicated search service in v1.
- Do not add Cloudflare Images unless image optimization costs or complexity justify it.
- Keep QA backend optional, small, and stopped or scaled down when not in use.
- Pause/scale down/remove QA backend if it creates cost.
- Prefer free/native features when they are good enough and do not add complexity.

## Approximate Shape

```txt
Base expected recurring:
  Vercel Pro
  AWS Lightsail 4 GB
  Lightsail snapshot storage
  Neon Postgres
  Upstash Redis pay-as-you-go
  Cloudflare R2 small usage
  Resend Free
  Better Stack/Sentry free or low usage tiers
  Cloudflare Web Analytics Free

Target:
  Around USD 50/month or lower where practical
```

## Review Triggers

Revisit cost model if:

- Lightsail compute is too small or operational overhead becomes too high.
- Lightsail snapshot storage cost is higher than expected.
- Neon or Upstash cost exceeds the target envelope.
- Upstash pay-as-you-go approaches the Fixed 250 MB monthly cost.
- Vercel image/bandwidth/function usage grows.
- Product image traffic grows significantly.
- QA backend becomes always-on and costly.
- Analytics needs become more advanced.
- Better Stack or Sentry usage exceeds free/low-cost tiers.
- Shipping automation adds paid tools.
- Marketing starts paid ads or email campaigns.

Before launch, verify current official pricing for Vercel, AWS Lightsail, Neon, Upstash, Cloudflare R2, and Resend because prices and limits can change.
