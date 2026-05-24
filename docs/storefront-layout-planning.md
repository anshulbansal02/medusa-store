# Storefront Layout And Page Planning

Status: planning recommendation
Last reviewed: 2026-05-24

This document records the storefront page and layout planning discussion for the current design pass. It is intentionally focused on information architecture and page layout, not visual styling tokens, brand palette, or typography.

## Decision Summary

Do not collapse the storefront into a single-page shop. Instead, make `/shop` the primary browsing surface and keep only meaningful category, product, checkout, support, and legal routes around it.

The recommended structure is:

```txt
Home
Shop
  All / New Arrivals
  Dresses
  Sets
  Tops
  Occasion Edit, only if it has real merchandising value
Product Detail
Search
Bag
Checkout
Order Confirmation
Support / Policy pages
```

This keeps the customer journey simple without weakening product discovery, SEO, mobile navigation, or trust.

## Why Not One Shop Page Only

The instinct behind one strong shop page is correct: the current catalog is small, around 20-25 products, and the brand should feel curated rather than like a marketplace. A heavy category tree would make the store feel larger than it is and would likely create repeated pages with nearly identical grids.

But a literal one-page shop has real drawbacks:

- Customers still need product detail pages for imagery, fit, fabric, size, delivery, returns, and add-to-bag confidence.
- Category and collection URLs are useful when they match how customers shop: dresses, sets, tops, occasion.
- Mobile users benefit from visible top-level product categories instead of having everything hidden behind a generic shop link.
- Search results and filtered category pages should be shareable and understandable.
- Support and legal pages are part of trust, especially for a new premium fashion brand.

The better principle is: one primary browsing system, not one literal page.

## Research Findings

### Product Lists Matter More Than Page Count

Baymard's product list and filtering research says product lists, filters, and sorting determine how easy it is for users to browse a catalog and get from category/search results to product pages. Their research reports that weak product list usability can sharply increase abandonment, while better product list tooling improves product-finding success.

Implication for this storefront:

- Invest layout effort into the PLP, not into many bespoke collection pages.
- The PLP must combine strong product imagery, useful filters, sorting, clear product count, and easy transitions to PDPs.
- The shop page should feel like the main product-finding tool, not just a static gallery.

Source: Baymard Product Lists UX, https://baymard.com/research/ecommerce-product-lists

### Category Pages And PLPs Have Different Jobs

Baymard distinguishes category pages, product listing pages, and collection pages:

- Category page: navigation hub.
- Product listing page: browsable/filterable product grid.
- Collection page: curated editorial grouping.

For this catalog size, separate category hub pages are unnecessary. The store does not need an intermediate "Dresses" landing page before showing dresses. The category should take users directly into a filtered PLP.

Implication:

- `/shop/dresses` should render the same shop layout with Dresses selected.
- `/shop/sets` should render the same shop layout with Sets selected.
- A future editorial collection can exist only if it has distinct content and merchandising, not just a renamed product grid.

Source: Baymard Category Pages, https://baymard.com/learn/ecommerce-category-page

### Mobile Navigation Should Expose Categories

Baymard's mobile navigation research says mobile users rely on the main navigation to understand the catalog and begin browsing. Hiding categories under a generic shop item can add friction, especially when users are unfamiliar with the store.

Implication:

- Mobile menu should expose `New Arrivals`, `Dresses`, `Sets`, `Tops`, and selected edits directly.
- The desktop header can stay restrained, but should not hide the entire catalog behind abstract labels.
- With a small catalog, a top-level `Shop` or `New Arrivals` link is fine, but the category labels should still be immediately visible somewhere prominent.

Source: Baymard Mobile Category Navigation, https://baymard.com/blog/main-navigation-product-categories

### Search Should Feed The Same Product-Finding Model

Baymard search research emphasizes that search users often need category-like results, filters, and relevant product lists, not just text matching.

Implication:

- Keep `/search` for full results and shareable URLs.
- The search results page should eventually use the same grid/filter/sort system as `/shop`.
- Header search dialog can stay as a fast entry point, but it should not be the only search experience.

Source: Baymard Ecommerce Search UX, https://baymard.com/blog/ecommerce-search-query-types

## Existing Project Findings

Current storefront routes:

