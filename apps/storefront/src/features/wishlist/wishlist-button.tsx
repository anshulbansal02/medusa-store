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
      data-saved={isSaved}
      className={cn(
        "size-10 rounded-none bg-transparent text-foreground shadow-none transition duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-primary active:translate-y-0 data-[saved=true]:text-primary motion-reduce:transition-none",
        className,
      )}
      onClick={() => toggleProduct(productId)}
    >
      <Heart
        className={cn(
          "size-5 stroke-icon-strong drop-shadow-sm transition duration-300 group-hover/button:scale-110 motion-reduce:transition-none",
          isSaved
            ? "fill-current"
            : "fill-background/85 group-hover/button:fill-background",
        )}
        aria-hidden="true"
      />
    </Button>
  );
}
