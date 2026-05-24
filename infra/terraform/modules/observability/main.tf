resource "betteruptime_monitor" "monitor" {
  for_each = var.better_stack_uptime_monitors

  url                   = each.value.url
  monitor_type          = each.value.monitor_type
  expected_status_codes = each.value.expected_status_codes
  pronounceable_name    = each.value.name
  check_frequency       = each.value.check_frequency
  confirmation_period   = each.value.confirmation_period
  recovery_period       = each.value.recovery_period
  request_timeout       = each.value.request_timeout
  regions               = each.value.regions
  email                 = each.value.email
  push                  = each.value.push
  sms                   = each.value.sms
  call                  = each.value.call
  verify_ssl            = each.value.verify_ssl
  follow_redirects      = each.value.follow_redirects
  ssl_expiration        = each.value.ssl_expiration
  domain_expiration     = each.value.domain_expiration
  paused                = each.value.paused
}
