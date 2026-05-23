# Infrastructure And Terraform Decisions

Status: discussion draft
Last reviewed: 2026-05-23

This document tracks the infrastructure and Terraform decisions before changing the canonical architecture docs or adding infrastructure code.

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

The first accepted change is:

- Production Medusa compute moves to AWS Lightsail 4 GB in Singapore.
- Durable state must remain external to the app host.
- Production database, Redis, email, and Terraform scope are still undecided.

## Raw Research Proposal

The raw research proposes:

- Storefront: Vercel Pro.
- Backend compute: AWS Lightsail 4 GB in Singapore.
- Database: Neon Postgres Launch in Singapore.
- Redis: Upstash in Singapore or Mumbai.
- Media: Cloudflare R2.
- Email: AWS SES in the raw proposal, but Resend is accepted for v1.
- CI/CD: GitHub Actions.
- QA/staging: Neon branch plus a second Medusa container on the same Lightsail instance.
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
| Render Singapore | Managed app host for Medusa while keeping data external. | Better deploy ergonomics and less VM maintenance than Lightsail. | Higher baseline cost; still needs external DB/cache decision. | Open |

Decision:

- Use AWS Lightsail 4 GB in Singapore for production Medusa compute.
- Keep Medusa stateless at the app tier: no production Postgres, Redis, uploaded media, or other durable state on the Lightsail disk.
- Use Dockerized Medusa so the app can move later if needed.
- Accept that the first production app tier is single-instance and may have short app-layer outages.
- Terraform and Codex can reduce setup toil, but they do not remove ownership of OS patching, Caddy config, Docker runtime, log access, deploy rollback, monitoring, SSH hardening, and host recovery.

Reason:

- Lightsail best matches the current cost/control tradeoff if durable state is external.
- Render is the cleaner low-ops alternative, but its cost is materially higher.
- Fly.io is technically strong, but its multi-region strengths are not the first problem for this Medusa backend.
- Railway remains credible for app hosting, but production compute is now intentionally moving away from Railway.

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

### Decision 3: Production Redis

Question: where should Medusa production Redis live?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Upstash Redis | External managed Redis-compatible service in Singapore. | Low operational burden, colocates with Medusa compute, portable Redis URL, pay-as-you-go start. | Command pricing and Medusa workload behavior need monitoring. | Accepted |
| Railway Redis | Use Railway only as an external Redis provider. | Familiar from the original plan. | Less clean now that compute is no longer on Railway; production responsibility, backups, and HA posture need verification. | Open but weak |
| Self-hosted Redis | Run Redis on the app VM. | Cheapest and simple for one host. | Coupled failure with app host; not ideal for workflow/event reliability. | Open but weak |

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

- Start with controlled Docker Compose deploys from GitHub Actions.
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
| Shared Lightsail compute, separate data | Run QA containers on the same Lightsail instance only during active testing, with separate Neon branch, Redis, secrets, and payment keys. | Lowest cost, simple, enough for lightweight internal QA. | QA can compete with production for CPU/RAM/disk/network if left running or load-tested. | Accepted |
| Separate QA Lightsail instance | Run QA on its own small VM. | Better compute isolation. | Adds another monthly Lightsail cost; stopped Lightsail instances still accrue charges until deleted. | Rejected for v1 |
| Managed temporary QA host | Use a platform host for QA only. | Cleaner isolation and possible easier start/stop. | Adds provider/deploy complexity and cost. | Rejected for v1 |

Decision:

- Run QA/staging Medusa on the same Lightsail instance initially.
- Keep QA containers stopped by default.
- Start QA containers only during active test windows.
- QA must use a separate Neon branch/database, separate Redis, separate secrets, and Razorpay test keys.
- QA must not share production Redis, JWT/cookie secrets, webhook secrets, or payment credentials.
- Move QA to separate compute if QA starts affecting production resources or if always-on QA becomes necessary.

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

### Decision 15: Lightsail Runtime Secret Injection

