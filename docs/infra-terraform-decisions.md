# Infrastructure And Terraform Decisions

Status: discussion draft
Last reviewed: 2026-05-23

This document tracks the infrastructure and Terraform decisions before adding infrastructure code.

Do not treat open items in this file as implementation approval. Each decision below must be agreed explicitly before it is moved into `docs/architecture.md`, `docs/secrets-and-config.md`, `docs/operations.md`, `docs/cost-model.md`, or Terraform code.

## Current Canonical Baseline

The original canonical docs said:

- Storefront: Vercel Pro.
- Backend/app/data host: Railway Pro.
- Database/cache: Railway Postgres and Railway Redis.
- Media: Cloudflare R2.
- Email: Resend.
- Analytics: Cloudflare Web Analytics.
- QA from `dev`, production from `main`.

Accepted replacement direction:

- QA Medusa compute is provisioned first on AWS Lightsail in Singapore.
- Production environment instantiation is deferred until QA is set up and tested.
- Durable state must remain external to the app host.
- Production database is Neon Postgres in Singapore.
- Production Redis is Upstash Redis in Singapore, pay-as-you-go initially.
- Email remains Resend for v1.
- Terraform manages broad durable infrastructure; deployments remain in GitHub Actions.

## Raw Research Proposal

The raw research proposes:

- Storefront: Vercel Pro.
- Backend compute: AWS Lightsail in Singapore, starting with QA.
- Database: Neon Postgres Launch in Singapore.
- Redis: Upstash in Singapore or Mumbai.
- Media: Cloudflare R2.
- Email: AWS SES in the raw proposal, but Resend is accepted for v1.
- CI/CD: GitHub Actions.
- QA/staging: separate QA Lightsail host plus separate Neon branch, Redis, and secrets.
- Infrastructure management: Terraform.

## Decision Principles

- Order and payment data safety is more important than app-layer uptime.
- The first production stack should remain operationally light.
- Keep Medusa as the commerce source of truth.
- Keep all durable state external to app containers.
- Prefer portable standards: Docker images, Postgres, Redis protocol, S3-compatible object storage, DNS records.
- Avoid adding providers unless the benefit is concrete enough to justify more operational surface.
- Verify current official vendor docs before finalizing prices, limits, or provider capabilities.

## Round 1: Infra

### Decision 0: Backend Region Strategy

Question: should core backend services run in Singapore, India, or a mixed India/Singapore layout?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| All Singapore | Lightsail Singapore, Neon Singapore, Upstash Singapore. | Backend compute, Postgres, and Redis are colocated; avoids cross-region app-to-data latency; matches Neon's current official region availability. | User-to-API hop from India is slightly farther than Mumbai, but acceptable for v1. | Accepted |
| All India | Compute, Postgres, and Redis all in India. | Best theoretical India user-to-backend latency. | Requires replacing Neon with Supabase Mumbai, AWS RDS Mumbai, Cloud SQL India, or self-hosted Postgres; higher cost, broader platform, or weaker recovery tradeoffs for v1. | Rejected for v1 |
| Mixed India/Singapore | Put some services in India and some in Singapore. | May improve one leg of latency. | Creates repeated cross-region DB/Redis calls during cart, checkout, orders, admin, and workflows. | Rejected |

Decision:

- Use Singapore for core backend infrastructure in v1.
- Production Medusa compute runs in AWS Lightsail Singapore.
- Production Postgres runs in Neon AWS Asia Pacific Singapore (`aws-ap-southeast-1`).
- Production Redis should be colocated in Singapore if Upstash is accepted.
- Keep the Vercel storefront globally served; Vercel has edge regions including Mumbai and Singapore.
- Keep media behind Cloudflare/R2/CDN behavior rather than optimizing backend region around media reads.

Reason:

- Neon's official region list includes AWS Asia Pacific Singapore (`aws-ap-southeast-1`) and does not list an India/Mumbai region.
- Neon recommends choosing the database region closest to the application server.
- AWS Lightsail supports both Mumbai and Singapore, but choosing Mumbai compute with Singapore Neon would force repeated cross-region database calls.
- Upstash supports Mumbai and Singapore, but its primary region should follow the writer: Medusa compute.
- For Medusa, app-to-Postgres and app-to-Redis latency is more important than moving only the public API endpoint closer to Indian users.

Revisit trigger:

- Revisit all-India only if measured production API latency hurts conversion or if Neon adds a suitable India region with comparable pricing and recovery behavior.

### Decision 1: Production Backend Compute Host

Question: should production Medusa move away from Railway to a VPS-style host?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Keep Railway for Medusa | Continue with the original canonical baseline. | Lowest migration from original docs, easier deploy experience, fewer server-admin tasks. | Railway database templates and production data posture need careful review; cost and HA assumptions must be verified. | Rejected for production compute |
| AWS Lightsail single instance | Run Dockerized Medusa on one Lightsail VM behind Caddy. | Predictable cost, direct control, easy AWS migration path, external data services keep state portable. | Single app host is a SPOF; we own OS patching, Docker, reverse proxy, deploy safety, monitoring, and SSH hardening. | Accepted |
| Render Singapore | Managed app host for Medusa while keeping data external. | Better deploy ergonomics and less VM maintenance than Lightsail. | Higher baseline cost; chosen only if Lightsail ops becomes unacceptable later. | Rejected for v1 |

Decision:

- Use AWS Lightsail in Singapore for Medusa compute, starting with a QA host.
- Defer production Lightsail instantiation until QA is set up and tested.
- Keep Medusa stateless at the app tier: no production Postgres, Redis, uploaded media, or other durable state on the Lightsail disk.
- Use Dockerized Medusa so the app can move later if needed.
- Accept that the first production app tier will likely be single-instance and may have short app-layer outages.
- Terraform and Codex can reduce setup toil, but they do not remove ownership of OS patching, Caddy config, Docker runtime, log access, deploy rollback, monitoring, SSH hardening, and host recovery.

Reason:

- Lightsail best matches the current cost/control tradeoff if durable state is external.
- Render is the cleaner low-ops alternative, but its cost is materially higher.
- Fly.io is technically strong, but its multi-region strengths are not the first problem for this Medusa backend.
- Railway/Render remain possible future app-hosting alternatives, but Medusa compute is intentionally Lightsail for v1.

### Decision 2: Production Database

Question: what owns production order/catalog/customer/payment state?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Neon Postgres | External managed Postgres in Singapore. | Strong portability, branching, pooled connections, focused managed Postgres product. | Another provider; Terraform provider appears community-owned and must be verified before implementation. | Accepted |
| Railway Postgres | Keep DB with Railway baseline. | Fewer providers if Railway hosts Medusa. | No longer a natural fit because compute is not on Railway; production recovery posture would still need review. | Rejected |
| Supabase Postgres | Managed Postgres, possible Mumbai/Singapore fit. | Official Terraform provider, India/Singapore regions, strong dashboard ecosystem. | Adds platform surface we do not need; PITR economics are less attractive for this narrow DB use case. | Rejected for v1 |
| Self-hosted Postgres | Put DB on the app VM. | Lowest cash cost. | Not recommended for production order data without real backup/PITR/restore operations. | Not preferred |

Decision:

- Use Neon Postgres in Singapore for production Medusa.
- Use Neon branching for low-cost QA/staging database flows if it verifies cleanly during setup.
- Use pooled connection strings for application runtime unless Medusa or Neon guidance requires otherwise.
- Do not use Lightsail disk for production Postgres.

Reason:

- Medusa's durable commerce state needs a managed Postgres service with a credible restore story.
- Neon is a focused managed Postgres provider, which fits better than adopting Supabase's broader platform only for a database.
- Supabase has a stronger official Terraform-provider story, but that alone is not enough to choose it for this store.
- Railway Postgres is no longer a natural default because production compute is moving away from Railway.

Terraform note:

- Neon has Terraform providers available, including a commonly used community provider that supports projects, branches, endpoints, roles, and databases.
- Before implementation, verify current Neon API/provider support, region IDs, backup/restore behavior, pooled connection output, and import behavior.
- If provider support is not reliable enough, manage the Neon project manually at first and keep Terraform limited to documented outputs and dependent infrastructure.

Backup posture:

- Rely on Neon built-in backup/restore/time-travel recovery for v1.
- Verify a restore workflow before production launch.
- Do not add external `pg_dump` backups to R2/S3 for v1.
- Revisit external encrypted database dumps if business risk, compliance, or Neon recovery limits require it.

### Decision 3: Production Redis

Question: where should Medusa production Redis live?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Upstash Redis | External managed Redis-compatible service in Singapore. | Low operational burden, colocates with Medusa compute, portable Redis URL, pay-as-you-go start. | Command pricing and Medusa workload behavior need monitoring. | Accepted |
| Railway Redis | Use Railway only as an external Redis provider. | Familiar from the original plan. | Less clean now that compute is no longer on Railway; production responsibility, backups, and HA posture need verification. | Rejected for v1 |
| Self-hosted Redis | Run Redis on the app VM. | Cheapest and simple for one host. | Coupled failure with app host; not ideal for workflow/event reliability. | Rejected for v1 |

Decision:

- Use Upstash Redis in Singapore for production Medusa.
- Start on Upstash pay-as-you-go pricing.
- Do not self-host production Redis on Lightsail.
- Do not split Redis into Mumbai while Medusa compute and Neon Postgres are in Singapore.

