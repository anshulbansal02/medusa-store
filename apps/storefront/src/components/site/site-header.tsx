import Link from "next/link";

import { LinkPendingIndicator } from "@/components/site/link-pending-indicator";
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
  const navItems = siteContent.header.primaryNavigationItems;
  const announcement = siteContent.header.announcement;

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-border/70 border-b bg-background/96 backdrop-blur-sm">
      {announcement.enabled ? (
        <div className="bg-announcement px-4 py-2 text-center text-micro font-medium uppercase tracking-label text-announcement-foreground sm:px-6 sm:tracking-label-wide lg:px-8">
          <Link
            href={announcement.href}
            prefetch={false}
            className="mx-auto flex max-w-[1440px] items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>{announcement.label}</span>
            <span className="hidden sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="hidden underline-offset-4 hover:underline sm:inline">
              {announcement.linkLabel}
            </span>
          </Link>
        </div>
      ) : null}
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
              className="inline-flex items-center gap-2 transition hover:text-foreground"
            >
              <span>{item.label}</span>
              <LinkPendingIndicator />
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="font-heading text-3xl leading-none tracking-normal"
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
