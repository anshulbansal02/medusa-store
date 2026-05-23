import Link from "next/link";

import { MobileMenu } from "@/components/site/mobile-menu";
import { siteContent } from "@/content/site-content";
import { BagDrawer } from "@/features/cart/bag-drawer";
import { BagHydrator } from "@/features/cart/bag-hydrator";
import { BagToast } from "@/features/cart/bag-toast";
import { SearchDialog } from "@/features/search/search-dialog";
import { WishlistLink } from "@/features/wishlist/wishlist-link";
import { getCurrentCart } from "@/lib/medusa/cart";
import { getProductCategories } from "@/lib/medusa/categories";
import { getProducts } from "@/lib/medusa/products";

export async function SiteHeader() {
  const [cart, categories, searchProducts] = await Promise.all([
    getCurrentCart(),
    getProductCategories(5),
    getProducts({ limit: 12 }),
  ]);
  const cartItemCount = cart?.itemCount ?? 0;
  const navItems = [
    { href: "/shop", label: siteContent.header.primaryShopLabel },
    ...categories.map((category) => ({
      href: `/shop/${category.handle}`,
      label: category.name,
    })),
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-border/70 border-b bg-background/92 backdrop-blur-sm">
      <div className="border-border/70 border-b px-4 py-2 text-micro uppercase tracking-label text-muted-foreground sm:px-6 sm:tracking-label-wide lg:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 overflow-x-auto whitespace-nowrap">
          {siteContent.header.announcementItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
      <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center lg:hidden">
          <MobileMenu navItems={navItems} />
        </div>

        <nav
          className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex"
          aria-label={siteContent.header.primaryNavigationLabel}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className="transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="font-heading text-2xl leading-none tracking-normal"
        >
          {siteContent.brand.name}
        </Link>

        <div className="flex items-center justify-end gap-1.5">
          <SearchDialog products={searchProducts} categories={categories} />
          <WishlistLink />
          <BagDrawer initialCart={cart} initialItemCount={cartItemCount} />
        </div>
      </div>
      <BagHydrator cart={cart} />
      <BagToast />
    </header>
  );
}
