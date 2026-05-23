export const seedCountryCodes = ["in"];

export const seedCurrencyCode = "inr";

export const seedInventoryQuantity = 1_000_000;

export const seedProductCategoryNames = [
  "Dresses",
  "Co-ords",
  "Tops",
  "Occasion Edit",
] as const;

export function createSeedShippingOptions({
  regionId,
  serviceZoneId,
  shippingProfileId,
}: {
  regionId: string;
  serviceZoneId: string;
  shippingProfileId: string;
}) {
  const enabledShippingRules = [
    {
      attribute: "enabled_in_store",
      value: "true",
      operator: "eq" as const,
    },
    {
      attribute: "is_return",
      value: "false",
      operator: "eq" as const,
    },
  ];

  return [
    {
      name: "Standard Shipping",
      price_type: "flat" as const,
      provider_id: "manual_manual",
      service_zone_id: serviceZoneId,
      shipping_profile_id: shippingProfileId,
      type: {
        label: "Standard",
        description: "Delivery in 2-3 business days.",
        code: "standard",
      },
      prices: [
        {
          currency_code: seedCurrencyCode,
          amount: 149,
        },
        {
          region_id: regionId,
          amount: 149,
        },
      ],
      rules: enabledShippingRules,
    },
    {
      name: "Express Shipping",
      price_type: "flat" as const,
      provider_id: "manual_manual",
      service_zone_id: serviceZoneId,
      shipping_profile_id: shippingProfileId,
      type: {
        label: "Express",
        description: "Priority dispatch within 24 hours.",
        code: "express",
      },
      prices: [
        {
          currency_code: seedCurrencyCode,
          amount: 299,
        },
        {
          region_id: regionId,
          amount: 299,
        },
      ],
      rules: enabledShippingRules,
    },
  ];
}
