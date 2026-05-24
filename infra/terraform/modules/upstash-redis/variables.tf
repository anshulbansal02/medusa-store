variable "database_name" {
  description = "Upstash Redis database name."
  type        = string
}

variable "primary_region" {
  description = "Primary region for the Upstash Global Redis database."
  type        = string
  default     = "ap-southeast-1"
}

variable "read_regions" {
  description = "Optional read regions for the Upstash Global Redis database."
  type        = set(string)
  default     = []
}

variable "budget" {
  description = "Monthly budget limit for the database in USD."
  type        = number
  default     = 20

  validation {
    condition     = var.budget >= 20
    error_message = "Upstash Redis budget must be at least 20 because the Upstash API rejects lower values."
  }
}

variable "eviction" {
  description = "Whether Redis eviction is enabled when the database reaches max size."
  type        = bool
  default     = false
}

variable "auto_scale" {
  description = "Whether Upstash can automatically upgrade when quotas are hit."
  type        = bool
  default     = false
}
