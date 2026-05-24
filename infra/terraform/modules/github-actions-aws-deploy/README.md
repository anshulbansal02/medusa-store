# GitHub Actions AWS Deploy Module

Creates AWS IAM resources for GitHub Actions deploy jobs that need temporary
AWS credentials.

The module uses GitHub's OIDC provider and environment-scoped trust policies.
It does not create long-lived AWS access keys.
