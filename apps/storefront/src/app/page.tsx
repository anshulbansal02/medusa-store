import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { siteContent } from "@/content/site-content";
import {
  FitSupportSection,
  HeroSection,
  NewArrivalsSection,
  OccasionEditSection,
  TrustStrip,
} from "@/features/home/home-sections";
import { absoluteUrl, siteConfig } from "@/lib/config/site";
import { getHomeProducts } from "@/lib/medusa/products";

export const metadata: Metadata = {
  title: `${siteConfig.name} | Occasion wear for evenings out`,
  description: siteConfig.description,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: `${siteConfig.name} | Occasion wear for evenings out`,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    type: "website",
  },
};

export default async function Home() {
  const products = await getHomeProducts();
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
      <HeroSection
        content={content}
        heroProducts={heroProducts}
        primaryProduct={primaryHeroProduct}
      />
      <NewArrivalsSection content={content} products={newArrivalProducts} />
      <OccasionEditSection content={content} products={occasionProducts} />
      <FitSupportSection content={content} product={fitSupportProduct} />
      <TrustStrip content={content} />
      <SiteFooter />
    </main>
  );
}
