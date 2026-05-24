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
