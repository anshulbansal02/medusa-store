# Engineering Standards

Status: canonical v1 engineering standards
Last reviewed: 2026-05-23

## Principles

- Keep the system simple, modular, and standard.
- Use existing commerce modules; do not invent commerce logic.
- Prefer boring, maintainable code over clever abstractions.
- Keep AI-assisted development constrained by explicit conventions.
- Security, performance, accessibility, and SEO are baseline requirements.

## Repository

Use one repository without heavy monorepo tooling.

```txt
apps/
  storefront/
  medusa/

docs/
  README.md
  design-workshop.md
  architecture.md
  storefront-experience.md
  engineering-standards.md
  implementation-plan.md
  launch-checklist.md
```

Rules:

- Avoid Turborepo/Nx unless clearly needed later.
- Use pnpm.
- Commit lockfile.
- Do not create shared packages prematurely.
- Duplicated config is acceptable if it keeps setup simple.
- Use simple conventional commit messages, but do not add commit tooling yet.
- Add `.editorconfig` during setup.

## Runtime

- Target Node.js 24 LTS for local development and deployments.
- Record the runtime in repo-level `.nvmrc`, `.node-version`, and `package.json` engines during setup.
- Use Corepack-managed pnpm through the root `packageManager` field.
- Pin the exact pnpm version selected during setup.
- Avoid global installs unless required by a platform or official scaffold command.
- For Medusa container builds that point to `apps/medusa`, keep pnpm trust policy (`minimumReleaseAge`, `allowBuilds`) available in that install context so build-script approval is applied consistently.
- Keep workspace-level `pnpm-workspace.yaml` for monorepo package graph policy and `minimumReleaseAge` consistency.

## Scaffolding

Use official CLIs for framework scaffolding.

Rules:

- Scaffold the storefront with `create-next-app`.
- Scaffold the Medusa backend with `create-medusa-app`.
- Use Biome for the storefront scaffold when the Next.js CLI offers a linter choice.
- Use the `src/` directory option for the storefront scaffold.
- Use the default Next.js `@/*` import alias for the storefront.
- Place the generated Medusa backend app at `apps/medusa` in this repo.
- If `create-medusa-app` generates `apps/backend`, moving it to `apps/medusa` is allowed scaffold cleanup.
- Use latest stable tooling at setup time.
- Do not hand-create framework internals that the official CLIs should own.
- Clean up generated starter files after scaffolding.
- Skip Medusa's optional Next.js Starter Storefront because this project uses a custom storefront UI.

## Storefront Structure

```txt
apps/storefront/app/          routes, layouts, metadata
apps/storefront/components/   reusable UI components
apps/storefront/features/     product, collection, cart, checkout, search
apps/storefront/lib/medusa/   Medusa API/data access
apps/storefront/lib/config/   site/nav/policy config
apps/storefront/lib/utils/    small utilities
apps/storefront/styles/       global styles/tokens
```

Preferred component structure:

```txt
apps/storefront/src/components/ui/       shadcn CLI-installed local components
apps/storefront/src/components/layout/   header, footer, container, section
apps/storefront/src/features/            commerce/domain UI and behavior
apps/storefront/src/lib/utils/           small utilities such as cn()
```

Rules:

- Keep Medusa access inside `lib/medusa`.
- Mark the Medusa data layer as server-only so it cannot be imported into Client Components by accident.
- Keep product/cart/checkout behavior inside feature modules.
- Keep components presentational unless they intentionally own interaction state.
- Keep `"use client"` boundaries small.
- Do not add `"use client"` to pages, layouts, or broad feature shells just to make one nested control interactive.
- Prefer Server Components for catalog, product, order, policy, SEO, and layout rendering.
- Use Client Components only for state, event handlers, browser APIs, lifecycle effects, form libraries, client stores, or third-party widgets that require the browser.
- Keep effects for synchronizing with external systems such as timers, focus management, browser storage, scripts, subscriptions, or non-React widgets.
- Do not use `useEffect` to derive render data, handle user events, or mirror props into state when the value can be calculated during render.
- Use server rendering for product/collection data where practical.
- Use typed data contracts at API boundaries.
- Avoid random API calls inside components.
- Keep `dynamic = "force-dynamic"` as an explicit exception for routes that truly need it; do not use it as a default.
- Keep UI components local to the storefront; do not create a shared UI package yet.
- Do not invent interactive/accessibility primitives.
- Install shared UI primitives from shadcn with the shadcn CLI when shadcn provides a suitable component.
- Customize installed shadcn local components through variants, tokens, and Tailwind utilities instead of forking ad hoc copies.
- Do not hand-roll components that shadcn already provides.
- If shadcn does not provide a suitable component, compose a local component with the same style pattern using Base UI, Vaul, or another established accessible primitive.
- Keep direct `@base-ui/react` imports inside `components/ui/*`; feature and page components should consume local UI primitives.
- Compose non-interactive layout/content components from semantic HTML and design-token-backed Tailwind utilities.
- Use a local `cn()` helper based on `clsx` and `tailwind-merge`.

