variable "aws_region" {
  description = "AWS region for production infrastructure."
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

variable "environment" {
  description = "Environment name."
  type        = string
  default     = "prod"
}

variable "enable_medusa_lightsail" {
  description = "Whether to instantiate production Medusa Lightsail compute."
  type        = bool
  default     = false
}

variable "enable_medusa_runtime_config" {
  description = "Whether to write the full production Medusa runtime SSM config. Keep false until production data services and real values are approved."
  type        = bool
  default     = false

  validation {
    condition = !var.enable_medusa_runtime_config || (
      var.production_storefront_domain != "www.example.com" &&
      var.production_medusa_api_domain != "api.example.com" &&
      var.production_medusa_admin_domain != "admin.example.com" &&
      var.production_media_domain != "media.example.com" &&
      var.production_media_bucket_name != "your-prod-media-bucket" &&
      var.cloudflare_r2_account_id != "cloudflare-account-id" &&
      length(var.medusa_store_cors_base_origins) == 0 &&
      length(var.medusa_admin_cors_base_origins) == 0 &&
      length(var.medusa_auth_cors_base_origins) == 0
    )
    error_message = "Before enabling production runtime config, replace placeholder production domains, media bucket, and Cloudflare R2 account ID. Keep production base CORS overrides empty unless explicitly reviewed."
  }
}

variable "lightsail_availability_zone" {
  description = "Lightsail availability zone for the production Medusa host."
  type        = string
  default     = "ap-southeast-1a"
}

variable "lightsail_blueprint_id" {
  description = "Lightsail blueprint ID for the production Medusa host OS."
  type        = string
  default     = "ubuntu_22_04"
}

variable "lightsail_bundle_id" {
  description = "Lightsail bundle ID for the production Medusa host size."
  type        = string
  default     = "medium_3_0"
}

variable "lightsail_ssh_public_key_path" {
  description = "Local path to the public SSH key to import into Lightsail when production compute is enabled."
  type        = string
  default     = "~/.ssh/id_ed25519_ecom_lightsail.pub"
}

variable "lightsail_temporary_ssh_cidrs" {
  description = "Temporary IPv4 CIDR blocks allowed to reach SSH during bootstrap."
  type        = set(string)
  default     = []
}

variable "lightsail_automatic_snapshot_time" {
  description = "Daily automatic Lightsail snapshot time in UTC, in HH:00 format."
  type        = string
  default     = "20:00"
}

variable "production_storefront_domain" {
  description = "Production storefront domain."
  type        = string
  default     = "www.example.com"
}

variable "production_medusa_api_domain" {
  description = "Production Medusa API domain."
  type        = string
  default     = "api.example.com"
}

variable "production_medusa_admin_domain" {
  description = "Production Medusa Admin domain."
  type        = string
  default     = "admin.example.com"
}

variable "production_media_domain" {
  description = "Production media domain served from Cloudflare R2."
  type        = string
  default     = "media.example.com"
}

variable "production_media_bucket_name" {
  description = "Cloudflare R2 bucket name for production media."
  type        = string
  default     = "your-prod-media-bucket"
}

variable "cloudflare_r2_account_id" {
  description = "Cloudflare account ID used in the R2 S3-compatible endpoint URL."
  type        = string
  default     = "cloudflare-account-id"
}

variable "medusa_store_cors_base_origins" {
  description = "Base allowed storefront origins for production Medusa before derived public domain origins are added."
  type        = list(string)
  default     = []
}

variable "medusa_admin_cors_base_origins" {
  description = "Base allowed admin origins for production Medusa before derived public domain origins are added."
  type        = list(string)
  default     = []
}

variable "medusa_auth_cors_base_origins" {
  description = "Base allowed auth origins for production Medusa before derived public domain origins are added."
  type        = list(string)
  default     = []
}

variable "production_database_url" {
  description = "Production Neon Postgres URL for Medusa. Prefer TF_VAR_production_database_url or ignored tfvars when runtime config is enabled."
  type        = string
  default     = null
  sensitive   = true
}

variable "production_redis_url" {
  description = "Production Upstash Redis TLS URL for Medusa. Prefer TF_VAR_production_redis_url or ignored tfvars when runtime config is enabled."
  type        = string
  default     = null
  sensitive   = true
}

variable "production_r2_access_key_id" {
  description = "Production Cloudflare R2 S3 access key ID for Medusa media. Prefer TF_VAR_production_r2_access_key_id or ignored tfvars when runtime config is enabled."
  type        = string
  default     = null
  sensitive   = true
}

variable "production_r2_secret_access_key" {
  description = "Production Cloudflare R2 S3 secret access key for Medusa media. Prefer TF_VAR_production_r2_secret_access_key or ignored tfvars when runtime config is enabled."
  type        = string
  default     = null
  sensitive   = true
}
