data "aws_caller_identity" "current" {}

locals {
  apex_domain                  = var.domain_name
  production_storefront_domain = var.production_storefront_subdomain == "" ? var.domain_name : "${var.production_storefront_subdomain}.${var.domain_name}"
  qa_storefront_domain         = "${var.qa_storefront_subdomain}.${var.domain_name}"
  qa_medusa_api_domain         = "${var.qa_medusa_api_subdomain}.${var.domain_name}"
  production_media_domain      = "${var.production_media_subdomain}.${var.domain_name}"
  qa_media_domain              = "${var.qa_media_subdomain}.${var.domain_name}"
  storefront_image_hostnames   = join(",", [local.production_media_domain, local.qa_media_domain])
  cloudflare_r2_buckets        = var.cloudflare_r2_media_enabled ? local.r2_media_buckets : {}
  cloudflare_r2_custom_domains = var.cloudflare_r2_media_enabled ? local.r2_media_custom_domains : {}
  tags = {
    Project     = var.project
    ManagedBy   = "terraform"
    Environment = "shared"
  }
  r2_media_buckets = {
    qa = {
      name = var.qa_media_bucket_name
    }
    production = {
      name = var.production_media_bucket_name
    }
  }
  r2_media_custom_domains = {
    qa = {
      bucket_key = "qa"
      domain     = local.qa_media_domain
    }
    production = {
      bucket_key = "production"
      domain     = local.production_media_domain
    }
  }
}

module "github_actions_aws_deploy" {
  source = "../../modules/github-actions-aws-deploy"

  project          = var.project
  github_owner     = var.github_owner
  github_repo      = var.github_repo
  aws_account_id   = data.aws_caller_identity.current.account_id
  aws_region       = var.aws_region
  qa_ssm_path      = "/${var.project}/qa/medusa"
  prod_ssm_path    = "/${var.project}/prod/medusa"
  create_prod_role = true
  tags             = local.tags
}

module "vercel_storefront" {
  source = "../../modules/vercel-storefront"

  project_name     = var.vercel_storefront_project_name
  function_regions = var.vercel_storefront_function_regions
  domains = {
    production_apex = {
      domain               = local.apex_domain
      redirect             = local.production_storefront_domain
      redirect_status_code = 308
    }
    production_www = {
      domain = local.production_storefront_domain
    }
    qa = {
      domain     = local.qa_storefront_domain
      git_branch = "dev"
    }
  }
  environment_variables = {
    qa_medusa_backend_url = {
      key       = "MEDUSA_BACKEND_URL"
      value     = "https://${local.qa_medusa_api_domain}"
      target    = ["preview"]
      sensitive = false
      comment   = "QA Medusa backend URL for manually dispatched Vercel preview deployments."
    }
    qa_medusa_publishable_key = {
      key       = "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"
      value     = var.vercel_storefront_qa_medusa_publishable_key
      target    = ["preview"]
      sensitive = false
      comment   = "QA Medusa publishable API key for storefront preview deployments."
    }
    image_hostnames_preview = {
      key       = "NEXT_PUBLIC_IMAGE_HOSTNAMES"
      value     = local.storefront_image_hostnames
      target    = ["preview"]
      sensitive = false
      comment   = "Allowed image hostnames for storefront preview deployments."
    }
    image_hostnames_production = {
      key       = "NEXT_PUBLIC_IMAGE_HOSTNAMES"
      value     = local.storefront_image_hostnames
      target    = ["production"]
      sensitive = false
      comment   = "Allowed image hostnames for storefront production deployments."
    }
  }
}

module "cloudflare_site" {
  count  = var.cloudflare_site_enabled ? 1 : 0
  source = "../../modules/cloudflare-site"

  account_id = var.cloudflare_account_id
  zone_id    = var.cloudflare_zone_id
  dns_records = {
    production_apex = {
      name    = local.apex_domain
      type    = "A"
      content = "76.76.21.21"
      proxied = false
      comment = "Production storefront apex on Vercel. Terraform-managed."
    }
    production_www = {
      name    = local.production_storefront_domain
      type    = "CNAME"
      content = "cname.vercel-dns-0.com"
      proxied = false
      comment = "Production storefront www on Vercel. Terraform-managed."
    }
    qa_storefront = {
      name    = local.qa_storefront_domain
      type    = "CNAME"
      content = "cname.vercel-dns-0.com"
      proxied = false
      comment = "QA storefront on Vercel. Terraform-managed."
    }
    qa_medusa_api = {
      name    = local.qa_medusa_api_domain
      type    = "A"
      content = var.qa_medusa_static_ip
      proxied = false
      comment = "QA Medusa API on AWS Lightsail. Terraform-managed."
    }
  }
  r2_buckets        = local.cloudflare_r2_buckets
  r2_custom_domains = local.cloudflare_r2_custom_domains
}
