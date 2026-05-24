import "server-only";

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

type MedusaFetchInit = RequestInit & {
  next?: {
    revalidate?: false | 0 | number;
    tags?: string[];
  };
};

export async function medusaFetch<T>(
  path: string,
  init: MedusaFetchInit = {},
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

export async function medusaPostJson<T>(
  path: string,
  body?: unknown,
  init: MedusaFetchInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");

  return medusaFetch<T>(path, {
    ...init,
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: init.cache ?? "no-store",
    headers,
  });
}

export async function medusaDelete<T>(
  path: string,
  init: MedusaFetchInit = {},
) {
  return medusaFetch<T>(path, {
    ...init,
    method: "DELETE",
    cache: init.cache ?? "no-store",
  });
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
