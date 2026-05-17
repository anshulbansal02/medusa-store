import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { getOrderById } from "@/lib/medusa/orders";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type OrderConfirmationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: OrderConfirmationPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: "Order Confirmation | The Label",
    description: `Order confirmation for ${id}.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 border-border border-b pb-8 lg:grid-cols-[0.74fr_1.26fr] lg:items-end">
            <div>
              <p className="text-muted-foreground text-sm">
                Order {order.displayId}
              </p>
              <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
                Order placed.
              </h1>
            </div>
            <div className="max-w-2xl text-muted-foreground">
              <p>
                We have received the order. A confirmation email should reach{" "}
                <span className="text-foreground">{order.email}</span> once
                transactional email is enabled.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <span className="border border-border px-3 py-2">
                  {order.status}
                </span>
                {order.placedAt ? (
                  <span className="border border-border px-3 py-2">
                    {order.placedAt}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-10 py-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <div>
              <h2 className="text-xl font-medium">Items</h2>
              <div className="mt-5 divide-y divide-border border-y border-border">
                {order.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[76px_1fr] gap-4 py-4"
                  >
                    <Link
                      href={item.href}
                      prefetch={false}
                      className="relative aspect-[4/5] overflow-hidden bg-muted"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          loading={index === 0 ? "eager" : "lazy"}
                          sizes="76px"
                          className="object-cover"
                        />
                      ) : null}
                    </Link>
                    <div className="grid gap-2 text-sm sm:grid-cols-[1fr_auto]">
                      <div>
                        <Link
                          href={item.href}
                          prefetch={false}
                          className="font-medium hover:underline"
                        >
                          {item.title}
                        </Link>
                        <p className="mt-1 text-muted-foreground">
                          {item.variant ? `${item.variant} · ` : ""}Qty{" "}
                          {item.quantity}
                        </p>
                        <p className="mt-2 text-muted-foreground">
                          {item.unitPrice} each
                        </p>
                      </div>
                      <p className="font-medium">{item.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="border border-border p-5 sm:p-6 lg:sticky lg:top-24">
              <h2 className="font-medium">Summary</h2>
              <div className="mt-5 grid gap-3 border-border border-b pb-5 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Items</span>
                  <span>{order.subtotal}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shippingTotal}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{order.taxTotal}</span>
                </div>
                {order.discountAmount > 0 ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Discount</span>
                    <span>{order.discountTotal}</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex justify-between gap-4 font-medium">
                <span>Total</span>
                <span>{order.total}</span>
              </div>

              {order.shippingAddress ? (
                <div className="mt-6 border-border border-t pt-5 text-sm">
                  <h3 className="font-medium">Delivery address</h3>
                  <div className="mt-2 text-muted-foreground">
                    {order.shippingAddress.name ? (
                      <p>{order.shippingAddress.name}</p>
                    ) : null}
                    {order.shippingAddress.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    {order.shippingAddress.phone ? (
                      <p>{order.shippingAddress.phone}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <Link
                href="/shop"
                prefetch={false}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-6 h-12 w-full rounded-none px-6",
                )}
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