Reason:

- Medusa production should have Redis for events, workflows, locks, caching, and temporary state.
- Redis writes are primarily from the Medusa backend, so the Redis primary region should follow Medusa compute.
- Pay-as-you-go is better while command volume is unknown.
- Fixed 250 MB is only worth switching to if measured command cost approaches the fixed plan or billing predictability matters more than minimizing early spend.

Review trigger:

- Review after QA smoke testing and again after early production traffic.
- Switch to Fixed 250 MB if pay-as-you-go spend approaches the fixed plan cost, command volume is noisy, or predictable billing becomes preferred.

Backup posture:

- Treat Redis as non-source-of-truth infrastructure for v1.
- Do not add a separate Redis backup/export plan.
- Rely on Upstash managed service behavior.
- If Redis loss disrupts in-flight workflows, recover operationally from Medusa/Postgres state.

### Decision 4: Email Provider

Question: should v1 switch from Resend to AWS SES?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Keep Resend | Keep current implementation and docs. | Already implemented, simpler developer experience, less infra churn. | Higher cost at scale; dependency on Resend limits and plan behavior. | Accepted |
| Move to AWS SES | Replace the current Resend notification provider. | Usually lower email unit cost, AWS-native if using Lightsail/SES. | More setup and deliverability work; requires code/provider changes and SES sandbox production approval. | Rejected for v1 |

Decision:

- Keep Resend for v1 transactional email.
- Do not switch to AWS SES as part of the Lightsail/Neon/Upstash infrastructure move.
- Keep SES as a later cost-optimization option if email volume or deliverability needs justify it.

Reason:

- The repo already has a Resend notification provider implementation.
- V1 email volume should be low enough that simplicity matters more than SES unit economics.
- SES would add sandbox approval, IAM/SMTP setup, deliverability work, and provider implementation churn.

### Decision 5: Media Storage

Question: should Cloudflare R2 remain the media store?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Cloudflare R2 Standard | Store Medusa-uploaded media in R2 with a custom media domain. | Low cost, no egress bandwidth charges, S3-compatible, aligns with Cloudflare DNS/analytics/access direction. | Need to configure caching and least-privilege tokens carefully. | Accepted |
| AWS S3 + CloudFront | Store media in S3 and serve through CloudFront. | Most standard AWS path, strong enterprise default. | More billing and configuration surface for v1. | Rejected for v1 |
| DigitalOcean Spaces | S3-compatible storage with included CDN. | Simple and predictable. | Less aligned with current providers; fixed base cost is less attractive at small catalog scale. | Rejected for v1 |
| Supabase Storage | Use Supabase object storage. | Convenient if Supabase is already the platform. | We are not using Supabase for Postgres/platform. | Rejected |

Decision:

- Use Cloudflare R2 Standard for production media storage.
- Use a custom media domain such as `media.brand.com`.
- Use Medusa's S3-compatible file module pointed at R2.
- Keep R2 tokens least-privilege and scoped to the media bucket.

Reason:

- Product images can create unpredictable read bandwidth, and R2 avoids egress bandwidth charges.
- R2 is S3-compatible, so migration to S3 + CloudFront remains possible later.
- R2 fits the existing Cloudflare direction for DNS, Web Analytics, optional Access, and optional Turnstile.

Backup posture:

- Do not add a separate cross-provider R2 media backup for v1.
- Keep original product media files organized outside the app as practical source backups.
- Revisit separate media replication/backups if catalog/media volume or business risk grows.

### Decision 6: DNS Provider

Question: should production DNS be managed in Cloudflare?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Cloudflare DNS | Move authoritative DNS management to Cloudflare. | Aligns with R2 custom media domain, Web Analytics, optional Access, optional Turnstile, CDN/cache/security rules, and Terraform support. | Requires careful DNS transfer/cutover from the current Shopify-managed domain setup. | Accepted |
| Keep Shopify-managed DNS | Leave DNS where it is. | Fewer immediate domain changes. | More awkward R2/media/security/Terraform setup; less unified Cloudflare control. | Rejected for production |

Decision:

- Use Cloudflare as the production DNS provider.
- Keep registrar ownership separate from DNS unless the business intentionally transfers the domain registrar later.
- Manage production records for `www`, apex redirect, `api`, `admin`, and `media` through Cloudflare once cutover is planned.

Reason:

- The project already uses Cloudflare R2 and Web Analytics.
- Cloudflare DNS simplifies custom R2 media domain setup and later Access/Turnstile/security controls.
- Cloudflare has mature Terraform provider support for DNS records and related resources.

### Decision 7: Backend Reverse Proxy And TLS

Question: what should terminate HTTP/HTTPS and route traffic to Medusa on Lightsail?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Caddy on Lightsail | Run Caddy on the VM as the origin reverse proxy and TLS manager. | Simple config, automatic HTTPS, no extra service fee, reliable normal-origin model. | We own Caddy install/config/reload/monitoring. | Accepted |
| Nginx + Certbot | Use Nginx and Certbot for TLS. | Very standard and widely known. | More moving parts than Caddy for this use case. | Rejected for v1 |
| Traefik | Docker-native reverse proxy. | Powerful for dynamic container routing. | More complexity than needed for one app host. | Rejected for v1 |
| Cloudflare Tunnel as primary ingress | Use `cloudflared` to expose Medusa without public origin ingress. | Hides origin and integrates with Cloudflare Zero Trust. | Adds another daemon/control plane and makes public ingress debugging more complex. | Rejected for v1 primary ingress |

Decision:

- Use Caddy on the Lightsail instance for origin reverse proxy and HTTPS.
- Use Cloudflare DNS/proxy/security in front where useful.
- Do not use Cloudflare Tunnel as the primary public ingress for v1.
- Route public hostnames such as `api.brand.com` and `admin.brand.com` through Caddy to Medusa containers on localhost or an internal Docker network.

Reason:

- Caddy gives the simplest reliable VM ingress path for this setup.
- Caddy's automatic HTTPS avoids separate Certbot automation.
- A normal public-origin model is easier to debug and migrate than a tunnel-first setup.
- Cloudflare can still provide DNS, proxying, basic DDoS protection, cache/security rules, and optional Access later.

### Decision 8: Medusa Container Runtime Shape

Question: how should Medusa run on the Lightsail instance?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Docker Compose with separate server and worker services | Build one Medusa image and run separate containers for HTTP/API and background worker roles. | Standard container shape, keeps process roles clear, simple on one VM, portable to ECS/Render/Railway later. | Requires compose/runbook discipline and resource monitoring on the single instance. | Accepted |
| Single shared Medusa container | Run HTTP and worker behavior in one broad process/container. | Fewer containers. | Less clear process separation; harder to reason about resource contention and restarts. | Rejected |
| Full orchestrator now | ECS/Kubernetes/Nomad-style orchestration. | Better long-term scaling model. | Too much setup for v1. | Rejected for v1 |

Decision:

- Run Medusa on Lightsail with Docker Compose.
- Build one production Medusa image.
- Run separate services for `medusa-server` and `medusa-worker`.
- Use Docker `restart: unless-stopped` for production Medusa services.
- Do not configure QA services to auto-start by default.
- Defer hard container memory limits until after QA usage establishes real Medusa server/worker memory behavior.
- Keep production Postgres, Redis, and media external; containers remain stateless.
- Treat deployment mechanics, registry choice, and image tagging as separate CI/CD decisions.

Reason:

- Separate server and worker containers are the cleaner production shape for a backend that handles both HTTP traffic and asynchronous work.
- The same image with different commands keeps builds simple while separating process roles.
- Docker Compose is enough for one Lightsail host and preserves a future migration path to a managed container platform.

### Decision 9: Container Registry

Question: where should the production Medusa Docker image be stored?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| GitHub Container Registry | Store private Medusa images in GHCR. | Free current cost posture, simple GitHub Actions integration, private image support, fewer AWS moving parts. | Less AWS-native than ECR; image scanning must be handled through GitHub/security workflow rather than ECR scanning. | Accepted |
| AWS ECR | Store private Medusa images in AWS ECR. | AWS-native, strong IAM integration, image scanning support. | Adds IAM/ECR setup and possible storage/transfer costs; more useful if compute later moves to ECS/Fargate. | Rejected for v1 |
| Docker Hub | Store images in Docker Hub. | Familiar and simple. | Less ideal for private production images and rate-limit/cost posture. | Rejected |

Decision:

- Use GitHub Container Registry for v1 Medusa production images.
- Keep the image private.
- Build and push images from GitHub Actions.
- Use immutable version tags for deploys; `latest` may exist for convenience but must not be the only production rollback handle.
- Revisit ECR if compute moves to ECS/Fargate or deeper AWS-managed container services.

Reason:

- GHCR is the simplest free registry for this GitHub-based repo and CI path.
- Avoiding ECR reduces v1 AWS IAM and registry setup.
- ECR's scanning and AWS-native integration are valuable later, but not enough to justify the extra setup now.

### Decision 10: Deployment Strategy

