# Storefront Experience

Status: canonical v1 storefront direction
Last reviewed: 2026-05-15

## Brand And Audience

- Store type: single-brand fashion storefront.
- Product direction: girls fashion, occasion/fancy western wear.
- Initial catalog: about 20-25 products.
- Price range: Rs. 5,000+.
- Positioning: mid-range premium with luxury/premium lean.
- Working audience: young women / young working women buying premium-looking western occasion/fancy wear.

## Visual Direction

Use a soft feminine premium + boutique editorial direction.

Design defaults:

- Elegant serif for selected headings.
- Clean sans-serif for body/UI.
- Brand-controlled light theme only.
- Tailwind CSS v4 design tokens for colors, typography, spacing, radius, and layout.
- Warm white / soft black base.
- One or two muted accents from brand colors.
- Spacious but not empty layouts.
- Large product imagery.
- Thin borders and restrained dividers.
- Refined product cards.
- Calm, polished forms and checkout.
- `lucide-react` outline icons for UI actions, inheriting `currentColor` with consistent refined stroke width.
- Official SVG assets for brand, payment, and social logos.
- No emoji icons unless explicitly requested.
- Subtle hover/image transitions only.

## Anti-Generic Design Rules

The storefront must not look like a generic AI/LLM-generated website.

Avoid:

- Purple/blue gradient SaaS heroes.
- Glassy blur cards.
- Floating gradient blobs, orbs, bokeh, decorative glows.
- Default shadcn dashboard aesthetics.
- Cards inside cards.
- Disconnected sections that look generated separately.
- Fake luxury copy.
- Emoji placeholders.
- Vague filler headlines.
- Over-animated hover effects.
- Decorative complexity instead of real product content.

Prefer:

- Real product photography.
- Brand assets and design references.
- Semantic design tokens instead of one-off CSS.
- Strong hierarchy.
- Useful content.
- Fewer, better sections.
- Screenshot review before accepting UI.

## Copywriting

Use real, specific, human copy.

Tone:

- Clear.
- Warm.
- Premium.
- Specific.
- Not overdramatic.

Avoid phrases like:

- "Elevate your wardrobe".
- "Timeless elegance".
- "Unmatched sophistication".

Buttons should be plain and useful:

- Add to cart.
- Shop new arrivals.
- Find your size.
- Checkout.

## Pages

Core shopping pages:

- Home.
- Shop / New Arrivals.
- Collection page.
- Product detail page.
- Search.
- Cart drawer/page.
- Checkout.
- Order confirmation.

Support/trust pages:

- About.
- Contact.
- Size guide.
- Shipping policy.
- Returns/exchanges policy.
- FAQ, optional.
- Track order, if practical.

Legal pages:

- Terms and conditions.
- Privacy policy.
- Refund/cancellation policy.
- Shipping policy.
- Returns/exchanges policy.

## Navigation

Desktop header:

```txt
New Arrivals
Dresses
Sets
Tops
Occasion Edit
Search
Account, optional
Cart
```

Mobile menu:

```txt
New Arrivals
Dresses
Sets
Tops
Occasion Edit
Bestsellers
Search
Size Guide
Shipping & Returns
Contact
```

Footer:

```txt
Shop:
  New Arrivals, Dresses, Sets, Tops, Occasion Edit

Help:
  Contact, Size Guide, Shipping, Returns, FAQ, Track Order if enabled

Legal:
  Terms, Privacy, Refund/Cancellation

Social:
  Instagram
```

## Homepage

Use a product-led homepage with premium editorial sections.

Recommended structure:

```txt
1. Hero
   Strong fashion image, short brand line, Shop New Arrivals CTA

2. New Arrivals
   Image-first product grid

3. Occasion Edit
   Visual collection section

4. Bestsellers
   Smaller product grid

5. Category tiles
   Dresses, Sets, Tops

6. Trust strip
   Secure payments, shipping, size support, policy summary

7. Brand/Instagram section
   Optional, only with strong visuals
```

Newness is a soft default, not a complex drop system.

## Product Detail Page

Must include:

- Large image gallery.
- 4-6 images where possible.
- Product image lightbox/zoom.
- Product name.
- Price and optional sale price.
- Short description.
- Color selector.
- Size selector.
- Size chart/size guide.
- Stock/unavailable variant state.
- Add to cart.
- Mobile sticky add-to-cart.
- Fabric.
- Fit.
- Care.
- Shipping/returns summary.
- Related products.

Optional if data exists:

