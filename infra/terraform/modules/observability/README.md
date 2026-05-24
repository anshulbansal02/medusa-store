# Observability

Terraform module for stable observability resources.

Current scope:

- Better Stack Uptime HTTP monitors.

Deferred:

- Better Stack Telemetry/log sources. Better Stack documents this under a separate Telemetry provider/API surface, so keep log sources manual until the provider behavior is reviewed.

Do not store API tokens in `terraform.tfvars`; use `TF_VAR_better_stack_uptime_api_token` or `BETTERUPTIME_API_TOKEN`.
