variable "project_name" {
  description = "Neon project name."
  type        = string
}

variable "org_id" {
  description = "Neon organization ID that owns the project."
  type        = string
}

variable "region_id" {
  description = "Neon region ID for the project."
  type        = string
  default     = "aws-ap-southeast-1"
}

variable "pg_version" {
  description = "PostgreSQL major version."
  type        = number
  default     = 17
}

variable "prod_branch_name" {
  description = "Default production branch name."
  type        = string
  default     = "prod"
}

variable "prod_database_name" {
  description = "Default production database name."
  type        = string
  default     = "medusa_prod"
}

variable "prod_role_name" {
  description = "Default production database role name."
  type        = string
  default     = "medusa_prod"
}

variable "qa_branch_name" {
  description = "QA branch name."
  type        = string
  default     = "qa"
}

variable "qa_database_name" {
  description = "QA database name."
  type        = string
  default     = "medusa_qa"
}

variable "qa_role_name" {
  description = "QA database role name."
  type        = string
  default     = "medusa_qa"
}

variable "history_retention_seconds" {
  description = "Neon point-in-time restore history retention, in seconds."
  type        = number
  default     = 21600
}

variable "prod_endpoint_min_cu" {
  description = "Minimum compute units for the default production endpoint."
  type        = number
  default     = 0.25
}

variable "prod_endpoint_max_cu" {
  description = "Maximum compute units for the default production endpoint."
  type        = number
  default     = 0.25
}

variable "qa_endpoint_min_cu" {
  description = "Minimum compute units for the QA endpoint."
  type        = number
  default     = 0.25
}

variable "qa_endpoint_max_cu" {
  description = "Maximum compute units for the QA endpoint."
  type        = number
  default     = 0.25
}
