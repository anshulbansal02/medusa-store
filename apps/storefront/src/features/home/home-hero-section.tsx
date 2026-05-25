import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { HomeSectionProps } from "@/features/home/home-section-types";
import type { StorefrontProduct } from "@/lib/medusa/products";
import { cn } from "@/lib/utils";

type HeroSectionProps = HomeSectionProps & {
  heroProducts: StorefrontProduct[];
  primaryProduct?: StorefrontProduct;
};

export function HeroSection({
  content,
  heroProducts,
  primaryProduct,
}: HeroSectionProps) {
  return (
    <section className="px-4 pt-28 pb-10 sm:px-6 sm:pt-32 sm:pb-14 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        {primaryProduct ? (
          <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
            <Link href={primaryProduct.href} className="group block">
              <article>
                <div className="relative aspect-[4/5] overflow-hidden bg-muted lg:aspect-[16/18] lg:min-h-[720px]">
                  <Image
                    src={primaryProduct.image}
                    alt={`${primaryProduct.name} ${content.hero.imageAltSuffix}`}
                    fill
                    loading="eager"
                    fetchPriority="high"
                    sizes="(min-width: 1024px) 54vw, 100vw"
                    className="object-cover transition duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-background sm:p-6">
                    <p className="text-micro uppercase tracking-label-wider">
                      {content.hero.productEyebrow}
                    </p>
                    <div className="mt-2 flex items-end justify-between gap-5">
                      <h2 className="max-w-[72%] font-heading text-3xl leading-none sm:max-w-md sm:text-5xl">
                        {primaryProduct.name}
                      </h2>
                      <p className="shrink-0 text-sm font-medium">
                        {primaryProduct.price}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </Link>

            <div className="nf-reveal-soft nf-delay-1">
              <p className="text-sm font-medium text-muted-foreground">
                {content.hero.eyebrow}
              </p>
              <h1 className="mt-4 font-heading text-hero tracking-normal sm:text-hero-lg">
                {content.hero.title}
              </h1>
              <p className="mt-6 max-w-xl text-muted-foreground">
                {content.hero.description}
              </p>

              <div className="mt-7 flex">
                <Link
                  href="/shop"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-11 rounded-none px-4 sm:px-6",
                  )}
                >
                  {content.hero.primaryAction}
                </Link>
              </div>

              {heroProducts.length > 1 ? (
                <div className="mt-10 grid grid-cols-2 gap-3">
                  {heroProducts.slice(1).map((product, index) => (
                    <Link
                      key={product.id}
                      href={product.href}
                      className="group block nf-reveal-soft"
                    >
                      <article>
                        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                          <Image
                            src={product.image}
                            alt={`${product.name} ${content.hero.imageAltSuffix}`}
                            fill
                            loading={index === 0 ? "eager" : "lazy"}
                            sizes="(min-width: 1024px) 22vw, 50vw"
                            className="object-cover transition duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
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
            <h2 className="text-base font-medium">{content.hero.emptyTitle}</h2>
            <p className="mt-2 max-w-xl text-muted-foreground text-sm">
              {content.hero.emptyDescription}
            </p>
          </div>
        )}

        <ValueStrip content={content} />
      </div>
    </section>
  );
}

function ValueStrip({ content }: HomeSectionProps) {
  return (
    <div className="mt-10 border-border border-y py-4">
      <div className="grid gap-4 text-sm sm:grid-cols-3">
        {content.valueStrip.map((item) => (
          <p key={item.title}>
            <span className="font-medium">{item.title}</span> {item.text}
          </p>
        ))}
      </div>
    </div>
  );
}
