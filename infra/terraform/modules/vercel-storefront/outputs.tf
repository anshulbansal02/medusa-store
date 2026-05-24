output "project_id" {
  description = "Vercel storefront project ID."
  value       = vercel_project.storefront.id
}

output "project_name" {
  description = "Vercel storefront project name."
  value       = vercel_project.storefront.name
}

output "environment_variable_ids" {
  description = "Vercel project environment variable IDs keyed by Terraform identifier."
  value = {
    for key, variable in vercel_project_environment_variable.variable : key => variable.id
  }
}

output "domain_ids" {
  description = "Vercel project domain IDs keyed by Terraform identifier."
  value = merge(
    {
      for key, domain in vercel_project_domain.domain : key => domain.id
    },
    {
      for key, domain in vercel_project_domain.redirect_domain : key => domain.id
    }
  )
}
