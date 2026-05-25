# Terraform Operator SSM Runbook

Use this runbook when running Terraform locally with provider credentials stored
in AWS SSM Parameter Store.

Do not print secret values. Keep shell tracing disabled.

## Shared Environment

The shared root uses AWS, Vercel, and Cloudflare providers. Vercel receives its
token through `TF_VAR_vercel_api_token`; Cloudflare's provider reads
`CLOUDFLARE_API_TOKEN` directly.

```sh
set +x

ssm_value() {
  aws ssm get-parameter \
    --profile personal \
    --region ap-southeast-1 \
    --name "$1" \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text
}

export CLOUDFLARE_API_TOKEN="$(ssm_value /ecom/shared/operator/cloudflare/api_token)"
export TF_VAR_vercel_api_token="$(ssm_value /ecom/shared/operator/vercel/api_token)"
export TF_VAR_cloudflare_account_id="$(ssm_value /ecom/shared/operator/cloudflare/account_id)"
export TF_VAR_cloudflare_zone_id="$(ssm_value /ecom/shared/operator/cloudflare/zone_id)"
export TF_VAR_github_owner="$(ssm_value /ecom/shared/operator/github/owner)"
export TF_VAR_github_repo="$(ssm_value /ecom/shared/operator/github/repo)"
export TF_VAR_vercel_storefront_qa_project_name="$(ssm_value /ecom/shared/operator/vercel/storefront_qa_project_name)"
export TF_VAR_vercel_storefront_prod_project_name="$(ssm_value /ecom/shared/operator/vercel/storefront_prod_project_name)"
export TF_VAR_vercel_storefront_qa_medusa_publishable_key="$(ssm_value /ecom/shared/operator/vercel/storefront_qa_medusa_publishable_key)"
export TF_VAR_production_apex_domain="$(ssm_value /ecom/shared/operator/domain/production_apex)"
export TF_VAR_production_storefront_domain="$(ssm_value /ecom/shared/operator/domain/production_storefront)"
export TF_VAR_qa_storefront_domain="$(ssm_value /ecom/shared/operator/domain/qa_storefront)"
export TF_VAR_qa_medusa_api_domain="$(ssm_value /ecom/shared/operator/domain/qa_medusa_api)"
export TF_VAR_qa_medusa_admin_domain="$(ssm_value /ecom/shared/operator/domain/qa_medusa_admin)"
export TF_VAR_production_media_domain="$(ssm_value /ecom/shared/operator/domain/production_media)"
export TF_VAR_qa_media_domain="$(ssm_value /ecom/shared/operator/domain/qa_media)"
export TF_VAR_transactional_email_domain="$(ssm_value /ecom/shared/operator/domain/transactional_email)"
export TF_VAR_qa_medusa_static_ip="$(ssm_value /ecom/shared/operator/lightsail/qa_medusa_static_ip)"
export TF_VAR_qa_media_bucket_name="$(ssm_value /ecom/shared/operator/cloudflare/r2/qa_media_bucket_name)"
export TF_VAR_production_media_bucket_name="$(ssm_value /ecom/shared/operator/cloudflare/r2/production_media_bucket_name)"
export TF_VAR_better_stack_uptime_api_token="$(ssm_value /ecom/shared/operator/better_stack/uptime_api_token)"
export AWS_PROFILE=personal
```

Then run:

```sh
mise exec terraform@1.15.4 -- terraform -chdir=infra/terraform/environments/shared plan \
  -var='aws_profile=personal' \
  -var='create_prod_deploy_role=true' \
  -var='resend_dns_enabled=true' \
  -var='cloudflare_site_enabled=true' \
  -var='cloudflare_r2_media_enabled=true' \
  -var='cloudflare_access_enabled=false' \
  -var='cloudflare_web_analytics_enabled=false' \
  -var='better_stack_uptime_enabled=true'
```

Set `cloudflare_access_enabled=true` only after the Cloudflare token has Zero
Trust Access write permission and `cloudflare_access_admin_emails` contains the
approved admin allowlist.

Set `cloudflare_web_analytics_enabled=true` only after the Cloudflare token has
Web Analytics/RUM write permission.

## QA Environment

The QA root uses AWS, Neon, and Upstash providers. Cloudflare account ID is used
only to derive the R2 endpoint URL.

```sh
set +x

ssm_value() {
  aws ssm get-parameter \
    --profile personal \
    --region ap-southeast-1 \
    --name "$1" \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text
}

export TF_VAR_neon_api_key="$(ssm_value /ecom/shared/operator/neon/api_key)"
export TF_VAR_neon_org_id="$(ssm_value /ecom/shared/operator/neon/org_id)"
export TF_VAR_upstash_email="$(ssm_value /ecom/shared/operator/upstash/email)"
export TF_VAR_upstash_api_key="$(ssm_value /ecom/shared/operator/upstash/api_key)"
export TF_VAR_cloudflare_r2_account_id="$(ssm_value /ecom/shared/operator/cloudflare/account_id)"
export TF_VAR_qa_storefront_domain="$(ssm_value /ecom/shared/operator/domain/qa_storefront)"
export TF_VAR_qa_medusa_api_domain="$(ssm_value /ecom/shared/operator/domain/qa_medusa_api)"
export TF_VAR_qa_medusa_admin_domain="$(ssm_value /ecom/shared/operator/domain/qa_medusa_admin)"
export TF_VAR_qa_media_domain="$(ssm_value /ecom/shared/operator/domain/qa_media)"
export TF_VAR_qa_media_bucket_name="$(ssm_value /ecom/shared/operator/cloudflare/r2/qa_media_bucket_name)"
export TF_VAR_resend_from_email="$(ssm_value /ecom/qa/medusa/RESEND_FROM_EMAIL)"
export TF_VAR_admin_invite_from_email="$(ssm_value /ecom/qa/medusa/ADMIN_INVITE_FROM_EMAIL)"
export TF_VAR_order_from_email="$(ssm_value /ecom/qa/medusa/ORDER_FROM_EMAIL)"
export TF_VAR_owner_order_from_email="$(ssm_value /ecom/qa/medusa/OWNER_ORDER_FROM_EMAIL)"
export TF_VAR_transactional_reply_to_email="$(ssm_value /ecom/qa/medusa/TRANSACTIONAL_REPLY_TO_EMAIL)"
export TF_VAR_resend_api_key="$(ssm_value /ecom/qa/medusa/RESEND_API_KEY)"
export AWS_PROFILE=personal
```

Then run:

```sh
mise exec terraform@1.15.4 -- terraform -chdir=infra/terraform/environments/qa plan \
  -var='aws_profile=personal' \
  -var='lightsail_ssh_public_key_path=~/.ssh/id_ed25519_ecom_lightsail.pub'
```

Do not run QA plan/apply with only provider credentials. The QA root also needs
the real domain, media, and currently managed email inputs above; otherwise
Terraform will compare against public placeholder defaults.

## After Manual Token Updates

If an operator updates a value in local `.env`, store it in SSM before relying on
it for repeatable Terraform work. Example for Cloudflare:

```sh
set +x
set -a
. ./.env
set +a

aws ssm put-parameter \
  --profile personal \
  --region ap-southeast-1 \
  --name /ecom/shared/operator/cloudflare/api_token \
  --type SecureString \
  --value "$CLOUDFLARE_API_TOKEN" \
  --overwrite
```

Do not commit `.env`, copied token values, or terminal logs containing secrets.
