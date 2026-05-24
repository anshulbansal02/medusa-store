# cloudflare-site

Terraform module for the Cloudflare foundation resources that have stable
provider support in `cloudflare/cloudflare` `5.19.1`.

This module currently supports:

- DNS records
- R2 buckets
- R2 custom domains
- Cloudflare Access self-hosted applications
- Turnstile widgets
- Cloudflare Web Analytics sites

Cloudflare Access support is limited to simple self-hosted applications with an
explicit email allowlist. WAF/ruleset resources are intentionally not included
yet because their policy shape is security-sensitive and should be added only
after the final admin hostnames and launch traffic behavior are reviewed.

Manual inputs needed before wiring this module into a live root:

- `CLOUDFLARE_API_TOKEN`
- Cloudflare account ID
- Cloudflare zone ID
- production domain and exact hostnames
- QA hostnames
- approved admin email allowlist for Access
