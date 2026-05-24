data "aws_caller_identity" "current" {}

locals {
  better_stack_uptime_monitors = {
    production_storefront = {
      name   = "Production storefront"
      url    = "https://${var.production_storefront_domain}"
      paused = true
    }
    qa_storefront = {
      name = "QA storefront"
      url  = "https://${var.qa_storefront_domain}"
    }
    qa_medusa_admin = {
      name = "QA Medusa Admin"
      url  = "https://${var.qa_medusa_admin_domain}"
    }
    qa_medusa_health = {
      name             = "QA Medusa health"
      url              = "https://${var.qa_medusa_api_domain}/health"
      monitor_type     = "keyword"
      required_keyword = "OK"
    }
    qa_medusa_ready = {
      name             = "QA Medusa readiness"
      url              = "https://${var.qa_medusa_api_domain}/ready"
      monitor_type     = "keyword"
      required_keyword = "\"ready\":true"
    }
  }
  storefront_image_hostnames   = join(",", [local.production_media_domain, local.qa_media_domain])
  cloudflare_r2_buckets        = var.cloudflare_r2_media_enabled ? local.r2_media_buckets : {}
  cloudflare_r2_custom_domains = var.cloudflare_r2_media_enabled ? local.r2_media_custom_domains : {}
  cloudflare_access_applications = var.cloudflare_access_enabled ? {
    qa_medusa_admin = {
      name             = "QA Medusa Admin"
      domain           = var.qa_medusa_admin_domain
      session_duration = var.cloudflare_access_session_duration
      allowed_emails   = var.cloudflare_access_admin_emails
    }
  } : {}
  cloudflare_web_analytics_sites = var.cloudflare_web_analytics_enabled ? {
    production = {
      host         = var.production_storefront_domain
      auto_install = false
    }
    qa = {
      host         = var.qa_storefront_domain
      auto_install = false
    }
  } : {}
  production_media_domain = var.production_media_domain
  qa_media_domain         = var.qa_media_domain
  resend_dns_records = var.resend_dns_enabled ? {
    resend_transactional_dkim = {
      name    = "resend._domainkey.${var.transactional_email_domain}"
      type    = "TXT"
      content = "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDCl+kQJNEHJ+F72Apedb4L/h/9KQ1ePUVLnFM5EzkKBTps6XD2KIdWbZ/yvrjxV35hDJsTrtssbLUXG/EaXbIKRDT6DxFLWgKqYVVh1bgLeihpUPouxrTZG4yPg8eTaNmtnKDRjr9p5jZ7nvZpC0i4pna73w8hcv/RcRnbMLVxiQIDAQAB"
      proxied = false
      comment = "Resend DKIM public key for transactional email. Terraform-managed."
    }
    resend_transactional_return_path_mx = {
      name     = "send.${var.transactional_email_domain}"
      type     = "MX"
      content  = "feedback-smtp.ap-northeast-1.amazonses.com"
      priority = 10
      proxied  = false
      comment  = "Resend return-path MX for transactional email bounces. Terraform-managed."
    }
    resend_transactional_return_path_spf = {
      name    = "send.${var.transactional_email_domain}"
      type    = "TXT"
      content = "v=spf1 include:amazonses.com ~all"
      proxied = false
      comment = "Resend SPF authorization for transactional email return path. Terraform-managed."
    }
    resend_transactional_dmarc = {
      name    = "_dmarc.${var.transactional_email_domain}"
      type    = "TXT"
      content = "v=DMARC1; p=quarantine; adkim=s; aspf=s; pct=100"
      proxied = false
      comment = "DMARC enforcement for the Resend transactional email subdomain. Terraform-managed."
    }
  } : {}
  vercel_storefront_qa_secret_environment_variables = var.vercel_storefront_qa_order_access_secret == null ? {} : {
    order_access_secret = {
      key       = "ORDER_ACCESS_SECRET"
      value     = var.vercel_storefront_qa_order_access_secret
      target    = ["production"]
      sensitive = true
      comment   = "Server-only signing secret for short-lived order detail access grants."
    }
  }
  vercel_storefront_prod_secret_environment_variables = var.vercel_storefront_prod_order_access_secret == null ? {} : {
    order_access_secret = {
      key       = "ORDER_ACCESS_SECRET"
      value     = var.vercel_storefront_prod_order_access_secret
      target    = ["production"]
      sensitive = true
      comment   = "Server-only signing secret for short-lived order detail access grants."
    }
  }
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
      domain     = var.qa_media_domain
    }
    production = {
      bucket_key = "production"
      domain     = var.production_media_domain
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
  create_prod_role = var.create_prod_deploy_role
  tags             = local.tags
}

module "vercel_storefront_qa" {
  source = "../../modules/vercel-storefront"

