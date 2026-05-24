provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = local.tags
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
}

provider "betteruptime" {
  api_token = var.better_stack_uptime_api_token
}