## Storefront Styling

Use Tailwind CSS v4 utilities backed by design tokens.

Rules:

- Keep CSS in global/token files only.
- Do not add component-level CSS files.
- Do not add custom CSS classes unless a CSS feature cannot be expressed cleanly with Tailwind utilities or tokens.
- Prefer semantic design tokens over one-off literal values.
- Do not use raw color values or arbitrary color utilities in components. Raw colors belong in token files or metadata/icon generation files.
- Arbitrary values are acceptable for exact layout constraints, aspect ratios, and CSS functions only.
- Do not use arbitrary text-size utilities. Add a named Tailwind v4 text token in `globals.css` instead.
- Run `pnpm --dir apps/storefront lint:tailwind` to block raw colors, arbitrary color utilities, arbitrary text sizes, and gradient utilities outside explicit token/metadata files.
- Keep theming configurable in the same spirit as shadcn-style CSS variables.
- Do not add dark mode tokens for v1.
- Use proper SVG/icon-library icons; do not use emoji as UI icons or placeholders unless explicitly requested.
- Use `lucide-react` as the primary UI icon library.
- Use outline icons that inherit `currentColor`, with consistent stroke width around `1.5` to `1.75`.
- Do not import the whole icon library namespace or use dynamic icon imports.
- Use official SVG assets for brand, payment, and social logos instead of UI icon libraries.

## Storefront Content

- Keep editable brand, page, empty-state, and support copy in `apps/storefront/src/content/*`.
- Keep page structure, routing, and data orchestration in App Router files and feature views.
- Do not show setup, backend, environment, launch-draft, or implementation wording to customers.
- Model content as typed objects so a future CMS adapter can replace the source without rewriting page components.

## Preferred Libraries

Use these where they fit:

- TypeScript.
- React 19.
- Next.js latest stable at setup time.
- Tailwind CSS v4 if compatible.
- `@base-ui/react`.
- shadcn CLI-installed local components.
- Zod.
- React Hook Form.
- Zustand.
- TanStack Query only where useful.
- date-fns.
- clsx.
- cva.
- tailwind-merge.
- ky where a small HTTP client is useful.

Do not use TanStack Router for the storefront because Next.js App Router is the router.

## State Management

Use Zustand for global client-side state.

Good Zustand use:

- Cart drawer UI state.
- Search overlay state.
- Local wishlist.
- Recently viewed products.
- Small global UI state.

Avoid Zustand for:

- Product/catalog server data.
- Orders as source of truth.
- Payment state as source of truth.
- Medusa commerce state.

Use URL state for filters, sort, and search where appropriate.

Use TanStack Query only where client-side async caching/retry behavior is clearly useful.

## Forms

Use React Hook Form + Zod.

Use for:

- Checkout contact/address.
- Newsletter signup.
- Contact form.
- Track order lookup.
- Webhook payload validation where useful.

Rules:

- Keep schemas close to the feature.
- Share schemas only when it meaningfully reduces duplication.
- Show clear inline errors.
- Preserve entered data.

## Linting And Formatting

Use Biome as the default linting and formatting tool for application code.

Rules:

- Use the official Next.js CLI Biome option for the storefront scaffold.
- Add ESLint only if a framework integration requires checks that Biome does not cover well.
- Do not let Biome, Prettier, and ESLint overlap on formatting.
- Keep scripts simple:
  - `dev:storefront`
  - `dev:medusa`
  - `build:storefront`
  - `build:medusa`
  - `typecheck`
  - `lint`
  - `format` or `format:check`
  - `build`

## TypeScript

- Enable `strict: true`.
- Avoid casual `any`.
- Validate external/API data at boundaries where needed.
- Keep Medusa API helper functions typed.
- Keep types pragmatic; avoid type gymnastics.
- Let official app scaffolds generate their own TypeScript configs first.
- Do not add a root `tsconfig.base.json` until there is real shared compiler config value.

## Testing

No written test suite for v1.

Required checks:

- Typecheck.
- Lint/format.
- Production build.
- Light CI where it is useful for deployments and build verification.
- Avoid excessive CI jobs that waste hosted limits.
- Manual browser testing.
- Manual mobile/desktop visual review.
- Manual checkout/payment/email smoke testing.

Use Playwright MCP for manual browser verification. Do not add a committed Playwright/Vitest suite unless a specific need appears later.

## Performance

Performance is first-class.

Targets:

