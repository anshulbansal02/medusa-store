# Transactional Email Research

Status: implementation guidance for v1 order emails
Last reviewed: 2026-05-23

## Sources Checked

- React Email manual setup: `https://react.email/docs/getting-started/manual-setup`
- React Email render utility: `https://react.email/docs/utilities/render`
- React Email Resend integration: `https://react.email/docs/integrations/resend`
- React Email changelog: `https://react.email/docs/changelog`
- Resend send email API: `https://resend.com/docs/api-reference/emails/send-email`
- Resend React Email guide: `https://resend.com/docs/send-with-react-email`
- Postmark transactional email best-practices guide, 2026 update: `https://postmarkapp.com/guides/transactional-email-best-practices`

## Decisions

- Keep React Email independent from any provider.
- Keep delivery providers thin. Resend should send already-rendered `subject`, `html`, and `text`; it should not own template layout.
- Use `react-email` for runtime rendering and components.
- Use `@react-email/ui` only for local preview tooling.
- Keep preview files in `apps/medusa/emails` and production template code in `apps/medusa/src/email`.
- Generate plain text from rendered HTML with `toPlainText`.
- Use a provider-neutral metadata shape for headers, tags, and reply-to so SES or SendGrid can map the same rendered content later.
- Pass Resend idempotency keys from Medusa notification idempotency keys.
- Use a dedicated transactional sending subdomain, for example `mail.example.com` in public docs, to isolate email reputation from the apex domain while keeping the sender identity recognizable.
- Keep Resend open and click tracking disabled for admin invites and v1 transactional mail.
- Configure DKIM, return-path SPF/MX, and DMARC for the sending subdomain before enabling hosted sends.
- Use a DMARC quarantine policy with strict alignment on the dedicated transactional subdomain because only Resend should send as that subdomain.

## Design Rules

- Transactional emails must prioritize clarity over marketing.
- First screen should answer: what happened, which order, total, and next step.
- Use a restrained premium brand look: warm background, editorial serif heading, readable sans body, one accent color.
- Use product imagery when available, but the email must remain useful with images blocked.
- Use a single-column, table-safe structure for email client compatibility.
- Keep body text at readable sizes, strong contrast, and short paragraphs.
- Include preview text.
- Include a real reply-to address in configured environments.
- Do not include sensitive payment credentials, raw tokens, or private customer data in tags, headers, or analytics-like metadata.

## Implementation Checklist

- `apps/medusa/src/email/templates/*`: React Email components only.
- `apps/medusa/src/email/transactional-email.tsx`: render and metadata mapping.
- `apps/medusa/src/modules/*`: provider delivery only.
- `apps/medusa/emails/*`: preview entries using production components with mock data.
- `apps/medusa/.env.example`: sender, reply-to, owner email, storefront URL.
- `apps/medusa/src/subscribers/user-invited.ts`: send `invite.created` and `invite.resent` emails through Medusa's Notification Module.
- Invite email metadata must not include invite tokens or recipient email addresses in provider tags or custom headers.
- Verification: Medusa typecheck, Medusa build, runtime render smoke, React Email preview linter, React Email compatibility check.
