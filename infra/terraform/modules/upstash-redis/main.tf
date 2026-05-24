resource "upstash_redis_database" "redis" {
  database_name = var.database_name
  region        = var.region
  tls           = true
  eviction      = var.eviction
  auto_scale    = var.auto_scale
  budget        = var.budget
}
