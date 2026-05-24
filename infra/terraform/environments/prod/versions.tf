terraform {
  required_version = "= 1.15.4"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "= 6.46.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "= 3.7.2"
    }
  }
}
