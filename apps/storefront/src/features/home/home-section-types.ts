import type { HomeContent } from "@/content/home-content";
import type { StorefrontProduct } from "@/lib/medusa/products";

export type HomeSectionProps = {
  content: HomeContent;
};

export type ProductSectionProps = HomeSectionProps & {
  products: StorefrontProduct[];
};
