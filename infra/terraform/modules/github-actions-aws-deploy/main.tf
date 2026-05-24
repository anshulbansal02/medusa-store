locals {
  github_oidc_url      = "https://token.actions.githubusercontent.com"
  github_oidc_host     = "token.actions.githubusercontent.com"
  github_repository    = "${var.github_owner}/${var.github_repo}"
  qa_role_name         = "${var.project}-qa-github-actions-deploy"
  prod_role_name       = "${var.project}-prod-github-actions-deploy"
  normalized_qa_path   = trimsuffix(var.qa_ssm_path, "/")
  normalized_prod_path = trimsuffix(var.prod_ssm_path, "/")
}

resource "aws_iam_openid_connect_provider" "github_actions" {
  url = local.github_oidc_url

  client_id_list = [
    "sts.amazonaws.com",
  ]

  tags = var.tags
}

data "aws_iam_policy_document" "qa_assume_role" {
  statement {
    effect = "Allow"

    actions = [
      "sts:AssumeRoleWithWebIdentity",
    ]

    principals {
      type = "Federated"
      identifiers = [
        aws_iam_openid_connect_provider.github_actions.arn,
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.github_oidc_host}:aud"
      values = [
        "sts.amazonaws.com",
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.github_oidc_host}:sub"
      values = [
        "repo:${local.github_repository}:environment:qa",
      ]
    }
  }
}

data "aws_iam_policy_document" "prod_assume_role" {
  count = var.create_prod_role ? 1 : 0

  statement {
    effect = "Allow"

    actions = [
      "sts:AssumeRoleWithWebIdentity",
    ]

    principals {
      type = "Federated"
      identifiers = [
        aws_iam_openid_connect_provider.github_actions.arn,
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.github_oidc_host}:aud"
      values = [
        "sts.amazonaws.com",
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.github_oidc_host}:sub"
      values = [
        "repo:${local.github_repository}:environment:production",
      ]
    }
  }
}

resource "aws_iam_role" "qa_deploy" {
  name                 = local.qa_role_name
  description          = "Allows GitHub Actions QA deploy jobs to read QA Medusa SSM parameters."
  assume_role_policy   = data.aws_iam_policy_document.qa_assume_role.json
  max_session_duration = 3600

  tags = var.tags
}

data "aws_iam_policy_document" "qa_deploy" {
  statement {
    sid    = "ReadQaMedusaSsmParameters"
    effect = "Allow"

    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath",
    ]

    resources = [
      "arn:aws:ssm:${var.aws_region}:${var.aws_account_id}:parameter${local.normalized_qa_path}/*",
    ]
  }
}

resource "aws_iam_policy" "qa_deploy" {
  name        = "${local.qa_role_name}-ssm-read"
  description = "Read-only access to QA Medusa SSM parameters for GitHub Actions deploys."
  policy      = data.aws_iam_policy_document.qa_deploy.json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "qa_deploy" {
  role       = aws_iam_role.qa_deploy.name
  policy_arn = aws_iam_policy.qa_deploy.arn
}

resource "aws_iam_role" "prod_deploy" {
  count = var.create_prod_role ? 1 : 0

  name                 = local.prod_role_name
  description          = "Allows GitHub Actions production deploy jobs to read production Medusa SSM parameters."
  assume_role_policy   = data.aws_iam_policy_document.prod_assume_role[0].json
  max_session_duration = 3600

  tags = var.tags
}

data "aws_iam_policy_document" "prod_deploy" {
  count = var.create_prod_role ? 1 : 0

  statement {
    sid    = "ReadProdMedusaSsmParameters"
    effect = "Allow"

    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath",
    ]

    resources = [
      "arn:aws:ssm:${var.aws_region}:${var.aws_account_id}:parameter${local.normalized_prod_path}/*",
    ]
  }
}

resource "aws_iam_policy" "prod_deploy" {
  count = var.create_prod_role ? 1 : 0

  name        = "${local.prod_role_name}-ssm-read"
  description = "Read-only access to production Medusa SSM parameters for GitHub Actions deploys."
  policy      = data.aws_iam_policy_document.prod_deploy[0].json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "prod_deploy" {
  count = var.create_prod_role ? 1 : 0

  role       = aws_iam_role.prod_deploy[0].name
  policy_arn = aws_iam_policy.prod_deploy[0].arn
}
