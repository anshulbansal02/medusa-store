# Infrastructure

Infrastructure code and runbooks for the accepted Vercel + AWS Lightsail + Neon + Upstash + Cloudflare stack live here.

Current Terraform CLI selection: `1.15.4`.

Before applying infrastructure, complete the preflight inventory in `docs/infra-resource-inventory.md`, review `docs/infra-provider-audit.md`, and create the Terraform state backend from `infra/terraform/bootstrap`.
