locals {
  normalized_path_prefix = trimsuffix(var.path_prefix, "/")
}

resource "aws_ssm_parameter" "string" {
  for_each = nonsensitive(toset(keys(var.string_parameters)))

  name        = "${local.normalized_path_prefix}/${each.key}"
  description = nonsensitive(var.string_parameters[each.key].description)
  type        = "String"
  value       = var.string_parameters[each.key].value
  tier        = "Standard"
  overwrite   = true

  tags = var.tags
}

resource "aws_ssm_parameter" "secure_string" {
  for_each = nonsensitive(toset(keys(var.secure_string_parameters)))

  name        = "${local.normalized_path_prefix}/${each.key}"
  description = nonsensitive(var.secure_string_parameters[each.key].description)
  type        = "SecureString"
  value       = var.secure_string_parameters[each.key].value
  tier        = "Standard"
  overwrite   = true

  tags = var.tags
}
