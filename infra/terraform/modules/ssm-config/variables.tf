variable "path_prefix" {
  description = "SSM path prefix for this environment, for example /ecom/qa/medusa."
  type        = string

  validation {
    condition     = can(regex("^/[A-Za-z0-9_.\\-/]+$", var.path_prefix))
    error_message = "path_prefix must be an absolute SSM path containing only letters, numbers, dots, underscores, hyphens, and slashes."
  }
}

variable "string_parameters" {
  description = "Non-secret SSM String parameters keyed by final path segment."
  type = map(object({
    value       = string
    description = optional(string, null)
  }))
  default = {}

  validation {
    condition = alltrue([
      for name in keys(var.string_parameters) : can(regex("^[A-Z][A-Z0-9_]*$", name))
    ])
    error_message = "Each string parameter key must be an uppercase environment variable name."
  }
}

variable "secure_string_parameters" {
  description = "Secret SSM SecureString parameters keyed by final path segment. Values are stored in Terraform state."
  type = map(object({
    value       = string
    description = optional(string, null)
  }))
  default = {}

  validation {
    condition = alltrue([
      for name in keys(var.secure_string_parameters) : can(regex("^[A-Z][A-Z0-9_]*$", name))
    ])
    error_message = "Each secure string parameter key must be an uppercase environment variable name."
  }
}

variable "tags" {
  description = "Tags to apply to SSM parameters."
  type        = map(string)
  default     = {}
}
