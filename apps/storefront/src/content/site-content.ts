import { cartContent } from "@/content/cart-content";
import { catalogContent } from "@/content/catalog-content";
import { checkoutContent } from "@/content/checkout-content";
import { globalContent } from "@/content/global-content";
import { homeContent } from "@/content/home-content";
import { orderContent } from "@/content/order-content";
import { supportContent } from "@/content/support-content";

export const siteContent = {
  ...globalContent,
  home: homeContent,
  ...catalogContent,
  ...cartContent,
  ...checkoutContent,
  ...supportContent,
  ...orderContent,
} as const;

export type SiteContent = typeof siteContent;
