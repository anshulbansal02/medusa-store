provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = local.tags
  }
}

provider "upstash" {
  email   = var.upstash_email
  api_key = var.upstash_api_key
}
