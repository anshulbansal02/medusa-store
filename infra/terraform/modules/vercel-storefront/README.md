# vercel-storefront

Terraform module for the Vercel storefront project.

This module intentionally keeps the project unlinked from GitHub. Deployments are
manual GitHub Actions workflow dispatches that call the Vercel CLI, matching the
current v1 release policy.

This module does not manage custom domains yet because the production domain is
not selected. Add domain resources after the domain and exact QA/prod hostnames
are known.

Environment variables are managed with standalone
`vercel_project_environment_variable` resources. Do not add inline
`environment` blocks to the project resource, because the provider treats those
as conflicting configuration modes.
