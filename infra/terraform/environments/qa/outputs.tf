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
