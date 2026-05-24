terraform {
  required_version = "= 1.15.4"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "= 6.46.0"
    }

    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "= 5.19.1"
    }

    upstash = {
      source  = "upstash/upstash"
      version = "= 2.1.0"
    }

    vercel = {
      source  = "vercel/vercel"
      version = "= 5.3.0"
    }

    betteruptime = {
      source  = "BetterStackHQ/better-uptime"
      version = "= 0.20.17"
    }

    random = {
      source  = "hashicorp/random"
      version = "= 3.7.2"
    }
  }
}
