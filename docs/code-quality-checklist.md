# Code Quality Checklist

Status: canonical review checklist
Last reviewed: 2026-05-23

Use this checklist before substantial refactors, feature work, and launch-readiness reviews.

## Review Order

1. Storefront structure and UI layering.
2. Storefront styling, tokens, accessibility, and browser behavior.
3. Storefront data access and client/server boundaries.
4. Medusa backend modules, workflows, routes, and configuration.
5. Documentation, commands, and operational clarity.

## Storefront Rules

- Keep route files focused on routing, metadata, and server data orchestration.
- Move reusable page sections into `components/content`, `components/site`, or feature view components.
- Keep commerce/domain behavior in `features/*`.
- Keep Medusa access in `lib/medusa`; Client Components must receive typed props or call Server Actions.
- Do not import Medusa helpers into Client Components except as type-only imports.
- Keep `"use client"` files narrow and interaction-focused.
- Use `useEffect` only for external synchronization: focus, timers, browser storage, subscriptions, scripts, or third-party widgets.
- Avoid `dynamic = "force-dynamic"` unless cookies, request data, or uncached per-request commerce state makes it necessary.
- Use React Hook Form and Zod for customer input forms.
- Use Zustand only for client UI state, not Medusa product, cart, order, or payment source-of-truth data.

## Component Rules

- Shared primitives live in `components/ui` and are installed with shadcn CLI when available.
- Direct `@base-ui/react` imports are allowed only inside `components/ui/*`.
- Feature and page components consume local shadcn/Base-UI-backed primitives, not Base UI directly.
- Do not rebuild common accessible primitives already covered by shadcn, Base UI, Vaul, or native HTML.
- Presentational components should receive typed data and callbacks; they should not fetch commerce data.
- Use lucide icons through direct named imports only.

## Tailwind And Tokens

- Use Tailwind CSS v4 utilities backed by `globals.css` theme tokens.
- Use semantic tokens such as `bg-background`, `text-foreground`, `border-border`, `bg-muted`, `text-muted-foreground`, `bg-primary`, and `text-destructive`.
- Do not add one-off hex, rgb, hsl, or oklch values in components.
- Keep raw color values in token files or metadata/icon generation files only.
- Arbitrary values are allowed for layout constraints, exact aspect ratios, CSS functions, and typography clamps when a named token would be less clear.
- Avoid arbitrary color, shadow, blur, gradient, and decorative background utilities in components.
- Prefer `rounded-none`, `rounded-sm`, `rounded-md`, or token-backed shadcn radii. Avoid large decorative rounding unless the component pattern requires it.
- Run `pnpm --dir apps/storefront lint`, `pnpm --dir apps/storefront lint:tailwind`, `pnpm --dir apps/storefront typecheck`, and `pnpm --dir apps/storefront build` after styling or UI changes.
- `lint:tailwind` blocks raw colors, arbitrary color utilities, and gradient utilities outside explicit token/metadata files.

## Backend Rules

- Medusa remains the commerce source of truth.
- Keep custom behavior in Medusa modules, providers, workflows, subscribers, and routes.
- Do not patch Medusa core or duplicate commerce tables.
- Keep integration configuration centralized in backend config helpers.
- Do not read `process.env` throughout backend business logic; use config helpers or module options.
- Validate module/provider options at startup and fail fast with clear `MedusaError` messages.
- Runtime integration failures should log operational context without secrets.
- Keep route handlers thin: validate input, load config, call integration/client, return a clear response.
- Keep workflow transforms deterministic and avoid hidden external I/O inside transforms.
- Avoid casual `any`; prefer small local types for vendor payloads.

## Verification Gates

- Storefront: lint, typecheck, production build, desktop/mobile browser check for changed UI.
- Backend: typecheck, Medusa build, unit tests for touched integrations.
- Payment work: Razorpay signature and order/payment state tests.
- Email work: template render smoke test or provider unit test when practical.
- Docs: update canonical docs when a rule, decision, command, or structure changes.
