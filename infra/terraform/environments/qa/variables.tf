variable "aws_region" {
  description = "AWS region for QA infrastructure."
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
  default     = "qa"
}

variable "lightsail_availability_zone" {
  description = "Lightsail availability zone for the QA Medusa host."
  type        = string
  default     = "ap-southeast-1a"
}

variable "lightsail_blueprint_id" {
  description = "Lightsail blueprint ID for the QA Medusa host OS."
  type        = string
  default     = "ubuntu_22_04"
}

variable "lightsail_bundle_id" {
  description = "Lightsail bundle ID for the QA Medusa host size."
  type        = string
  default     = "small_3_0"
}

variable "lightsail_ssh_public_key_path" {
  description = "Local path to the public SSH key to import into Lightsail."
  type        = string
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

variable "upstash_email" {
  description = "Upstash account email for the Terraform provider. Prefer TF_VAR_upstash_email."
  type        = string
}

variable "upstash_api_key" {
  description = "Upstash API key for the Terraform provider. Prefer TF_VAR_upstash_api_key."
  type        = string
  sensitive   = true
}

variable "upstash_redis_primary_region" {
  description = "Primary region for the QA Upstash Global Redis database."
  type        = string
  default     = "ap-southeast-1"
}

variable "upstash_redis_read_regions" {
  description = "Optional read regions for the QA Upstash Global Redis database."
  type        = set(string)
  default     = []
}

variable "upstash_redis_budget" {
  description = "Monthly budget guardrail for QA Upstash Redis in USD."
  type        = number
  default     = 20
}

variable "neon_api_key" {
  description = "Neon API key for the Terraform provider. Prefer TF_VAR_neon_api_key."
  type        = string
  sensitive   = true
}

variable "neon_org_id" {
  description = "Neon organization ID that owns the Medusa project."
  type        = string
  default     = "org-soft-pond-66604026"
}

variable "neon_region_id" {
  description = "Neon region ID for the Medusa project."
  type        = string
  default     = "aws-ap-southeast-1"
}

variable "neon_pg_version" {
  description = "PostgreSQL major version for the Neon project."
  type        = number
  default     = 17
}

variable "neon_history_retention_seconds" {
  description = "Neon point-in-time restore history retention, in seconds."
  type        = number
  default     = 21600
}

variable "qa_storefront_domain" {
  description = "QA storefront domain."
  type        = string
  default     = "qa.neonfold.com"
}

variable "qa_medusa_api_domain" {
  description = "QA Medusa API domain."
  type        = string
  default     = "qa-api.neonfold.com"
}

variable "qa_medusa_admin_domain" {
  description = "QA Medusa Admin domain."
  type        = string
  default     = "qa-admin.neonfold.com"
}

variable "qa_media_domain" {
  description = "QA media domain served from Cloudflare R2."
  type        = string
  default     = "qa-media.neonfold.com"
}

variable "qa_media_bucket_name" {
  description = "Cloudflare R2 bucket name for QA media."
  type        = string
  default     = "ecom-qa-media"
}

variable "cloudflare_r2_account_id" {
  description = "Cloudflare account ID used in the R2 S3-compatible endpoint URL."
  type        = string
}

variable "medusa_store_cors_base_origins" {
  description = "Base allowed storefront origins for QA Medusa before derived public domain origins are added."
  type        = list(string)
  default     = ["http://storefront.localhost", "http://52.77.164.161", "http://100.71.144.128"]
}

variable "medusa_admin_cors_base_origins" {
  description = "Base allowed admin origins for QA Medusa before derived public domain origins are added."
  type        = list(string)
  default     = ["http://localhost:29181", "http://52.77.164.161", "http://100.71.144.128"]
}

variable "medusa_auth_cors_base_origins" {
  description = "Base allowed auth origins for QA Medusa before derived public domain origins are added."
  type        = list(string)
  default     = ["http://localhost:29181", "http://52.77.164.161", "http://100.71.144.128"]
}
