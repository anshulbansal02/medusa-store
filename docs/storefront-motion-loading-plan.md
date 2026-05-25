# Storefront Motion And Loading Plan

Status: planned storefront UX standard
Last reviewed: 2026-05-25

This document records the agreed direction for loading states, transitions,
animation, and perceived performance in the Neonfold storefront.

The goal is a fast, calm, premium ecommerce experience. Motion should make the
interface feel responsive and polished, not theatrical.

## Research Basis

- Next.js App Router prefetching should be the default smooth navigation layer.
  Next.js prefetches route assets and RSC payloads so client-side navigation can
  feel instant. Disable prefetch only where resource cost clearly outweighs UX
  value, such as low-priority footer/legal links.
  Source: https://nextjs.org/docs/app/guides/prefetching
- Next.js `experimental.viewTransition` is not recommended for production.
  Do not use it for v1 storefront page transitions.
  Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition
- Animate only compositing-friendly properties whenever possible: `opacity` and
  `transform`. Avoid animating layout-affecting properties such as `width`,
  `height`, `margin`, `padding`, `top`, `left`, and grid sizing.
  Source: https://web.dev/articles/animations-and-performance
- LCP and image loading matter more than decorative loading effects. Use
  `next/image`, correct `sizes`, stable aspect ratios, and eager/high-priority
  loading only for clear above-fold LCP images.
  Source: https://nextjs.org/docs/app/api-reference/components/image
- React 19 `useTransition` is appropriate for non-blocking UI updates and
  pending states when a client interaction needs immediate feedback.
  Source: https://react.dev/reference/react/useTransition

## Principles

- Prefer native Next.js, React, Tailwind CSS v4, shadcn, Base UI, Vaul, and
  existing installed libraries before adding new runtime dependencies.
- Keep motion CSS-first unless a specific interaction requires JavaScript
  orchestration.
- Keep route pages and broad shells as Server Components. Do not add `"use client"`
  to pages or layouts for motion.
- Do not hide core content behind animation. The first meaningful text and LCP
  image should render immediately.
- Respect `prefers-reduced-motion`.
- Do not use motion to disguise slow data access. Fix route prefetching, caching,
  streaming, image priority, and data boundaries first.
- Use design-token-backed Tailwind utilities. No raw colors, gradient effects, or
  component-level CSS files.

## Non-Goals

- No full-page animated route transitions for v1.
- No Next.js experimental View Transitions in production.
- No Lenis/smooth-scroll scroll hijacking.
- No GSAP, complex timeline libraries, parallax-heavy sections, or scroll-jacking.
- No pulsing skeletons across every page.
- No blur placeholders everywhere. Use blur only if real `blurDataURL` values are
  generated from final product images.
- No animation that causes layout shift or horizontal overflow.

## Navigation Plan

High-intent storefront links should allow default Next.js prefetching:

- Header nav.
- Mobile nav.
- Homepage CTAs.
- Product cards.
- Collection/category links.
- Search result links.
- Related product cards.
- Empty-state primary shopping actions.

Links that may keep `prefetch={false}`:

- Footer legal/support links.
- Low-intent policy links.
- External links.
- Links where prefetching creates known backend/resource cost.

Implementation rule: do not add custom route-loading dots or global route
progress bars until prefetching has been cleaned up and measured.

## Loading State Plan

Use route-level `loading.tsx` as a quiet fallback, not a dominant visual system.

Preferred loading states:

- Preserve the final page's spacing, max width, and image ratios.
- Use static muted blocks with no pulse by default.
- Keep the header and shared layout interactive.
- Show loading UI only where there is real waiting.
- Prefer local pending states for local actions instead of full-page loading.

Avoid:

- Spinners for full-page ecommerce content.
- Overly detailed skeleton wireframes.
- Large pulsing skeleton screens.
- Text skeletons that look like generic SaaS loading.
- Replacing an already visible page with a loading shell during minor updates.

Route loading variants:

- `page`: policy/support pages with a quiet heading/content placeholder.
- `catalog`: shop/collection/search pages with filter row and image-grid rhythm.
- `product`: PDP with image-gallery rhythm and product-info rhythm.

## Image Experience Plan

Images are the main product experience. Optimization should be visible as speed,
not as decoration.

Rules:

- Every `next/image` with `fill` must have accurate `sizes`.
- Every image region must have stable dimensions through aspect ratio or fixed
  container constraints.
- Use `loading="eager"` and `fetchPriority="high"` only for the clear first
  viewport LCP image.
- Lazy-load below-fold grid, related product, thumbnail, bag, and search images.
- Keep product hover image swaps subtle and compositing-friendly.
- Do not preload many images.
- Do not blur placeholders unless the product/media pipeline stores real blur
  metadata.

Future media pipeline:

- When R2 product media is final, consider generating tiny image placeholders at
  upload/import time and storing them in Medusa metadata.
- Consider Cloudflare Images only if transformation cost or Vercel image
  optimization usage becomes a real operational issue.

## Motion System

Use small CSS utilities in `globals.css`, backed by named timing values.

Recommended timing:

- Fast: `120ms`
- Base: `180ms`
- Slow: `260ms`

