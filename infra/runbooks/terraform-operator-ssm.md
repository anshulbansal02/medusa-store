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
export AWS_PROFILE=personal
```

Then run:

```sh
mise exec terraform@1.15.4 -- terraform -chdir=infra/terraform/environments/shared plan \
  -var='aws_profile=personal' \
  -var='github_owner=anshulbansal02' \
  -var='github_repo=medusa-store' \
  -var='cloudflare_site_enabled=true' \
  -var='cloudflare_r2_media_enabled=true' \
  -var='cloudflare_web_analytics_enabled=false'
```

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
export TF_VAR_upstash_email="$(ssm_value /ecom/shared/operator/upstash/email)"
export TF_VAR_upstash_api_key="$(ssm_value /ecom/shared/operator/upstash/api_key)"
export TF_VAR_cloudflare_r2_account_id="$(ssm_value /ecom/shared/operator/cloudflare/account_id)"
export AWS_PROFILE=personal
```

Then run:

```sh
mise exec terraform@1.15.4 -- terraform -chdir=infra/terraform/environments/qa plan \
  -var='aws_profile=personal' \
  -var='lightsail_ssh_public_key_path=/Users/optimus/.ssh/id_ed25519_ecom_lightsail.pub'
```

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
