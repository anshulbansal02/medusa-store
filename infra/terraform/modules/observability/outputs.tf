output "better_stack_uptime_monitor_ids" {
  description = "Better Stack Uptime monitor IDs keyed by monitor name."
  value       = { for key, monitor in betteruptime_monitor.monitor : key => monitor.id }
}
