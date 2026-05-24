locals {
  tags = {
    Project     = var.project
    ManagedBy   = "terraform"
    Environment = var.environment
  }
}

module "medusa_lightsail" {
  count  = var.enable_medusa_lightsail ? 1 : 0
  source = "../../modules/lightsail-medusa"

  project                 = var.project
  environment             = var.environment
  availability_zone       = var.lightsail_availability_zone
  blueprint_id            = var.lightsail_blueprint_id
  bundle_id               = var.lightsail_bundle_id
  ssh_public_key_path     = var.lightsail_ssh_public_key_path
  temporary_ssh_cidrs     = var.lightsail_temporary_ssh_cidrs
  automatic_snapshot_time = var.lightsail_automatic_snapshot_time
  tags                    = local.tags
}

resource "random_password" "medusa_jwt_secret" {
  length  = 64
  special = false
}

resource "random_password" "medusa_cookie_secret" {
  length  = 64
  special = false
}

module "medusa_ssm_config" {
  source = "../../modules/ssm-config"

  path_prefix = "/${var.project}/${var.environment}/medusa"
  string_parameters = {
    NODE_ENV = {
      value       = "production"
      description = "Node runtime mode for the production Medusa service."
    }
    MEDUSA_WORKER_MODE = {
      value       = "shared"
      description = "Default production Medusa worker mode before dedicated scaling is introduced."
    }
    S3_REGION = {
      value       = "auto"
      description = "S3-compatible region value used by Cloudflare R2."
    }
  }
  secure_string_parameters = {
    JWT_SECRET = {
      value       = random_password.medusa_jwt_secret.result
      description = "JWT signing secret for the production Medusa service."
    }
    COOKIE_SECRET = {
      value       = random_password.medusa_cookie_secret.result
      description = "Cookie signing secret for the production Medusa service."
    }
  }
  tags = local.tags
}
