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

variable "create_prod_deploy_role" {
  description = "Whether to create the production Medusa AWS deploy role. Keep false until production Medusa deploy is approved."
  type        = bool
  default     = false
}

variable "vercel_api_token" {
  description = "Vercel API token for Terraform-managed storefront resources. Prefer TF_VAR_vercel_api_token."
  type        = string
  sensitive   = true
}

variable "vercel_storefront_qa_project_name" {
  description = "Vercel project name for the QA storefront."
  type        = string
  default     = "your-storefront-qa-project"
}

variable "vercel_storefront_prod_project_name" {
  description = "Vercel project name for the production storefront."
  type        = string
  default     = "your-storefront-prod-project"
}

variable "vercel_storefront_function_regions" {
  description = "Default Vercel Function regions for the storefront."
  type        = set(string)
  default     = ["sin1"]
}

variable "vercel_storefront_qa_medusa_publishable_key" {
  description = "QA Medusa publishable API key configured on the QA Vercel project. This is browser-safe, but still environment-specific; pass it through ignored tfvars or TF_VAR_vercel_storefront_qa_medusa_publishable_key."
  type        = string
  sensitive   = true
}

variable "vercel_storefront_qa_order_access_secret" {
  description = "Server-only QA storefront secret used to sign short-lived order detail access grants. Prefer TF_VAR_vercel_storefront_qa_order_access_secret."
  type        = string
  sensitive   = true
  default     = null
  nullable    = true

  validation {
    condition     = var.vercel_storefront_qa_order_access_secret == null || length(var.vercel_storefront_qa_order_access_secret) >= 32
    error_message = "Use at least 32 characters for vercel_storefront_qa_order_access_secret."
  }
}

variable "vercel_storefront_prod_order_access_secret" {
  description = "Server-only production storefront secret used to sign short-lived order detail access grants. Prefer TF_VAR_vercel_storefront_prod_order_access_secret."
  type        = string
  sensitive   = true
  default     = null
  nullable    = true

  validation {
    condition     = var.vercel_storefront_prod_order_access_secret == null || length(var.vercel_storefront_prod_order_access_secret) >= 32
    error_message = "Use at least 32 characters for vercel_storefront_prod_order_access_secret."
  }
}

variable "production_apex_domain" {
  description = "Production apex domain."
  type        = string
  default     = "example.com"
}

variable "production_storefront_domain" {
  description = "Production storefront domain."
  type        = string
  default     = "www.example.com"
}

variable "qa_storefront_domain" {
  description = "QA storefront domain."
  type        = string
  default     = "qa.example.com"
}

variable "qa_medusa_api_domain" {
  description = "QA Medusa API domain."
  type        = string
  default     = "qa-api.example.com"
}

variable "qa_medusa_admin_domain" {
  description = "QA Medusa Admin domain."
  type        = string
  default     = "qa-admin.example.com"
}

variable "production_medusa_api_domain" {
  description = "Future production Medusa API domain. DNS is deferred until production compute exists."
  type        = string
  default     = "api.example.com"
}

variable "production_medusa_admin_domain" {
  description = "Future production Medusa Admin domain. DNS is deferred until production compute exists."
  type        = string
  default     = "admin.example.com"
}

variable "production_media_domain" {
  description = "Production media domain served from Cloudflare R2."
  type        = string
  default     = "media.example.com"
}

variable "qa_media_domain" {
  description = "QA media domain served from Cloudflare R2."
  type        = string
  default     = "qa-media.example.com"
}

variable "transactional_email_domain" {
  description = "Verified Resend transactional email sending subdomain."
  type        = string
  default     = "mail.neonfold.com"
}

variable "resend_dns_enabled" {
  description = "Whether to manage Resend DNS records for the transactional email subdomain."
  type        = bool
  default     = false
}

variable "qa_medusa_static_ip" {
  description = "QA Medusa Lightsail static public IP used for Cloudflare DNS. Pass the real value through ignored tfvars or TF_VAR_qa_medusa_static_ip."
  type        = string
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

variable "cloudflare_access_enabled" {
  description = "Whether to create Cloudflare Access protection for the QA Medusa Admin hostname."
  type        = bool
  default     = false

  validation {
    condition     = !var.cloudflare_access_enabled || (var.cloudflare_site_enabled && length(var.cloudflare_access_admin_emails) > 0)
    error_message = "Enable cloudflare_site_enabled and provide at least one cloudflare_access_admin_emails entry before enabling Cloudflare Access."
  }
}

variable "cloudflare_access_admin_emails" {
  description = "Approved admin email allowlist for Cloudflare Access."
  type        = set(string)
  default     = []

  validation {
    condition = alltrue([
      for email in var.cloudflare_access_admin_emails : can(regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", email))
    ])
    error_message = "All Cloudflare Access admin emails must be valid email addresses."
  }
}

variable "cloudflare_access_session_duration" {
  description = "Cloudflare Access session duration for protected admin applications."
  type        = string
  default     = "12h"
}

variable "cloudflare_web_analytics_enabled" {
  description = "Whether to create Cloudflare Web Analytics sites for storefront hostnames."
  type        = bool
  default     = false
}

variable "qa_media_bucket_name" {
  description = "Cloudflare R2 bucket name for QA media."
  type        = string
  default     = "your-qa-media-bucket"
}

variable "production_media_bucket_name" {
  description = "Cloudflare R2 bucket name for production media."
  type        = string
  default     = "your-prod-media-bucket"
}

variable "better_stack_uptime_enabled" {
  description = "Whether to manage Better Stack Uptime monitors from the shared root."
  type        = bool
  default     = false
}

variable "better_stack_uptime_api_token" {
  description = "Better Stack Uptime API token. Prefer TF_VAR_better_stack_uptime_api_token or BETTERUPTIME_API_TOKEN."
  type        = string
  sensitive   = true
  default     = null
}