Question: how should production deploys update Medusa on Lightsail?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Disciplined Docker Compose deploy | GitHub Actions builds/pushes immutable image, SSHes to Lightsail, pulls, migrates, runs `docker compose up -d`, health-checks, and can rollback by tag. | Simple, official Compose production shape, low operational surface. | Short restart blip possible for the HTTP server. | Accepted baseline |
| Docker Compose plus `docker-rollout` | Use the lightweight open-source Docker CLI plugin to scale up, wait for health, then remove the old server container. | Minimal path to near-zero-downtime HTTP deploys while staying on Compose. | Extra plugin/script dependency; needs correct health checks and enough memory headroom. | Accepted later upgrade |
| Kamal | Adopt Kamal's Docker deploy framework and proxy. | Polished zero-downtime server deploy tool. | More opinionated framework and proxy model than needed for v1. | Rejected for v1 |
| Docker Swarm/ECS/Kubernetes | Use an orchestrator for rolling updates. | More native rollout model. | Too much complexity for one v1 host. | Rejected for v1 |
| Watchtower/auto-updater | Automatically update containers when images change. | Low setup. | Not controlled enough for checkout/order systems with migrations and rollback needs. | Rejected |

Decision:

- After production compute and full runtime config are approved, start with controlled Docker Compose deploys from GitHub Actions.
- Require immutable image tags, a Medusa server health check, and a rollback runbook.
- Deploy the worker with normal Compose restart semantics.
- Treat `docker-rollout` as the planned lightweight upgrade for near-zero-downtime `medusa-server` deploys after the baseline deploy path is stable.
- Do not adopt Kamal, Swarm, ECS, Kubernetes, or Watchtower for v1.

Reason:

- Plain Compose is the simplest reliable production deployment model for one Lightsail host.
- Caddy can reduce visible errors with reverse-proxy retries/health behavior, but it is not a deployment orchestrator.
- `docker-rollout` fits our existing Compose path better than introducing a larger deployment framework.
- Checkout/order deployments should remain controlled by CI, explicit migrations, health checks, and tag-based rollback.

### Decision 11: Production Migration Gate

Question: how should production Medusa database migrations run?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Manual gated production migration | Deployment workflow requires explicit approval before running migrations against production Neon. | Safer for order/payment/catalog schema; preserves human review before database changes. | Slightly slower deploys. | Accepted |
| Automatic migration in every deploy | CI runs production migrations automatically before/with app deploy. | Fast and simple. | Higher blast radius if a migration is broken, destructive, or incompatible. | Rejected for v1 |
| Fully manual outside CI | Operator SSHes/runs migration separately. | Maximum manual control. | More error-prone and less auditable than a gated workflow. | Rejected |

Decision:

- Require an explicit manual gate/approval before production migrations run.
- Prefer the deployment workflow to execute the approved migration command so logs and ordering remain auditable.
- Run staging/QA migrations before production migrations when a staging database exists.
- Follow expand-migrate-contract: additive changes first, app deploy second, destructive cleanup later.
- Do not combine destructive schema cleanup with the same-minute production app cutover.

Reason:

- Medusa migrations affect commerce-critical data: carts, checkout, orders, payments, products, customers, inventory, and fulfillment.
- The operational cost of an approval gate is small compared with the risk of an accidental production schema break.
- A gated workflow is safer than fully manual SSH because it keeps commands repeatable and logged.

### Decision 12: QA/Staging Compute Placement

Question: should QA/staging Medusa share the production Lightsail instance?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Shared Lightsail compute, separate data | Run QA containers on the same Lightsail instance only during active testing, with separate Neon branch, Redis, secrets, and payment keys. | Lowest cost, simple, enough for lightweight internal QA. | QA can compete with production for CPU/RAM/disk/network if left running or load-tested. | Rejected |
| Separate QA Lightsail instance | Run QA on its own VM before production is instantiated. | Better compute isolation and allows end-to-end QA before production rollout. | Adds a QA monthly Lightsail cost; stopped Lightsail instances still accrue charges until deleted. | Accepted |
| Managed temporary QA host | Use a platform host for QA only. | Cleaner isolation and possible easier start/stop. | Adds provider/deploy complexity and cost. | Rejected for v1 |

Decision:

- Run QA/staging Medusa on a separate QA Lightsail instance initially.
- Defer production Lightsail creation until production launch readiness.
- QA must use a separate Neon branch/database, separate Redis, separate secrets, and Razorpay test keys.
- QA must not share production Redis, JWT/cookie secrets, webhook secrets, or payment credentials.
- Delete the QA Lightsail instance when it is no longer needed; stopped Lightsail instances still accrue charges until deleted.

Reason:

- V1 QA is expected to be lightweight and internal.
- The most important isolation boundary is data/secrets/payment isolation, not compute isolation.
- A separate Lightsail instance would add cost even when stopped; it must be deleted to stop instance charges.

### Decision 13: QA/Staging Redis

Question: should QA/staging have its own Redis?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Separate QA Upstash Redis pay-as-you-go | Create a separate Upstash Redis database in Singapore for QA/staging. | Keeps QA close to production behavior, avoids sharing production Redis, low expected cost if QA is used lightly. | Adds another Redis database/secret to manage. | Accepted |
| No QA Redis initially | Run only simple QA flows until Redis-like behavior is needed. | Fewer resources. | QA may differ from production for workflows/events/locks/cache behavior. | Rejected |
| Share production Redis | Reuse production Redis for QA. | No extra resource. | Unsafe isolation boundary; QA could affect production workflows/cache/locks. | Rejected |

Decision:

- Use a separate Upstash Redis database for QA/staging.
- Place QA Redis in Singapore.
- Use pay-as-you-go pricing initially.
- QA must never share production Redis.
- Stop QA containers when not testing; the QA Redis database can remain provisioned if cost stays negligible.

Reason:

- Medusa production behavior depends on Redis-backed events, workflows, locks, and cache behavior.
- QA should be close enough to production to catch workflow and checkout issues.
- A separate pay-as-you-go Upstash database is a small cost for a cleaner isolation boundary.

### Decision 14: QA/Staging Database

Question: should QA/staging use a Neon branch or a separate Neon project?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Neon branch | Create a QA/staging branch from the production Neon project. | Cheap, fast, production-like schema/data snapshot, aligns with why Neon was selected. | Same project boundary; branch reset and credential handling must be disciplined. | Accepted |
| Separate Neon project | Use a fully separate Neon project for QA/staging. | Stronger project-level isolation. | More setup/cost and less convenient branch workflow for v1. | Rejected for v1 |
| Shared production database | Point QA at production DB. | No setup. | Unsafe; QA can mutate production data. | Rejected |

Decision:

- Use a Neon branch for QA/staging.
- Use separate QA/staging database credentials/connection strings.
- QA/staging must never write to the production branch/database.
- Document branch reset/refresh rules before launch.
- If QA needs stronger isolation later, move to a separate Neon project.

Reason:

- Neon branching gives cheap, production-like QA without paying for a full second database stack.
- A separate branch is enough for lightweight internal QA when paired with separate Redis, secrets, and payment keys.
- Shared production DB is never acceptable for QA.

### Decision 15: Runtime Config And Secret Store

Question: where should Medusa runtime config and secrets be centrally managed?

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| AWS SSM Parameter Store managed by Terraform | Store runtime config/secrets centrally in SSM paths and manage them through Terraform where provider behavior is safe enough. | Central AWS-native config store, standard parameters have no additional charge, SecureString support, versioning/IAM, no custom sync scripts. | Terraform state may contain secret values and must be treated as a secret-bearing artifact. | Accepted |
| GitHub environment secrets only | Store app secrets directly in GitHub environments and write env files during deploy. | Simple and close to CI. | GitHub becomes the primary long-term secret store; weaker central config story. | Rejected as primary store |
| AWS Secrets Manager | Store all secrets in Secrets Manager. | Strong secret-management product with rotation features. | More cost and complexity than needed for v1. | Rejected for v1 |
| Manual env files on server | SSH and edit `.env.prod` manually. | Simple first setup. | Easy to drift, less auditable, harder to recreate. | Rejected |

Decision:

- Use AWS SSM Parameter Store as the central runtime config/secrets store for Medusa.
- Use hierarchical paths such as `/ecom/prod/medusa/*` and `/ecom/qa/medusa/*`.
- Store secrets as `SecureString`.
- Terraform may manage SSM parameters, including secret values, after provider behavior is reviewed.
- Prefer write-only SSM value support where available.
- Accept that Terraform remote state may contain secret values.
- Treat Terraform remote state as a secret-bearing artifact.
- GitHub Actions fetches SSM parameters during deploy and writes the target Medusa env file to Lightsail over Tailscale SSH.
- Keep generated env files out of Git and with restrictive server permissions.
- GitHub environment secrets should hold only deploy/bootstrap credentials needed to read SSM, run Terraform, and reach Lightsail, not duplicate the full app secret set.

Reason:

- SSM Parameter Store gives a simple central source for runtime configuration without Secrets Manager cost/complexity.
- Avoiding custom secret-sync scripts keeps the setup simpler and less fragile.
- Terraform state can expose secret values, so remote state must be secured like a secret store.
- GitHub Actions still owns deploy mechanics, but not the long-term app-secret source of truth.

### Decision 16: Lightsail Server Bootstrap

Question: how should Docker, Caddy, and base server setup be installed on Lightsail?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Separate bootstrap script/runbook under `infra/` | Terraform creates the VM/network; a committed script/runbook installs Docker, Caddy, users, directories, and base service config. | Repeatable, inspectable, easy to rerun/debug, keeps Terraform focused on infrastructure. | One extra operational step after VM creation. | Accepted |
| Terraform cloud-init/user-data | Terraform passes bootstrap commands to the instance at creation time. | More automated initial provisioning. | Harder to iterate/debug; can blur runtime setup into Terraform. | Rejected for v1 |
| Manual SSH commands only | Operator runs ad hoc commands. | Fastest once. | Not repeatable and easy to drift. | Rejected |

