output "database_id" {
  description = "Upstash Redis database ID."
  value       = upstash_redis_database.redis.database_id
}

output "database_name" {
  description = "Upstash Redis database name."
  value       = upstash_redis_database.redis.database_name
}

output "endpoint" {
  description = "Upstash Redis endpoint."
  value       = upstash_redis_database.redis.endpoint
}

output "port" {
  description = "Upstash Redis port."
  value       = upstash_redis_database.redis.port
}

output "redis_url" {
  description = "TLS Redis URL for application runtime use."
  value       = "rediss://default:${urlencode(upstash_redis_database.redis.password)}@${upstash_redis_database.redis.endpoint}:${upstash_redis_database.redis.port}"
  sensitive   = true
}
