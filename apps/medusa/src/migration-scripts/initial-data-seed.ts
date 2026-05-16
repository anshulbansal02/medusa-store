import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const countries = ["in"];

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Default Sales Channel",
          description: "Created by Medusa",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Default Publishable API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  const {
    result: [store],
  } = await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Default Store",
          supported_currencies: [
            {
              currency_code: "inr",
              is_default: true,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "India",
          currency_code: "inr",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "India Warehouse",
          address: {
            city: "Mumbai",
            country_code: "IN",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  // This is created by a migration script in core.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "India Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "India",
        geo_zones: [
          {
            country_code: "in",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "inr",
            amount: 149,
          },
          {
            region_id: region.id,
            amount: 149,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "inr",
            amount: 299,
          },
          {
            region_id: region.id,
            amount: 299,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Dresses",
          is_active: true,
        },
        {
          name: "Co-ords",
          is_active: true,
        },
        {
          name: "Tops",
          is_active: true,
        },
        {
          name: "Occasion Edit",
          is_active: true,
        },
      ],
    },
  });

  const categoryIds = new Map(
    categoryResult.map((category) => [category.name, category.id])
  );
  const getCategoryId = (name: string) => {
    const id = categoryIds.get(name);

    if (!id) {
      throw new Error(`Missing seeded category: ${name}`);
    }

    return id;
  };
  const sizeOptions = ["XS", "S", "M", "L", "XL"];
  const makeSizeVariants = ({
    baseSku,
    color,
    price,
  }: {
    baseSku: string;
    color: string;
    price: number;
  }) =>
    sizeOptions.map((size) => ({
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

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Noor Draped Midi Dress",
          category_ids: [getCategoryId("Dresses")],
          description:
            "Draped midi dress in deep wine with a clean neckline and soft movement.",
          handle: "noor-draped-midi-dress",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
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
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Ira Structured Co-ord",
          category_ids: [getCategoryId("Co-ords")],
          description:
            "Structured ivory co-ord with a tailored top and easy evening fit.",
          handle: "ira-structured-coord",
          weight: 500,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
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
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Mira Satin Evening Top",
          category_ids: [getCategoryId("Tops")],
          description:
            "Satin evening top in sage with a sharper shoulder and fluid drape.",
          handle: "mira-satin-evening-top",
          weight: 250,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
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
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Zoya Cutwork Dress",
          category_ids: [getCategoryId("Occasion Edit")],
          description:
            "Cutwork occasion dress in black with a fitted waist and photo-ready shape.",
          handle: "zoya-cutwork-dress",
          weight: 420,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
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
              id: defaultSalesChannel.id,
            },
          ],
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 1000000,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
