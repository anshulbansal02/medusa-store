resource "vercel_project" "storefront" {
  name      = var.project_name
  framework = var.framework

  node_version                 = var.node_version
  auto_assign_custom_domains   = var.auto_assign_custom_domains
  preview_deployments_disabled = var.preview_deployments_disabled

  # The project is intentionally not linked to Git. GitHub Actions owns
  # explicit manual deploys through the Vercel CLI.
  resource_config = {
    function_default_regions = var.function_regions
  }
}

resource "vercel_project_environment_variable" "variable" {
  for_each = var.environment_variables

  project_id = vercel_project.storefront.id
  key        = each.value.key
  value      = each.value.value
  target     = each.value.target
  sensitive  = each.value.sensitive
  comment    = each.value.comment
  git_branch = each.value.git_branch
}

locals {
  direct_domains = {
    for key, domain in var.domains : key => domain
    if domain.redirect == null
  }

  redirect_domains = {
    for key, domain in var.domains : key => domain
    if domain.redirect != null
  }
}

resource "vercel_project_domain" "domain" {
  for_each = local.direct_domains

  project_id           = vercel_project.storefront.id
  domain               = each.value.domain
  git_branch           = each.value.git_branch
  redirect             = each.value.redirect
  redirect_status_code = each.value.redirect_status_code
}

resource "vercel_project_domain" "redirect_domain" {
  for_each = local.redirect_domains

  project_id           = vercel_project.storefront.id
  domain               = each.value.domain
  git_branch           = each.value.git_branch
  redirect             = each.value.redirect
  redirect_status_code = each.value.redirect_status_code

  depends_on = [vercel_project_domain.domain]
}
