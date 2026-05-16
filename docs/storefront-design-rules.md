# Storefront Design Rules

Status: working rules for storefront implementation
Last reviewed: 2026-05-16

These rules distill the design research into build-time guardrails. Use them before changing storefront UI.

## Brand Position

- Modern premium boutique, not marketplace, fast fashion, or cold luxury.
- Product direction is girls / young women's western occasion and fancy wear.
- Prioritize newness, visual appeal, size confidence, and low-friction shopping.
- Keep the storefront product-led. Copy supports products; it does not replace them.

## Visual System

- Use a clean near-white / espresso / clean red / neutral taupe palette.
- Product photography must dominate the page.
- Use the clean red accent sparingly for primary action and brand moments, not broad decorative backgrounds or tinted page surfaces.
- Maintain strong text contrast. Do not use pale beige or grey for important text.
- Use Instrument Serif for brand/editorial headings and Geist for UI/body unless we intentionally test another approved pairing.
- Use consistent image ratios: product cards `4:5`, editorial blocks `3:4`, larger story images `5:4` or theme-specific ratios.

## UX Priorities

- Homepage hierarchy: hero image, strong headline, CTA, new arrivals, curated edits, size/trust support.
- Product card hierarchy: image, product name, price, color/short note.
- PDP hierarchy later: image gallery, name, price, size, size guide, add to bag, fit/fabric/care, delivery/returns.
- Size guidance must stay close to size selection and add-to-bag flows.
- Keep mobile layouts first-class; fashion browsing will often start on mobile.

## Anti-Generic Rules

- No gradient blobs, orbs, bokeh backgrounds, glass cards, or SaaS dashboard styling.
- No fake luxury filler copy such as "timeless elegance" or "elevate your wardrobe".
- No fake reviews or social proof.
- No generic AI assistant UI. If AI is added later, it must be scoped to shopping tasks like sizing, styling, or order help.
- No decorative complexity that competes with product imagery.
- No emojis as icons or placeholders.

## Implementation Rules

- Use Tailwind v4 tokens and shadcn CLI-installed local components.
- Install shadcn components before composing equivalent primitives by hand.
- Customize shadcn components locally through tokens, variants, and Tailwind utilities.
- Keep CSS in global/token files only unless a specific CSS feature demands otherwise.
- Keep Medusa data access inside `apps/storefront/src/lib/medusa`.
- Fetch commerce/catalog data through Medusa helpers, not directly inside reusable UI components.
- Product names, prices, descriptions, images, categories, product-led homepage selections, and product-specific size chart data must come from Medusa.
- Product-specific size charts are read from `product.metadata.size_chart` with `unit`, `note`, `columns`, and `rows`; the storefront renders this data but does not define measurement values.
- Do not use substitute commerce or product fallback data. Use empty, loading, and error states when Medusa data is unavailable.
- Review UI with desktop and mobile screenshots before accepting significant storefront changes.
