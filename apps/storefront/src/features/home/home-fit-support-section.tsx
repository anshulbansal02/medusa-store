import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { HomeSectionProps } from "@/features/home/home-section-types";
import type { StorefrontProduct } from "@/lib/medusa/products";
import { cn } from "@/lib/utils";

type FitSupportSectionProps = HomeSectionProps & {
  product?: StorefrontProduct;
};

export function FitSupportSection({
  content,
  product,
}: FitSupportSectionProps) {
  if (!product) {
    return null;
  }

  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <Link
          href={product.href}
          className="group relative aspect-[5/4] overflow-hidden bg-muted"
        >
          <Image
            src={product.image}
            alt={`${product.name} fit reference`}
            fill
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
          />
        </Link>
        <div className="nf-reveal lg:pl-10">
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
              href="/shop"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 rounded-none px-6",
              )}
            >
              {content.fitSupport.primaryAction}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
