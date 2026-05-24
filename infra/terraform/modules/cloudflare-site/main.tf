resource "cloudflare_dns_record" "record" {
  for_each = var.dns_records

  zone_id  = var.zone_id
  name     = each.value.name
  type     = each.value.type
  content  = each.value.content
  proxied  = each.value.proxied
  priority = each.value.priority
  ttl      = each.value.ttl
  comment  = each.value.comment
}

resource "cloudflare_r2_bucket" "bucket" {
  for_each = var.r2_buckets

  account_id    = var.account_id
  name          = each.value.name
  location      = each.value.location
  storage_class = each.value.storage_class
}

resource "cloudflare_r2_custom_domain" "domain" {
  for_each = var.r2_custom_domains

  account_id  = var.account_id
  zone_id     = var.zone_id
  bucket_name = cloudflare_r2_bucket.bucket[each.value.bucket_key].name
  domain      = each.value.domain
  enabled     = each.value.enabled
  min_tls     = each.value.min_tls
}

resource "cloudflare_zero_trust_access_application" "application" {
  for_each = var.access_applications

  account_id                 = var.account_id
  name                       = each.value.name
  type                       = "self_hosted"
  domain                     = each.value.domain
  session_duration           = each.value.session_duration
  http_only_cookie_attribute = true
  app_launcher_visible       = false

  policies = [
    {
      name     = "Allow approved admin emails"
      decision = "allow"
      include = [
        for email in sort(tolist(each.value.allowed_emails)) : {
          email = {
            email = email
          }
        }
      ]
    }
  ]
}

resource "cloudflare_turnstile_widget" "widget" {
  for_each = var.turnstile_widgets

  account_id = var.account_id
  name       = each.value.name
  domains    = each.value.domains
  mode       = each.value.mode
}

resource "cloudflare_web_analytics_site" "site" {
  for_each = var.web_analytics_sites

  account_id   = var.account_id
  host         = each.value.host
  auto_install = each.value.auto_install
}
