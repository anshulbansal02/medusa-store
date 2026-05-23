import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionView } from "@/features/products/collection-view";
import { ProductDetailView } from "@/features/products/product-detail-view";
import { absoluteUrl } from "@/lib/config/site";
import { getCategoryByHandle } from "@/lib/medusa/categories";
import {
  getProductByHandle,
  getProductsByCategoryHandle,
  getRelatedProducts,
} from "@/lib/medusa/products";

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
    return <CollectionRoute handle={handle} />;
  }

  return (
    <ProductDetailView
      product={product}
      relatedProducts={await getRelatedProducts(product, 4)}
    />
  );
}

async function CollectionRoute({ handle }: { handle: string }) {
  const { category, products } = await getProductsByCategoryHandle({
    handle,
    limit: 24,
  });

  if (!category) {
    notFound();
  }

  return <CollectionView category={category} products={products} />;
}
