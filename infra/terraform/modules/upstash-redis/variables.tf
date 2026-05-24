variable "database_name" {
  description = "Upstash Redis database name."
  type        = string
}

variable "region" {
  description = "Upstash Redis primary region."
  type        = string
  default     = "ap-southeast-1"
}

variable "budget" {
  description = "Monthly budget limit for the database in USD."
  type        = number
  default     = 5
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
