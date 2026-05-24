# neon-postgres

Terraform module for the Medusa Neon Postgres project and QA database path.

This module creates:

- one Neon project in `aws-ap-southeast-1`;
- a default production branch/database/role shape with minimal endpoint size
  settings;
- a QA branch with its own role, database, and pooled read-write endpoint;
- a sensitive QA `DATABASE_URL` output for AWS SSM Parameter Store.

Provider note: `neon_branch` supports branch protection, but the
`neon_project` default branch block in `kislerdm/neon` `0.13.0` does not expose
`protected`. Do not claim the default production branch is Terraform-protected
until provider/API support is available or the resource model changes.

Provider/account note: this module intentionally does not set
`suspend_timeout_seconds`. Neon rejected that setting for the current account,
so the account's permitted default suspend behavior is used.

The current Neon account accepts a maximum project history retention of `21600`
seconds. Keep higher PITR settings for a later plan/account upgrade decision.

The Neon provider requires a Neon API key through `TF_VAR_neon_api_key` or
`NEON_API_KEY`. The Neon CLI OAuth login is useful for inventory but is not
accepted by the Terraform provider.
