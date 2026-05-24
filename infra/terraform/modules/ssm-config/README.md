# SSM Config Module

Creates environment-specific AWS SSM Parameter Store `String` parameters for
non-secret runtime configuration.

Secret values are intentionally not managed by this module yet. Add real
`SecureString` handling only after the first secret write/update workflow is
reviewed with the target provider version and state behavior.
