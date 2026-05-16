import { Search, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/shop", label: "New Arrivals" },
  { href: "/shop/dresses", label: "Dresses" },
  { href: "/shop/sets", label: "Sets" },
  { href: "/shop/tops", label: "Tops" },
  { href: "/shop/occasion-edit", label: "Occasion Edit" },
];

export function SiteHeader() {
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
          <Link
            href="/account"
            prefetch={false}
            aria-label="Account"
            className="hidden size-9 items-center justify-center text-muted-foreground transition hover:text-foreground sm:inline-flex"
          >
            <UserRound className="size-4 stroke-[1.6]" />
          </Link>
          <Link
            href="/cart"
            prefetch={false}
            aria-label="Cart"
            className="inline-flex size-9 items-center justify-center text-muted-foreground transition hover:text-foreground"
          >
            <ShoppingBag className="size-4 stroke-[1.6]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
