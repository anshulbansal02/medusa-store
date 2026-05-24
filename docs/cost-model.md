# Cost Model

Status: v1 cost guardrail
Last reviewed: 2026-05-24

Target: keep recurring operating cost around USD 50/month or lower where practical, excluding payment gateway transaction fees and domain renewal.

## Assumptions

- Vercel Pro account is acceptable.
- AWS Lightsail is accepted for Medusa compute, starting with QA; production instantiation is deferred until QA is set up and tested.
- Existing domain is already purchased through Shopify.
- Existing AWS account is available and used for Lightsail compute, Terraform state, and SSM Parameter Store.
- Production Postgres is Neon in Singapore.
- Production Redis is Upstash in Singapore, pay-as-you-go initially.
- Avoid extra paid services unless they clearly reduce complexity or risk.

## Expected V1 Services

| Service | Purpose | Expected Cost Posture |
| --- | --- | --- |
| Vercel Pro | Next.js storefront | Already acceptable; storefront host |
| AWS Lightsail 2 GB | QA Medusa compute first | Predictable lower-cost QA app-host while testing |
| AWS Lightsail 4 GB | Production Medusa compute later | Predictable single-instance production app-host cost when active |
| Lightsail snapshots | Host recovery convenience | Extra snapshot storage cost; review after first month |
| Neon Postgres | Production database | Managed Postgres in Singapore |
| Upstash Redis | Production cache/events/workflows | Pay-as-you-go initially; review for Fixed 250 MB after real usage |
| Cloudflare R2 | Product/media storage | Low at initial image/catalog scale |
| Cloudflare DNS | Authoritative DNS | Free/low-cost DNS management; registrar transfer not required |
| Cloudflare Web Analytics | Basic website analytics | Free |
| Better Stack | Uptime checks, alerts, logs, and application error tracking | Free/low-cost tier expected initially; verify commercial-use terms and ingestion limits |
| Resend | Transactional email | Free plan expected to be enough initially |
| Razorpay | Payments | Transaction fees; excluded from infra target |
| Domain | Existing domain | Renewal cost; excluded from monthly infra target |

## Cost Guardrails

- Do not switch Redis to a fixed plan until measured usage or billing needs justify it.
- Do not add paid analytics in v1.
- Do not add a CMS in v1.
- Do not add a dedicated search service in v1.
- Do not add Cloudflare Images unless image optimization costs or complexity justify it.
- Instantiate production compute after QA setup and testing, when explicitly approved.
- Delete QA backend compute when it is no longer needed; stopped Lightsail instances still accrue charges until deleted.
- Prefer free/native features when they are good enough and do not add complexity.
- Do not rely on a free tier blindly. Track limits and overage behavior for GitHub Actions minutes/storage, GHCR storage/transfer, Vercel bandwidth/build/image usage, Lightsail bandwidth/snapshots, Neon storage/compute, Upstash commands/bandwidth/storage, Cloudflare R2 storage/operations/egress, Resend sends, and Better Stack.
- Add budget alerts or usage review checkpoints before enabling always-on QA, production traffic, or media-heavy campaigns.

## Approximate Shape

```txt
Base expected recurring:
  Vercel Pro
  AWS Lightsail 2 GB for active QA first; production 4 GB later
  Lightsail snapshot storage
  Neon Postgres
  Upstash Redis pay-as-you-go
  Cloudflare R2 small usage
  Resend Free
  Better Stack free or low usage tier
  Cloudflare Web Analytics Free

Target:
  Around USD 50/month or lower where practical
```

## Review Triggers

Revisit cost model if:

- Any provider starts charging after a free allowance is exceeded.
- GitHub Actions, GHCR, Vercel, Cloudflare R2, Neon, Upstash, or Lightsail bandwidth/storage usage begins trending upward without a matching business need.
- Lightsail compute is too small or operational overhead becomes too high.
- Lightsail snapshot storage cost is higher than expected.
- Neon or Upstash cost exceeds the target envelope.
- Upstash pay-as-you-go approaches the Fixed 250 MB monthly cost.
- Vercel image/bandwidth/function usage grows.
- Product image traffic grows significantly.
- QA backend becomes always-on and costly.
- Analytics needs become more advanced.
- Better Stack usage exceeds free/low-cost tiers.
- Shipping automation adds paid tools.
- Marketing starts paid ads or email campaigns.

Before launch, verify current official pricing for Vercel, AWS Lightsail, Neon, Upstash, Cloudflare R2, and Resend because prices and limits can change.

## Later Cost Review Tasks

- Produce a monthly cost and quota checklist before production launch.
- Confirm GitHub Actions and GHCR usage limits for the organization/account used by this repo.
- Confirm Vercel Pro usage limits and overage behavior for bandwidth, builds, image optimization, and deployment retention.
- Confirm Lightsail instance, static IP, snapshot, and outbound transfer charges in the selected region.
- Confirm Neon and Upstash free/pay-as-you-go limits, autoscaling behavior, and budget controls.
- Confirm Cloudflare R2 operation/storage costs and any media-domain traffic assumptions.