```txt
/
/shop
/shop/[handle]
/search
/wishlist
/bag
/cart -> redirects to /bag
/checkout
/order-confirmation/[id]
/about
/contact
/size-guide
/shipping
/returns
/refund-cancellation
/faq
/track-order
/terms
/privacy
```

Current implementation details that matter:

- `/shop` already behaves like a primary catalog page.
- `/shop/[handle]` currently resolves both product detail pages and category pages.
- Header nav is generated from product categories plus the main `New Arrivals` shop link.
- Mobile menu already exposes category links at the top level, which matches research guidance.
- `/search` currently does simple server-side filtering over fetched products.
- `/cart` redirects to `/bag`, which is good.
- Support/legal pages exist and mostly match the canonical storefront docs.

The core issue is not the number of route files. The issue is whether customers experience too many different browsing page types.

## Recommended Information Architecture

### 1. Home

Keep as a distinct page.

Purpose:

- Establish brand mood.
- Show current drop.
- Give fast paths into the shop.
- Provide premium trust and fit confidence.

Layout direction:

- Product-led hero.
- New arrivals grid or rail.
- Category entry points.
- One curated editorial block.
- Fit / shipping / returns trust strip.
- Avoid turning home into a long generic landing page.

Do not:

- Make home a duplicate of `/shop`.
- Add many marketing sections before products.
- Use fake editorial copy without product relevance.

### 2. Shop / New Arrivals

Make `/shop` the primary product listing page.

Purpose:

- Browse all active products.
- Default to new arrivals / current edit.
- Provide filtering and sorting without marketplace heaviness.

Recommended controls:

- Category: All, Dresses, Sets, Tops, Occasion.
- Size: clear apparel sizes from available variants.
- Color: only if product color data is reliable.
- Price: simple bands, not a complex range slider for v1.
- Availability: in stock / available sizes, only if data is reliable.
- Sort: Newest, Price low-high, Price high-low.

Layout direction:

- Compact heading, not oversized editorial hero on every visit.
- Filter/sort bar near product count.
- Desktop: gallery-like 3-column or 4-column grid depending image density.
- Mobile: 2-column grid with a sticky or near-top filter/sort trigger.
- Applied filters visible and removable.
- Product cards remain image-first.

Do not:

- Build a bulky sidebar that makes the boutique feel like a marketplace.
- Create many independent category page templates.
- Add filters that are not backed by reliable Medusa product/variant data.

### 3. Category PLPs

Keep only meaningful category URLs, but render them through the same PLP shell.

Recommended URLs:

```txt
/shop/dresses
/shop/sets
/shop/tops
/shop/occasion-edit
```

Purpose:

- Direct navigation.
- SEO and shareable entry points.
- Cleaner customer intent than asking everyone to start from All.

Layout direction:

- Same controls and grid as `/shop`.
- Category selected by default.
- Short category copy only if it is specific and useful.
- "View all" or clear category action.

Decision rule:

- Keep a category page only if there are enough products or business intent to justify it.
- If a category has 1-2 products, keep it as a filter option but consider hiding it from primary nav.

### 4. Editorial Collections

Treat editorial collections differently from product categories.

Examples:

```txt
/shop/occasion-edit
/shop/first-drop
/shop/wedding-guest
```

Use only when there is a curated reason:

- Campaign/drop.
- Occasion styling.
- Seasonal edit.
- Homepage story block.

Do not create editorial collection pages just to increase page count. If the page is only a title plus the same grid, it should be a filter state instead.

### 5. Product Detail Pages

Keep product detail pages separate and strong.

Purpose:

- Convert interest into add-to-bag.
- Answer fit, size, fabric, care, delivery, and returns questions.
- Carry product SEO and structured data.

Layout direction:

- Large image gallery.
- Sticky product info and add-to-bag on desktop.
- Mobile image carousel first, then name/price/size/add-to-bag.
- Size guide near size selector.
- Fit/fabric/care details below or in compact sections.
- Related products from same category/edit.

Routing concern:

- Current `/shop/[handle]` handles both product and category handles.
- This is workable for v1, but it risks slug collisions.
- Preferred future route shape is:

```txt
/products/[handle]
/shop/[category]
```

If changing routes is too disruptive before launch, keep the current route but reserve category and product handles carefully.

### 6. Search

Keep `/search`, but align it with the PLP.

