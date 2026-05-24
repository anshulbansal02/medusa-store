provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = local.tags
  }
}

provider "cloudflare" {}
provider "upstash" {}
provider "vercel" {}
provider "betteruptime" {}
