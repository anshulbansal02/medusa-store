# SSM Config Module

Creates environment-specific AWS SSM Parameter Store parameters for Medusa
runtime configuration.

Non-secret values use `String`. Secret values use `SecureString`.

`SecureString` values are still present in Terraform state when managed through
this module. Use only with the approved S3 remote state backend and treat state
as secret-bearing.
