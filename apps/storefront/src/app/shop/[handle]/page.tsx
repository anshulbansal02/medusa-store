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
import { absoluteUrl } from "@/lib/config/site";
import { getCategoryByHandle } from "@/lib/medusa/categories";
import {
  getProductByHandle,
  getProductsByCategoryHandle,
  getRelatedProducts,
} from "@/lib/medusa/products";
import {
  createProductJsonLd,
  serializeJsonLd,
} from "@/lib/seo/product-json-ld";

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
    alternates: {
      canonical: absoluteUrl(`/shop/${product.handle}`),
    },
    openGraph: {
      title: `${product.name} | The Label`,
      description: product.description,
      url: absoluteUrl(`/shop/${product.handle}`),
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
      type: "website",
    },
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

  const relatedProducts = await getRelatedProducts(product, 4);
  const primaryCategory = product.categories[0];
  const productJsonLd = createProductJsonLd(product);
  const productNameWords: Array<{ key: string; word: string }> = [];
  let productNameCursor = 0;

  for (const word of product.name.split(" ")) {
    const wordStart = product.name.indexOf(word, productNameCursor);
    productNameWords.push({ key: `${wordStart}-${word}`, word });
    productNameCursor = wordStart + word.length + 1;
  }

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is generated server-side and serialized with "<" escaped.
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(productJsonLd),
        }}
      />
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
              key={product.id}
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
            </div>

            {product.detailSections.length > 0 ? (
              <div className="grid gap-4 border-border border-t pt-6 text-sm">
                {product.detailSections.map((section) => (
                  <section key={section.key} className="flex gap-3">
                    <ShieldCheck
                      className="mt-0.5 size-4 shrink-0 stroke-[1.6] text-muted-foreground"
                      aria-hidden="true"
                    />
                    <div>
                      <h2 className="font-medium">{section.title}</h2>
                      <p className="mt-1 text-muted-foreground">
                        {section.text}
                      </p>
                    </div>
                  </section>
                ))}
              </div>
            ) : null}

            <ProductSizeChart sizeChart={product.sizeChart} />
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
          <div className="mx-auto max-w-[1440px] border-border border-t pt-9">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-muted-foreground text-sm">
                  {primaryCategory?.name ?? "Keep browsing"}
                </p>
                <h2 className="mt-2 font-heading text-5xl leading-none sm:text-6xl">
                  More from this edit
                </h2>
              </div>
              {primaryCategory ? (
                <Link
                  href={`/shop/${primaryCategory.handle}`}
                  prefetch={false}
                  className="text-sm font-medium underline-offset-4 hover:underline"
                >
                  View edit
                </Link>
              ) : null}
            </div>
            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

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
                  eager={index < 4}
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
