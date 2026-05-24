import { RefreshCw, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { siteContent } from "@/content/site-content";
import { AddToCartForm } from "@/features/cart/add-to-cart-form";
import { ProductCard } from "@/features/products/product-card";
import { ProductGallery } from "@/features/products/product-gallery";
import {
  ProductListing,
  type ProductListingSearchParams,
} from "@/features/products/product-listing";
import { ProductSizeChart } from "@/features/products/product-size-chart";
import { absoluteUrl } from "@/lib/config/site";
import {
  getCategoryByHandle,
  getProductCategories,
} from "@/lib/medusa/categories";
import {
  getProductByHandle,
  getProductsByCategoryHandle,
  getRelatedProducts,
  type ProductDetail,
  type StorefrontProduct,
} from "@/lib/medusa/products";
import {
  createProductJsonLd,
  serializeJsonLd,
} from "@/lib/seo/product-json-ld";

type ProductPageProps = {
  params: Promise<{
    handle: string;
  }>;
  searchParams?: Promise<ProductListingSearchParams>;
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
        title: `${category.name} | Neonfold`,
        description:
          category.description ||
          `${siteContent.collection.metadataDescriptionPrefix} ${category.name}.`,
      };
    }

    return {
      title: siteContent.product.notFoundTitle,
    };
  }

  return {
    title: `${product.name} | Neonfold`,
    description: product.description,
    alternates: {
      canonical: absoluteUrl(`/shop/${product.handle}`),
    },
    openGraph: {
      title: `${product.name} | Neonfold`,
      description: product.description,
      url: absoluteUrl(`/shop/${product.handle}`),
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return <CollectionRoute handle={handle} searchParams={searchParams} />;
  }

  const relatedProducts = await getRelatedProducts(product, 4);

  return (
    <ProductRouteContent product={product} relatedProducts={relatedProducts} />
  );
}

async function CollectionRoute({
  handle,
  searchParams,
}: {
  handle: string;
  searchParams?: Promise<ProductListingSearchParams>;
}) {
  const [params, collectionResult, categories] = await Promise.all([
    searchParams,
    getProductsByCategoryHandle({
      handle,
      limit: 100,
    }),
    getProductCategories(12),
  ]);
  const { category, products } = collectionResult;

  if (!category) {
    notFound();
  }

  const content = siteContent.collection;

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <ProductListing
        actionPath={`/shop/${category.handle}`}
        activeCategoryHref={`/shop/${category.handle}`}
        categories={categories}
        description={category.description || content.fallbackDescription}
        emptyActionHref="/shop"
        emptyActionLabel={content.allProductsAction}
        emptyDescription={content.emptyDescription}
        emptyTitle={content.emptyTitle}
        eyebrow={category.name}
        products={products}
        searchParams={params}
        title={category.name}
      />

      <SiteFooter />
    </main>
  );
}

function ProductRouteContent({
  product,
  relatedProducts,
}: {
  product: ProductDetail;
  relatedProducts: StorefrontProduct[];
}) {
  const primaryCategory = product.categories[0];
  const productJsonLd = createProductJsonLd(product);
  const content = siteContent.product;

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
        <div className="mx-auto grid max-w-[1440px] min-w-0 gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] xl:gap-14">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <nav
              aria-label={content.breadcrumbLabel}
              className="mb-6 flex min-w-0 flex-wrap items-center gap-2 text-muted-foreground text-sm"
            >
              <Link
                href="/shop"
                prefetch={false}
                className="hover:text-foreground"
              >
                {content.shopBreadcrumbLabel}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="min-w-0 break-words text-foreground">
                {product.name}
              </span>
            </nav>

            <div className="border-border border-b pb-6">
              <p className="text-muted-foreground text-sm">
                {content.statusLabel}
              </p>
              <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-6">
                <h1 className="min-w-0 break-words font-heading text-5xl leading-none sm:text-6xl [overflow-wrap:anywhere]">
                  {product.name}
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
                  className="mt-0.5 size-4 shrink-0 stroke-icon text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="font-medium">{content.deliveryTitle}</h2>
                  <p className="mt-1 text-muted-foreground">
                    {content.deliveryText}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <RefreshCw
                  className="mt-0.5 size-4 shrink-0 stroke-icon text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="font-medium">{content.returnsTitle}</h2>
                  <p className="mt-1 text-muted-foreground">
                    {content.returnsText}
                  </p>
                </div>
              </div>
            </div>

            {product.detailSections.length > 0 ? (
              <div className="grid gap-4 border-border border-t pt-6 text-sm">
                {product.detailSections.map((section) => (
                  <section key={section.key} className="flex gap-3">
                    <ShieldCheck
                      className="mt-0.5 size-4 shrink-0 stroke-icon text-muted-foreground"
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
                  {primaryCategory?.name ?? content.relatedEyebrowFallback}
                </p>
                <h2 className="mt-2 font-heading text-5xl leading-none sm:text-6xl">
                  {content.relatedTitle}
                </h2>
              </div>
              {primaryCategory ? (
                <Link
                  href={`/shop/${primaryCategory.handle}`}
                  prefetch={false}
                  className="text-sm font-medium underline-offset-4 hover:underline"
                >
                  {content.relatedAction}
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
