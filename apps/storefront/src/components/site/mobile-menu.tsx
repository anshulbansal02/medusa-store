"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export type MobileMenuItem = {
  href: string;
  label: string;
};

type MobileMenuProps = {
  navItems: MobileMenuItem[];
};

const supportItems = [
  { href: "/size-guide", label: "Size Guide" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Contact" },
];

export function MobileMenu({ navItems }: MobileMenuProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="left" autoFocus>
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="size-9 rounded-none text-muted-foreground hover:bg-transparent hover:text-foreground lg:hidden"
        >
          <Menu className="size-4 stroke-[1.6]" aria-hidden="true" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-dvh w-[86vw] max-w-sm rounded-none border-border bg-background text-foreground">
        <div className="flex items-start justify-between gap-5 border-border border-b px-5 py-5">
          <div>
            <DrawerTitle className="font-heading text-3xl leading-none">
              Menu
            </DrawerTitle>
            <DrawerDescription className="mt-1 text-muted-foreground text-sm">
              Shop the current edit and store support.
            </DrawerDescription>
          </div>
          <DrawerClose
            ref={closeButtonRef}
            aria-label="Close menu"
            className="inline-flex size-9 cursor-pointer items-center justify-center text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4 stroke-[1.6]" aria-hidden="true" />
          </DrawerClose>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <Link
            href="/search"
            prefetch={false}
            onClick={closeMenu}
            className="flex min-h-12 items-center gap-3 border-border border-b text-sm font-medium transition hover:text-primary"
          >
            <Search className="size-4 stroke-[1.6]" aria-hidden="true" />
            Search
          </Link>

          <nav aria-label="Mobile primary navigation" className="py-4">
            <ul className="grid gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    onClick={closeMenu}
                    className="block py-3 font-heading text-4xl leading-none transition hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-label="Mobile support navigation"
            className="border-border border-t pt-4"
          >
            <ul className="grid gap-1 text-sm text-muted-foreground">
              {supportItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    onClick={closeMenu}
                    className="block py-2 transition hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
