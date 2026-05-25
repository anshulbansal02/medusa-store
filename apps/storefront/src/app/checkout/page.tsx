import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";

import { AnalyticsEventOnMount } from "@/components/analytics/ecommerce-events";
import { EmptyAction } from "@/components/content/empty-action";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { siteContent } from "@/content/site-content";
import { CheckoutAddressForm } from "@/features/checkout/checkout-address-form";
import { RazorpayPaymentButton } from "@/features/checkout/razorpay-payment-button";
import type { CheckoutAddressInput } from "@/features/checkout/schema";
import { ShippingMethodForm } from "@/features/checkout/shipping-method-form";
import {
  getCurrentCart,
  getCurrentShippingOptions,
  type StorefrontCart,
} from "@/lib/medusa/cart";

export const metadata: Metadata = {
  title: siteContent.checkout.metadata.title,
  description: siteContent.checkout.metadata.description,
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <Suspense fallback={<CheckoutContentFallback />}>
        <CheckoutContent />
      </Suspense>
      <SiteFooter />
    </main>
  );
}

async function CheckoutContent() {
  const cart = await getCurrentCart();
  const content = siteContent.checkout;
  const shippingOptions = cart?.shippingAddress
    ? await getCurrentShippingOptions(cart)
    : [];

  if (!cart || cart.items.length === 0) {
    return (
      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 lg:px-8">
        <EmptyAction
          eyebrow={content.eyebrow}
          title={content.emptyTitle}
          description={content.emptyDescription}
          actionHref="/shop"
          actionLabel={content.emptyAction}
          className="mx-auto max-w-[900px] border-border border-b pb-10"
          titleAs="h1"
        />
      </section>
    );
  }

  return (
    <>
      <AnalyticsEventOnMount
        event="checkout_viewed"
        data={{
          item_count: cart.itemCount,
          has_shipping_address: Boolean(cart.shippingAddress),
          has_shipping_method: Boolean(cart.selectedShippingOptionId),
        }}
      />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="border-border border-b pb-7">
            <p className="text-muted-foreground text-sm">{content.eyebrow}</p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              {content.title}
            </h1>
          </div>

          <div className="grid gap-10 py-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="grid gap-10">
              <section>
                <div className="mb-5">
                  <h2 className="text-xl font-medium">
                    {content.addressTitle}
                  </h2>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {content.addressDescription}
                  </p>
                </div>
                <CheckoutAddressForm defaultValues={getAddressDefaults(cart)} />
              </section>

              <section className="border-border border-t pt-8">
                <div className="mb-5">
                  <h2 className="text-xl font-medium">
                    {content.shippingTitle}
                  </h2>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {content.shippingDescription}
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
                      <h3 className="font-medium">{content.noShippingTitle}</h3>
                      <p className="mt-2 text-muted-foreground text-sm">
                        {content.noShippingDescription}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="border border-border px-5 py-6">
                    <h3 className="font-medium">
                      {content.addressRequiredTitle}
                    </h3>
                    <p className="mt-2 text-muted-foreground text-sm">
                      {content.addressRequiredDescription}
                    </p>
                  </div>
                )}
              </section>
            </div>

            <aside className="border border-border p-5 sm:p-6 lg:sticky lg:top-24">
              <h2 className="font-medium">{content.summaryTitle}</h2>
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
                        {item.variant} · {content.quantityPrefix}{" "}
                        {item.quantity}
                      </p>
                      <p className="mt-2">{item.total}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 border-border border-b pb-5 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    {content.itemSummaryLabel}
                  </span>
                  <span>{cart.subtotal}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    {content.shippingTitle}
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

              <RazorpayPaymentButton
                publicKey={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? null}
                isReadyForPayment={Boolean(
                  cart.shippingAddress && cart.selectedShippingOptionId,
                )}
              />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

function CheckoutContentFallback() {
  return (
    <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="border-border border-b pb-7">
          <div className="h-3 w-20 bg-muted" />
          <div className="mt-4 h-16 w-60 bg-muted sm:h-24 sm:w-80" />
        </div>
        <div className="grid gap-10 py-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="grid gap-10">
            {[0, 1].map((section) => (
              <div
                key={section}
                className={section === 1 ? "border-border border-t pt-8" : ""}
              >
                <div className="h-5 w-36 bg-muted" />
                <div className="mt-3 h-3 w-72 max-w-full bg-muted" />
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="h-12 bg-muted" />
                  <div className="h-12 bg-muted" />
                  <div className="h-12 bg-muted sm:col-span-2" />
                </div>
              </div>
            ))}
          </div>
          <div className="border border-border p-5 sm:p-6">
            <div className="h-4 w-28 bg-muted" />
            <div className="mt-5 grid gap-4 border-border border-b pb-5">
              {[0, 1].map((item) => (
                <div key={item} className="grid grid-cols-[56px_1fr] gap-3">
                  <div className="aspect-[4/5] bg-muted" />
                  <div>
                    <div className="h-3 w-full bg-muted" />
                    <div className="mt-3 h-3 w-2/3 bg-muted" />
                    <div className="mt-4 h-3 w-20 bg-muted" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 h-4 w-full bg-muted" />
            <div className="mt-6 h-12 w-full bg-muted" />
          </div>
        </div>
      </div>
    </section>
  );
}

function getAddressDefaults(cart: StorefrontCart | null) {
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
