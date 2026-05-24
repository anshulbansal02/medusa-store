data "aws_caller_identity" "current" {}

locals {
  tags = {
    Project     = var.project
    ManagedBy   = "terraform"
    Environment = "shared"
  }
}

module "github_actions_aws_deploy" {
  source = "../../modules/github-actions-aws-deploy"

  project          = var.project
  github_owner     = var.github_owner
  github_repo      = var.github_repo
  aws_account_id   = data.aws_caller_identity.current.account_id
  aws_region       = var.aws_region
  qa_ssm_path      = "/${var.project}/qa/medusa"
  prod_ssm_path    = "/${var.project}/prod/medusa"
  create_prod_role = true
  tags             = local.tags
}

module "vercel_storefront" {
  source = "../../modules/vercel-storefront"

  project_name     = var.vercel_storefront_project_name
  function_regions = var.vercel_storefront_function_regions
}
