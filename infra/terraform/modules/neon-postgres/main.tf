resource "neon_project" "medusa" {
  name                      = var.project_name
  org_id                    = var.org_id
  region_id                 = var.region_id
  pg_version                = var.pg_version
  history_retention_seconds = var.history_retention_seconds
  store_password            = "yes"

  branch {
    name          = var.prod_branch_name
    database_name = var.prod_database_name
    role_name     = var.prod_role_name
  }

  default_endpoint_settings {
    autoscaling_limit_min_cu = var.prod_endpoint_min_cu
    autoscaling_limit_max_cu = var.prod_endpoint_max_cu
  }
}

resource "neon_branch" "qa" {
  project_id = neon_project.medusa.id
  parent_id  = neon_project.medusa.default_branch_id
  name       = var.qa_branch_name
}

resource "neon_endpoint" "qa" {
  project_id = neon_project.medusa.id
  branch_id  = neon_branch.qa.id
  type       = "read_write"

  autoscaling_limit_min_cu = var.qa_endpoint_min_cu
  autoscaling_limit_max_cu = var.qa_endpoint_max_cu
  pooler_enabled           = true
  pooler_mode              = "transaction"
}

resource "neon_role" "qa" {
  project_id = neon_project.medusa.id
  branch_id  = neon_branch.qa.id
  name       = var.qa_role_name

  depends_on = [neon_endpoint.qa]
}

resource "neon_database" "qa" {
  project_id = neon_project.medusa.id
  branch_id  = neon_branch.qa.id
  owner_name = neon_role.qa.name
  name       = var.qa_database_name
}

locals {
  qa_database_url = "postgresql://${urlencode(neon_role.qa.name)}:${urlencode(neon_role.qa.password)}@${neon_endpoint.qa.host}/${urlencode(neon_database.qa.name)}?sslmode=verify-full"
}
