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

output "vercel_storefront_qa_project_id" {
  description = "Terraform-managed Vercel QA storefront project ID."
  value       = module.vercel_storefront_qa.project_id
}

output "vercel_storefront_qa_project_name" {
  description = "Terraform-managed Vercel QA storefront project name."
  value       = module.vercel_storefront_qa.project_name
}

output "vercel_storefront_qa_environment_variable_ids" {
  description = "Terraform-managed Vercel QA storefront environment variable IDs."
  value       = module.vercel_storefront_qa.environment_variable_ids
}

output "vercel_storefront_qa_domain_ids" {
  description = "Terraform-managed Vercel QA storefront domain IDs."
  value       = module.vercel_storefront_qa.domain_ids
}

output "vercel_storefront_prod_project_id" {
  description = "Terraform-managed Vercel production storefront project ID."
  value       = module.vercel_storefront_prod.project_id
}

output "vercel_storefront_prod_project_name" {
  description = "Terraform-managed Vercel production storefront project name."
  value       = module.vercel_storefront_prod.project_name
}

output "vercel_storefront_prod_environment_variable_ids" {
  description = "Terraform-managed Vercel production storefront environment variable IDs."
  value       = module.vercel_storefront_prod.environment_variable_ids
}

output "vercel_storefront_prod_domain_ids" {
  description = "Terraform-managed Vercel production storefront domain IDs."
  value       = module.vercel_storefront_prod.domain_ids
}

output "cloudflare_dns_record_ids" {
  description = "Terraform-managed Cloudflare DNS record IDs."
  value       = var.cloudflare_site_enabled ? module.cloudflare_site[0].dns_record_ids : {}
}

output "cloudflare_r2_bucket_names" {
  description = "Terraform-managed Cloudflare R2 media bucket names."
  value       = var.cloudflare_site_enabled ? module.cloudflare_site[0].r2_bucket_names : {}
}

output "cloudflare_r2_custom_domain_status" {
  description = "Terraform-managed Cloudflare R2 media custom-domain status."
  value       = var.cloudflare_site_enabled ? module.cloudflare_site[0].r2_custom_domain_status : {}
}
