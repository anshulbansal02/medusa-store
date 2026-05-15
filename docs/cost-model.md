# Cost Model

Status: v1 cost guardrail
Last reviewed: 2026-05-15

Target: keep recurring operating cost around USD 50/month or lower where practical, excluding payment gateway transaction fees and domain renewal.

## Assumptions

- Vercel Pro account is acceptable.
- Railway Pro plan is acceptable.
- Existing domain is already purchased through Shopify.
- Existing AWS account is available, but AWS is not the default for v1.
- Avoid using both Supabase and Railway for overlapping backend/database roles.
- Avoid extra paid services unless they clearly reduce complexity or risk.

## Expected V1 Services

| Service | Purpose | Expected Cost Posture |
| --- | --- | --- |
| Vercel Pro | Next.js storefront | Already acceptable; storefront host |
| Railway Pro | Medusa, Postgres, Redis | Keep within included usage where practical |
| Cloudflare R2 | Product/media storage | Low at initial image/catalog scale |
| Cloudflare Web Analytics | Basic website analytics | Free |
| Resend | Transactional email | Free plan expected to be enough initially |
| Razorpay | Payments | Transaction fees; excluded from infra target |
| Domain | Existing domain | Renewal cost; excluded from monthly infra target |

## Cost Guardrails

- Do not add Supabase unless Railway is not used for backend/database or a Supabase-specific feature becomes necessary.
- Do not add paid analytics in v1.
- Do not add a CMS in v1.
- Do not add a dedicated search service in v1.
- Do not add Cloudflare Images unless image optimization costs or complexity justify it.
- Keep QA backend optional, small, and within Railway Pro usage if used.
- Pause/scale down/remove QA backend if it creates cost.
- Prefer free/native features when they are good enough and do not add complexity.

## Approximate Shape

```txt
Base expected recurring:
  Vercel Pro
  Railway Pro
  Cloudflare R2 small usage
  Resend Free
  Cloudflare Web Analytics Free

Target:
  Around USD 50/month or lower where practical
```

## Review Triggers

Revisit cost model if:

- Railway usage exceeds included credit.
- Vercel image/bandwidth/function usage grows.
- Product image traffic grows significantly.
- QA backend becomes always-on and costly.
- Analytics needs become more advanced.
- Shipping automation adds paid tools.
- Marketing starts paid ads or email campaigns.

Before launch, verify current official pricing for Vercel, Railway, Cloudflare R2, and Resend because prices and limits can change.
