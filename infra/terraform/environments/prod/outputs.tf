# Outputs are added as production infrastructure modules are wired in.
output "medusa_lightsail_instance_name" {
  description = "Production Medusa Lightsail instance name."
  value       = try(module.medusa_lightsail[0].instance_name, null)
}

output "medusa_lightsail_static_ip_address" {
  description = "Production Medusa Lightsail static IPv4 address."
  value       = try(module.medusa_lightsail[0].static_ip_address, null)
}

output "medusa_lightsail_ssh_username" {
  description = "Default SSH username for the production Medusa Lightsail host."
  value       = try(module.medusa_lightsail[0].username, null)
}

output "medusa_lightsail_key_pair_name" {
  description = "Lightsail key pair name imported for the production Medusa host."
  value       = try(module.medusa_lightsail[0].key_pair_name, null)
}
