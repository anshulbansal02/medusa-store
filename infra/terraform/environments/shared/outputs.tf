output "github_actions_oidc_provider_arn" {
  description = "AWS IAM OIDC provider ARN for GitHub Actions."
  value       = module.github_actions_aws_deploy.oidc_provider_arn
}

output "github_actions_qa_deploy_role_arn" {
  description = "IAM role ARN for QA Medusa deploys from GitHub Actions."
  value       = module.github_actions_aws_deploy.qa_deploy_role_arn
}

output "github_actions_prod_deploy_role_arn" {
  description = "IAM role ARN for production Medusa deploys from GitHub Actions."
  value       = module.github_actions_aws_deploy.prod_deploy_role_arn
}

output "vercel_storefront_project_id" {
  description = "Terraform-managed Vercel storefront project ID."
  value       = module.vercel_storefront.project_id
}

output "vercel_storefront_project_name" {
  description = "Terraform-managed Vercel storefront project name."
  value       = module.vercel_storefront.project_name
}

output "vercel_storefront_environment_variable_ids" {
  description = "Terraform-managed Vercel storefront environment variable IDs."
  value       = module.vercel_storefront.environment_variable_ids
}
