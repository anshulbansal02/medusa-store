variable "aws_region" {
  description = "AWS region used for regional IAM policy resource ARNs."
  type        = string
  default     = "ap-southeast-1"
}

variable "aws_profile" {
  description = "Optional local AWS CLI profile name for Terraform."
  type        = string
  default     = null
}

variable "project" {
  description = "Project tag value."
  type        = string
  default     = "ecom"
}

variable "github_owner" {
  description = "GitHub repository owner allowed to assume deploy roles."
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name allowed to assume deploy roles."
  type        = string
}

variable "vercel_api_token" {
  description = "Vercel API token for Terraform-managed storefront resources. Prefer TF_VAR_vercel_api_token."
  type        = string
  sensitive   = true
}

variable "vercel_storefront_project_name" {
  description = "Vercel project name for the storefront."
  type        = string
  default     = "medusa-store-storefront"
}

variable "vercel_storefront_function_regions" {
  description = "Default Vercel Function regions for the storefront."
  type        = set(string)
  default     = ["sin1"]
}
