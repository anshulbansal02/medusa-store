import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Contact | The Label",
  description: "Contact the store team for order and product help.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[900px]">
          <div className="border-border border-b pb-7">
            <p className="text-muted-foreground text-sm">Contact</p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              Store help.
            </h1>
          </div>

          <div className="grid gap-7 py-8 text-sm sm:grid-cols-2">
            <div>
              <h2 className="font-medium">Orders and styling</h2>
              <p className="mt-2 text-muted-foreground">
                Share the product name, size, and your question. The store team
                can confirm availability, sizing, and order status.
              </p>
            </div>
            <div>
              <h2 className="font-medium">Response time</h2>
              <p className="mt-2 text-muted-foreground">
                Support details will be finalized before production launch.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
