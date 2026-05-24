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
