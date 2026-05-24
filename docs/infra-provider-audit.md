# Infrastructure Provider Audit

Status: preliminary audit record
Last reviewed: 2026-05-24

Use this file with Phase 0 of `docs/infra-terraform-implementation-plan.md`.

This audit records provider candidates and known review gates before real resources are wired. It is not approval to manage live resources or secrets through Terraform.

## Terraform CLI

Selected CLI version: `1.15.4`

Reason:

- HashiCorp's official install page currently lists Terraform `1.15.4`.
- The repo pins this version in `.terraform-version` and Terraform root modules.

Local status:

- This machine currently has Terraform `1.5.7`, so `terraform init` and `terraform validate` are blocked until Terraform is upgraded locally.

## Provider Candidates

| Provider | Source | Candidate version | Status | Notes |
| --- | --- | --- | --- | --- |
| AWS | `hashicorp/aws` | `6.46.0` | candidate | Official provider. Needed for Lightsail, S3, SSM, IAM, billing resources where supported. |
| Cloudflare | `cloudflare/cloudflare` | `5.19.1` | candidate | Partner provider. Needed for DNS, R2, Access, Turnstile, and security resources where supported. |
| Upstash | `upstash/upstash` | `2.1.0` | candidate | Needed for Redis databases. Confirm Singapore region IDs and pay-as-you-go behavior before resources. |
| Vercel | `vercel/vercel` | `5.3.0` | candidate | Needed for storefront project, domains, and env vars. Avoid mixing inline and standalone env-var modes. |
| Better Stack Uptime | `BetterStackHQ/better-uptime` | `0.20.17` | candidate | Partner provider. Covers uptime resources; log source support may require a separate provider/API or manual setup. |
| Sentry | `jianyuan/sentry` | `0.15.0-beta3` | review before use | Registry latest is beta. Not pinned in root modules until resource support and stability are reviewed. |
| Neon | `kislerdm/neon` | `0.13.0` | validated, blocked on API key for plan/apply | Community provider with project, branch, endpoint, role, database, sensitive connection outputs, and import support. Requires a Neon API key; Neon CLI OAuth login is not accepted by the provider/API for Terraform auth. |

## Official References Checked

- Terraform install page: https://developer.hashicorp.com/terraform/install
- Terraform provider versioning: https://developer.hashicorp.com/terraform/tutorials/configuration-language/provider-versioning
- AWS provider registry: https://registry.terraform.io/providers/hashicorp/aws/latest
- Cloudflare provider registry: https://registry.terraform.io/providers/cloudflare/cloudflare/latest
- Cloudflare Terraform changelog: https://developers.cloudflare.com/changelog/product/terraform/
- Cloudflare R2 Terraform example: https://developers.cloudflare.com/r2/examples/terraform/
- Upstash Terraform provider docs: https://upstash.com/docs/redis/howto/terraformprovider
- Vercel Terraform guide: https://vercel.com/guides/integrating-terraform-with-vercel/
- Vercel project environment variable docs: https://registry.terraform.io/providers/vercel/vercel/latest/docs/resources/project_environment_variable
- Better Stack Terraform docs: https://betterstack.com/docs/uptime/terraform/
- Better Stack provider registry: https://registry.terraform.io/providers/BetterStackHQ/better-uptime/latest
- Sentry provider registry: https://registry.terraform.io/providers/jianyuan/sentry/latest/docs
- Neon provider registry: https://registry.terraform.io/providers/kislerdm/neon/latest/docs
- Neon regions: https://neon.com/docs/conceptual-guides/regions
- Neon API current user endpoint: https://api-docs.neon.tech/reference/getcurrentuserinfo

Registry API checks on 2026-05-24:

- Terraform CLI current version: `1.15.4`.
- AWS provider latest: `6.46.0`, published 2026-05-20.
- Cloudflare provider latest: `5.19.1`, published 2026-05-01.
- Upstash provider latest: `2.1.0`, published 2025-08-27.
- Vercel provider latest: `5.3.0`, published 2026-05-20.
- Better Stack Uptime provider latest: `0.20.17`, published 2026-05-13.
- Sentry provider latest: `0.15.0-beta3`, published 2026-05-18.
- Neon provider latest: `0.13.0`, published 2026-01-02.

## Open Review Items

- Confirm AWS provider `6.x` resource arguments for Lightsail snapshots and port rules before adding the Lightsail module.
- Confirmed Cloudflare provider `5.19.1` exposes `cloudflare_dns_record`, `cloudflare_r2_bucket`, `cloudflare_r2_custom_domain`, `cloudflare_turnstile_widget`, and `cloudflare_web_analytics_site`. A validated module exists for those resources but is not wired to a live root until Cloudflare account/zone/domain inputs are available.
- Cloudflare Access and WAF/ruleset resources exist in the provider, but remain under review because policy/ruleset shape is security-sensitive and depends on the final admin hostname, approved admin email allowlist, and Zero Trust account state.
- Confirmed Upstash Terraform provider `2.1.0` uses `upstash_redis_database`; Regional Redis creation is rejected as deprecated, so use `region = "global"` with `primary_region = "ap-southeast-1"` for Singapore-primary databases. The Upstash API rejects budget values below `$20`.
- Confirm Vercel env var resource mode and sensitive-value behavior before managing env vars.
- Confirm Better Stack log source Terraform support. If unsupported or unstable, keep log source manual and document the reason.
- Decide whether to use the beta Sentry provider, pin a stable older version, or keep Sentry manual for v1. Sentry is intentionally not in the root `required_providers` blocks yet.
- Neon provider schema validation passed after using `store_password = "yes"`. The QA root now pins `kislerdm/neon` `0.13.0`.
- Neon Terraform plan/apply uses `NEON_KEY` from the local uncommitted `.env` file mapped to `TF_VAR_neon_api_key`. The current account rejected explicit endpoint suspend interval changes and history retention above `21600` seconds, so Terraform leaves suspend interval unset and pins history retention to `21600` seconds.
