terraform {
  backend "s3" {
    bucket       = "replace-with-private-state-bucket"
    key          = "ecom/prod/terraform.tfstate"
    region       = "ap-southeast-1"
    encrypt      = true
    use_lockfile = true
  }
}