Recommended easing:

- Standard interaction: `ease-out`
- Premium reveal: `cubic-bezier(0.22, 1, 0.36, 1)`

Allowed properties:

- `opacity`
- `transform: translate/scale`
- Small color, background, and border transitions for controls

Avoid properties:

- `width`
- `height`
- `margin`
- `padding`
- `top`, `right`, `bottom`, `left`
- grid/flex layout dimensions
- box-shadow animations on large surfaces

Recommended utilities:

- `nf-reveal`: short opacity + small translate reveal.
- `nf-reveal-soft`: softer reveal for lower-priority sections.
- `nf-delay-1`, `nf-delay-2`: tiny stagger only where it improves scanning.
- `motion-reduce:animate-none` and `motion-reduce:transition-none` everywhere
  motion is applied.

## Where Motion Belongs

Use motion for:

- Product image hover and alternate-image reveal.
- Quick look modal open/close.
- Bag drawer open/close.
- Filter panel open/close.
- Toast entrance/exit.
- Wishlist heart press feedback.
- Add-to-bag pending/success feedback.
- Section reveals below the first viewport.
- Search overlay and result updates.
- Applied filter chip add/remove.

Use motion sparingly for:

- Homepage hero supporting copy and CTAs.
- Collection headings.
- PDP lower content such as details and related products.

Do not use motion for:

- Main LCP hero image entrance.
- Main product title/price delay on PDP.
- Full route page wrappers.
- Checkout form layout changes.
- Sticky header/logo.
- Anything that creates content flash before data is ready.

## Interaction Feedback Plan

Use local, immediate feedback instead of global loading indicators.

Cart:

- Add-to-bag button should enter a pending state immediately.
- Toast should be minimal, bottom-right for PDP, top-layer where required by
  modals.
- Bag drawer should preserve scroll and avoid mobile overflow.

Wishlist:

- Button should be snappy, no black flash, no size shift.
- Use optimistic UI where practical.

Filters and sort:

- Keep URL state as the source of truth.
- Use React transition/pending affordance only if route updates feel delayed.
- Applied chips should wrap cleanly and avoid layout jumps.

Search:

- Keep input stable.
- Use a small local pending state while results change.
- Avoid descriptions and side panels in result cards.
- Product images should be large enough to be useful.

Checkout/forms:

- Use inline pending states and disabled submit only where needed.
- Preserve entered data.
- Keep validation messages stable and avoid shifting large blocks.

## Library Policy

Use now:

- Tailwind CSS v4 utilities.
- `tw-animate-css` already installed for shadcn-style `animate-in`,
  `fade-in`, `slide-in`, and `zoom-in` utilities.
- shadcn/Base UI/Vaul state-based overlay animations.
- Embla through shadcn carousel for gallery/lightbox behavior.

Consider later only if needed:

- `motion/react-mini` for one isolated `Reveal` or `AnimateList` component if
  CSS utilities are not enough. Keep it behind a small Client Component boundary.
- `@formkit/auto-animate` only for dynamic list add/remove/reorder cases such as
  applied filter chips, wishlist items, or bag items. Do not apply globally.

Avoid:

- Full Motion page-transition architecture.
- GSAP.
- Lenis/smooth-scroll.
- Animation component libraries that replace shadcn/Base UI primitives.

## Implementation Order

1. Prefetch cleanup:
   remove unnecessary `prefetch={false}` from high-intent storefront links.
2. Loading state cleanup:
   keep one shared route-loading shell and make variants more final-layout
   accurate.
3. Motion token utilities:
   add small Tailwind v4-safe reveal utilities in `globals.css`.
4. Apply motion surgically:
   home sections, product cards, PDP lower content, filters, drawer, toast, and
   quick look only.
5. Interaction pending states:
   cart, wishlist, filters, search, checkout submit.
6. Image audit:
   verify `sizes`, eager/high priority, lazy loading, aspect ratios, carousel
   images, and absence of Next image warnings.
7. Measurement:
   run build and Playwright MCP checks on mobile and desktop.

## Verification Checklist

Before accepting motion/loading changes:

- `pnpm --dir apps/storefront lint`
- `pnpm --dir apps/storefront typecheck`
- `pnpm --dir apps/storefront lint:tailwind`
- `pnpm --dir apps/storefront build`
- Playwright MCP desktop and mobile screenshots.
- No horizontal overflow:
  `document.documentElement.scrollWidth <= document.documentElement.clientWidth`
- No console errors.
- No Next image LCP warnings on home and PDP.
- No active animations after page idle except intended overlays/toasts.
- Motion respects reduced-motion settings.
- No page content flash, delayed hero, or large layout shift.

## Open Follow-Up

- Decide whether to remove the unused shadcn `Skeleton` primitive if route
  loading no longer imports it.
- Decide whether filter chip and bag/wishlist item add/remove animations justify
  `@formkit/auto-animate`.
- Decide whether a small `Reveal` Client Component is useful after the CSS-first
  pass.
- Revisit blur placeholders only after final product media is stored in R2 and
  the upload/import pipeline can generate real placeholder metadata.