- Lighthouse mobile performance target: 85+ where practical.
- Product and collection pages should feel fast.
- Keep JavaScript bundle small.
- Avoid unnecessary client components.
- Avoid heavy animation libraries.
- Avoid unnecessary third-party scripts.
- Optimize images and use stable dimensions.
- Lazy-load below-the-fold images.

Guardrails:

- Use `next/image` or a clear CDN/image-loader strategy.
- Keep `"use client"` boundaries small.
- Review bundle size before launch.
- Do not accept visually polished but slow pages.

## Accessibility

- Use semantic HTML.
- Build menus, dialogs, cart, search, filters, and overlays from local shadcn-style primitives backed by Base UI or another established accessible primitive.
- Do not invent custom accessibility primitives unless necessary.
- Prefer native semantics before ARIA.
- Ensure keyboard navigation works.
- Keep focus states visible.
- Label forms correctly.
- Check color contrast.

## Security

Security is non-negotiable.

Required:

- Follow [Secrets And Config](secrets-and-config.md) for environment variables, hosted config, and secret rotation.
- No secrets in code.
- No real `.env` files committed.
- `.env.example` documents required variables.
- QA/prod secrets separate.
- `NEXT_PUBLIC_*` only for browser-safe values.
- Razorpay signatures verified server-side.
- Webhooks verified where possible.
- CORS locked to known origins.
- Admin protected with Cloudflare Access plus strong Medusa Admin credentials.
- No sensitive data in logs.
- Postgres backups enabled.
- Least-privilege R2/S3 tokens.

Required:

- Cloudflare Turnstile for public forms.

## Backend Customization

Use Medusa core as-is.

Allowed customizations:

- Razorpay payment provider/module.
- Future fulfillment provider/module.
- R2/S3 file provider configuration.
- Email/notification integration.
- Small custom module only if needed, such as newsletter capture.

Rules:

- Do not patch Medusa core.
- Do not duplicate commerce tables outside Medusa.
- Do not build custom cart/order/payment logic.
- Keep integrations isolated and documented.
- Preserve upgrade path.
- Centralize backend environment/config reads in a config helper or in Medusa module options; avoid direct `process.env` reads in route, workflow, subscriber, and provider logic.
- Provider option validation should fail fast with clear errors.
- Runtime integration failures should log context without secrets and return safe customer-facing messages.

## Migrations And Seeds

- Use Medusa migration/module conventions.
- Keep custom tables/modules minimal.
- Add seed data for QA/local if needed.
- Keep production data separate from QA/local data.
- Do not manually patch production database as a normal workflow.
- Document one-off operational fixes.

## Local Development

Keep setup simple and agent-friendly.

- pnpm scripts for common tasks.
- Clear README.
- `.env.example` files.
- Obvious app boundaries.
- No hidden setup steps.
- Use Docker Compose for local Postgres and Redis from day one.
- Run Next.js and Medusa directly with pnpm on the host during local development.
- Do not containerize application servers for local development unless there is a clear need later.
- Keep Docker Compose scoped to local development; production services are managed by hosted infrastructure.
- Run local UI apps through portless to avoid port collisions and give agents stable URLs:
  - Storefront UI: `http://storefront.localhost`.
- Use plain HTTP and the default `.localhost` TLD for portless commands in this repo.
- Do not hard-code local UI app ports. Portless assigns random internal app ports.
- Run Medusa directly as the API server on fixed nonstandard local port `29181`.
- Optional Medusa Admin alias is `http://medusa.localhost` via `pnpm medusa:admin:alias`; keep storefront API calls pointed at `http://localhost:29181`.
- Use fixed nonstandard local host ports only for Docker services:
  - Postgres host port: `25433`.
  - Redis host port: `26380`.
- Do not move local app development to common ports such as `3000`, `4000`, `8000`, `8080`, or `9000`.

## Dependency Updates

- Use latest stable versions at setup time.
- Configure `minimumReleaseAge: 4320` in `pnpm-workspace.yaml` so package versions must be at least 3 days old before pnpm installs them.
- Keep `minimumReleaseAgeStrict` enabled so installs fail instead of silently bypassing the age gate.
- Use pnpm v11 `allowBuilds` in `pnpm-workspace.yaml` for reviewed dependency lifecycle scripts; do not use removed `onlyBuiltDependencies` settings.
- Use `minimumReleaseAgeExclude` only for explicit, reviewed exceptions.
- Do not disable pnpm's default transitive exotic dependency blocking.
- Avoid experimental packages unless strongly justified.
- Review release notes before major upgrades.
- Do not auto-upgrade critical commerce dependencies blindly.
- Do not pin forever without maintenance.

## AI-Assisted Development

Create and maintain `AGENTS.md`.

Future agents should follow:

- Project structure.
- Medusa data access rules.
- Storefront UX/design rules.
- Security rules.
- Performance/accessibility/SEO expectations.
- Commands to run.
- Files/areas to avoid editing casually.
