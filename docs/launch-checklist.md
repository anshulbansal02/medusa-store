# Launch Checklist

Status: v1 manual launch checklist
Last reviewed: 2026-05-15

This checklist is intentionally lightweight. There is no written test suite for v1, so manual checks must be disciplined.

## Build And Code

- TypeScript check passes.
- Lint/format check passes.
- Production build passes.
- No obvious console errors on key pages.
- `.env.example` files are current.
- Real secrets are not committed.
- `dev` and `main` branches are protected.
- `dev` deploys to QA.
- `main` deploys to production.

## Storefront UX

- Home page checked on mobile and desktop.
- Collection page checked on mobile and desktop.
- Product page checked on mobile and desktop.
- Search checked on mobile and desktop.
- Cart drawer checked on mobile and desktop.
- Cart page checked on mobile and desktop.
- Checkout checked on mobile and desktop.
- Empty/loading/error states checked where practical.
- Product image lightbox/zoom works.
- Mobile sticky add-to-cart works.
- Related products render correctly.
- Text does not overflow or overlap.
- Design does not look generic AI/LLM-generated.

## Commerce Flow

- Product catalog loads from Medusa.
- Size/color variants display correctly.
- Unavailable variants are clear.
- Add to cart works.
- Quantity updates/removal work.
- Guest checkout works.
- Razorpay test success works.
- Razorpay failure/retry path is understandable.
- Order confirmation page works.
- Order appears correctly in Medusa Admin.
- No COD option appears in v1.

## Payments

- Razorpay keys are separated for QA/prod.
- Razorpay signature verification is implemented server-side.
- Payment failure does not create a misleading paid order.
- Payment success maps to correct order state.
- No payment secrets are exposed to the browser.

## Email

- Resend domain is verified before production launch.
- SPF/DKIM/DMARC configured where required.
- Order confirmation email sends.
- Owner new-order notification sends if enabled.
- Shipping/tracking email sends if implemented.
- Emails do not expose internal/debug data.

## Shipping And Fulfillment

- Shipping method/rules are visible in checkout.
- Manual fulfillment/tracking workflow is documented for the business team.
- Tracking number/status can be added manually if used.
- Customer shipping/tracking communication works if implemented.
- No Shiprocket/Delhivery API integration is expected in v1.

## Content And Policy

- About page present.
- Contact page present.
- Size guide present.
- Shipping policy present.
- Returns/exchanges policy page present.
- Refund/cancellation policy present.
- Terms and conditions present.
- Privacy policy present.
- Returns/exchanges copy is configurable if final terms are not known.
- GST/tax invoice details are not overbuilt; templates leave room for future GST details.

## SEO And Metadata

- Product metadata exists.
- Collection metadata exists.
- Canonical URLs exist.
- Open Graph metadata exists.
- Product JSON-LD exists.
- Sitemap exists.
- Robots file exists.
- Favicons exist.
- Apple touch icon exists.
- Web manifest exists.
- Theme color is set.

## Performance

- Product images use stable dimensions/aspect ratio.
- Product-card images use 4:5 display ratio.
- Below-the-fold images lazy-load.
- No unnecessary heavy third-party scripts.
- Lighthouse mobile performance target is checked where practical.
- Bundle size is reviewed before launch.

## Accessibility

- Header navigation is keyboard usable.
- Mobile menu is keyboard usable.
- Search overlay is keyboard usable.
- Cart drawer is keyboard usable.
- Filters are keyboard usable.
- Checkout forms have labels.
- Focus states are visible.
- Form errors are clear.
- Color contrast checked.
- Product image alt text is reasonable where practical.

## Security

- HTTPS configured for all public domains.
- Medusa Admin has strong credentials.
- No shared admin passwords.
- CORS restricted to known origins.
- Production secrets are only in Vercel/Railway secret stores.
- QA/prod secrets are separate.
- No secrets in logs.
- R2 tokens are least-privilege.
- Postgres backups enabled.
- Restore process understood at a basic level.
- Cloudflare Access for admin added if simple.
- Cloudflare Turnstile added only if public form protection is needed.

## Analytics And Visibility

- Cloudflare Web Analytics enabled.
- No Google Analytics.
- No Meta/ads pixels.
- No customer/payment/order data sent to analytics.
- Railway/Vercel logs accessible.
- Razorpay dashboard accessible.
- Resend dashboard accessible.
- Medusa Admin order visibility confirmed.

## Production Cutover

- Domain DNS records configured.
- `www` points to production storefront.
- Apex/root redirects to `www`.
- Admin/API subdomains configured if used.
- Media domain configured if used.
- QA and production URLs are distinct.
- Production smoke test completed after deploy.
