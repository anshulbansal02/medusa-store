import type {
  MedusaProductCategory,
  StorefrontProductCategory,
} from "./categories";

export type MedusaImage = {
  url?: string;
};

export type MedusaPrice = {
  calculated_amount?: number;
  currency_code?: string;
};

export type MedusaLegacyPrice = {
  amount?: number;
  currency_code?: string;
};

export type MedusaVariantOption = {
  value?: string;
  option?: {
    title?: string;
  };
};

export type MedusaVariant = {
  id?: string;
  title?: string;
  options?: MedusaVariantOption[];
  calculated_price?: MedusaPrice | null;
  prices?: MedusaLegacyPrice[];
};

export type MedusaMetadata = Record<string, unknown>;

export type MedusaProduct = {
  id: string;
  title: string;
  handle?: string;
  description?: string | null;
  thumbnail?: string | null;
  images?: MedusaImage[];
  variants?: MedusaVariant[];
  categories?: MedusaProductCategory[];
  metadata?: MedusaMetadata | null;
};

export type MedusaProductsResponse = {
  products?: MedusaProduct[];
};

export type StorefrontProduct = {
  id: string;
  name: string;
  href: string;
  price: string;
  note: string;
  image: string;
  categories: StorefrontProductCategory[];
};

export type ProductDetail = {
  id: string;
  name: string;
  handle: string;
  description: string;
  price: string;
  priceAmount: number | null;
  currencyCode: string;
  images: string[];
  variants: ProductDetailVariant[];
  color: string;
  categories: StorefrontProductCategory[];
  detailSections: ProductDetailSection[];
  sizeChart: ProductSizeChart | null;
};

export type ProductDetailVariant = {
  id: string;
  title: string;
  size: string;
  color: string;
  price: string;
};

export type ProductSizeChartColumn = {
  key: string;
  label: string;
};

export type ProductSizeChartRow = {
  size: string;
  values: Record<string, string>;
};

export type ProductSizeChart = {
  unit: string;
  note: string;
  columns: ProductSizeChartColumn[];
  rows: ProductSizeChartRow[];
};

export type ProductDetailSection = {
  key: string;
  title: string;
  text: string;
};
