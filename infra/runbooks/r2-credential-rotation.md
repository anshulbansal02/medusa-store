# R2 Credential Rotation Runbook

R2 S3 credentials are created manually in Cloudflare and stored as AWS SSM `SecureString` parameters.

Rotation outline:

1. Create a new least-privilege R2 S3 access key in Cloudflare.
2. Store the new key and secret in the environment-specific SSM paths.
3. Deploy or restart Medusa for that environment through the approved deploy path.
4. Verify media upload and read behavior.
5. Revoke the old R2 credential in Cloudflare.
6. Record the rotation date without recording secret values.

Do not commit R2 credentials to Git, Terraform variables, docs, or workflow logs.
