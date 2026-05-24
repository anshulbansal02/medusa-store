output "instance_name" {
  description = "Lightsail instance name."
  value       = aws_lightsail_instance.medusa.name
}

output "instance_arn" {
  description = "Lightsail instance ARN."
  value       = aws_lightsail_instance.medusa.arn
}

output "username" {
  description = "Default SSH username for the Lightsail instance."
  value       = aws_lightsail_instance.medusa.username
}

output "static_ip_name" {
  description = "Lightsail static IP name."
  value       = aws_lightsail_static_ip.medusa.name
}

output "static_ip_address" {
  description = "Lightsail static IPv4 address."
  value       = aws_lightsail_static_ip.medusa.ip_address
}

output "key_pair_name" {
  description = "Lightsail key pair name imported from the local public key."
  value       = aws_lightsail_key_pair.medusa.name
}
