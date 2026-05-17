"use client";

import { Heart } from "lucide-react";
import Link from "next/link";

import { useWishlistStore } from "@/features/wishlist/wishlist-store";

export function WishlistLink() {
  const count = useWishlistStore((state) => state.productIds.length);
  const hasHydrated = useWishlistStore((state) => state.hasHydrated);

  return (
    <Link
      href="/wishlist"
      prefetch={false}
      aria-label="Open wishlist"
      className="relative grid size-9 cursor-pointer place-items-center transition hover:bg-muted"
    >
      <Heart className="size-4 stroke-[1.6]" aria-hidden="true" />
      {hasHydrated && count > 0 ? (
        <span className="-top-1 -right-1 absolute grid size-4 place-items-center bg-primary text-[0.62rem] text-primary-foreground leading-none">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
