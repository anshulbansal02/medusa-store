import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { CheckoutAddressForm } from "@/features/checkout/checkout-address-form";
import type { CheckoutAddressInput } from "@/features/checkout/schema";
import { ShippingMethodForm } from "@/features/checkout/shipping-method-form";
import { getCurrentCart, getCurrentShippingOptions } from "@/lib/medusa/cart";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | The Label",
  description: "Add delivery details and choose shipping for your order.",
};

function getAddressDefaults(cart: Awaited<ReturnType<typeof getCurrentCart>>) {
  const address = cart?.shippingAddress;

  return {
    email: cart?.email ?? "",
    firstName: address?.firstName ?? "",
    lastName: address?.lastName ?? "",
    phone: address?.phone ?? "",
    address1: address?.address1 ?? "",
    address2: address?.address2 ?? "",
    city: address?.city ?? "",
    province: address?.province ?? "",
    postalCode: address?.postalCode ?? "",
  } satisfies CheckoutAddressInput;
}

export default async function CheckoutPage() {
  const cart = await getCurrentCart();
  const shippingOptions = cart?.shippingAddress
    ? await getCurrentShippingOptions()
    : [];

  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen">
        <SiteHeader />
        <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 lg:px-8">
          <div className="mx-auto max-w-[900px] border-border border-b pb-10">
            <p className="text-muted-foreground text-sm">Checkout</p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              Your cart is empty.
            </h1>
            <p className="mt-5 max-w-xl text-muted-foreground">
              Add a style before entering delivery details.
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
        </section>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="border-border border-b pb-7">
            <p className="text-muted-foreground text-sm">Checkout</p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              Delivery details
            </h1>
          </div>

          <div className="grid gap-10 py-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="grid gap-10">
              <section>
                <div className="mb-5">
                  <h2 className="text-xl font-medium">Address</h2>
                  <p className="mt-1 text-muted-foreground text-sm">
                    India-only delivery for this launch. Billing uses the same
                    address.
                  </p>
                </div>
                <CheckoutAddressForm defaultValues={getAddressDefaults(cart)} />
              </section>

              <section className="border-border border-t pt-8">
                <div className="mb-5">
                  <h2 className="text-xl font-medium">Shipping</h2>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Save the address first, then choose a delivery method.
                  </p>
                </div>

                {cart.shippingAddress ? (
                  shippingOptions.length > 0 ? (
                    <ShippingMethodForm
                      options={shippingOptions}
                      selectedShippingOptionId={cart.selectedShippingOptionId}
                    />
                  ) : (
                    <div className="border border-border px-5 py-6">
                      <h3 className="font-medium">
                        No shipping options available.
                      </h3>
                      <p className="mt-2 text-muted-foreground text-sm">
                        Check the address or shipping setup in Medusa.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="border border-border px-5 py-6">
                    <h3 className="font-medium">Address needed first.</h3>
                    <p className="mt-2 text-muted-foreground text-sm">
                      Shipping options appear after the delivery address is
                      saved.
                    </p>
                  </div>
                )}
              </section>
            </div>

            <aside className="border border-border p-5 sm:p-6 lg:sticky lg:top-24">
              <h2 className="font-medium">Order summary</h2>
              <div className="mt-5 grid gap-4 border-border border-b pb-5">
                {cart.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[56px_1fr] gap-3"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          loading={index === 0 ? "eager" : "lazy"}
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">{item.name}</p>
                      <p className="mt-1 text-muted-foreground">
                        {item.variant} · Qty {item.quantity}
                      </p>
                      <p className="mt-2">{item.total}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 border-border border-b pb-5 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Items</span>
                  <span>{cart.subtotal}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {cart.selectedShippingOptionId
                      ? cart.shippingTotal
                      : "Choose method"}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex justify-between gap-4 font-medium">
                <span>Total</span>
                <span>{cart.total}</span>
              </div>

              <button
                type="button"
                disabled
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-6 h-12 w-full rounded-none",
                )}
              >
                Payment coming next
              </button>
              <p className="mt-4 text-muted-foreground text-sm">
                Razorpay payment will be connected after this checkout
                foundation is stable.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
