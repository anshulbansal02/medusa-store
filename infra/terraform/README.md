# Terraform

Terraform owns durable infrastructure only. It does not deploy application releases.

## Roots

- `bootstrap`: local-state bootstrap for the S3 remote state bucket.
- `environments/prod`: production infrastructure root using S3 remote state.
- `environments/qa`: QA infrastructure root using separate S3 remote state.

## Rules

- Use Terraform CLI `1.15.4`.
- Run `terraform fmt -recursive infra/terraform` before review.
- Run `terraform init` in each root before `terraform validate`.
- Pass the S3 backend bucket with `-backend-config="bucket=..."` for environment roots after bootstrap creates the bucket.
- Do not commit `.terraform/`, local state, plans, provider credentials, or secret tfvars.
- Commit only non-secret `*.tfvars.example` files.
- Keep provider credentials in local environment variables or approved secret stores.
- GitHub Actions may later run `fmt`/`validate`, but must not apply infrastructure for v1.
