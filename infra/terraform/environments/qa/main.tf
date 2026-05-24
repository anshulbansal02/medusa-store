locals {
  tags = {
    Project     = var.project
    ManagedBy   = "terraform"
    Environment = var.environment
  }
}

module "medusa_lightsail" {
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

module "medusa_redis" {
  source = "../../modules/upstash-redis"

  database_name = "${var.project}-${var.environment}-medusa"
  region        = var.upstash_redis_region
  budget        = var.upstash_redis_budget
  eviction      = false
  auto_scale    = false
}

module "medusa_ssm_config" {
  source = "../../modules/ssm-config"

  path_prefix = "/${var.project}/${var.environment}/medusa"
  string_parameters = {
    NODE_ENV = {
      value       = "production"
      description = "Node runtime mode for the QA Medusa service."
    }
    MEDUSA_WORKER_MODE = {
      value       = "shared"
      description = "Medusa worker mode for the single-host QA service."
    }
    S3_REGION = {
      value       = "auto"
      description = "S3-compatible region value used by Cloudflare R2."
    }
  }
  secure_string_parameters = {
    REDIS_URL = {
      value       = module.medusa_redis.redis_url
      description = "Redis TLS URL for the QA Medusa service."
    }
  }
  tags = local.tags
}
