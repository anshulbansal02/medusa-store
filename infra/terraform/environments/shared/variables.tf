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

variable "vercel_storefront_qa_medusa_backend_url" {
  description = "QA Medusa backend URL configured on Vercel preview deployments."
  type        = string
  default     = "http://52.77.164.161"
}

variable "vercel_storefront_qa_medusa_publishable_key" {
  description = "QA Medusa publishable API key configured on Vercel preview deployments. This is browser-safe."
  type        = string
  default     = "pk_8c1d080d0113830ac1d39a30dfa86c7927b475e1413899f479b408a95bb39b85"
}
