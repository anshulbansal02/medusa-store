# Security Review

Status: active review findings with partial remediation
Last reviewed: 2026-05-24

Scope: committed repository content, current working tree, CI/CD workflows, Terraform configuration, deploy scripts, Medusa backend integration code, storefront server actions, and dependency audit output. This review records verified findings only. Do not paste real secrets, IPs, account IDs, provider IDs, customer data, or token values into this file.

Decision: fix the verified security findings before production launch. QA may continue only for infrastructure bring-up when access is intentionally restricted and no real customer data is used.

## Findings

### Public Repo Exposes Real Infrastructure Metadata

Remediation status: committed docs and Terraform examples now use placeholders for the high-signal infrastructure identifiers found in the review. Because the values were previously committed, public-repo safety still requires history rewrite or repository replacement plus rotation of any credentials that were used alongside the exposed metadata.

Real environment-specific infrastructure metadata is committed in docs and Terraform examples. This includes QA origin endpoints, private network endpoints, AWS account and role metadata, Terraform state bucket naming, provider organization/project/resource IDs, QA preview URLs, and SSM secret path structure.

These values are not credentials by themselves, but they materially help reconnaissance against a public repository and should not be treated as general config.

Evidence:

- `docs/infra-resource-inventory.md`
- `docs/secrets-and-config.md`
- `infra/terraform/environments/qa/variables.tf`
- `infra/terraform/environments/qa/terraform.tfvars.example`
- `infra/terraform/environments/{qa,prod,shared}/backend.tf`

Completed changes:

- Replace real IPs, provider IDs, account IDs, ARNs, bucket names, preview URLs, and SSM paths in public docs/examples with placeholders.
- Replace real-looking transactional email domains and local workstation paths in public docs/examples with placeholders.
- Move real values to GitHub environment variables, SSM, local ignored tfvars, or private operator notes.
- Keep committed Terraform examples generic; require operators to pass real values through ignored local files or `TF_VAR_*`.

Scrub and rotation plan:

- Before the repo remains public, rewrite git history to remove exposed metadata from old commits.
- Rotate actual access material that may have been paired with these identifiers outside Git: Tailscale OAuth credentials, QA SSH key, Vercel token, Neon API key, and Upstash API key.
- Consider recreating the Terraform state bucket with a non-account-derived name if the exposed bucket name has already been public.

### QA Medusa Is Exposed Over Plain HTTP

Remediation status: committed deploy/config defaults require HTTPS Medusa hostnames and no longer include raw public/private IP CORS origins. Cloudflare Access for the QA admin hostname is now wired as an opt-in Terraform setting, but the live Cloudflare token still needs Zero Trust Access write permission before it can be enabled.

The deploy script configures Caddy to proxy public port 80 directly to Medusa. QA Terraform defaults also include raw HTTP origins for Medusa backend, admin, and auth CORS.

Evidence:

- `infra/scripts/deploy-medusa-host.sh`
- `infra/terraform/environments/qa/variables.tf`
- `infra/terraform/environments/qa/terraform.tfvars.example`

Completed changes:

- Put QA API/admin behind HTTPS hostnames, for example `qa-api` and `qa-admin`.
- Remove raw IP and private network origins from committed defaults and from live CORS once domain setup is complete.
- Keep deployed QA CORS defaults limited to derived QA HTTPS domains; local development origins must be added only through an explicit operator override if ever needed.
- Keep Store API and Admin on separate hostnames so CORS and access policies stay clean.
- Wire Cloudflare Access for QA Medusa Admin through `infra/terraform/environments/shared` with an explicit admin email allowlist.

Remaining fix:

- Enable Cloudflare Access after updating the Cloudflare API token permissions, then apply shared Terraform before using QA Admin for real operator/customer data.

Rotation plan:

