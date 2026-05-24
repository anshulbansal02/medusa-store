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
        "size-10 rounded-full border border-background/85 bg-background/88 text-foreground shadow-lg backdrop-blur-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-background hover:text-primary hover:shadow-xl active:translate-y-0 active:scale-95 data-[saved=true]:border-background data-[saved=true]:bg-background data-[saved=true]:text-primary motion-reduce:transition-none",
        className,
      )}
      onClick={() => toggleProduct(productId)}
    >
      <Heart
        className={cn(
          "size-[18px] stroke-icon-strong transition duration-300 ease-out group-hover/button:scale-110 motion-reduce:transition-none",
          isSaved ? "fill-current" : "fill-transparent",
        )}
        aria-hidden="true"
      />
    </Button>
  );
}
