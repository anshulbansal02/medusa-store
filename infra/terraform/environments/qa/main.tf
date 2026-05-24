locals {
  medusa_store_cors_origins = join(",", distinct(concat(var.medusa_store_cors_base_origins, ["https://${var.qa_storefront_domain}"])))
  medusa_admin_cors_origins = join(",", distinct(concat(var.medusa_admin_cors_base_origins, ["https://${var.qa_medusa_api_domain}", "https://${var.qa_medusa_admin_domain}"])))
  medusa_auth_cors_origins  = join(",", distinct(concat(var.medusa_auth_cors_base_origins, ["https://${var.qa_medusa_api_domain}", "https://${var.qa_medusa_admin_domain}", "https://${var.qa_storefront_domain}"])))
  medusa_backend_url        = "https://${var.qa_medusa_api_domain}"
  medusa_admin_url          = "https://${var.qa_medusa_admin_domain}"
  medusa_r2_file_url        = "https://${var.qa_media_domain}"
  medusa_r2_endpoint        = "https://${var.cloudflare_r2_account_id}.r2.cloudflarestorage.com"
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

  database_name  = "${var.project}-${var.environment}-medusa"
  primary_region = var.upstash_redis_primary_region
  read_regions   = var.upstash_redis_read_regions
  budget         = var.upstash_redis_budget
  eviction       = false
  auto_scale     = false
}

module "medusa_postgres" {
  source = "../../modules/neon-postgres"

  project_name              = "${var.project}-medusa"
  org_id                    = var.neon_org_id
  region_id                 = var.neon_region_id
  pg_version                = var.neon_pg_version
  history_retention_seconds = var.neon_history_retention_seconds
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
    STORE_CORS = {
      value       = local.medusa_store_cors_origins
      description = "Allowed storefront origins for the QA Medusa service."
    }
    ADMIN_CORS = {
      value       = local.medusa_admin_cors_origins
      description = "Allowed admin origins for the QA Medusa service."
    }
    AUTH_CORS = {
      value       = local.medusa_auth_cors_origins
      description = "Allowed auth origins for the QA Medusa service."
    }
    MEDUSA_BACKEND_URL = {
      value       = local.medusa_backend_url
      description = "Externally reachable QA Medusa backend URL."
    }
    MEDUSA_ADMIN_URL = {
      value       = local.medusa_admin_url
      description = "Externally reachable QA Medusa Admin URL."
    }
    ADMIN_PATH = {
      value       = "/app"
      description = "Medusa Admin UI path. Caddy redirects the dedicated admin hostname root to this path."
    }
    S3_FILE_URL = {
      value       = local.medusa_r2_file_url
      description = "Public QA media base URL served from Cloudflare R2."
    }
    S3_BUCKET = {
      value       = var.qa_media_bucket_name
      description = "Cloudflare R2 bucket name for QA Medusa media."
    }
    S3_ENDPOINT = {
      value       = local.medusa_r2_endpoint
      description = "Cloudflare R2 S3-compatible endpoint for QA Medusa media."
    }
    STOREFRONT_URL = {
      value       = "https://${var.qa_storefront_domain}"
      description = "Canonical QA storefront URL used in transactional email links."
    }
    RESEND_FROM_EMAIL = {
      value       = var.resend_from_email
      description = "Default sender identity for QA Medusa transactional emails."
    }
    ADMIN_INVITE_FROM_EMAIL = {
      value       = var.admin_invite_from_email
      description = "Sender identity for QA Medusa Admin invite emails."
    }
    ORDER_FROM_EMAIL = {
      value       = var.order_from_email
      description = "Sender identity for QA customer order emails."
    }
    OWNER_ORDER_FROM_EMAIL = {
      value       = var.owner_order_from_email
      description = "Sender identity for QA owner order notification emails."
    }
    TRANSACTIONAL_REPLY_TO_EMAIL = {
      value       = var.transactional_reply_to_email
      description = "Reply-to mailbox for QA transactional email."
    }
  }
  secure_string_parameters = {
    DATABASE_URL = {
      value       = module.medusa_postgres.qa_database_url
      description = "PostgreSQL URL for the QA Medusa service."
    }
    REDIS_URL = {
      value       = module.medusa_redis.redis_url
      description = "Redis TLS URL for the QA Medusa service."
    }
    JWT_SECRET = {
      value       = random_password.medusa_jwt_secret.result
      description = "JWT signing secret for the QA Medusa service."
    }
    COOKIE_SECRET = {
      value       = random_password.medusa_cookie_secret.result
      description = "Cookie signing secret for the QA Medusa service."
    }
    RESEND_API_KEY = {
      value       = var.resend_api_key
      description = "Resend API key used by the QA Medusa notification provider."
    }
  }
  tags = local.tags
}
