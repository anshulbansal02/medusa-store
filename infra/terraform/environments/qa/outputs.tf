# Outputs are added as QA infrastructure modules are wired in.
output "medusa_lightsail_instance_name" {
  description = "QA Medusa Lightsail instance name."
  value       = module.medusa_lightsail.instance_name
}

output "medusa_lightsail_static_ip_address" {
  description = "QA Medusa Lightsail static IPv4 address."
  value       = module.medusa_lightsail.static_ip_address
}

output "medusa_lightsail_ssh_username" {
  description = "Default SSH username for the QA Medusa Lightsail host."
  value       = module.medusa_lightsail.username
}

output "medusa_lightsail_key_pair_name" {
  description = "Lightsail key pair name imported for the QA Medusa host."
  value       = module.medusa_lightsail.key_pair_name
}

output "medusa_ssm_path_prefix" {
  description = "QA Medusa SSM path prefix."
  value       = module.medusa_ssm_config.path_prefix
}

output "medusa_ssm_string_parameter_names" {
  description = "QA Medusa non-secret SSM String parameter names."
  value       = module.medusa_ssm_config.string_parameter_names
}

output "medusa_ssm_secure_string_parameter_names" {
  description = "QA Medusa secret SSM SecureString parameter names."
  value       = module.medusa_ssm_config.secure_string_parameter_names
}

output "medusa_redis_database_id" {
  description = "QA Medusa Upstash Redis database ID."
  value       = module.medusa_redis.database_id
}

output "medusa_redis_database_name" {
  description = "QA Medusa Upstash Redis database name."
  value       = module.medusa_redis.database_name
}

output "medusa_redis_endpoint" {
  description = "QA Medusa Upstash Redis endpoint."
  value       = module.medusa_redis.endpoint
}

output "medusa_postgres_project_id" {
  description = "QA Medusa Neon project ID."
  value       = module.medusa_postgres.project_id
}

output "medusa_postgres_region_id" {
  description = "QA Medusa Neon region ID."
  value       = module.medusa_postgres.region_id
}

output "medusa_postgres_qa_branch_id" {
  description = "QA Medusa Neon branch ID."
  value       = module.medusa_postgres.qa_branch_id
}

output "medusa_postgres_qa_endpoint_host" {
  description = "QA Medusa Neon endpoint host."
  value       = module.medusa_postgres.qa_endpoint_host
}
