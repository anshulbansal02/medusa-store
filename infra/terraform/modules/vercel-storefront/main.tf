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
