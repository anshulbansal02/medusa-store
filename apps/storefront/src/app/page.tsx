import { Ruler, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { ProductCard } from "@/features/products/product-card";
import { getHomeProducts } from "@/lib/medusa/products";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Secure prepaid checkout",
    text: "Razorpay payments planned for launch.",
  },
  {
    icon: Truck,
    title: "India shipping",
    text: "Simple dispatch updates from the store team.",
  },
  {
    icon: Ruler,
    title: "Size support",
    text: "Fit notes and a clear size chart on every product.",
  },
];

export default async function Home() {
  const products = await getHomeProducts();
  const primaryHeroProduct = products[0];
  const heroProducts = primaryHeroProduct
    ? [
        primaryHeroProduct,
        ...products
          .filter((product) => product.id !== primaryHeroProduct.id)
          .slice(0, 2),
      ]
    : [];
  const occasionProducts = products.filter((product) =>
    product.categories.some((category) => category.handle === "occasion-edit"),
  );

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-20 pb-10 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div className="order-1 max-w-2xl">
            <p className="text-sm font-medium text-muted-foreground">
              The first edit
            </p>
            <h1 className="mt-4 font-heading text-[clamp(3.35rem,14vw,5rem)] leading-[0.86] tracking-normal sm:text-[clamp(4rem,9vw,9rem)]">
              Designed to be noticed.
            </h1>
            <p className="mt-6 max-w-xl text-muted-foreground">
              Limited-run western occasion pieces for dinners, wedding
              functions, launches, and dressed-up weekends.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:flex sm:flex-row">
              <Link
                href="/shop"
                prefetch={false}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 rounded-none px-4 sm:px-6",
                )}
              >
                Shop new arrivals
              </Link>
              <Link
                href="/size-guide"
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 rounded-none px-4 sm:px-6",
                )}
              >
                Find your size
              </Link>
            </div>

            <nav
              aria-label="Featured categories"
              className="mt-8 hidden flex-wrap gap-x-5 gap-y-2 border-border border-t pt-5 text-sm sm:flex"
            >
              <Link
                href="/shop/dresses"
                prefetch={false}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Dresses
              </Link>
              <Link
                href="/shop/sets"
                prefetch={false}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Co-ords
              </Link>
              <Link
                href="/shop/tops"
                prefetch={false}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Tops
              </Link>
              <Link
                href="/shop/occasion-edit"
                prefetch={false}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Occasion edit
              </Link>
            </nav>
          </div>

          {primaryHeroProduct ? (
            <div className="order-2 grid gap-3 sm:grid-cols-[1fr_0.52fr] lg:min-h-[620px]">
              <Link
                href={primaryHeroProduct.href}
                prefetch={false}
                className="group block"
              >
                <article>
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted sm:min-h-[620px]">
                    <Image
                      src={primaryHeroProduct.image}
                      alt={`${primaryHeroProduct.name} styled on a model`}
                      fill
                      priority
                      loading="eager"
                      sizes="(min-width: 1024px) 54vw, 100vw"
                      className="object-cover transition duration-500 ease-out group-hover:scale-[1.025]"
                    />
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-medium">{primaryHeroProduct.name}</h2>
                      {primaryHeroProduct.note ? (
                        <p className="mt-1 max-w-md text-muted-foreground text-sm">
                          {primaryHeroProduct.note}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-sm font-medium">
                      {primaryHeroProduct.price}
                    </p>
                  </div>
                </article>
              </Link>

              {heroProducts.length > 1 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                  {heroProducts.slice(1).map((product, index) => (
                    <Link
                      key={product.id}
                      href={product.href}
                      prefetch={false}
                      className="group block"
                    >
                      <article>
                        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                          <Image
                            src={product.image}
                            alt={`${product.name} styled on a model`}
                            fill
                            loading={index === 0 ? "eager" : "lazy"}
                            sizes="(min-width: 1024px) 26vw, 50vw"
                            className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                          />
                        </div>
                        <div className="mt-2 flex items-start justify-between gap-3 text-sm">
                          <h2 className="font-medium leading-snug">
                            {product.name}
                          </h2>
                          <p className="shrink-0">{product.price}</p>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="border border-border px-5 py-8 sm:px-8">
              <h2 className="text-base font-medium">
                The first edit is waiting for products.
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground text-sm">
                Publish products in Medusa to turn the homepage into a
                product-led storefront.
              </p>
            </div>
          )}
        </div>

        <div className="mx-auto mt-10 max-w-[1440px] border-border border-t pt-5">
          <div className="grid gap-4 text-sm sm:grid-cols-3">
            <p>
              <span className="font-medium">Small catalog, sharper edit.</span>{" "}
              About 20-25 pieces at launch.
            </p>
            <p>
              <span className="font-medium">Premium price confidence.</span> Fit
              notes and size support stay close to purchase decisions.
            </p>
            <p>
              <span className="font-medium">India-first checkout.</span> Prepaid
              flow and clear shipping details before launch.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 flex flex-col justify-between gap-5 border-border border-b pb-6 md:flex-row md:items-end">
            <div>
              <h2 className="font-heading text-5xl leading-none sm:text-6xl">
                New arrivals
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Dresses, co-ords, and statement tops selected for dinners,
                wedding functions, and dressed-up weekends.
              </p>
            </div>
            <Link
              href="/shop"
              prefetch={false}
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              View all products
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="border border-border px-5 py-8 sm:px-8">
              <h3 className="text-base font-medium">
                New arrivals are not connected yet.
              </h3>
              <p className="mt-2 max-w-xl text-muted-foreground text-sm">
                Start Medusa with a publishable key and published products to
                populate this section.
              </p>
            </div>
          )}
        </div>
      </section>

      {occasionProducts.length > 0 ? (
        <section className="border-border border-y px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <h2 className="font-heading text-5xl leading-none sm:text-7xl">
                Occasion edit
              </h2>
              <p className="mt-5 max-w-md text-muted-foreground">
                Shop by plan, not by trend. This edit pulls from the live Medusa
                catalog.
              </p>
              <Link
                href="/shop/occasion-edit"
                prefetch={false}
                className="mt-7 inline-flex text-sm font-medium underline-offset-4 hover:underline"
              >
                View the edit
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {occasionProducts.slice(0, 3).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative aspect-[5/4] overflow-hidden bg-muted">
            <Image
              src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1400&q=82"
              alt="Editorial fashion styling with layered eveningwear"
              fill
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="lg:pl-10">
            <p className="text-sm font-medium text-muted-foreground">
              Size and fit first
            </p>
            <h2 className="mt-3 font-heading text-5xl leading-none sm:text-7xl">
              Dressy should still feel easy.
            </h2>
            <p className="mt-5 max-w-xl text-muted-foreground">
              Product pages will keep measurements, fabric, care, and fit notes
              close to the add-to-bag flow, so customers can decide without
              searching through policy text.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/size-guide"
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 rounded-none px-6",
                )}
              >
                Size guide
              </Link>
              <Link
                href="/shop"
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "h-11 rounded-none px-6",
                )}
              >
                Shop new arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-border border-y px-4 py-9 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-6 md:grid-cols-3">
          {trustItems.map((item) => (
            <div key={item.title} className="flex gap-4">
              <item.icon className="mt-0.5 size-5 shrink-0 stroke-[1.6] text-primary" />
              <div>
                <h2 className="text-sm font-medium">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