Decision:

- Use a separate bootstrap script/runbook committed under `infra/`.
- Terraform creates Lightsail infrastructure; bootstrap configures the host.
- Bootstrap should install Docker, Docker Compose plugin, Caddy, deployment directories, basic permissions, and any approved host-level hardening.
- Bootstrap should configure a 2 GB swap file with low swappiness.
- Keep live secrets out of bootstrap scripts.
- Keep app deployments in GitHub Actions, not bootstrap.

Reason:

- Server bootstrap needs to be repeatable and debuggable.
- Cloud-init is useful, but too opaque for this first VPS setup.
- Separating Terraform provisioning, host bootstrap, and app deployment keeps responsibilities clear.

Swap:

- Configure a 2 GB swap file on the 4 GB Lightsail instance.
- Set low swappiness, such as `10`.
- Treat swap as an emergency cushion for deploy/runtime spikes, not normal operating memory.
- If swap is used regularly, tune containers or scale the instance instead of relying on swap.

### Decision 17: Observability And Alerts

Question: what monitoring and alerting should v1 use?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Better Stack-only + server logs | Use Better Stack for uptime, alerts, logs, and error tracking, with local Docker/Caddy logs for server investigation. | One vendor and alert surface for v1, useful free/low-cost starting point, no self-hosted observability burden. | Better Stack error tracking is newer than Sentry; verify source-map/release/debugging workflow before launch. | Accepted |
| Better Stack + Sentry + server logs | Use Better Stack for uptime/alerts/logs and Sentry for app errors. | Strong specialized code-level error tracking. | Two vendors, two SDK/config surfaces, duplicate alert/noise/billing management for v1. | Later option |
| UptimeRobot free + logs | Use UptimeRobot free checks and server logs. | Simple. | UptimeRobot free plan is not ideal for a commercial ecommerce site; weaker app error visibility. | Rejected |
| Grafana Cloud/Prometheus/Loki | Full metrics/logs/dashboard stack. | Powerful and extensible. | More setup than v1 needs; easy to overbuild. | Rejected for v1 |
| Self-hosted observability on Lightsail | Run monitoring stack on the same VM. | No external observability vendor. | Bad failure model: monitoring can die with the app host. | Rejected |

Decision:

- Use Better Stack for uptime checks, alerts, log collection, and v1 application error tracking.
- Ship Docker/Caddy/app logs to Better Stack via Vector from day one.
- Keep local Docker/Caddy logs available on Lightsail as a fallback.
- Do not set up Prometheus, Grafana, Loki, Datadog, or a self-hosted observability stack for v1.
- Verify Better Stack current free-tier/commercial-use limits before production launch.
- Manage Better Stack resources through Terraform where provider support is stable.
- Defer Sentry unless Better Stack error tracking is insufficient after QA or early production usage.

Initial checks:

- Storefront availability.
- Medusa API health endpoint at `/health`.
- Admin/API hostname availability.
- SSL/domain expiry alerts where available.
- Worker heartbeat is deferred until a reliable worker-emitted signal exists.

Reason:

- Uptime alerts, logs, and app exception tracking solve the immediate v1 operational need.
- Keeping v1 on Better Stack avoids duplicate alerting and billing while still covering service reachability, logs, and application errors.
- Full metrics/log pipelines can be added later if incidents or traffic justify them.

Terraform scope:

- Terraform manages Better Stack uptime monitors.
- Terraform manages Better Stack Telemetry/log sources where provider support is stable.
- Terraform manages Better Stack heartbeats/status page only if needed.
- Better Stack account signup, billing/free-tier setup, and initial API tokens are manual bootstrap steps.
- Better Stack provider credentials must not be committed.

Logging:

- Use Vector on Lightsail to ship Docker/Caddy/app logs to Better Stack.
- Configure Vector during Lightsail bootstrap.
- Store Better Stack source tokens in SSM.
- Configure Docker log rotation locally so logs cannot fill the instance disk.
- Do not log secrets, payment tokens, raw request bodies, or customer-sensitive data.

Alert channels:

- Use Better Stack email alerts and mobile app push notifications for v1.
- Do not configure Slack alerts for v1.
- Do not build custom WhatsApp/Telegram/Signal alert bridges for v1.
- Paid SMS/phone alerts can be revisited if missed downtime alerts become a real risk.

Health endpoint:

- Add a dedicated unauthenticated Medusa `/health` endpoint for shallow liveness.
- Add a dedicated unauthenticated Medusa `/ready` endpoint for readiness/dependency checks.
- `/health` must be cheap, read-only, and safe for frequent liveness checks.
- `/ready` may check app readiness plus Postgres and Redis connectivity.
- Use `/health` for process liveness and simple deploy checks.
- Use `/ready` for deeper dependency-aware monitoring after tuning alert behavior.

Worker heartbeat:

- Do not add a Better Stack worker heartbeat at launch.
- Add a heartbeat only when the Medusa worker can emit a real periodic signal.
- Do not fake worker health from the API server.
- Use worker logs, Better Stack error events, and Docker restart status initially.

Status page:

- Do not create a public Better Stack status page for v1.
- Keep Better Stack as internal monitoring/alerting.
- Revisit a public status page only if customer expectations or operational maturity require it.

### Decision 18: Lightsail Snapshots

Question: should Lightsail automatic snapshots be enabled?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Enable automatic snapshots | Lightsail takes automatic daily instance snapshots and keeps the recent automatic snapshot window. | Faster VM recovery from host corruption/misconfiguration/disk issues. | Snapshot storage has extra cost; not a substitute for Neon/R2/Upstash backups. | Accepted |
| No Lightsail snapshots | Rebuild host only from Terraform/bootstrap/deploy. | Lowest cost and cleanest immutable-infra discipline. | Slower recovery if host config needs to be reconstructed under pressure. | Rejected |

Decision:

- Enable automatic Lightsail snapshots for active Medusa Lightsail instances, starting with QA.
- Treat snapshots as host recovery convenience only.
- Do not treat Lightsail snapshots as database, Redis, media, or application-release backups.
- Do not accumulate manual snapshots casually.
- Review snapshot storage cost after the first month.

Reason:

- The source of truth remains external: Neon, Upstash, R2, GHCR, Terraform, and bootstrap scripts.
- Snapshots still reduce recovery time if the VM itself is corrupted or misconfigured.
- The expected initial cost should be low, but it is not zero.

### Decision 19: Billing And Usage Alerts

Question: should provider billing/usage alerts be configured?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Configure low v1 billing/usage alerts | Add cost/usage alerts where providers support them. | Catches surprise usage from snapshots, Redis commands, DB usage, logs, image traffic, or platform overages. | Some providers may require manual dashboard setup or paid-plan support. | Accepted |
| No billing alerts initially | Review invoices manually. | Less setup. | Higher risk of surprise usage/cost. | Rejected |

Decision:

- Configure billing/usage alerts where each provider supports them.
- Use low v1 thresholds close to expected usage.
- Prefer Terraform-managed alerts where provider support is reliable; otherwise configure manually and document.
- Review alerts after first production month.

Initial alert areas:

- AWS Lightsail and snapshot storage.
- Neon compute/storage/branch usage.
- Upstash Redis command spend approaching Fixed 250 MB cost.
- Vercel usage/overage.
- Cloudflare R2 storage/operations.
- Better Stack log volume and monitor limits.
- Better Stack event volume.

Reason:

- The chosen stack is low-cost, but several services are usage-based.
- Early alerts are cheaper than discovering runaway usage in an invoice.

### Decision 20: Production Admin Protection

Question: should production Medusa Admin be protected by Cloudflare Access?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Cloudflare Access in front of admin | Require Cloudflare Access identity gate before `admin.brand.com`, then Medusa Admin auth behind it. | Strong extra protection, no shared basic-auth password, aligns with Cloudflare DNS. | Adds setup and possible access friction for admin users. | Accepted |
| Caddy basic auth | Add HTTP basic auth at the origin proxy. | Simple and origin-local. | Shared credentials are easy to mishandle; weaker admin-user lifecycle. | Fallback only |
| Medusa auth only | Expose Medusa Admin directly over HTTPS. | Simplest. | Only one auth layer for production admin. | Rejected |

Decision:

- Use Cloudflare Access in front of production Medusa Admin.
- Use Cloudflare Access email OTP with an allowlist of approved admin email addresses for v1.
- Keep Medusa Admin authentication enabled behind Cloudflare Access.
- Do not rely on Caddy basic auth unless Cloudflare Access is not ready.
- Use separate admin user accounts; no shared Medusa admin passwords.

Reason:

- Admin is a high-risk production surface.
- Cloudflare Access gives a clean outer identity gate without managing a shared proxy password.
- Email OTP is the simplest identity method while there is only one operator.
- The project already uses Cloudflare DNS, so Access fits the chosen platform boundary.

### Decision 21: Cloudflare Proxy For API/Admin