- Model height/size.
- Product measurements.
- Fit note.
- Buy Now.

Rules:

- Do not make customers hunt for price, size, delivery/returns, or add-to-cart.
- Unavailable sizes/colors must be obvious.
- Do not show exact stock count by default.
- Show subtle low-stock/few-left hint only when meaningful.

Reference interaction patterns:

- Use a dedicated purchase panel structure: color, size, quantity, inline errors, add-to-cart, and trust notes close together.
- Keep a sticky mobile add-to-cart summary on product pages.
- Use an image gallery with thumbnails and a full-screen viewer rather than a static image wall.
- Use quick add, quick look, recently viewed, wishlist, and fit helpers only when they stay lightweight and do not duplicate Medusa commerce logic.

## Product Images

- Product-card display ratio: 4:5 vertical.
- Uploads do not need to be exactly 4:5, but should be close where possible.
- Use stable dimensions and avoid layout shift.
- Product detail gallery can show larger images with more detail.
- Editorial images can use theme-dependent ratios.

Minimum photo guidance:

- 4-6 photos per product where possible.
- Consistent crop/lighting.
- At least one full outfit/model shot if possible.
- One detail/fabric shot.

## Collection And Listing Pages

Collection pages should feel like curated fashion edits, not generic ecommerce grids.

Structure:

```txt
1. Compact editorial collection header.
2. Utility row: count, sort, filter.
3. Applied filter chips.
4. Premium image-first product grid.
5. Optional editorial insert on selected collections.
```

V1 filters:

- Size, prioritized.
- Color.
- Product type.
- Price range.
- Availability, optional.

Sort:

- Newest.
- Bestselling, if data exists.
- Price low to high.
- Price high to low.

Product card:

- Large stable image.
- Product name.
- Price and optional sale price.
- Subtle color swatches or color count if useful.
- Badges only if meaningful.
- Desktop hover can show second image.
- No quick add in v1.

## Cart And Checkout

Cart:

- Drawer-first.
- Full cart page also exists.
- Add to Cart opens cart drawer.
- Mobile drawer behaves like bottom sheet/full-screen panel.

Checkout:

- Guest-first.
- Sectioned single-page checkout.
- Contact.
- Shipping address.
- Shipping method.
- Payment.
- Review.
- Razorpay prepaid.

Rules:

- No required account before payment.
- Minimal fields.
- Clear order summary.
- Clear total, shipping, policies, and secure-payment messaging.
- Payment failure/retry path must be understandable.

## Search

V1 search should be fast, visual, and simple.

- Header search icon/button.
- Overlay/drawer/command-style panel.
- Search product names, collections, colors, and basic product text where available.
- Visual product results with image, name, price.
- Quick links when empty.
- Helpful no-results state.
- No Algolia/Meilisearch/Typesense in v1.

## Lightweight UX Enhancements

Must-have:

- Product image lightbox/zoom.
- Mobile sticky add-to-cart.
- Related products.

Nice if simple:

- Buy Now.
- Local wishlist.
- Recently viewed products.
- Product badges.
- Track Order page.
- Newsletter capture.
- Fit/model/product measurements.

Do not build if they become complex.

## Trust And Support

- Contact page and footer should include WhatsApp/contact link.
- Avoid loud floating WhatsApp button by default.
- Instagram link only; no live Instagram feed in v1.
- Returns/exchanges copy must stay configurable until final business policy is known.
- GST/tax invoice details are not visible unless business requirements are confirmed.

## Empty, Loading, And Error States

Required:

- Empty cart with action.
- Empty wishlist if wishlist exists.
- No search results with useful links.
- Product unavailable state.
- Checkout error with retry path.
- Payment failure with retry/support path.
- Skeletons or stable placeholders for loading.
- Inline, specific form errors.

## Accessibility

- Use semantic HTML and landmarks.
- Use Base UI or established primitives for complex interactions.
- Prefer native semantics before ARIA.
- Menus, dialogs, search, cart, filters, and checkout must be keyboard usable.
- Focus states must be visible.
- Forms need proper labels.
- Contrast must be checked.
- Product image alt text should be useful where practical.

## SEO And Metadata

V1 SEO:

- Product metadata.
- Collection metadata.
- Clean URLs.
- Canonical URLs.
- Open Graph images.
- Product JSON-LD.
- Sitemap.
- Robots.
- Favicons.
- Apple touch icon.
- Web manifest.
- Theme color.

No blog/content engine in v1.
