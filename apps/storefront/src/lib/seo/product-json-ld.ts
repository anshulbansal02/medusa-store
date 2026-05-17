import { absoluteUrl, siteConfig } from "@/lib/config/site";
import type { ProductDetail } from "@/lib/medusa/products";

type ProductJsonLd = {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description?: string;
  image: string[];
  url: string;
  brand: {
    "@type": "Brand";
    name: string;
  };
  offers?: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
  };
};

export function createProductJsonLd(product: ProductDetail): ProductJsonLd {
  const productUrl = absoluteUrl(`/shop/${product.handle}`);
  const jsonLd: ProductJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.images,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
  };

  if (product.priceAmount !== null && product.currencyCode) {
    jsonLd.offers = {
      "@type": "Offer",
      price: String(product.priceAmount),
      priceCurrency: product.currencyCode.toUpperCase(),
      availability:
        product.variants.length > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: productUrl,
    };
  }

  return jsonLd;
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