Question: should API/admin hostnames be proxied through Cloudflare?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Cloudflare proxied records for API/admin | `api.brand.com` and `admin.brand.com` resolve to Cloudflare anycast IPs and proxy to the Lightsail origin. | Hides origin IP from normal DNS, adds free DDoS/proxy layer, enables Access/WAF/rate-limit options later. | Adds Cloudflare edge behavior to debug; origin must still be secured. | Accepted |
| DNS-only direct to Lightsail | DNS points directly to the Lightsail static IP. | Simplest request path. | Exposes origin IP directly and loses Cloudflare proxy protections. | Rejected for production |

Decision:

- Proxy `api.brand.com` through Cloudflare for production.
- Proxy `admin.brand.com` through Cloudflare and protect it with Cloudflare Access.
- Keep Caddy serving valid HTTPS at the origin.
- Use full end-to-end HTTPS; do not use Cloudflare Flexible SSL.
- Keep origin firewall and SSH hardening; Cloudflare proxy is not a replacement for host security.

Reason:

- Cloudflare's free plan includes core DNS/proxy/CDN/SSL/DDoS protection features suitable for this v1 layer.
- Dynamic API responses still reach the origin, so performance is not the main reason; security and operational controls are.
- Proxying now keeps the path open for future WAF/rate-limit rules without changing DNS architecture.

### Decision 22: Lightsail Origin Firewall For HTTP/HTTPS

Question: should Lightsail `80/443` be open publicly or restricted to Cloudflare IP ranges?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Open `80/443` publicly at launch | Lightsail allows public HTTP/HTTPS while Cloudflare proxy is configured in DNS. | Simplest launch path, fewer moving parts during DNS/TLS setup. | Direct origin access is possible if the IP is known. | Accepted initial posture |
| Restrict `80/443` to Cloudflare IP ranges | Only Cloudflare edge IP ranges can reach the origin HTTP/HTTPS ports. | Stronger origin protection after Cloudflare proxy is stable. | Requires correct Cloudflare IP allowlist maintenance; easier to break origin during setup. | Accepted later hardening |
| No public inbound, tunnel only | Use Cloudflare Tunnel for all ingress. | Hides origin network path. | Tunnel-first was rejected for v1 primary ingress. | Rejected |

Decision:

- Launch with Lightsail `80/443` open publicly.
- Keep Cloudflare proxied DNS records for API/admin.
- After the proxied path, Caddy HTTPS, health checks, and deploys are stable, restrict `80/443` to Cloudflare IP ranges.
- Keep SSH restricted to the smallest practical trusted source set.

Reason:

- Cloudflare-only origin firewalling is stronger, but first-launch DNS/TLS/debugging is simpler with public `80/443`.
- This is a phased hardening step, not a rejection of origin restriction.

### Decision 23: SSH And Deploy Access To Lightsail

Question: how should human SSH and GitHub Actions deploy access reach the Lightsail host?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Tailscale for SSH/deploy access | Install Tailscale on Lightsail; human devices and GitHub Actions join the tailnet and SSH to the private Tailscale IP. | No permanent public SSH, stable private access from changing networks, works for personal devices and CI deploys. | Requires Tailscale setup/ACLs and tested CI connectivity. | Accepted |
| Public SSH restricted to trusted IPs | Keep port `22` open only to selected IPs. | Simple and AWS-native. | Annoying with changing personal IPs; GitHub Actions IP ranges are broad/dynamic. | Fallback only |
| Public SSH open to anywhere, key-only | Leave SSH open globally with key auth. | Simplest. | Unnecessary public attack surface. | Rejected |
| Cloudflare Access/Tunnel for SSH | Use Cloudflare Zero Trust for SSH. | Strong access layer. | More setup and not needed because Tailscale account already exists. | Rejected for v1 |

Decision:

- Use Tailscale for human SSH and GitHub Actions deploy access.
- Install Tailscale on the Lightsail VM during bootstrap.
- Close public port `22` after Tailscale access is tested.
- GitHub Actions deploy jobs may join the tailnet using Tailscale's GitHub Action and deploy over the server's Tailscale IP.
- Use Tailscale ACLs so only approved personal devices/users and the deploy identity can access the host.
- Keep emergency access through Lightsail browser SSH or temporary IP-restricted public SSH.

Reason:

- Only one operator needs routine access, across a few personal devices.
- Tailscale avoids depending on changing personal IPs or broad GitHub Actions runner IP ranges.
- Public SSH does not need to remain exposed for v1.

### Decision 24: Lightsail Host OS

Question: which host operating system should the Lightsail VM use?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Ubuntu 22.04 LTS | Use Ubuntu Jammy as the Lightsail host OS. | Mature LTS, broad docs for Docker/Caddy/Tailscale, matches raw setup guide, boring production choice. | Slightly older than 24.04. | Accepted |
| Ubuntu 24.04 LTS | Use Ubuntu Noble as the Lightsail host OS. | Newer LTS, supported by Docker and Lightsail. | Newer LTS edge cases are not worth it for this host role. | Rejected for v1 |
| Debian | Use Debian host OS. | Lighter and stable. | Slightly less aligned with common Lightsail/Docker/Caddy/Tailscale examples for this project. | Rejected for v1 |
| Amazon Linux 2023 | Use AWS-native Linux host OS. | AWS-native default. | Less aligned with our Docker/Caddy/Tailscale examples and troubleshooting path. | Rejected for v1 |

Decision:

- Use Ubuntu 22.04 LTS for the Lightsail host.
- Do not install Node.js on the host for app runtime.
- Run Medusa with Node.js 24 inside the production Docker image.
- Host packages are limited to Docker Engine, Docker Compose plugin, Caddy, Tailscale, and basic operational tooling.

Reason:

- The host OS only needs to run the container/proxy/access stack.
- Node 24 is a container-runtime requirement, not a host-OS requirement.
- Ubuntu 22.04 LTS is mature, well documented, and good enough for a 4 GB production VPS.

### Decision 25: Medusa Docker Base Image

Question: which Node base image should Medusa use in production Docker builds?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Node 24 Debian slim | Use an official Node 24 Debian slim image for Medusa build/runtime stages. | Better native dependency compatibility, official Node image, glibc-based, still smaller than full Debian. | Larger than Alpine. | Accepted |
| Node 24 Alpine | Use an official Node 24 Alpine image. | Smaller image. | musl/native dependency compatibility issues are more likely; troubleshooting can cost more than the image-size savings. | Rejected for v1 |
| Host Node runtime | Install Node on Lightsail and run Medusa directly. | Avoids Docker image complexity. | Violates our containerized runtime direction and makes migration harder. | Rejected |

Decision:

- Use an official Node 24 Debian slim image for Medusa production Docker builds.
- Prefer multi-stage builds.
- Do not use Alpine for v1 unless image size becomes a real problem and native dependency compatibility is verified.
- Do not install host Node.js for production Medusa runtime.

Reason:

- The project requires Node.js 24.
- Debian slim is the safer production default for Medusa and Node native dependencies.
- Image size is less important than predictable installs/builds and simpler debugging.

### Decision 26: Vercel Terraform Management

Question: should Terraform manage the Vercel storefront project and configuration?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Manage Vercel through Terraform | Use the official Vercel Terraform provider for storefront project, domains, and environment variables where supported. | Complete infra-as-code coverage, repeatable storefront platform setup, fewer dashboard-only changes. | Secrets may enter Terraform state if managed directly; provider environment variable resource modes must not be mixed. | Accepted |
| Manage only DNS/domain records | Keep Vercel project/env config in dashboard or GitHub Actions and manage only Cloudflare DNS. | Avoids Vercel secrets in Terraform state. | Less complete infrastructure-as-code coverage. | Rejected |

Decision:

- Manage the Vercel storefront project and configuration through Terraform for v1 where provider support is reliable.
- Manage Vercel domains through Terraform.
- Manage Vercel environment variables through Terraform where practical.
- Keep Vercel deployments in GitHub Actions, not Terraform.
- Do not mix Vercel project inline `environment` config with standalone Vercel environment variable resources.

Secret-state caution:

- Terraform state can contain managed secret values even when outputs are marked sensitive.
- Before adding Vercel secret environment variables to Terraform, confirm the remote state security posture and the Vercel provider's sensitive handling.
- Terraform may manage Vercel secret environment variables directly after provider behavior is reviewed.
- Treat remote Terraform state as a secret-bearing artifact.

Reason:

- The official Vercel Terraform provider supports projects, project domains, and environment variable resources.
- Full infra-as-code is preferred for this project.
- Avoiding custom Vercel secret-sync scripts keeps the setup simpler.
- Deployments are release operations and remain better handled by GitHub Actions.

### Decision 27: Neon Terraform Management

Question: should Terraform manage Neon project, branches, roles, and databases?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Terraform-managed Neon after provider audit | Use Terraform for Neon project/branch/database/role resources after reviewing provider maturity and behavior. | Complete infra-as-code coverage and reproducible QA branch setup. | Neon provider support appears community-maintained; provider drift/import/secret behavior must be reviewed before production use. | Accepted |
| Manual Neon setup | Create/manage Neon in dashboard and document outputs. | Avoids relying on a community provider. | Less complete IaC and more manual drift risk. | Rejected for v1 unless audit fails |
| Hybrid manual-first/import-later | Create Neon manually, then import stable resources later. | Safer fallback if provider is not mature enough. | More transition work. | Fallback |

Decision:

- Manage Neon through Terraform if provider review/audit passes.
- Review provider source, registry docs, supported resources, import behavior, sensitive outputs, region IDs, pooled/direct connection outputs, and branch lifecycle behavior before implementation.
- If the review fails, create Neon manually and document/import stable resources later.
- Do not put Neon passwords or connection strings into committed Terraform variables.