Question: how should production Medusa secrets get onto the Lightsail host?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| GitHub Actions writes env files from environment secrets | Store secrets in GitHub environments and write `.env.prod` / `.env.qa` to Lightsail during deploy over SSH. | Repeatable, auditable deploy path, no secrets in Git or Terraform, simple for v1. | Secrets pass through CI runtime and SSH; workflow permissions must be tight. | Accepted |
| Manual env files on server | SSH and edit `.env.prod` manually. | Simple first setup. | Easy to drift, less auditable, harder to recreate. | Rejected for v1 |
| AWS Secrets Manager/SSM | Store secrets in AWS and fetch at deploy/runtime. | Strong AWS-native secret management. | More setup and integration complexity for v1. | Rejected for v1 |

Decision:

- Store production and QA runtime secrets in GitHub environment secrets.
- Use GitHub Actions to write runtime env files onto Lightsail during deploy.
- Keep env files out of Git and Terraform.
- Use GitHub environment protection/approval for production.
- Restrict workflow permissions and SSH key scope.
- Set restrictive file permissions on generated env files on the server.

Reason:

- This keeps v1 secret handling repeatable without adding AWS Secrets Manager/SSM complexity.
- GitHub Actions already owns deploys, so env-file generation belongs in the deployment workflow rather than Terraform.
- Production approvals provide a useful control point for secrets and deploys.

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
- Keep live secrets out of bootstrap scripts.
- Keep app deployments in GitHub Actions, not bootstrap.

Reason:

- Server bootstrap needs to be repeatable and debuggable.
- Cloud-init is useful, but too opaque for this first VPS setup.
- Separating Terraform provisioning, host bootstrap, and app deployment keeps responsibilities clear.

### Decision 17: Observability And Alerts

Question: what monitoring and alerting should v1 use?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Better Stack + Sentry + server logs | Use Better Stack for uptime/alerts, Sentry for app errors, and local Docker/Caddy logs for server investigation. | Simple, useful free/low-cost starting point, alerts on downtime and code errors, no self-hosted observability burden. | Free tiers and commercial-use terms must be verified before launch; not a full metrics platform. | Accepted |
| UptimeRobot free + logs | Use UptimeRobot free checks and server logs. | Simple. | UptimeRobot free plan is not ideal for a commercial ecommerce site; weaker app error visibility. | Rejected |
| Grafana Cloud/Prometheus/Loki | Full metrics/logs/dashboard stack. | Powerful and extensible. | More setup than v1 needs; easy to overbuild. | Rejected for v1 |
| Self-hosted observability on Lightsail | Run monitoring stack on the same VM. | No external observability vendor. | Bad failure model: monitoring can die with the app host. | Rejected |

Decision:

- Use Better Stack for uptime checks, alerts, and optional lightweight log collection.
- Use Sentry for storefront and Medusa application error tracking.
- Keep Docker and Caddy logs available locally on Lightsail for operational investigation.
- Do not set up Prometheus, Grafana, Loki, Datadog, or a self-hosted observability stack for v1.
- Verify Better Stack and Sentry current free-tier/commercial-use limits before production launch.

Initial checks:

- Storefront availability.
- Medusa API health endpoint.
- Admin/API hostname availability.
- SSL/domain expiry alerts where available.
- Optional worker heartbeat once a reliable heartbeat endpoint/job exists.

Reason:

- Uptime alerts and app exception tracking solve the immediate v1 operational need.
- Sentry answers "what code broke"; Better Stack answers "is the service reachable".
- Full metrics/log pipelines can be added later if incidents or traffic justify them.

### Decision 18: Lightsail Snapshots

Question: should production Lightsail automatic snapshots be enabled?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Enable production automatic snapshots | Lightsail takes automatic daily instance snapshots and keeps the recent automatic snapshot window. | Faster VM recovery from host corruption/misconfiguration/disk issues. | Snapshot storage has extra cost; not a substitute for Neon/R2/Upstash backups. | Accepted |
| No Lightsail snapshots | Rebuild host only from Terraform/bootstrap/deploy. | Lowest cost and cleanest immutable-infra discipline. | Slower recovery if host config needs to be reconstructed under pressure. | Rejected for production v1 |

Decision:

