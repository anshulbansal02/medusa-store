export const siteConfig = {
  name: "Neonfold",
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://storefront.localhost"
  ).replace(/\/$/, ""),
  description:
    "Premium occasion and western wear for dinners, weddings, and after-hours plans.",
};

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return new URL(normalizedPath, siteConfig.url).toString();
}
