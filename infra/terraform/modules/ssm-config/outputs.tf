output "path_prefix" {
  description = "SSM path prefix managed by this module."
  value       = local.normalized_path_prefix
}

output "string_parameter_names" {
  description = "Names of non-secret SSM String parameters."
  value = {
    for key, parameter in aws_ssm_parameter.string : key => parameter.name
  }
}

output "secure_string_parameter_names" {
  description = "Names of secret SSM SecureString parameters."
  value = {
    for key, parameter in aws_ssm_parameter.secure_string : key => parameter.name
  }
}
