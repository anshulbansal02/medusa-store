terraform {
  backend "s3" {
    bucket         = "ecom-terraform-state-174766597237-ap-southeast-1"
    key            = "ecom/qa/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "ecom-terraform-locks"
    encrypt        = true
  }
}
