import { BadgeCheck, Mail, PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { siteContent } from "@/content/site-content";
import { TrackOrderForm } from "@/features/orders/track-order-form";
import { absoluteUrl } from "@/lib/config/site";

export const metadata: Metadata = {
  title: siteContent.trackOrder.metadata.title,
  description: siteContent.trackOrder.metadata.description,
  alternates: {
    canonical: absoluteUrl("/track-order"),
  },
  openGraph: {
    title: siteContent.trackOrder.metadata.title,
    description: siteContent.trackOrder.metadata.description,
    url: absoluteUrl("/track-order"),
    type: "website",
  },
};

export default function TrackOrderPage() {
  const content = siteContent.trackOrder;

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="border-border border-b pb-7 lg:sticky lg:top-24">
            <p className="text-muted-foreground text-sm">{content.eyebrow}</p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              {content.title}
            </h1>
            <p className="mt-5 max-w-xl text-muted-foreground">
              {content.description}
            </p>
          </div>

          <div className="grid gap-8">
            <section className="border border-border p-5 sm:p-6">
              <h2 className="text-xl font-medium">{content.formTitle}</h2>
              <p className="mt-2 max-w-xl text-muted-foreground text-sm">
                {content.formDescription}
              </p>
              <div className="mt-6">
                <TrackOrderForm />
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              {content.helpItems.map((item) => (
                <article key={item.title} className="border border-border p-4">
                  <HelpIcon icon={item.icon} />
                  <h2 className="mt-4 font-medium text-sm">{item.title}</h2>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {item.text}
                  </p>
                </article>
              ))}
            </section>

            <p className="text-muted-foreground text-sm">
              {content.missingEmailLead}{" "}
              <Link
                href="/contact"
                prefetch={false}
                className="text-foreground underline-offset-4 hover:underline"
              >
                {content.contactAction}
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

const helpIcons = {
  badgeCheck: BadgeCheck,
  mail: Mail,
  packageSearch: PackageSearch,
} as const;

type HelpIconKey = keyof typeof helpIcons;

function HelpIcon({ icon }: { icon: HelpIconKey }) {
  const Icon = helpIcons[icon];

  return (
    <Icon
      className="size-4 stroke-icon text-muted-foreground"
      aria-hidden="true"
    />
  );
}
