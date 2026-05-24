terraform {
  backend "s3" {
    bucket       = "ecom-terraform-state-174766597237-ap-southeast-1"
    key          = "ecom/shared/terraform.tfstate"
    region       = "ap-southeast-1"
    encrypt      = true
    use_lockfile = true
  }
}