Reason:

- Full Terraform ownership is preferred for infrastructure consistency.
- Neon branching is part of the QA/staging plan, so reproducible branch management is valuable.
- Provider maturity must be verified because Neon Terraform support is not as clearly official as AWS/Cloudflare/Vercel.

## Round 1: Terraform Setup

### Decision Summary: Terraform Provider Set

This summarizes provider scope already decided above.

Terraform-managed provider/resource areas:

```txt
aws
  Lightsail
  S3 backend bucket
  Native S3 backend lockfiles
  SSM Parameter Store
  IAM as needed

cloudflare
  DNS records
  R2 bucket/domain resources
  Access app/policies
  WAF/security baseline
  Turnstile widgets

upstash
  Production Redis
  QA Redis

vercel
  Storefront project
  Domains
  Environment variables where provider behavior is acceptable

betterstack
  Uptime monitors
  Log/telemetry sources where stable

neon
  Project, branches, roles, and databases after provider audit passes
```

Explicitly not Terraform-managed for v1:

```txt
GitHub repository settings/environments/secrets
Razorpay dashboard/account/webhook setup
R2 S3 access key/secret generation
Application deploys
Medusa database migrations
Docker image releases
Lightsail host bootstrap execution
```

### Decision 28: IaC Tool

Question: should the project use Terraform or OpenTofu?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Terraform | Use the HashiCorp Terraform CLI and Terraform Registry providers. | Broadest docs/provider expectation; matches most vendor examples. | License posture differs from OpenTofu. | Accepted |
| OpenTofu | Use the open-source Terraform fork. | Open-source governance and strong compatibility story. | Slightly more translation from vendor examples that say Terraform. | Rejected for v1 |

Decision:

- Use Terraform for v1 infrastructure as code.
- Use Terraform Registry provider docs and pin provider versions.
- Do not mix Terraform and OpenTofu in this repo for v1.

Reason:

- Vendor docs and examples for AWS, Cloudflare, Vercel, Upstash, and community Neon providers are easiest to follow as Terraform.
- Consistency matters more than tool neutrality for this initial setup.

### Decision 29: Terraform Scope

Question: what should Terraform own in v1?

Options:

| Scope | Owns | Does not own | Status |
| --- | --- | --- | --- |
| Minimal IaC | DNS records, R2 bucket, provider scaffolding, non-secret variables. | App server bootstrap, secrets, deployments. | Rejected as too narrow |
| Infra IaC | DNS, R2, Lightsail instance/static IP/firewall, basic IAM/users where supported. | Runtime app deploys, generated secrets, database schema migrations. | Rejected as too narrow |
| Broad IaC | Durable infrastructure across Cloudflare, AWS, Upstash, Vercel, and Neon where provider support is reliable. | App releases, migrations, runtime secret values, emergency operations. | Accepted |

Decision:

- Use Terraform for broad infrastructure management.
- Use GitHub Actions for deployments, image builds, migrations, health checks, and rollbacks.
- Terraform must not manage Medusa Docker image releases or Docker Compose image tag updates.
- Terraform must not commit or expose live secret values.

Terraform must own:

- AWS Lightsail instance, static IP, and firewall/ports.
- Cloudflare DNS records.
- Cloudflare R2 bucket and stable bucket settings where provider support is solid.
- Upstash production Redis and QA Redis.
- Vercel project/domain/environment configuration where provider support fits cleanly.
- Remote Terraform state resources after the state backend decision is made.

Terraform should own if provider support is reliable:

- Neon project, production branch/database/role, QA branch/database/role, and non-secret outputs after provider review/audit passes.

Terraform must not own:

- Medusa image releases.
- Docker Compose image tag changes.
- Production migrations.
- Production `.env` files or live runtime secret values.
- JWT/cookie secrets, Razorpay secrets, Resend keys, R2 secret access keys, Neon passwords, or Upstash passwords committed into `.tfvars`.
- Emergency operational changes.

Reason:

- Terraform is the right tool for durable resource configuration and drift control.
- GitHub Actions is the right tool for release automation.
- Keeping deployments out of Terraform avoids turning infrastructure state into application release state.
- Keeping live secret values out of Terraform/Git reduces accidental exposure risk.

### Decision 30: Terraform Directory Layout

Question: where should Terraform live?

Options:

| Option | Shape | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Root `infra/terraform` | `infra/terraform/{environments,modules}` | Clear separation from apps; common pattern; leaves room for infra scripts/runbooks later. | More structure upfront. | Accepted |
| Root `terraform/` | `terraform/{envs,modules}` | Short path and obvious. | Slightly less aligned with broader infra docs if we later add scripts/runbooks. | Rejected |
| Separate repo | Dedicated infrastructure repo. | Strong separation of duties. | Too heavy for current project. | Not preferred for v1 |

Decision:

- Place Terraform under `infra/terraform`.
- Use environment directories under `infra/terraform/environments`.
- Use shared modules under `infra/terraform/modules`.
- Keep app source, generated app configs, and deployment scripts outside Terraform modules unless they are explicitly infra bootstrap files.

Initial target shape:

```txt
infra/
  terraform/
    environments/
      prod/
      qa/
    modules/
      lightsail-medusa/
      cloudflare-site/
      upstash-redis/
      vercel-storefront/
      neon-postgres/   # only if provider support is accepted during implementation
```

Reason:

- `infra/terraform` keeps infrastructure code separate from application code without requiring a separate repo.
- The `infra/` parent leaves room for future runbooks, bootstrap scripts, or non-Terraform operational files.

### Decision 31: Terraform State Backend

Question: where should Terraform state live?

Options:

| Option | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- |
| Terraform Cloud / HCP Terraform | Managed remote state, locking, team-friendly. | Another service/account and possible cost/plan constraints. | Rejected for v1 |
| S3 backend + native S3 lockfiles | Current Terraform S3 backend pattern, good if AWS is already used. | Requires Terraform CLI support for `use_lockfile`. | Accepted |
| S3 backend + DynamoDB lock | Older standard AWS pattern. | DynamoDB locking is deprecated by Terraform's S3 backend. | Rejected |
| Local state | Fastest to start. | Not acceptable for shared production infra. | Not preferred |

Decision:

- Use an AWS S3 backend for Terraform state.
- Use native S3 lockfiles for Terraform state locking.
- Do not use local state for shared or production infrastructure.
- Do not add HCP Terraform/Terraform Cloud for v1.
- Treat Terraform state as secret-bearing because Terraform may manage SSM and Vercel secret values.
- Enable S3 block public access, encryption, and versioning for the state bucket.
- Restrict state bucket access to the minimum human and CI principals needed.

Bootstrap note:

- The S3 state bucket must be created before the main Terraform configuration can use it as a backend.
- Use a small bootstrap step/configuration, then switch the main `infra/terraform/environments/*` configurations to the remote backend.

Reason:

- We already use AWS for Lightsail, so S3 avoids adding another state platform.
- Native S3 lockfiles keep the backend durable while avoiding the deprecated DynamoDB locking path.

### Decision 32: Terraform Execution

Question: should Terraform apply run locally or from GitHub Actions?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Local Terraform apply with remote state | Run `terraform plan/apply` from the operator machine while using S3 remote state and native S3 lockfiles. | Simpler credential model for one engineer, fewer CI secrets, still has shared remote state safety. | Less CI audit trail; depends on operator discipline. | Accepted |
| GitHub Actions plan/apply with approval | Run Terraform from CI with protected production apply. | Repeatable runner, CI audit trail, useful for teams. | Requires broad cloud credentials in CI and more workflow setup. | Rejected for v1 |
| Mixed local and CI apply | Allow both local and CI applies. | Flexible. | Process drift and unclear source of operational truth. | Rejected |

Decision:

- Run Terraform `plan` and `apply` locally for v1.
- Always use S3 remote state and native S3 lockfiles.
- Never use local state for production or QA infrastructure.
- GitHub Actions may run `terraform fmt` / `terraform validate` later, but must not apply infrastructure in v1.
- Revisit GitHub Actions apply if another engineer joins or infra changes become frequent.

Reason:

- There is one engineer/operator plus Codex assistance.
- Infra changes should be infrequent.
- Keeping broad provider credentials out of CI is simpler and safer for v1.
- Remote state and locking provide the important safety properties even with local execution.

### Decision 33: Terraform State Bootstrap

Question: how should the S3 state bucket be created?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Bootstrap Terraform config | Use a small `infra/terraform/bootstrap` config with local state to create the S3 state bucket, then use remote state for real environments. | Repeatable, versioned, standard pattern, avoids manual console drift. | One small bootstrap local state file must be handled carefully. | Accepted |
| Manual AWS console/CLI setup | Create bucket/table manually. | Quick once. | Less reproducible and easier to drift. | Rejected |
| Main Terraform creates its own backend | Try to create backend resources from the same config that uses them. | None meaningful. | Backend must exist before it can be used reliably. | Rejected |

Decision:

- Add `infra/terraform/bootstrap` for Terraform backend bootstrap resources.
- Use local state only for this bootstrap config.
- Bootstrap creates the S3 state bucket.
- Main `prod` and `qa` environment configs use the S3 backend and native S3 lockfiles from the start.
- Keep bootstrap state secure and do not use it for application/provider resources.