- Enable automatic Lightsail snapshots for the production instance.
- Treat snapshots as host recovery convenience only.
- Do not treat Lightsail snapshots as database, Redis, media, or application-release backups.
- Do not accumulate manual snapshots casually.
- Review snapshot storage cost after the first month.
- QA has no separate snapshot decision while it shares production compute and remains disposable.

Reason:

- The source of truth remains external: Neon, Upstash, R2, GHCR, Terraform, and bootstrap scripts.
- Snapshots still reduce recovery time if the VM itself is corrupted or misconfigured.
- The expected initial cost should be low, but it is not zero.

### Decision 19: Production Admin Protection

Question: should production Medusa Admin be protected by Cloudflare Access?

Options:

| Option | What it means | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Cloudflare Access in front of admin | Require Cloudflare Access identity gate before `admin.brand.com`, then Medusa Admin auth behind it. | Strong extra protection, no shared basic-auth password, aligns with Cloudflare DNS. | Adds setup and possible access friction for admin users. | Accepted |
| Caddy basic auth | Add HTTP basic auth at the origin proxy. | Simple and origin-local. | Shared credentials are easy to mishandle; weaker admin-user lifecycle. | Fallback only |
| Medusa auth only | Expose Medusa Admin directly over HTTPS. | Simplest. | Only one auth layer for production admin. | Rejected |

Decision:

- Use Cloudflare Access in front of production Medusa Admin.
- Keep Medusa Admin authentication enabled behind Cloudflare Access.
- Do not rely on Caddy basic auth unless Cloudflare Access is not ready.
- Use separate admin user accounts; no shared Medusa admin passwords.

Reason:

- Admin is a high-risk production surface.
- Cloudflare Access gives a clean outer identity gate without managing a shared proxy password.
- The project already uses Cloudflare DNS, so Access fits the chosen platform boundary.

## Round 1: Terraform Setup

### Decision 20: IaC Tool

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

### Decision 21: Terraform Scope

Question: what should Terraform own in v1?

Options:

| Scope | Owns | Does not own | Status |
| --- | --- | --- | --- |
| Minimal IaC | DNS records, R2 bucket, provider scaffolding, non-secret variables. | App server bootstrap, secrets, deployments. | Open |
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
- Vercel project/domain/non-secret configuration where provider support fits cleanly.
- Remote Terraform state resources after the state backend decision is made.

Terraform should own if provider support is reliable:

- Neon project, production branch/database/role, QA branch/database/role, and non-secret outputs.

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

### Decision 22: Terraform Directory Layout

Question: where should Terraform live?

Options:

| Option | Shape | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- | --- |
| Root `infra/terraform` | `infra/terraform/{environments,modules}` | Clear separation from apps; common pattern; leaves room for infra scripts/runbooks later. | More structure upfront. | Accepted |
| Root `terraform/` | `terraform/{envs,modules}` | Short path and obvious. | Slightly less aligned with broader infra docs if we later add scripts/runbooks. | Open |
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

### Decision 23: Terraform State Backend

Question: where should Terraform state live?

Options:

| Option | Pros | Risks / tradeoffs | Status |
| --- | --- | --- | --- |
| Terraform Cloud / HCP Terraform | Managed remote state, locking, team-friendly. | Another service/account and possible cost/plan constraints. | Rejected for v1 |
| S3 backend + DynamoDB lock | Standard AWS pattern, good if AWS is already used. | More AWS resources and bootstrap steps. | Accepted |
| Local state | Fastest to start. | Not acceptable for shared production infra. | Not preferred |

Decision:

- Use an AWS S3 backend for Terraform state.
- Use DynamoDB for Terraform state locking.
- Do not use local state for shared or production infrastructure.
- Do not add HCP Terraform/Terraform Cloud for v1.

Bootstrap note:

- The S3 state bucket and DynamoDB lock table must be created before the main Terraform configuration can use them as a backend.
- Use a small bootstrap step/configuration, then switch the main `infra/terraform/environments/*` configurations to the remote backend.

Reason:

- We already use AWS for Lightsail, so S3/DynamoDB avoids adding another state platform.
- S3 remote state with DynamoDB locking is a standard, durable Terraform backend pattern.

### Decision 24: Environments

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
