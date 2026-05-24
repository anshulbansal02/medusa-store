# Infrastructure

Infrastructure code and runbooks for the accepted Vercel + AWS Lightsail + Neon + Upstash + Cloudflare stack live here.

Current Terraform CLI selection: `1.15.4`.

Use `mise exec terraform@1.15.4 -- terraform ...` or the root `pnpm infra:*`
scripts so the stale system Terraform binary is not used.

Before applying infrastructure, complete the preflight inventory in `docs/infra-resource-inventory.md`, review `docs/infra-provider-audit.md`, and create the Terraform state backend from `infra/terraform/bootstrap`.

Shared operator/provider credentials are stored in AWS SSM Parameter Store under
`/ecom/shared/operator/*`. Use AWS CLI reads into `TF_VAR_*` environment
variables for local Terraform plan/apply runs; do not print or commit the
values. See `runbooks/terraform-operator-ssm.md` for the exact provider
environment variable mapping.

Runtime deployment files:

- `compose/docker-compose.qa.yml`: QA Medusa server, worker, and migration services.
- `compose/docker-compose.prod.yml`: production Medusa server, worker, and migration services.
- `scripts/render-ssm-env.py`: renders SSM deploy parameters into a dotenv file on the GitHub runner.
- `scripts/deploy-medusa-host.sh`: runs migrations, starts QA Medusa containers, and points Caddy at the local Medusa port on the Lightsail host.

Both Compose files require deploy-time `MEDUSA_IMAGE` and `MEDUSA_ENV_FILE`
values. Runtime env files are generated on the Lightsail host from SSM and are
not committed. The host deploy script requires both `/health` and `/ready` to
pass before it reports success.
