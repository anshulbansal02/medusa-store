import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { siteContent } from "@/content/site-content";
import { cn } from "@/lib/utils";

export default function OrderConfirmationNotFound() {
  const content = siteContent.orderConfirmation.notFound;

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[960px]">
          <div className="border-border border-b pb-8">
            <p className="text-muted-foreground text-sm">{content.eyebrow}</p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              {content.title}
            </h1>
          </div>
          <div className="max-w-2xl py-8">
            <p className="text-muted-foreground">{content.description}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/track-order"
                prefetch={false}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 rounded-none px-6",
                )}
              >
                {content.retryAction}
              </Link>
              <Link
                href="/contact"
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 rounded-none px-6",
                )}
              >
                {content.contactAction}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
