locals {
  medusa_store_cors_origins = join(",", distinct(concat(var.medusa_store_cors_base_origins, ["https://${var.production_storefront_domain}"])))
  medusa_admin_cors_origins = join(",", distinct(concat(var.medusa_admin_cors_base_origins, ["https://${var.production_medusa_api_domain}", "https://${var.production_medusa_admin_domain}"])))
  medusa_auth_cors_origins  = join(",", distinct(concat(var.medusa_auth_cors_base_origins, ["https://${var.production_medusa_api_domain}", "https://${var.production_medusa_admin_domain}", "https://${var.production_storefront_domain}"])))
  medusa_backend_url        = "https://${var.production_medusa_api_domain}"
  medusa_admin_url          = "https://${var.production_medusa_admin_domain}"
  medusa_r2_file_url        = "https://${var.production_media_domain}"
  medusa_r2_endpoint        = "https://${var.cloudflare_r2_account_id}.r2.cloudflarestorage.com"
  medusa_baseline_string_parameters = {
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
  medusa_runtime_string_parameters = var.enable_medusa_runtime_config ? {
    STORE_CORS = {
      value       = local.medusa_store_cors_origins
      description = "Allowed storefront origins for the production Medusa service."
    }
    ADMIN_CORS = {
      value       = local.medusa_admin_cors_origins
      description = "Allowed admin origins for the production Medusa service."
    }
    AUTH_CORS = {
      value       = local.medusa_auth_cors_origins
      description = "Allowed auth origins for the production Medusa service."
    }
    MEDUSA_BACKEND_URL = {
      value       = local.medusa_backend_url
      description = "Externally reachable production Medusa backend URL."
    }
    MEDUSA_ADMIN_URL = {
      value       = local.medusa_admin_url
      description = "Externally reachable production Medusa Admin URL."
    }
    ADMIN_PATH = {
      value       = "/app"
      description = "Medusa Admin UI path. Caddy redirects the dedicated admin hostname root to this path."
    }
    S3_FILE_URL = {
      value       = local.medusa_r2_file_url
      description = "Public production media base URL served from Cloudflare R2."
    }
    S3_BUCKET = {
      value       = var.production_media_bucket_name
      description = "Cloudflare R2 bucket name for production Medusa media."
    }
    S3_ENDPOINT = {
      value       = local.medusa_r2_endpoint
      description = "Cloudflare R2 S3-compatible endpoint for production Medusa media."
    }
    STOREFRONT_URL = {
      value       = "https://${var.production_storefront_domain}"
      description = "Canonical production storefront URL used in transactional email links."
    }
  } : {}
  medusa_runtime_secure_string_parameters = var.enable_medusa_runtime_config ? {
    DATABASE_URL = {
      value       = coalesce(var.production_database_url, "")
      description = "PostgreSQL URL for the production Medusa service."
    }
    REDIS_URL = {
      value       = coalesce(var.production_redis_url, "")
      description = "Redis TLS URL for the production Medusa service."
    }
    S3_ACCESS_KEY_ID = {
      value       = coalesce(var.production_r2_access_key_id, "")
      description = "Cloudflare R2 S3 access key ID for production Medusa media."
    }
    S3_SECRET_ACCESS_KEY = {
      value       = coalesce(var.production_r2_secret_access_key, "")
      description = "Cloudflare R2 S3 secret access key for production Medusa media."
    }
  } : {}
  tags = {
    Project     = var.project
    ManagedBy   = "terraform"
    Environment = var.environment
  }
}

check "production_runtime_config_complete" {
  assert {
    condition = !var.enable_medusa_runtime_config || (
      length(coalesce(var.production_database_url, "")) > 0 &&
      length(coalesce(var.production_redis_url, "")) > 0 &&
      length(coalesce(var.production_r2_access_key_id, "")) > 0 &&
      length(coalesce(var.production_r2_secret_access_key, "")) > 0
    )
    error_message = "When enable_medusa_runtime_config is true, production_database_url, production_redis_url, production_r2_access_key_id, and production_r2_secret_access_key must be set through ignored tfvars or TF_VAR_*."
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
  string_parameters = merge(
    local.medusa_baseline_string_parameters,
    local.medusa_runtime_string_parameters,
  )
  secure_string_parameters = merge({
    JWT_SECRET = {
      value       = random_password.medusa_jwt_secret.result
      description = "JWT signing secret for the production Medusa service."
    }
    COOKIE_SECRET = {
      value       = random_password.medusa_cookie_secret.result
      description = "Cookie signing secret for the production Medusa service."
    }
  }, local.medusa_runtime_secure_string_parameters)
  tags = local.tags
}
