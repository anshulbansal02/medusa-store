import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentCart } from "@/lib/medusa/cart";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cart | The Label",
  description: "Review selected styles before checkout.",
};

export default async function CartPage() {
  const cart = await getCurrentCart();
  const hasItems = Boolean(cart?.items.length);

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="border-border border-b pb-7">
            <p className="text-muted-foreground text-sm">Your edit</p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              Cart
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
                          Qty {item.quantity} · {item.unitPrice}
                        </p>
                      </div>
                      <p className="font-medium sm:text-right">{item.total}</p>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="border border-border p-5 sm:p-6 lg:sticky lg:top-24">
                <h2 className="font-medium">Order summary</h2>
                <div className="mt-5 grid gap-3 border-border border-b pb-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      Subtotal · {cart.itemCount} item
                      {cart.itemCount === 1 ? "" : "s"}
                    </span>
                    <span>{cart.subtotal}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {cart.selectedShippingOptionId
                        ? cart.shippingTotal
                        : "Calculated later"}
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex justify-between gap-4 font-medium">
                  <span>Total</span>
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
                  Continue to checkout
                </Link>
                <p className="mt-4 text-muted-foreground text-sm">
                  Add delivery details, choose shipping, then continue to
                  payment.
                </p>
              </aside>
            </div>
          ) : (
            <div className="py-12">
              <h2 className="text-xl font-medium">Your cart is empty.</h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Start with the latest dresses, co-ords, and occasion pieces.
              </p>
              <Link
                href="/shop"
                prefetch={false}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-7 h-11 rounded-none px-6",
                )}
              >
                Shop new arrivals
              </Link>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
