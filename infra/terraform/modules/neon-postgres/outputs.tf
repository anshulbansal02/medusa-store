output "project_id" {
  description = "Neon project ID."
  value       = neon_project.medusa.id
}

output "project_name" {
  description = "Neon project name."
  value       = neon_project.medusa.name
}

output "region_id" {
  description = "Neon project region ID."
  value       = neon_project.medusa.region_id
}

output "prod_branch_id" {
  description = "Default production branch ID."
  value       = neon_project.medusa.default_branch_id
}

output "qa_branch_id" {
  description = "QA branch ID."
  value       = neon_branch.qa.id
}

output "qa_database_name" {
  description = "QA database name."
  value       = neon_database.qa.name
}

output "qa_role_name" {
  description = "QA database role name."
  value       = neon_role.qa.name
}

output "qa_endpoint_id" {
  description = "QA endpoint ID."
  value       = neon_endpoint.qa.id
}

output "qa_endpoint_host" {
  description = "QA endpoint host."
  value       = neon_endpoint.qa.host
}

output "qa_database_url" {
  description = "QA pooled PostgreSQL connection URL."
  value       = local.qa_database_url
  sensitive   = true
}
