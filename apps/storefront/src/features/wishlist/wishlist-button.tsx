"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/features/wishlist/wishlist-store";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  productId: string;
  productName: string;
  className?: string;
};

export function WishlistButton({
  productId,
  productName,
  className,
}: WishlistButtonProps) {
  const productIds = useWishlistStore((state) => state.productIds);
  const hasHydrated = useWishlistStore((state) => state.hasHydrated);
  const toggleProduct = useWishlistStore((state) => state.toggleProduct);
  const isSaved = hasHydrated && productIds.includes(productId);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={
        isSaved
          ? `Remove ${productName} from wishlist`
          : `Save ${productName} to wishlist`
      }
      aria-pressed={isSaved}
      className={cn(
        "size-10 rounded-none bg-background/90 text-foreground shadow-sm hover:bg-background",
        className,
      )}
      onClick={() => toggleProduct(productId)}
    >
      <Heart
        className={cn(
          "size-4 stroke-icon-strong",
          isSaved ? "fill-current" : "fill-transparent",
        )}
        aria-hidden="true"
      />
    </Button>
  );
}
