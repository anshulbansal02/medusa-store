import { Search } from "lucide-react";
import Link from "next/link";

import { BagDrawer } from "@/features/cart/bag-drawer";
import { BagHydrator } from "@/features/cart/bag-hydrator";
import { BagToast } from "@/features/cart/bag-toast";
import { getCurrentCart } from "@/lib/medusa/cart";

const navItems = [
  { href: "/shop", label: "New Arrivals" },
  { href: "/shop/dresses", label: "Dresses" },
  { href: "/shop/sets", label: "Sets" },
  { href: "/shop/tops", label: "Tops" },
  { href: "/shop/occasion-edit", label: "Occasion Edit" },
];

export async function SiteHeader() {
  const cart = await getCurrentCart();
  const cartItemCount = cart?.itemCount ?? 0;

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-border/70 border-b bg-background/92 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-heading text-2xl leading-none tracking-normal"
        >
          The Label
        </Link>

        <nav
          className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex"
          aria-label="Primary navigation"
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

        <div className="flex items-center gap-1.5">
          <Link
            href="/search"
            prefetch={false}
            aria-label="Search"
            className="inline-flex size-9 items-center justify-center text-muted-foreground transition hover:text-foreground"
          >
            <Search className="size-4 stroke-[1.6]" />
          </Link>
          <BagDrawer initialCart={cart} initialItemCount={cartItemCount} />
        </div>
      </div>
      <BagHydrator cart={cart} />
      <BagToast />
    </header>
  );
}