Purpose:

- Let users find products by name, category, color, and product notes.
- Provide shareable search results.
- Support users who prefer direct intent over browsing.

Layout direction:

- Search input at top.
- Result count.
- Same product grid as shop.
- Same filter/sort shell if feasible.
- Helpful empty state linking back to shop.

Do not:

- Make search visually unrelated to shop.
- Keep search as a completely separate browsing system long term.

### 7. Bag And Cart

Keep `/bag` as the real route. Keep `/cart` as a redirect only.

Purpose:

- Bag drawer supports quick shopping.
- Bag page supports review before checkout.
- Cart URL compatibility is useful, but it should not become a second page.

Layout direction:

- Drawer-first for quick review.
- Full bag page for item review and checkout path.
- No duplicate cart terminology in visible nav.

### 8. Checkout

Keep separate.

Purpose:

- Guest checkout.
- Address, shipping, and Razorpay payment.
- Operational correctness.

Layout direction:

- Calm, sectioned single-page checkout.
- No editorial distractions.
- Clear payment/security and shipping state.

### 9. Order Confirmation

Keep separate.

Purpose:

- Confirm payment/order state.
- Provide next steps and support.
- Avoid account dependency.

Layout direction:

- Clear order status.
- Payment/shipping summary.
- Support/contact link.
- Track order link only if tracking flow is reliable.

### 10. Wishlist

Keep if polished, but treat as optional.

Purpose:

- Lightweight customer convenience.
- Useful for fashion browsing if it is local and low maintenance.

Layout direction:

- Header icon is enough.
- Footer link is acceptable.
- Do not make wishlist a primary nav item unless analytics later proves usage.

### 11. Size Guide

Keep.

Purpose:

- Reduce apparel fit anxiety.
- Support premium price trust.
- Help reduce returns and support questions.

Layout direction:

- Standalone page plus PDP-level size chart access.
- Clear measurement instructions.
- Link from PDP size selector, footer, mobile support menu.

### 12. Shipping, Returns, Refund/Cancellation

Keep separate URLs, but use one consistent policy layout.

Purpose:

- Trust.
- Legal clarity.
- Payment gateway and operational expectations.

Layout direction:

- Same policy page template.
- Short summaries near product/bag/checkout.
- Full policy pages from footer and support nav.

Do not:

- Merge legal policies into one ambiguous page if the business needs separate links.
- Surface all policy pages as primary shopping navigation.

### 13. FAQ

Keep only if the content is real and non-duplicative.

Purpose:

- Answer common pre-purchase questions not covered elsewhere.

Decision rule:

- If FAQ mostly repeats shipping, returns, size, and contact pages, remove it from prominent navigation or defer it.
- If it covers real concerns like sizing help, order changes, exchange workflow, fabric care, or payment, keep it.

### 14. Track Order

Keep only if operationally reliable.

Purpose:

- Let guest customers check order status without an account.

Decision rule:

- If it works with Medusa order lookup and safe verification, keep it in support nav.
- If it is placeholder-like, hide it before launch.

### 15. About And Contact

Keep both.

Purpose:

- New-brand legitimacy.
- Customer support.
- Founder/brand clarity.

Layout direction:

- About should be concise and product/brand specific.
- Contact should prioritize WhatsApp/email and expected response behavior.
- Avoid generic luxury filler copy.

### 16. Terms And Privacy

Keep.

Purpose:

- Legal baseline.
- Payment and data trust.

Layout direction:

- Footer only.
- Plain policy template.

## Navigation Recommendation

### Desktop Header

Recommended:

```txt
New Arrivals
Dresses
Sets
Tops
Occasion Edit
Search
Wishlist icon
Bag
```

Keep the header restrained. Five shopping links is enough for v1.

### Mobile Menu

Recommended:

```txt
Search
New Arrivals
Dresses
Sets
Tops
Occasion Edit
Size Guide
Shipping
Returns
Track Order, only if reliable
Contact
```

This matches the current project direction and external mobile navigation research.

### Footer

Recommended:

```txt
Shop:
  New Arrivals
  Dresses
  Sets
  Tops
  Occasion Edit

Help:
  Contact
  Size Guide
  Shipping
  Returns
  FAQ, only if useful
  Track Order, only if reliable

Legal:
  Terms
  Privacy
  Refund/Cancellation
```

