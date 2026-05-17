import { BadgeCheck, Mail, PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TrackOrderForm } from "@/features/orders/track-order-form";
import { absoluteUrl } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Track Order | The Label",
  description:
    "Open your order details using the order ID or confirmation link from The Label.",
  alternates: {
    canonical: absoluteUrl("/track-order"),
  },
  openGraph: {
    title: "Track Order | The Label",
    description:
      "Open your order details using the order ID or confirmation link from The Label.",
    url: absoluteUrl("/track-order"),
    type: "website",
  },
};

const helpItems = [
  {
    icon: Mail,
    title: "Use the confirmation email",
    text: "The order ID starts with order_. You can also paste the full confirmation link.",
  },
  {
    icon: PackageSearch,
    title: "No account required",
    text: "The lookup opens the order page directly from the store system.",
  },
  {
    icon: BadgeCheck,
    title: "Need help?",
    text: "Contact the store team with your order email if the link is missing.",
  },
];

export default function TrackOrderPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="border-border border-b pb-7 lg:sticky lg:top-24">
            <p className="text-muted-foreground text-sm">Order support</p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              Track order.
            </h1>
            <p className="mt-5 max-w-xl text-muted-foreground">
              Use the order ID or confirmation link from your email to reopen
              the order details page.
            </p>
          </div>

          <div className="grid gap-8">
            <section className="border border-border p-5 sm:p-6">
              <h2 className="text-xl font-medium">Find your order</h2>
              <p className="mt-2 max-w-xl text-muted-foreground text-sm">
                This page does not create an account or ask for a password. It
                only opens the order page for the reference you provide.
              </p>
              <div className="mt-6">
                <TrackOrderForm />
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              {helpItems.map((item) => (
                <article key={item.title} className="border border-border p-4">
                  <item.icon
                    className="size-4 stroke-[1.6] text-muted-foreground"
                    aria-hidden="true"
                  />
                  <h2 className="mt-4 font-medium text-sm">{item.title}</h2>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {item.text}
                  </p>
                </article>
              ))}
            </section>

            <p className="text-muted-foreground text-sm">
              Missing the order email?{" "}
              <Link
                href="/contact"
                prefetch={false}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Contact support
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
