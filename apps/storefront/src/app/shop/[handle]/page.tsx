import {
  CreditCard,
  RefreshCw,
  Ruler,
  ShieldCheck,
  Shirt,
  Truck,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnalyticsEventOnMount } from "@/components/analytics/ecommerce-events";
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
import { WishlistButton } from "@/features/wishlist/wishlist-button";
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
      <AnalyticsEventOnMount
        event="collection_viewed"
        data={{
          collection_handle: category.handle,
          collection_name: category.name,
          product_count: products.length,
        }}
      />
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
      <AnalyticsEventOnMount
        event="product_viewed"
        data={{
          product_id: product.id,
          product_handle: product.handle,
          product_name: product.name,
          categories: product.categories.map((category) => category.name),
          price_amount: product.priceAmount,
          currency: product.currencyCode,
        }}
      />
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
          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>

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

            <section className="border-border border-b pb-7">
              <p className="text-muted-foreground text-sm">
                {content.statusLabel}
              </p>
              <h1 className="mt-3 min-w-0 break-words font-heading text-5xl leading-none sm:text-6xl [overflow-wrap:anywhere]">
                {product.name}
              </h1>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                  <p className="font-medium text-2xl leading-tight">
                    {product.price}
                  </p>
                  {product.compareAtPrice ? (
                    <>
                      <p className="text-muted-foreground text-sm line-through">
                        {product.compareAtPrice}
                      </p>
                      <p className="border border-primary/20 bg-primary/5 px-2 py-1 font-medium text-primary text-xs uppercase">
                        {getDiscountLabel(product)}
                      </p>
                    </>
                  ) : null}
                </div>
              </div>
              {product.description ? (
                <p className="mt-5 max-w-xl text-muted-foreground">
                  {product.description}
                </p>
              ) : null}
            </section>

            <AddToCartForm
              key={product.id}
              productId={product.id}
              productName={product.name}
              productPrice={product.price}
              color={product.color}
              variants={product.variants}
              sizeChart={product.sizeChart}
              submitSideAction={
                <WishlistButton
                  productId={product.id}
                  productName={product.name}
                  variant="outline"
                  className="shrink-0"
                />
              }
            />

            <ProductAssuranceSection content={content} />

            {product.detailSections.length > 0 ? (
              <div className="grid gap-5 border-border border-t py-6 text-sm">
                {product.detailSections.map((section) => (
                  <section key={section.key} className="flex gap-3">
                    <ProductDetailIcon sectionKey={section.key} />
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

function getDiscountLabel(product: ProductDetail) {
  if (!product.priceAmount || !product.compareAtPriceAmount) {
    return "Sale";
  }

  const discountPercent = Math.round(
    ((product.compareAtPriceAmount - product.priceAmount) /
      product.compareAtPriceAmount) *
      100,
  );

  return `${discountPercent}% off`;
}

function ProductAssuranceSection({
  content,
}: {
  content: typeof siteContent.product;
}) {
  const items = [
    {
      title: content.deliveryTitle,
      text: content.deliveryText,
      icon: Truck,
    },
    {
      title: content.returnsTitle,
      text: content.returnsText,
      icon: RefreshCw,
    },
    {
      title: content.paymentTitle,
      text: content.paymentText,
      icon: CreditCard,
    },
  ];

  return (
    <section className="grid gap-4 border-border border-t py-6 text-sm sm:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div key={item.title} className="flex gap-3">
            <Icon
              className="mt-0.5 size-5 shrink-0 stroke-icon text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-medium">{item.title}</h2>
              <p className="mt-1 text-muted-foreground">{item.text}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ProductDetailIcon({ sectionKey }: { sectionKey: string }) {
  const icons = {
    measurements: Ruler,
    fit: Ruler,
    fabric: Shirt,
    care: ShieldCheck,
    model: UserRound,
  } satisfies Record<string, typeof ShieldCheck>;
  const Icon = icons[sectionKey as keyof typeof icons] ?? ShieldCheck;

  return (
    <Icon
      className="mt-0.5 size-5 shrink-0 stroke-icon text-muted-foreground"
      aria-hidden="true"
    />
  );
}
