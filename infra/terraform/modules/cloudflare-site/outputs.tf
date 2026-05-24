output "dns_record_ids" {
  description = "Cloudflare DNS record IDs keyed by input key."
  value = {
    for key, record in cloudflare_dns_record.record : key => record.id
  }
}

output "r2_bucket_names" {
  description = "R2 bucket names keyed by input key."
  value = {
    for key, bucket in cloudflare_r2_bucket.bucket : key => bucket.name
  }
}

output "r2_custom_domain_status" {
  description = "R2 custom-domain status keyed by input key."
  value = {
    for key, domain in cloudflare_r2_custom_domain.domain : key => domain.status
  }
}

output "access_application_ids" {
  description = "Cloudflare Access application IDs keyed by input key."
  value = {
    for key, application in cloudflare_zero_trust_access_application.application : key => application.id
  }
}

output "turnstile_sitekeys" {
  description = "Turnstile sitekeys keyed by input key."
  value = {
    for key, widget in cloudflare_turnstile_widget.widget : key => widget.sitekey
  }
}

output "turnstile_secrets" {
  description = "Turnstile widget secrets keyed by input key. Treat as secret-bearing Terraform state."
  value = {
    for key, widget in cloudflare_turnstile_widget.widget : key => widget.secret
  }
  sensitive = true
}

output "web_analytics_site_tokens" {
  description = "Cloudflare Web Analytics site tokens keyed by input key."
  value = {
    for key, site in cloudflare_web_analytics_site.site : key => site.site_token
  }
}
