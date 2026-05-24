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

