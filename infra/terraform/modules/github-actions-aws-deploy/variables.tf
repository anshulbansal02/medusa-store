variable "project" {
  description = "Project name used in IAM resource names."
  type        = string
}

variable "github_owner" {
  description = "GitHub repository owner allowed to assume deploy roles."
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name allowed to assume deploy roles."
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID containing the SSM parameters."
  type        = string
}

variable "aws_region" {
  description = "AWS region containing the SSM parameters."
  type        = string
}

variable "qa_ssm_path" {
  description = "QA SSM path prefix for Medusa runtime config and secrets."
  type        = string
}

variable "prod_ssm_path" {
  description = "Production SSM path prefix for Medusa runtime config and secrets."
  type        = string
}

variable "create_prod_role" {
  description = "Whether to create the production deploy role."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to IAM resources that support tagging."
  type        = map(string)
  default     = {}
}
