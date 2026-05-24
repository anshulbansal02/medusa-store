terraform {
  required_version = "= 1.15.4"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "= 6.46.0"
    }

    upstash = {
      source  = "upstash/upstash"
      version = "= 2.1.0"
    }

    neon = {
      source  = "kislerdm/neon"
      version = "= 0.13.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "= 3.7.2"
    }

  }
}
