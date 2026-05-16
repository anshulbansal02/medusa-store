const medusaBackendUrl =
  process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const medusaPublishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

function isConfigured(value: string | undefined): value is string {
  return typeof value === "string" && !value.includes("replace_me");
}

export function getMedusaConfig() {
  const backendUrl = medusaBackendUrl;
  const publishableKey = medusaPublishableKey;

  if (!isConfigured(backendUrl) || !isConfigured(publishableKey)) {
    return null;
  }

  return { backendUrl, publishableKey };
}

export async function medusaFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T | null> {
  const config = getMedusaConfig();

  if (!config) {
    return null;
  }

  const headers = new Headers(init.headers);
  headers.set("x-publishable-api-key", config.publishableKey);

  let response: Response;

  try {
    response = await fetch(new URL(path, config.backendUrl), {
      ...init,
      headers,
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

export function formatStorePrice(amount?: number, currencyCode?: string) {
  if (typeof amount !== "number" || !currencyCode) {
    return null;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount);
}