- If anyone used Medusa Admin or auth over raw HTTP, rotate Medusa admin credentials and regenerate `JWT_SECRET` and `COOKIE_SECRET`.
- Update SSM values for `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, and `MEDUSA_BACKEND_URL` after HTTPS domain setup.

### Order Confirmation Page Exposes PII With Only An Order ID

Remediation status: fixed in the storefront. Order detail pages now require a short-lived, signed, HttpOnly order-access cookie before fetching or rendering the order. Verified checkout grants the cookie after payment completion; manual track-order lookup requires the order reference plus matching checkout email before the server grants access.

The storefront order confirmation route fetches an order by id and renders customer email, order contents, totals, delivery name, delivery address, and phone number. The track-order flow accepts only an order reference and then routes to the same page.

Evidence:

- `apps/storefront/src/lib/medusa/orders.ts`
- `apps/storefront/src/app/order-confirmation/[id]/page.tsx`
- `apps/storefront/src/features/orders/track-order-form.tsx`

Completed changes:

- Require a second verifier for order lookup, such as email, phone, or postal code.
- Verify that pair server-side before rendering customer/order PII.
- For post-checkout confirmation, issue a short-lived signed confirmation grant and require verified lookup after it expires.
- Avoid showing full delivery address and phone on unauthenticated pages.

Rotation plan:

- No key rotation is required for this finding.
- Treat existing order confirmation URLs as bearer links and avoid sharing them publicly.

### Production Dependency Audit Fails

Remediation status: partially fixed. Medusa packages were updated to `2.15.3` and patched transitive dependency versions are enforced through root `pnpm-workspace.yaml` overrides. The remaining production audit finding is `GHSA-cfw5-68c4-ffqp` in `@mikro-orm/knex`; directly overriding MikroORM to `6.6.14` is incompatible with the current Medusa stack, so this stays as a production-launch gate until Medusa validates a compatible dependency update.

`pnpm audit --prod` currently reports one high-severity production vulnerability in `@mikro-orm/knex` through Medusa transitive dependencies. Earlier Medusa, telemetry, lodash, and PostCSS advisories have been reduced or patched through package upgrades and narrow root overrides.

Verified high-severity packages reported by the original audit:

- `lodash`
- `@mikro-orm/knex`
- `@opentelemetry/sdk-node`
- `@opentelemetry/exporter-prometheus`

Completed changes:

- Upgrade Medusa packages and Next/PostCSS to reduce the vulnerable transitive dependency graph.
- Regenerate lockfiles from the committed package manifests.
- Use narrow root overrides for patched transitive packages where upstream Medusa/Next ranges have not yet moved.
- Keep the MikroORM advisory open instead of forcing an incompatible override.

Rotation plan:

- No secret rotation is required for dependency advisories.

### Bootstrap Runs A Remote Shell Script As Root

Remediation status: fixed in `infra/scripts/bootstrap-lightsail.sh`; Vector installs from a pinned `.deb` version instead of executing the remote setup script through root shell.

The Lightsail bootstrap script executes the Vector setup script fetched over HTTPS directly through `bash` while running as root.

Evidence:

- `infra/scripts/bootstrap-lightsail.sh`

Fix plan:

- Replace remote shell execution with a pinned apt repository setup:
  - install the Vector repository signing key into a keyring;
  - configure the apt source with `signed-by`;
  - install Vector through `apt-get`;
  - pin package versions where practical.

Rotation plan:

- No routine rotation is required.
- If the bootstrap was run during a known upstream compromise window, rebuild the host from a clean image and rotate host-level deploy credentials.

### Deploy Failure Can Print Backend Logs Into GitHub Actions

Remediation status: fixed in `infra/scripts/deploy-medusa-host.sh`; failed deploys print service status only and leave detailed logs on the host/private log sink.

On deployment health-check failure, the deploy script prints the last 200 Medusa server log lines to GitHub Actions stderr. Runtime logs can contain customer, payment, webhook, or config details depending on the failure.

Evidence:

- `infra/scripts/deploy-medusa-host.sh`

Fix plan:

- Replace GitHub-facing log tailing with a generic failure message plus `docker compose ps`.
- Keep detailed logs on the host or ship them to a private log sink with redaction.
- Add a separate operator-only command/runbook for retrieving detailed logs during incident response.

Rotation plan:

- If any workflow run already printed secrets or sensitive customer/payment payloads, delete the affected workflow logs and rotate the exposed credentials.

## Confirmed Good Controls

- No committed private keys, real `.env` files, Terraform state files, or obvious live API tokens were found in tracked files.
- Local secret-bearing files and Terraform state are ignored by `.gitignore`.
- GitHub Actions AWS access uses OIDC and an SSM read-only policy scoped to the configured environment path.
- CI and deploy workflow checkouts do not persist Git credentials after checkout.
- QA deploy SSH/SCP requires strict host key checking against pinned known hosts.
- Generated Medusa runtime env files are copied to Lightsail with restrictive permissions and are not committed.
- SSM-to-dotenv rendering rejects invalid keys, duplicate keys, and multiline values before writing deploy env files.
- Medusa container runs as the non-root `node` user.
- Medusa Compose services set `no-new-privileges`.
- Medusa Compose services drop all Linux capabilities.
- Medusa container port is bound to localhost on the host; public exposure is through Caddy.
- Razorpay frontend verification validates signature server-side and fetches Razorpay payment/order state before completing checkout.