Reason:

- Terraform backends need to exist before normal environment state can use them.
- A tiny bootstrap config is more repeatable than manual console setup.
- Local state is acceptable only for this initial backend bootstrap boundary.

### Decision 34: Terraform And Provider Version Pinning

Question: should Terraform CLI and provider versions be pinned?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Strict version pinning | Pin Terraform CLI and provider version ranges in each root module. | Predictable applies, safer upgrades, standard practice for production IaC. | Requires intentional upgrade work. | Accepted |
| Loose latest-compatible versions | Allow broad latest versions. | Less maintenance. | Unexpected provider behavior can affect infra applies. | Rejected |

Decision:

- Pin the Terraform CLI version with `required_version`.
- Pin provider version ranges with `required_providers`.
- Commit `.terraform.lock.hcl`.
- Upgrade Terraform/providers intentionally in separate changes.

Reason:

- This setup uses multiple providers: AWS, Cloudflare, Upstash, Vercel, and likely Neon.
- Provider behavior changes can affect production infrastructure.
- Pinning versions is normal production Terraform practice.

### Decision 35: Terraform Variable Files

Question: should environment `tfvars` files be committed?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Commit non-secret tfvars only | Commit environment configuration values that are safe for Git, and keep secret values out of committed files. | Clear reviewable config, reproducible non-secret setup, safer default. | Secret values need a separate input path during apply. | Accepted |
| Commit all tfvars including secrets | Put every variable in Git. | Fully reproducible. | Unsafe; secrets in Git history. | Rejected |
| Commit no tfvars | Keep all values local/untracked. | Avoids accidental committed secrets. | Less reviewable and easier to drift. | Rejected |

Decision:

- Commit non-secret environment tfvars.
- Never commit secret values in tfvars.
- Provide `.tfvars.example` files where useful.
- Secret values may be supplied locally during apply or through another approved secure input path.
- Even when Terraform manages secret values, they must not enter Git.

Reason:

- Non-secret config belongs in version control for review and reproducibility.
- Git history is not an acceptable place for secrets.

### Decision 36: Terraform Formatting And Validation

Question: should Terraform formatting and validation be required?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Require `terraform fmt` and `terraform validate` | All Terraform code must format and validate before apply/merge. | Standard Terraform hygiene, catches syntax/provider issues early. | Requires Terraform init/provider availability for validation. | Accepted |
| No formal requirement | Run commands ad hoc. | Less setup. | Easier to commit broken Terraform. | Rejected |

Decision:

- Require `terraform fmt` for all Terraform code.
- Require `terraform validate` for root modules before apply.
- Add repo scripts for Terraform formatting/validation during implementation.
- GitHub Actions may run Terraform format/validate later without apply permissions.

Reason:

- Formatting and validation are standard Terraform quality gates.
- They catch low-cost mistakes before touching infrastructure.

### Decision 37: Domain Layout

Question: what hostname layout should production and QA use?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Service-separated subdomains | Use `www`, `api`, `admin`, `media`, `qa`, `qa-api`, and `qa-admin`. | Clear ownership, safer CORS/cache/security policies, easier migration/debugging. | More DNS records. | Accepted |
| Path-based backend/admin | Put API/admin under storefront paths such as `/api` or `/admin`. | Fewer hostnames. | Couples storefront and backend routing; makes Cloudflare Access/cache/CORS boundaries less clean. | Rejected |
| Single QA hostname for all QA surfaces | Route all QA through one hostname. | Fewer records. | Less explicit and weaker isolation between QA storefront/API/admin behavior. | Rejected |

Decision:

```txt
brand.com            redirect to www.brand.com
www.brand.com        production storefront on Vercel

api.brand.com        production Medusa API on Lightsail/Caddy
admin.brand.com      production Medusa Admin on Lightsail/Caddy + Cloudflare Access
media.brand.com      Cloudflare R2 public media domain

qa.brand.com         QA storefront
qa-api.brand.com     QA Medusa API
qa-admin.brand.com   QA Medusa Admin
```

Reason:

- Separate hostnames keep storefront, API, admin, and media security/cache/CORS policies clean.
- `admin.brand.com` can have Cloudflare Access without affecting storefront/API.
- `media.brand.com` can follow R2/CDN behavior without API cache risk.
- API/admin can move away from Lightsail later without changing storefront/media hostnames.

### Decision 38: Web Analytics

Question: what web analytics should v1 use?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Cloudflare Web Analytics | Use Cloudflare's lightweight web analytics for v1 traffic/performance visibility. | Free/lightweight, fits Cloudflare stack, tracks visits/page views/performance/referrers/devices/countries/browsers/OS. | Not full product analytics, funnels, revenue attribution, or identity analytics. | Accepted |
| Umami Cloud later | Add Umami if custom events/funnels become necessary. | Lightweight and has a free tier for small usage. | Extra script/tool; not needed for launch. | Later option |
| Plausible | Paid privacy-first web analytics. | Strong simple dashboards. | Paid and unnecessary for v1. | Rejected for v1 |
| GA4 | Google Analytics. | Powerful and free. | More complexity/noise; current project avoids Google Analytics. | Rejected |
| PostHog/heavy product analytics | Full product analytics. | Powerful funnels/events/replays. | Too heavy for v1. | Rejected |

Decision:

- Use Cloudflare Web Analytics as the only web analytics tool for v1.
- Use Medusa Admin, Razorpay, Resend, and Better Stack for commerce/payment/email/uptime/log/error visibility.
- Do not add GA4, Meta pixels, PostHog, Plausible, or Umami for launch.
- Revisit Umami Cloud if custom events or lightweight funnel visibility becomes necessary.

Reason:

- Cloudflare Web Analytics gives enough launch-level website visibility with minimal setup.
- It covers visits, page views, page load time, Core Web Vitals, referrers, countries, device type, browser, and OS.
- Ecommerce truth should remain in Medusa/Razorpay rather than a heavy web analytics system.

### Decision 39: Search Infrastructure

Question: should v1 infrastructure include a dedicated search provider?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Defer dedicated search infrastructure | Do not provision Algolia/Typesense/Meilisearch in the initial infra build; keep search integration modular. | No launch cost, avoids adding another provider immediately, keeps v1 infra smaller. | Search quality is limited until a dedicated provider is added. | Accepted |
| Algolia now | Add Algolia from the start using free/included tier and guardrails. | Best hosted ecommerce search quality with no fixed cost initially. | Usage overage risk and another provider during launch. | Later option |
| Self-host Typesense/Meilisearch now | Run open-source search on existing infrastructure. | Strong search without SaaS fee. | Adds another production service to operate. | Rejected for v1 |
| Typesense/Meilisearch Cloud now | Managed search cluster. | Strong search and low ops. | Adds fixed/likely monthly cost. | Rejected for v1 |

Decision:

- Do not provision dedicated search infrastructure in the initial infra build.
- Keep search code modular so Algolia can be added later without scattering search provider calls through UI components.
- Prefer Algolia later if best-in-class search is still desired and free/included usage guardrails are acceptable.
- Keep Postgres/Medusa-native search as the launch fallback.

Reason:

- Best-in-class search is desirable, but not required for the first infra setup.
- Deferring avoids provider/cost surface while the rest of the production stack is being established.
- A modular search boundary keeps the later Algolia addition clean.

### Decision 40: Razorpay Terraform Scope

Question: should Razorpay setup be managed by Terraform?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Manual Razorpay dashboard setup | Configure Razorpay keys, webhook URLs, capture settings, and live/test mode in Razorpay Dashboard; store app references/secrets in SSM/Vercel config. | Matches payment-provider operational model, avoids brittle IaC around payments, keeps human verification explicit. | Manual checklist discipline required. | Accepted |
| Terraform-managed Razorpay | Try to manage Razorpay configuration through Terraform/provider/API. | More IaC coverage if provider is mature. | Not worth the risk/complexity for payment operations in v1. | Rejected |

Decision:

- Keep Razorpay account/dashboard setup outside Terraform.
- Manage Razorpay app config values and secrets through approved runtime config stores.
- Keep QA/test and production/live Razorpay keys and webhook secrets separate.
- Verify webhook URLs and automatic capture manually before launch.

Reason:

- Payment configuration is high-risk and benefits from explicit dashboard verification.
- The app needs Razorpay config values, but Terraform does not need to own Razorpay operational setup.

### Decision 41: R2 Terraform Scope

Question: should Terraform manage R2 credentials as well as R2 bucket/domain resources?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Terraform bucket/domain, manual R2 S3 credentials | Terraform manages R2 bucket/settings/DNS/custom domain where supported; R2 S3 access key/secret are created manually and stored in SSM. | Automates stable infra while avoiding brittle credential generation; keeps access secrets in central secret store. | One manual credential-creation step and rotation runbook needed. | Accepted |
| Terraform everything including R2 credentials | Attempt to create all R2 credentials/tokens via Terraform. | More complete automation. | R2 S3 credential creation is less cleanly first-class; secret values and API-token permissions add fragility. | Rejected for v1 |
| Manual R2 entirely | Create bucket/domain/credentials in dashboard. | Simple once. | More drift and less IaC coverage than needed. | Rejected |

Decision:

- Terraform manages the Cloudflare R2 bucket and supported bucket settings.
- Terraform manages media DNS/custom-domain records where provider support is reliable.
- R2 S3 access credentials are created manually in Cloudflare and stored in AWS SSM Parameter Store as `SecureString`.
- Document R2 credential rotation.

