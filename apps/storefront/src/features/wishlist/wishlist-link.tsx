"use client";

import { Heart } from "lucide-react";
import Link from "next/link";

import { siteContent } from "@/content/site-content";
import { useWishlistStore } from "@/features/wishlist/wishlist-store";

export function WishlistLink() {
  const content = siteContent.wishlist;
  const count = useWishlistStore((state) => state.productIds.length);
  const hasHydrated = useWishlistStore((state) => state.hasHydrated);

  return (
    <Link
      href="/wishlist"
      prefetch={false}
      aria-label={content.openLabel}
      className="relative grid size-9 cursor-pointer place-items-center transition hover:bg-muted"
    >
      <Heart className="size-4 stroke-icon" aria-hidden="true" />
      {hasHydrated && count > 0 ? (
        <span className="-top-1 -right-1 absolute grid size-4 place-items-center bg-primary text-primary-foreground text-tiny leading-none">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
