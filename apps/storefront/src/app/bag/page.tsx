import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { EmptyAction } from "@/components/content/empty-action";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { siteContent } from "@/content/site-content";
import { getCurrentCart } from "@/lib/medusa/cart";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: siteContent.bag.metadata.title,
  description: siteContent.bag.metadata.description,
};

export default async function BagPage() {
  const cart = await getCurrentCart();
  const content = siteContent.bag;
  const hasItems = Boolean(cart?.items.length);

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="border-border border-b pb-7">
            <p className="text-muted-foreground text-sm">{content.eyebrow}</p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              {content.title}
            </h1>
          </div>

          {hasItems && cart ? (
            <div className="grid gap-10 py-8 lg:grid-cols-[1fr_360px] lg:items-start">
              <div className="grid gap-6">
                {cart.items.map((item, index) => (
                  <article
                    key={item.id}
                    className="grid grid-cols-[96px_1fr] gap-4 border-border border-b pb-6 sm:grid-cols-[132px_1fr]"
                  >
                    <Link
                      href={item.href}
                      prefetch={false}
                      className="relative aspect-[4/5] overflow-hidden bg-muted"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          loading={index === 0 ? "eager" : "lazy"}
                          sizes="132px"
                          className="object-cover"
                        />
                      ) : null}
                    </Link>

                    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                      <div>
                        <Link
                          href={item.href}
                          prefetch={false}
                          className="font-medium hover:underline hover:underline-offset-4"
                        >
                          {item.name}
                        </Link>
                        {item.variant ? (
                          <p className="mt-1 text-muted-foreground text-sm">
                            {item.variant}
                          </p>
                        ) : null}
                        <p className="mt-3 text-sm">
                          {content.quantityPrefix} {item.quantity} ·{" "}
                          {item.unitPrice}
                        </p>
                      </div>
                      <p className="font-medium sm:text-right">{item.total}</p>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="border border-border p-5 sm:p-6 lg:sticky lg:top-24">
                <h2 className="font-medium">{content.summaryTitle}</h2>
                <div className="mt-5 grid gap-3 border-border border-b pb-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {content.subtotalLabel} · {cart.itemCount}{" "}
                      {cart.itemCount === 1
                        ? content.itemSingular
                        : content.itemPlural}
                    </span>
                    <span>{cart.subtotal}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {content.shippingLabel}
                    </span>
                    <span>
                      {cart.selectedShippingOptionId
                        ? cart.shippingTotal
                        : content.shippingPendingLabel}
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex justify-between gap-4 font-medium">
                  <span>{content.totalLabel}</span>
                  <span>{cart.total}</span>
                </div>
                <Link
                  href="/checkout"
                  prefetch={false}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-6 h-12 w-full rounded-none",
                  )}
                >
                  {content.checkoutFullAction}
                </Link>
                <p className="mt-4 text-muted-foreground text-sm">
                  {content.summaryNote}
                </p>
              </aside>
            </div>
          ) : (
            <EmptyAction
              title={content.emptyTitle}
              description={content.emptyPageDescription}
              actionHref="/shop"
              actionLabel={content.emptyAction}
              titleClassName="mt-0 font-sans text-xl leading-snug sm:text-xl"
            />
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
