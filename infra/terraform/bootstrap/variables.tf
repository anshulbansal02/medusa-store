variable "aws_region" {
  description = "AWS region for Terraform state resources."
  type        = string
}

variable "aws_profile" {
  description = "Optional local AWS CLI profile name for bootstrap applies."
  type        = string
  default     = null
}

variable "state_bucket_name" {
  description = "Globally unique S3 bucket name for Terraform remote state."
  type        = string
}

variable "lock_table_name" {
  description = "DynamoDB table name for Terraform state locking."
  type        = string
}

variable "project" {
  description = "Project tag value."
  type        = string
  default     = "ecom"
}

