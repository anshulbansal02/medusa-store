import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 text-sm text-muted-foreground md:flex-row">
        <div>
          <Link href="/" className="font-heading text-3xl text-foreground">
            The Label
          </Link>
          <p className="mt-3 max-w-sm">
            Premium western occasion wear for India, built around newness,
            visual appeal, and a low-friction shopping flow.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="mb-3 text-foreground text-sm font-medium">Shop</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" prefetch={false}>
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/shop/dresses" prefetch={false}>
                  Dresses
                </Link>
              </li>
              <li>
                <Link href="/shop/sets" prefetch={false}>
                  Sets
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-3 text-foreground text-sm font-medium">Help</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" prefetch={false}>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/size-guide" prefetch={false}>
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/shipping" prefetch={false}>
                  Shipping
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