  project_name     = var.vercel_storefront_qa_project_name
  function_regions = var.vercel_storefront_function_regions
  domains = {
    qa = {
      domain = var.qa_storefront_domain
    }
  }
  environment_variables = merge(
    {
      site_url = {
        key       = "NEXT_PUBLIC_SITE_URL"
        value     = "https://${var.qa_storefront_domain}"
        target    = ["production"]
        sensitive = false
        comment   = "Canonical QA storefront URL for metadata and absolute links."
      }
      qa_medusa_backend_url = {
        key       = "MEDUSA_BACKEND_URL"
        value     = "https://${var.qa_medusa_api_domain}"
        target    = ["production"]
        sensitive = false
        comment   = "QA Medusa backend URL for manually dispatched QA deployments."
      }
      qa_medusa_publishable_key = {
        key       = "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"
        value     = nonsensitive(var.vercel_storefront_qa_medusa_publishable_key)
        target    = ["production"]
        sensitive = false
        comment   = "QA Medusa publishable API key for storefront deployments."
      }
      image_hostnames = {
        key       = "NEXT_PUBLIC_IMAGE_HOSTNAMES"
        value     = local.storefront_image_hostnames
        target    = ["production"]
        sensitive = false
        comment   = "Allowed image hostnames for QA storefront deployments."
      }
    },
    local.vercel_storefront_qa_secret_environment_variables,
    var.cloudflare_site_enabled && var.cloudflare_web_analytics_enabled ? {
      cloudflare_web_analytics_token = {
        key       = "NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN"
        value     = module.cloudflare_site[0].web_analytics_site_tokens["qa"]
        target    = ["production"]
        sensitive = false
        comment   = "Cloudflare Web Analytics token for the QA storefront."
      }
    } : {}
  )
}

module "vercel_storefront_prod" {
  source = "../../modules/vercel-storefront"

  project_name     = var.vercel_storefront_prod_project_name
  function_regions = var.vercel_storefront_function_regions
  domains = {
    production_apex = {
      domain               = var.production_apex_domain
      redirect             = var.production_storefront_domain
      redirect_status_code = 308
    }
    production_www = {
      domain = var.production_storefront_domain
    }
  }
  environment_variables = merge(
    {
      site_url = {
        key       = "NEXT_PUBLIC_SITE_URL"
        value     = "https://${var.production_storefront_domain}"
        target    = ["production"]
        sensitive = false
        comment   = "Canonical production storefront URL for metadata and absolute links."
      }
      image_hostnames = {
        key       = "NEXT_PUBLIC_IMAGE_HOSTNAMES"
        value     = local.storefront_image_hostnames
        target    = ["production"]
        sensitive = false
        comment   = "Allowed image hostnames for production storefront deployments."
      }
    },
    local.vercel_storefront_prod_secret_environment_variables,
    var.cloudflare_site_enabled && var.cloudflare_web_analytics_enabled ? {
      cloudflare_web_analytics_token = {
        key       = "NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN"
        value     = module.cloudflare_site[0].web_analytics_site_tokens["production"]
        target    = ["production"]
        sensitive = false
        comment   = "Cloudflare Web Analytics token for the production storefront."
      }
    } : {}
  )
}

moved {
  from = module.vercel_storefront
  to   = module.vercel_storefront_qa
}

moved {
  from = module.vercel_storefront_qa.vercel_project_environment_variable.variable["image_hostnames_production"]
  to   = module.vercel_storefront_qa.vercel_project_environment_variable.variable["image_hostnames"]
}

module "cloudflare_site" {
  count  = var.cloudflare_site_enabled ? 1 : 0
  source = "../../modules/cloudflare-site"

  account_id = var.cloudflare_account_id
  zone_id    = var.cloudflare_zone_id
  dns_records = merge(
    {
      production_apex = {
        name    = var.production_apex_domain
        type    = "A"
        content = "76.76.21.21"
        proxied = false
        comment = "Production storefront apex on Vercel. Terraform-managed."
      }
      production_www = {
        name    = var.production_storefront_domain
        type    = "CNAME"
        content = "cname.vercel-dns-0.com"
        proxied = false
        comment = "Production storefront www on Vercel. Terraform-managed."
      }
      qa_storefront = {
        name    = var.qa_storefront_domain
        type    = "CNAME"
        content = "cname.vercel-dns-0.com"
        proxied = false
        comment = "QA storefront on Vercel. Terraform-managed."
      }
      qa_medusa_api = {
        name    = var.qa_medusa_api_domain
        type    = "A"
        content = var.qa_medusa_static_ip
        proxied = false
        comment = "QA Medusa API on AWS Lightsail. Terraform-managed."
      }
      qa_medusa_admin = {
        name    = var.qa_medusa_admin_domain
        type    = "A"
        content = var.qa_medusa_static_ip
        proxied = true
        comment = "QA Medusa Admin on AWS Lightsail. Terraform-managed."
      }
    },
    local.resend_dns_records,
  )
  r2_buckets          = local.cloudflare_r2_buckets
  r2_custom_domains   = local.cloudflare_r2_custom_domains
  access_applications = local.cloudflare_access_applications
  web_analytics_sites = local.cloudflare_web_analytics_sites
}

module "observability" {
  count  = var.better_stack_uptime_enabled ? 1 : 0
  source = "../../modules/observability"

  better_stack_uptime_monitors = local.better_stack_uptime_monitors
}
