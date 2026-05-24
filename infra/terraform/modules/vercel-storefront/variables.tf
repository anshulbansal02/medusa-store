variable "project_name" {
  description = "Vercel project name for the storefront."
  type        = string
}

variable "framework" {
  description = "Vercel framework preset."
  type        = string
  default     = "nextjs"
}

variable "node_version" {
  description = "Node.js version used by Vercel builds and serverless functions."
  type        = string
  default     = "24.x"
}

variable "function_regions" {
  description = "Default Vercel Function regions. Keep close to Medusa and data services."
  type        = set(string)
  default     = ["sin1"]
}

variable "auto_assign_custom_domains" {
  description = "Whether production deployments automatically receive configured production custom domains."
  type        = bool
  default     = true
}

variable "preview_deployments_disabled" {
  description = "Whether Vercel preview deployments are disabled. CLI-managed QA deploys still use preview target."
  type        = bool
  default     = false
}

variable "environment_variables" {
  description = "Vercel project environment variables keyed by stable Terraform identifiers. Do not use inline project environment config with this module."
  type = map(object({
    key        = string
    value      = string
    target     = set(string)
    sensitive  = bool
    comment    = optional(string)
    git_branch = optional(string)
  }))
  default = {}
}

variable "domains" {
  description = "Vercel project domains keyed by stable Terraform identifiers."
  type = map(object({
    domain               = string
    git_branch           = optional(string)
    redirect             = optional(string)
    redirect_status_code = optional(number)
  }))
  default = {}
}
