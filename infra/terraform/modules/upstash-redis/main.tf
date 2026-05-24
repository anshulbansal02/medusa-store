resource "upstash_redis_database" "redis" {
  database_name  = var.database_name
  region         = "global"
  primary_region = var.primary_region
  read_regions   = var.read_regions
  tls            = true
  eviction       = var.eviction
  auto_scale     = var.auto_scale
  budget         = var.budget
}
