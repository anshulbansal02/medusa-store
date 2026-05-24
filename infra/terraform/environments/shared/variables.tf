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

variable "vercel_storefront_qa_medusa_publishable_key" {
  description = "QA Medusa publishable API key configured on Vercel preview deployments. This is browser-safe."
  type        = string
  default     = "pk_8c1d080d0113830ac1d39a30dfa86c7927b475e1413899f479b408a95bb39b85"
}

variable "domain_name" {
  description = "Base domain for the current storefront environment set. Change this to move from the interim domain to the final brand domain."
  type        = string
  default     = "neonfold.com"
}

variable "production_storefront_subdomain" {
  description = "Subdomain for the production storefront. Use an empty string to use the apex."
  type        = string
  default     = "www"
}

variable "qa_storefront_subdomain" {
  description = "Subdomain for the QA storefront."
  type        = string
  default     = "qa"
}

variable "qa_medusa_api_subdomain" {
  description = "Subdomain for the QA Medusa API."
  type        = string
  default     = "qa-api"
}

variable "production_media_subdomain" {
  description = "Subdomain for production media served from Cloudflare R2."
  type        = string
  default     = "media"
}

variable "qa_media_subdomain" {
  description = "Subdomain for QA media served from Cloudflare R2."
  type        = string
  default     = "qa-media"
}

variable "qa_medusa_static_ip" {
  description = "QA Medusa Lightsail static public IP used for Cloudflare DNS."
  type        = string
  default     = "52.77.164.161"
}

variable "cloudflare_site_enabled" {
  description = "Whether to manage Cloudflare DNS and site resources for the storefront domain."
  type        = bool
  default     = false
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID for the domain account."
  type        = string
  default     = null
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for storefront_domain."
  type        = string
  default     = null
}

variable "cloudflare_r2_media_enabled" {
  description = "Whether to create Cloudflare R2 media buckets and custom domains."
  type        = bool
  default     = false
}

variable "qa_media_bucket_name" {
  description = "Cloudflare R2 bucket name for QA media."
  type        = string
  default     = "ecom-qa-media"
}

variable "production_media_bucket_name" {
  description = "Cloudflare R2 bucket name for production media."
  type        = string
  default     = "ecom-prod-media"
}
