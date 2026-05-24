output "oidc_provider_arn" {
  description = "AWS IAM OIDC provider ARN for GitHub Actions."
  value       = aws_iam_openid_connect_provider.github_actions.arn
}

output "qa_deploy_role_arn" {
  description = "IAM role ARN for QA Medusa deploy jobs."
  value       = aws_iam_role.qa_deploy.arn
}

output "prod_deploy_role_arn" {
  description = "IAM role ARN for production Medusa deploy jobs, when enabled."
  value       = var.create_prod_role ? aws_iam_role.prod_deploy[0].arn : null
}
