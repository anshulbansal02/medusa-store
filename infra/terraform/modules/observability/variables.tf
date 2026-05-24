variable "better_stack_uptime_monitors" {
  description = "Better Stack Uptime monitors keyed by stable Terraform names."
  type = map(object({
    name                  = string
    url                   = string
    monitor_type          = optional(string, "status")
    expected_status_codes = optional(list(number))
    check_frequency       = optional(number, 300)
    confirmation_period   = optional(number, 60)
    recovery_period       = optional(number, 180)
    request_timeout       = optional(number, 10)
    regions               = optional(list(string), ["as"])
    email                 = optional(bool, true)
    push                  = optional(bool, true)
    sms                   = optional(bool, false)
    call                  = optional(bool, false)
    verify_ssl            = optional(bool, true)
    follow_redirects      = optional(bool, true)
    ssl_expiration        = optional(number, 14)
    domain_expiration     = optional(number, 30)
    paused                = optional(bool, false)
  }))
  default = {}
}
