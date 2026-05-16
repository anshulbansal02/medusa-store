import { RefreshCw, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { AddToCartForm } from "@/features/cart/add-to-cart-form";
import { ProductCard } from "@/features/products/product-card";
import { ProductGallery } from "@/features/products/product-gallery";
import { ProductSizeChart } from "@/features/products/product-size-chart";
import {
  getCategoryByHandle,
  getProductByHandle,
  getProductsByCategoryHandle,
} from "@/lib/medusa/products";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    const category = await getCategoryByHandle(handle);

    if (category) {
      return {
        title: `${category.name} | The Label`,
        description: category.description || `Shop ${category.name}.`,
      };
    }

    return {
      title: "Product not found | The Label",
    };
  }

  return {
    title: `${product.name} | The Label`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    const category = await getCategoryByHandle(handle);

    if (category) {
      return <CollectionPage handle={handle} />;
    }

    notFound();
  }

  const productNameWords: Array<{ key: string; word: string }> = [];
  let productNameCursor = 0;

  for (const word of product.name.split(" ")) {
    const wordStart = product.name.indexOf(word, productNameCursor);
    productNameWords.push({ key: `${wordStart}-${word}`, word });
    productNameCursor = wordStart + word.length + 1;
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-24 pb-28 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.08fr_0.92fr] xl:gap-14">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="lg:sticky lg:top-24 lg:self-start">
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex items-center gap-2 text-muted-foreground text-sm"
            >
              <Link
                href="/shop"
                prefetch={false}
                className="hover:text-foreground"
              >
                Shop
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-foreground">{product.name}</span>
            </nav>

            <div className="border-border border-b pb-6">
              <p className="text-muted-foreground text-sm">New arrival</p>
              <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-6">
                <h1 className="font-heading text-5xl leading-[0.95] sm:text-6xl">
                  {productNameWords.map((part, index) => (
                    <span key={part.key} className="whitespace-nowrap">
                      {part.word}
                      {index < productNameWords.length - 1 ? " " : ""}
                    </span>
                  ))}
                </h1>
                <p className="shrink-0 pt-1 font-medium">{product.price}</p>
              </div>
              {product.description ? (
                <p className="mt-5 max-w-xl text-muted-foreground">
                  {product.description}
                </p>
              ) : null}
            </div>

            <AddToCartForm
              productName={product.name}
              productPrice={product.price}
              color={product.color}
              variants={product.variants}
              hasSizeChart={Boolean(product.sizeChart)}
            />

            <div className="grid gap-4 border-border border-t pt-6 text-sm">
              <div className="flex gap-3">
                <Truck
                  className="mt-0.5 size-4 shrink-0 stroke-[1.6] text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="font-medium">Delivery</h2>
                  <p className="mt-1 text-muted-foreground">
                    India shipping with prepaid checkout planned for launch.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <RefreshCw
                  className="mt-0.5 size-4 shrink-0 stroke-[1.6] text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="font-medium">Returns</h2>
                  <p className="mt-1 text-muted-foreground">
                    Return policy will be finalized before production checkout
                    is enabled.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 stroke-[1.6] text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="font-medium">Fit and fabric</h2>
                  <p className="mt-1 text-muted-foreground">
                    Use the size chart before checkout. Fabric, care, and fit
                    notes stay close to the purchase decision.
                  </p>
                </div>
              </div>
            </div>

            <ProductSizeChart sizeChart={product.sizeChart} />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

async function CollectionPage({ handle }: { handle: string }) {
  const { category, products } = await getProductsByCategoryHandle({
    handle,
    limit: 24,
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 border-border border-b pb-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-muted-foreground text-sm">{category.name}</p>
              <h1 className="mt-3 max-w-3xl font-heading text-6xl leading-none sm:text-8xl">
                {category.name}
              </h1>
            </div>
            <p className="max-w-2xl text-muted-foreground lg:justify-self-end">
              {category.description ||
                "Browse this live Medusa category from the current catalog."}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 py-6">
            <p className="text-muted-foreground text-sm">
              {products.length} styles
            </p>
            <Link
              href="/shop"
              prefetch={false}
              className="text-sm underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid gap-x-5 gap-y-11 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 4}
                />
              ))}
            </div>
          ) : (
            <div className="border border-border px-5 py-8 sm:px-8">
              <h2 className="text-base font-medium">
                Products are not available yet.
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground text-sm">
                Start Medusa with a publishable key and published products to
                populate this collection.
              </p>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
