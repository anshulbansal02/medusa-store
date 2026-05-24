import { ArrowRight, Ruler, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteContent } from "@/content/site-content";

const footerTrustIcons = {
  ruler: Ruler,
  shield: ShieldCheck,
  truck: Truck,
} as const;

type FooterTrustIconKey = keyof typeof footerTrustIcons;

function FooterTrustIcon({ icon }: { icon: FooterTrustIconKey }) {
  const Icon = footerTrustIcons[icon];

  return (
    <span className="flex size-11 shrink-0 items-center justify-center border border-border bg-background text-primary">
      <Icon className="size-5.5 stroke-icon-strong" aria-hidden="true" />
    </span>
  );
}

export function SiteFooter() {
  const content = siteContent.footer;

  return (
    <footer className="border-border border-t px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-10">
        <div className="grid items-center gap-7 py-6 md:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] md:py-8">
          <div>
            <p className="text-micro font-medium uppercase tracking-label-wide text-muted-foreground">
              {content.newsletter.eyebrow}
            </p>
            <h2 className="mt-3 max-w-2xl text-balance font-heading text-3xl leading-none text-foreground sm:text-4xl lg:text-5xl">
              {content.newsletter.title}
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground text-sm sm:text-base">
              {content.newsletter.description}
            </p>
          </div>
          <form
            className="flex w-full items-center border border-border bg-background shadow-sm"
            aria-label={content.newsletter.title}
          >
            <label className="sr-only" htmlFor="footerNewsletterEmail">
              {content.newsletter.emailLabel}
            </label>
            <Input
              id="footerNewsletterEmail"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={content.newsletter.emailPlaceholder}
              className="h-14 rounded-none border-0 bg-transparent px-4 shadow-none focus-visible:ring-0"
            />
            <Button
              type="button"
              size="icon"
              className="h-14 w-14 rounded-none"
              aria-label={content.newsletter.submitLabel}
            >
              <ArrowRight className="size-5 stroke-icon" aria-hidden="true" />
            </Button>
          </form>
        </div>
        <div className="flex flex-col justify-between gap-8 border-border border-t pt-8 text-sm text-muted-foreground md:flex-row">
          <div>
            <Link href="/" className="font-heading text-3xl text-foreground">
              {siteContent.brand.name}
            </Link>
            <p className="mt-3 max-w-sm">
              {siteContent.brand.footerDescription}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {content.sections.map((section) => (
              <div key={section.title}>
                <h2 className="mb-3 text-foreground text-sm font-medium">
                  {section.title}
                </h2>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} prefetch={false}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-5 border-border border-t pt-8 md:grid-cols-3">
          {content.trustItems.map((item) => (
            <div key={item.title} className="flex gap-4">
              <FooterTrustIcon icon={item.icon} />
              <div>
                <h2 className="text-sm font-medium text-foreground">
                  {item.title}
                </h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
