import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Shipping | The Label",
  description: "Shipping and delivery notes for India orders.",
};

export default function ShippingPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[900px]">
          <div className="border-border border-b pb-7">
            <p className="text-muted-foreground text-sm">Delivery</p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              Shipping.
            </h1>
          </div>

          <div className="grid gap-7 py-8 text-sm sm:grid-cols-2">
            <div>
              <h2 className="font-medium">India only</h2>
              <p className="mt-2 text-muted-foreground">
                The launch store is planned for India orders with prepaid
                checkout.
              </p>
            </div>
            <div>
              <h2 className="font-medium">Courier details</h2>
              <p className="mt-2 text-muted-foreground">
                Shipping rates, dispatch timelines, and courier tracking will be
                finalized before production checkout is enabled.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