Reason:

- R2 bucket and DNS are durable infrastructure and fit Terraform well.
- R2 S3 access credentials are security-sensitive and less cleanly Terraformable than the bucket itself.
- A one-time manual credential step is acceptable when the resulting values are centrally stored in SSM.

### Decision 42: Cloudflare Access Terraform Scope

Question: should Terraform manage Cloudflare Access for production admin?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Terraform-managed Cloudflare Access | Manage the Access app and policies for `admin.brand.com` through Terraform. | Durable security policy in IaC, reviewable changes, consistent with Cloudflare DNS/proxy Terraform scope. | Requires correct Cloudflare Zero Trust account/team configuration and careful policy review. | Accepted |
| Manual Cloudflare Access setup | Configure Access in the dashboard. | Fast initial setup. | Security policy drift and less reviewability. | Rejected |

Decision:

- Terraform manages the Cloudflare Access application for `admin.brand.com`.
- Terraform manages the Access policies for allowed admin identities.
- Medusa Admin auth remains enabled behind Cloudflare Access.
- Review Access policy changes before apply.

Reason:

- Admin access policy is durable security infrastructure.
- Managing Access in Terraform reduces dashboard drift.
- Cloudflare is already the DNS/proxy/security boundary for admin.

### Decision 43: Cloudflare WAF And Rate Limiting

Question: should launch include Cloudflare WAF/rate-limit rules?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Conservative Cloudflare security baseline | Enable free/baseline managed protections and only safe custom/rate-limit rules; observe before aggressive blocking. | Free/low-cost protection without likely checkout/API breakage. | Less aggressive against abuse at launch. | Accepted |
| Aggressive WAF/rate limits/Bot Fight Mode at launch | Turn on broad bot fighting and strong API limits immediately. | More immediate protection. | Can challenge or block checkout, payment callbacks, admin, or Store API traffic. | Rejected for launch |
| No custom security beyond proxy | Rely only on proxy/DDoS baseline. | Least risk of false positives. | Misses low-cost protection available in Cloudflare. | Rejected |

Decision:

- Enable Cloudflare Free Managed Ruleset / baseline WAF protections where available.
- Manage safe Cloudflare security rules through Terraform where provider support is reliable.
- Add conservative API rate limiting only if the free plan supports it cleanly.
- Prefer log/simulate mode first when available.
- Do not enable Bot Fight Mode globally at launch.
- Do not add aggressive country blocks or broad API challenges at launch.
- Revisit stronger rules after observing traffic or abuse.

Reason:

- Cloudflare has useful free/low-cost WAF/DDoS/security features.
- Checkout, payment webhooks, Store API, and admin flows are sensitive to false positives.
- Conservative launch security gives protection without risking customer/payment breakage.

### Decision 44: Cloudflare Turnstile For Public Forms

Question: should public forms use CAPTCHA/spam protection?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Cloudflare Turnstile | Use Turnstile widgets on public forms and verify tokens server-side. | Free/low-cost, fits Cloudflare stack, avoids Google reCAPTCHA, Terraform support. | Requires app integration and server-side verification. | Accepted |
| Google reCAPTCHA | Use Google's CAPTCHA product. | Widely known. | Not aligned with privacy/lightweight direction; more Google surface. | Rejected |
| No CAPTCHA initially | Add protection only after spam appears. | Less implementation work. | Public forms are exposed to spam from launch. | Rejected |

Decision:

- Use Cloudflare Turnstile for public forms.
- Manage Turnstile widgets through Terraform where provider support is stable.
- Use Managed mode by default.
- Verify Turnstile tokens server-side before accepting form submissions.
- Use separate QA and production Turnstile config.

Applies to:

- Contact form.
- Newsletter form if enabled.
- Any support/request form.
- Any future unauthenticated write action exposed to the public.

Reason:

- The storefront will have public forms.
- Turnstile is the cleanest fit with the existing Cloudflare stack.
- Server-side verification is required; client widget rendering alone is not protection.

### Decision 45: GitHub Repository Terraform Scope

Question: should Terraform manage GitHub repository settings, environments, and secrets?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Manual GitHub repo setup | Configure GitHub repo settings, branch protection, environments, and Actions secrets manually. | Simple for one engineer, avoids Terraform managing its own execution context. | Requires checklist discipline. | Accepted |
| Terraform-managed GitHub repo settings | Use GitHub provider for repo settings/environments/secrets. | More IaC coverage. | Awkward for bootstrapping CI/secrets and not needed for v1. | Rejected |

Decision:

- Keep GitHub repository settings manual for v1.
- Keep GitHub Actions environments and secrets manual for v1.
- Document required repo settings/secrets in launch/deploy docs.
- Revisit Terraform-managed GitHub only if team/process grows.

Reason:

- There is one engineer/operator.
- GitHub configuration changes should be infrequent.
- Avoiding Terraform for GitHub reduces bootstrap complexity.

### Decision 46: Deployment Triggers

Question: how should QA and production deploys be triggered?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Manual QA and production storefront dispatch | `dev` pushes run CI only; QA deploys are manual workflow dispatch. Production storefront deploys from `main` are manual workflow dispatch/approval. Production Medusa deploy is added later after compute/runtime approval. | Keeps deploys intentional and avoids slow deploy/watch cycles while preserving CI feedback. | QA feedback requires an explicit deploy step. | Accepted |
| QA auto from `dev`, production manual dispatch | `dev` pushes can deploy QA; production deploys from `main` require manual workflow dispatch/approval. | Fast QA feedback, controlled production releases. | Creates deploy overhead during active setup. | Rejected |
| Production auto on `main` push | Every push/merge to `main` deploys production. | Fully automated. | Too risky for checkout/order/payment backend in v1. | Rejected |
| Fully manual QA and prod | No automatic deploys. | Maximum control. | Slower QA feedback. | Rejected |

Decision:

- QA deploys are manual workflow dispatch from `dev`.
- Production storefront deploys are manual workflow dispatch for v1.
- Production Medusa deploy remains deferred until production compute and full runtime config are explicitly approved.
- Development work can push directly to `dev`; production releases go through PR merge into `main`.
- Production migrations keep their explicit approval gate.
- Revisit automatic production deploy only after production stability and rollback confidence improve.

Reason:

- Production Medusa deploys affect checkout, orders, payment callbacks, and admin operations.
- Manual dispatch is the right control point for one-operator v1 production.
- Manual QA deploys avoid unnecessary deployment churn while infrastructure and application setup are still changing quickly.

### Decision 47: CI Checks Before Deploy

Question: what checks should run before deploy?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Lean required checks | Run only lint/format, typecheck, and production builds that are practical for changed apps before deploy. | Catches real breakage without overbuilding CI. | Less coverage than a full test/security matrix. | Accepted |
| Heavy CI suite | Add broad security scans, dependency audits, E2E suites, and many matrix jobs immediately. | More coverage. | Slower, noisier, and likely overkill for v1. | Rejected |
| Minimal/no checks | Deploy with little automated validation. | Fastest. | Too risky for checkout/order/payment app. | Rejected |

Decision:

- Require lean CI checks before deploy.
- Run formatting/linting where configured.
- Run typecheck for changed apps/packages where practical.
- Run production build for storefront and Medusa before their deploys.
- Add Terraform `fmt`/`validate` when Terraform code exists.
- Do not add heavy/fancy checks unless they catch a real current risk.

Reason:

- The goal is useful confidence, not pipeline complexity.
- Checkout/order/payment paths need basic build/type safety before deploy.

### Decision 48: Environments

Question: should Terraform model QA and production separately?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Separate environment directories | Use `infra/terraform/environments/prod` and `infra/terraform/environments/qa`. | Explicit, reviewable, less workspace confusion, clear variables/state per environment. | Some duplication, managed through shared modules. | Accepted |
| Terraform workspaces | One configuration with workspace-selected state. | Less duplicated configuration. | Easier to apply to the wrong environment; less obvious in review. | Rejected for v1 |
| Single environment only | Manage only production with Terraform. | Simplest short term. | Does not model QA resources cleanly. | Rejected |

Decision:

- Use separate Terraform environment directories for `prod` and `qa`.
- Use shared modules for reusable infrastructure logic.
- Keep state separate per environment.
- Never share database, Redis, Razorpay, JWT, cookie, or webhook secrets between QA and production.
- Preview/staging resources should be cheaper and allowed to be stopped when not in use.

Reason:

- Separate directories make reviews and applies more explicit.
- Separate state reduces accidental QA/prod coupling.
- Workspaces are not worth the footgun risk for this small setup.

## Provider Capability Checks Needed

Before finalizing, verify current official docs for:

- AWS Lightsail instance types, region availability, static IP, firewall, snapshots, and Terraform provider support.
- Neon Terraform/provider/API support, branching support, pooled connection behavior, backups/restore, and region availability.
- Upstash Terraform/provider/API support, Redis protocol URL behavior, region availability, and pricing.
- Cloudflare Terraform provider support for R2 buckets, custom domains, DNS, and Web Analytics where applicable.
- Vercel Terraform/provider/API support for project env vars, domains, and deployment settings.
- Resend domain verification, API key handling, and Terraform/API support where useful.
- SES domain verification, sandbox exit process, SMTP credentials, and Terraform support only if revisited later.

## Decisions Not Yet Made
