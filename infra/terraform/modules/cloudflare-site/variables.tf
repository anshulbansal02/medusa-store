variable "account_id" {
  description = "Cloudflare account ID."
  type        = string
}

variable "zone_id" {
  description = "Cloudflare zone ID for the production domain."
  type        = string
}

variable "dns_records" {
  description = "DNS records to manage in the Cloudflare zone."
  type = map(object({
    name    = string
    type    = string
    content = string
    proxied = optional(bool)
    ttl     = optional(number, 1)
    comment = optional(string)
  }))
  default = {}
}

variable "r2_buckets" {
  description = "R2 buckets to create, keyed by a stable Terraform identifier."
  type = map(object({
    name          = string
    location      = optional(string, "apac")
    storage_class = optional(string, "Standard")
  }))
  default = {}
}

variable "r2_custom_domains" {
  description = "R2 custom domains to attach to buckets, keyed by a stable Terraform identifier."
  type = map(object({
    bucket_key = string
    domain     = string
    enabled    = optional(bool, true)
    min_tls    = optional(string, "1.2")
  }))
  default = {}
}

variable "turnstile_widgets" {
  description = "Turnstile widgets to create, keyed by a stable Terraform identifier."
  type = map(object({
    name    = string
    domains = list(string)
    mode    = optional(string, "managed")
  }))
  default = {}
}

variable "web_analytics_sites" {
  description = "Cloudflare Web Analytics sites to create, keyed by a stable Terraform identifier."
  type = map(object({
    host         = string
    auto_install = optional(bool, false)
  }))
  default = {}
}
