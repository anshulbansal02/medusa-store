import type { Metadata } from "next";

import { BagPageView } from "@/features/cart/bag-page-view";
import { getCurrentCart } from "@/lib/medusa/cart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bag | The Label",
  description: "Review selected styles before checkout.",
};

export default async function BagPage() {
  return <BagPageView cart={await getCurrentCart()} />;
}
