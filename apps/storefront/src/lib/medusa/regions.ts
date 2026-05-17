import { cache } from "react";

import { medusaFetch } from "@/lib/medusa/client";

type MedusaRegion = {
  id: string;
};

type MedusaRegionsResponse = {
  regions?: MedusaRegion[];
};

export const getDefaultRegionId = cache(async () => {
  const data = await medusaFetch<MedusaRegionsResponse>("/store/regions", {
    cache: "no-store",
  });

  return data?.regions?.[0]?.id ?? null;
});
