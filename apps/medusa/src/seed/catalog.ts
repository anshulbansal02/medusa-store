import { ProductStatus } from "@medusajs/framework/utils";

type SeedProductInput = {
  categoryIds: Map<string, string>;
  defaultSalesChannelId: string;
  shippingProfileId: string;
};

const sizeOptions = ["XS", "S", "M", "L", "XL"];

const standardDressSizeChart = {
  unit: "in",
  note: "Garment measurements. Compare with a similar piece that fits you well.",
  columns: [
    { key: "bust", label: "Bust" },
    { key: "waist", label: "Waist" },
    { key: "hip", label: "Hip" },
  ],
  rows: [
    { size: "XS", values: { bust: "32", waist: "26", hip: "34" } },
    { size: "S", values: { bust: "34", waist: "28", hip: "36" } },
    { size: "M", values: { bust: "36", waist: "30", hip: "38" } },
    { size: "L", values: { bust: "38", waist: "32", hip: "40" } },
    { size: "XL", values: { bust: "40", waist: "34", hip: "42" } },
  ],
};

function makeSizeVariants({
  baseSku,
  color,
  price,
}: {
  baseSku: string;
  color: string;
  price: number;
}) {
  return sizeOptions.map((size) => ({
    title: `${size} / ${color}`,
    sku: `${baseSku}-${size}`,
    options: {
      Size: size,
      Color: color,
    },
    prices: [
      {
        amount: price,
        currency_code: "inr",
      },
    ],
  }));
}

function getCategoryId(categoryIds: Map<string, string>, name: string) {
  const id = categoryIds.get(name);

  if (!id) {
    throw new Error(`Missing seeded category: ${name}`);
  }

  return id;
}

export function createSeedProducts({
  categoryIds,
  defaultSalesChannelId,
  shippingProfileId,
}: SeedProductInput) {
  return [
    {
      title: "Noor Draped Midi Dress",
      category_ids: [getCategoryId(categoryIds, "Dresses")],
      description:
        "Draped midi dress in deep wine with a clean neckline and soft movement.",
      handle: "noor-draped-midi-dress",
      metadata: {
        product_details: {
          fabric: "Mid-weight draped crepe with a soft matte finish.",
          fit: "Skims the body through the waist with easy movement through the skirt.",
          care: "Dry clean recommended. Steam lightly from the reverse side.",
          model: "Model is 5'8\" and wears size S.",
        },
        size_chart: standardDressSizeChart,
      },
      weight: 400,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfileId,
      images: [
        {
          url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=82",
        },
        {
          url: "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=82",
        },
      ],
      options: [
        {
          title: "Size",
          values: sizeOptions,
        },
        {
          title: "Color",
          values: ["Wine"],
        },
      ],
      variants: makeSizeVariants({
        baseSku: "NOOR-WINE",
        color: "Wine",
        price: 6800,
      }),
      sales_channels: [
        {
          id: defaultSalesChannelId,
        },
      ],
    },
    {
      title: "Ira Structured Co-ord",
      category_ids: [getCategoryId(categoryIds, "Co-ords")],
      description:
        "Structured ivory co-ord with a tailored top and easy evening fit.",
      handle: "ira-structured-coord",
      metadata: {
        product_details: {
          fabric: "Structured woven blend with a smooth lining in the top.",
          fit: "Tailored through the shoulder and relaxed through the trouser.",
          care: "Dry clean only to preserve the set shape.",
          model: "Model is 5'7\" and wears size S.",
        },
        size_chart: standardDressSizeChart,
      },
      weight: 500,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfileId,
      images: [
        {
          url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=82",
        },
      ],
      options: [
        {
          title: "Size",
          values: sizeOptions,
        },
        {
          title: "Color",
          values: ["Ivory"],
        },
      ],
      variants: makeSizeVariants({
        baseSku: "IRA-IVORY",
        color: "Ivory",
        price: 7200,
      }),
      sales_channels: [
        {
          id: defaultSalesChannelId,
        },
      ],
    },
    {
      title: "Mira Satin Evening Top",
      category_ids: [getCategoryId(categoryIds, "Tops")],
      description:
        "Satin evening top in sage with a sharper shoulder and fluid drape.",
      handle: "mira-satin-evening-top",
      metadata: {
        product_details: {
          fabric: "Fluid satin with a soft sheen and clean fall.",
          fit: "Sharp shoulder line with a relaxed body for easy tucking.",
          care: "Dry clean recommended. Avoid high-heat ironing on the face.",
          model: "Model is 5'8\" and wears size S.",
        },
        size_chart: standardDressSizeChart,
      },
      weight: 250,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfileId,
      images: [
        {
          url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=82",
        },
      ],
      options: [
        {
          title: "Size",
          values: sizeOptions,
        },
        {
          title: "Color",
          values: ["Sage"],
        },
      ],
      variants: makeSizeVariants({
        baseSku: "MIRA-SAGE",
        color: "Sage",
        price: 5400,
      }),
      sales_channels: [
        {
          id: defaultSalesChannelId,
        },
      ],
    },
    {
      title: "Zoya Cutwork Dress",
      category_ids: [getCategoryId(categoryIds, "Occasion Edit")],
      description:
        "Cutwork occasion dress in black with a fitted waist and photo-ready shape.",
      handle: "zoya-cutwork-dress",
      metadata: {
        product_details: {
          fabric: "Cutwork textured fabric with a smooth inner lining.",
          fit: "Defined at the waist with a clean, occasion-ready shape.",
          care: "Dry clean only. Store flat or on a padded hanger.",
          model: "Model is 5'7\" and wears size S.",
        },
        size_chart: standardDressSizeChart,
      },
      weight: 420,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfileId,
      images: [
        {
          url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=82",
        },
      ],
      options: [
        {
          title: "Size",
          values: sizeOptions,
        },
        {
          title: "Color",
          values: ["Black"],
        },
      ],
      variants: makeSizeVariants({
        baseSku: "ZOYA-BLACK",
        color: "Black",
        price: 8100,
      }),
      sales_channels: [
        {
          id: defaultSalesChannelId,
        },
      ],
    },
  ];
}
