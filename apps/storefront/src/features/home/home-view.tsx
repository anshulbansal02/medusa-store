import { Ruler, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { siteContent } from "@/content/site-content";
import { ProductCard } from "@/features/products/product-card";
import type { StorefrontProduct } from "@/lib/medusa/products";
import { cn } from "@/lib/utils";

type HomeViewProps = {
  products: StorefrontProduct[];
};

const trustIcons = {
  ruler: Ruler,
  shield: ShieldCheck,
  truck: Truck,
} as const;

type TrustIconKey = keyof typeof trustIcons;

function TrustIcon({ icon }: { icon: TrustIconKey }) {
  const Icon = trustIcons[icon];

  return <Icon className="mt-0.5 size-5 shrink-0 stroke-[1.6] text-primary" />;
}

export function HomeView({ products }: HomeViewProps) {
  const content = siteContent.home;
  const primaryHeroProduct = products[0];
  const fitSupportProduct = products.at(-1) ?? primaryHeroProduct;
  const heroProducts = primaryHeroProduct
    ? [
        primaryHeroProduct,
        ...products
          .filter((product) => product.id !== primaryHeroProduct.id)
          .slice(0, 2),
      ]
    : [];
  const newArrivalProducts = primaryHeroProduct
    ? products.filter((product) => product.id !== primaryHeroProduct.id)
    : products;
  const occasionProducts = products.filter((product) =>
    product.categories.some((category) => category.handle === "occasion-edit"),
  );

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-10 sm:px-6 sm:pt-32 sm:pb-14 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          {primaryHeroProduct ? (
            <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
              <Link
                href={primaryHeroProduct.href}
                prefetch={false}
                className="group block"
              >
                <article>
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted lg:aspect-[16/18] lg:min-h-[720px]">
                    <Image
                      src={primaryHeroProduct.image}
                      alt={`${primaryHeroProduct.name} styled on a model`}
                      fill
                      loading="eager"
                      fetchPriority="high"
                      sizes="(min-width: 1024px) 54vw, 100vw"
                      className="object-cover transition duration-500 ease-out group-hover:scale-[1.025]"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-background sm:p-6">
                      <p className="text-micro uppercase tracking-[0.14em]">
                        {content.hero.productEyebrow}
                      </p>
                      <div className="mt-2 flex items-end justify-between gap-5">
                        <h2 className="max-w-[72%] font-heading text-3xl leading-none sm:max-w-md sm:text-5xl">
                          {primaryHeroProduct.name}
                        </h2>
                        <p className="shrink-0 text-sm font-medium">
                          {primaryHeroProduct.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {content.hero.eyebrow}
                </p>
                <h1 className="mt-4 font-heading text-hero tracking-normal sm:text-hero-lg">
                  {content.hero.title}
                </h1>
                <p className="mt-6 max-w-xl text-muted-foreground">
                  {content.hero.description}
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
                    {content.hero.primaryAction}
                  </Link>
                  <Link
                    href="/size-guide"
                    prefetch={false}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-11 rounded-none px-4 sm:px-6",
                    )}
                  >
                    {content.hero.secondaryAction}
                  </Link>
                </div>

                {heroProducts.length > 1 ? (
                  <div className="mt-10 grid grid-cols-2 gap-3">
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
                              sizes="(min-width: 1024px) 22vw, 50vw"
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
            </div>
          ) : (
            <div className="border border-border px-5 py-8 sm:px-8">
              <h2 className="text-base font-medium">
                {content.hero.emptyTitle}
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground text-sm">
                {content.hero.emptyDescription}
              </p>
            </div>
          )}

          <div className="mt-10 border-border border-y py-4">
            <div className="grid gap-4 text-sm sm:grid-cols-3">
              {content.valueStrip.map((item) => (
                <p key={item.title}>
                  <span className="font-medium">{item.title}</span> {item.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 flex flex-col justify-between gap-5 border-border border-b pb-6 md:flex-row md:items-end">
            <div>
              <h2 className="font-heading text-5xl leading-none sm:text-6xl">
                {content.newArrivals.title}
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                {content.newArrivals.description}
              </p>
            </div>
            <Link
              href="/shop"
              prefetch={false}
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              {content.newArrivals.action}
            </Link>
          </div>

          {newArrivalProducts.length > 0 ? (
            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {newArrivalProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="border border-border px-5 py-8 sm:px-8">
              <h3 className="text-base font-medium">
                {content.newArrivals.emptyTitle}
              </h3>
              <p className="mt-2 max-w-xl text-muted-foreground text-sm">
                {content.newArrivals.emptyDescription}
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
                {content.occasionEdit.title}
              </h2>
              <p className="mt-5 max-w-md text-muted-foreground">
                {content.occasionEdit.description}
              </p>
              <Link
                href="/shop/occasion-edit"
                prefetch={false}
                className="mt-7 inline-flex text-sm font-medium underline-offset-4 hover:underline"
              >
                {content.occasionEdit.action}
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

      {fitSupportProduct ? (
        <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <Link
              href={fitSupportProduct.href}
              prefetch={false}
              className="group relative aspect-[5/4] overflow-hidden bg-muted"
            >
              <Image
                src={fitSupportProduct.image}
                alt={`${fitSupportProduct.name} fit reference`}
                fill
                sizes="(min-width: 1024px) 54vw, 100vw"
                className="object-cover transition duration-500 ease-out group-hover:scale-[1.025]"
              />
            </Link>
            <div className="lg:pl-10">
              <p className="text-sm font-medium text-muted-foreground">
                {content.fitSupport.eyebrow}
              </p>
              <h2 className="mt-3 font-heading text-5xl leading-none sm:text-7xl">
                {content.fitSupport.title}
              </h2>
              <p className="mt-5 max-w-xl text-muted-foreground">
                {content.fitSupport.description}
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
                  {content.fitSupport.primaryAction}
                </Link>
                <Link
                  href="/shop"
                  prefetch={false}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "h-11 rounded-none px-6",
                  )}
                >
                  {content.fitSupport.secondaryAction}
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-border border-y px-4 py-9 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-6 md:grid-cols-3">
          {content.trustItems.map((item) => (
            <div key={item.title} className="flex gap-4">
              <TrustIcon icon={item.icon} />
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
