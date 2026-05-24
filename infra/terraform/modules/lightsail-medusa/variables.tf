variable "project" {
  description = "Project name used in Lightsail resource names."
  type        = string
}

variable "environment" {
  description = "Environment name used in Lightsail resource names."
  type        = string
}

variable "availability_zone" {
  description = "Lightsail availability zone for the Medusa host."
  type        = string
}

variable "blueprint_id" {
  description = "Lightsail blueprint ID for the Medusa host OS."
  type        = string
  default     = "ubuntu_22_04"
}

variable "bundle_id" {
  description = "Lightsail bundle ID for the Medusa host size."
  type        = string
  default     = "medium_3_0"
}

variable "ssh_public_key_path" {
  description = "Local path to the public SSH key to import into Lightsail. Do not point this at a private key."
  type        = string

  validation {
    condition     = endswith(var.ssh_public_key_path, ".pub")
    error_message = "ssh_public_key_path must point to a public key file ending in .pub."
  }
}

variable "temporary_ssh_cidrs" {
  description = "Temporary IPv4 CIDR blocks allowed to reach SSH during bootstrap. Leave empty after Tailscale SSH is verified."
  type        = set(string)
  default     = []

  validation {
    condition = alltrue([
      for cidr in var.temporary_ssh_cidrs : can(cidrhost(cidr, 0))
    ])
    error_message = "Each temporary SSH entry must be a valid IPv4 CIDR block."
  }

  validation {
    condition     = !contains(var.temporary_ssh_cidrs, "0.0.0.0/0")
    error_message = "Temporary SSH must not be open to the full internet."
  }
}

variable "enable_automatic_snapshots" {
  description = "Whether to enable Lightsail automatic snapshots for host recovery."
  type        = bool
  default     = true
}

variable "automatic_snapshot_time" {
  description = "Daily automatic snapshot time in UTC, in HH:00 format."
  type        = string
  default     = "20:00"

  validation {
    condition     = can(regex("^([01][0-9]|2[0-3]):00$", var.automatic_snapshot_time))
    error_message = "automatic_snapshot_time must be in HH:00 UTC format."
  }
}

variable "tags" {
  description = "Tags to apply to Lightsail resources that support tagging."
  type        = map(string)
  default     = {}
}
