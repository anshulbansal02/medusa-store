# Infrastructure

Infrastructure code and runbooks for the accepted Vercel + AWS Lightsail + Neon + Upstash + Cloudflare stack live here.

Current Terraform CLI selection: `1.15.4`.

Before applying infrastructure, complete the preflight inventory in `docs/infra-resource-inventory.md`, review `docs/infra-provider-audit.md`, and create the Terraform state backend from `infra/terraform/bootstrap`.

Runtime deployment files:

- `compose/docker-compose.qa.yml`: QA Medusa server, worker, and migration services.
- `compose/docker-compose.prod.yml`: production Medusa server, worker, and migration services.

Both Compose files require deploy-time `MEDUSA_IMAGE` and `MEDUSA_ENV_FILE` values. Runtime env files are generated on the Lightsail host from SSM and are not committed.
