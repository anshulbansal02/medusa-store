locals {
  normalized_path_prefix = trimsuffix(var.path_prefix, "/")
}

resource "aws_ssm_parameter" "string" {
  for_each = var.string_parameters

  name        = "${local.normalized_path_prefix}/${each.key}"
  description = each.value.description
  type        = "String"
  value       = each.value.value
  tier        = "Standard"
  overwrite   = true

  tags = var.tags
}
