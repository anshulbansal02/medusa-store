# cloudflare-site

Terraform module for the Cloudflare foundation resources that have stable
provider support in `cloudflare/cloudflare` `5.19.1`.

This module currently supports:

- DNS records
- R2 buckets
- R2 custom domains
- Turnstile widgets
- Cloudflare Web Analytics sites

Cloudflare Access and WAF/ruleset resources are intentionally not included yet.
They need a separate review because policy/ruleset shape is security-sensitive
and depends on the final admin hostname, approved admin email allowlist, and
Cloudflare Zero Trust account state.

Manual inputs needed before wiring this module into a live root:

- `CLOUDFLARE_API_TOKEN`
- Cloudflare account ID
- Cloudflare zone ID
- production domain and exact hostnames
- QA hostnames
- approved admin email allowlist for Access