## Layout System Recommendation

The layout issue should be solved by shared page systems:

### Shared PLP Shell

Use for:

- `/shop`
- `/shop/[category]`
- `/search`, once search matures
- Editorial collection grids, if added

Core parts:

- Page heading and concise description.
- Product count.
- Filter/sort controls.
- Applied filters.
- Product grid.
- Empty state.
- Optional compact trust strip.

### Shared Policy Shell

Use for:

- Shipping.
- Returns.
- Refund/cancellation.
- Terms.
- Privacy.
- FAQ if it stays.

Core parts:

- Compact page title.
- Last updated / status if needed.
- Scannable sections.
- Contact/support CTA where relevant.

### Shared Support Shell

Use for:

- Contact.
- Track order.
- Size guide if it needs richer tools later.

Core parts:

- Clear task.
- Minimal explanatory copy.
- Form or action surface.
- Related help links.

## Filter Strategy

Filters must follow available data, not invented fashion logic.

V1 safe filters:

- Category from Medusa categories.
- Size from variants.
- Color from product metadata if already structured.
- Price sort from variant price.
- Availability from variant inventory if reliable.

V1 optional filters:

- Occasion, only if managed as product metadata or Medusa category/tag consistently.
- Product status such as New or Bestseller, only if real.

Avoid for v1:

- Complex style taxonomy.
- Fit personality filters.
- AI-style recommendations.
- Many nested filters.
- URL-indexed combinations for every filter value.

## SEO And URL Notes

Recommended indexable pages:

- Home.
- Shop.
- Primary category PLPs.
- Product pages.
- Core support/legal pages.

Be careful with:

- Arbitrary filter combinations.
- Search result pages.
- Empty or near-empty category pages.
- Duplicate collection pages with identical products and copy.

Principle:

- Index pages that represent real customer intent and unique content.
- Treat filter combinations as UX state unless they become real merchandising pages.

## Implementation Phases

### Phase 1: Planning And Route Cleanup

- Decide final primary categories for v1.
- Confirm whether `Occasion Edit` is a category, collection, or homepage-only block.
- Decide whether to keep `/shop/[handle]` for both products/categories until after launch.
- Remove or de-emphasize pages that are placeholders.

### Phase 2: Shared PLP Layout

- Build a reusable PLP shell.
- Apply it to `/shop`.
- Add category state and category links.
- Add product count, sort, and simple filter controls.
- Keep the visual style boutique, not marketplace.

### Phase 3: Category Routes

- Render category URLs through the same PLP shell.
- Add metadata/canonical handling.
- Guard against empty or low-value categories.
- Keep descriptions concise.

### Phase 4: Search Alignment

- Make `/search` reuse the product grid and filter/sort shell where practical.
- Keep search dialog as fast preview.
- Ensure empty states point back to useful browse paths.

### Phase 5: Support And Policy Consolidation

- Confirm which support pages are launch-worthy.
- Keep separate legal URLs.
- Use shared policy/support templates to reduce layout sprawl.
- Hide Track Order or FAQ from prominent nav if not genuinely useful.

### Phase 6: Visual QA

- Review desktop and mobile screenshots.
- Check the shop, a category page, search results, PDP, bag, checkout, and support pages.
- Confirm no overlapping text, generic dashboard look, or filter clutter.

## Open Questions

These need business or catalog decisions before implementation:

- What are the final v1 categories?
- Is `Occasion Edit` a stable category or a seasonal/editorial collection?
- Will color be structured enough to filter reliably?
- Will product metadata include occasion, fit notes, and size chart data consistently?
- Should Track Order launch, or stay hidden until order lookup is reliable?
- Does FAQ contain unique support answers, or should it be removed from visible nav?

## Recommendation For The Current Design Pass

Start with `/shop`.

The highest-impact layout improvement is not making a new page. It is turning `/shop` into a polished, reusable product listing system:

- Compact title area.
- Strong product grid.
- Mobile-friendly filters.
- Sort and product count.
- Category links that feel like filters, not separate pages.
- Same shell reused for category PLPs.

Once that is working, align `/search` and clean up support/legal layouts. This will make the storefront feel simpler to customers while keeping the route structure needed for commerce, trust, and SEO.

