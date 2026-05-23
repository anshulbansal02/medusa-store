import type { Metadata } from "next";

import { HomeView } from "@/features/home/home-view";
import { absoluteUrl, siteConfig } from "@/lib/config/site";
import { getHomeProducts } from "@/lib/medusa/products";

export const metadata: Metadata = {
  title: `${siteConfig.name} | Occasion wear for evenings out`,
  description: siteConfig.description,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: `${siteConfig.name} | Occasion wear for evenings out`,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    type: "website",
  },
};

export default async function Home() {
  return <HomeView products={await getHomeProducts()} />;
}
