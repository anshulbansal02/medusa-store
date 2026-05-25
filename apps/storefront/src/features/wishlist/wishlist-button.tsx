"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/features/wishlist/wishlist-store";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  productId: string;
  productName: string;
  className?: string;
  variant?: "floating" | "outline";
};

export function WishlistButton({
  variant = "floating",
  productId,
  productName,
  className,
}: WishlistButtonProps) {
  const productIds = useWishlistStore((state) => state.productIds);
  const hasHydrated = useWishlistStore((state) => state.hasHydrated);
  const toggleProduct = useWishlistStore((state) => state.toggleProduct);
  const isSaved = hasHydrated && productIds.includes(productId);
  function handleClick() {
    toggleProduct(productId);
    trackAnalyticsEvent(
      isSaved ? "wishlist_item_removed" : "wishlist_item_added",
      {
        product_id: productId,
        product_name: productName,
      },
    );
  }

  return (
    <Button
      type="button"
      variant={variant === "outline" ? "outline" : "ghost"}
      size="icon"
      aria-label={
        isSaved
          ? `Remove ${productName} from wishlist`
          : `Save ${productName} to wishlist`
      }
      aria-pressed={isSaved}
      data-saved={isSaved}
      className={cn(
        variant === "outline"
          ? "h-12 w-12 rounded-none border-border text-foreground hover:border-foreground hover:bg-background hover:text-foreground data-[saved=true]:border-primary/35 data-[saved=true]:text-primary"
          : "size-8 rounded-full border border-background/85 bg-background/88 text-foreground shadow-md backdrop-blur-sm transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-150 ease-out hover:-translate-y-0.5 hover:border-background hover:bg-background hover:text-primary hover:shadow-lg active:translate-y-0 active:scale-95 data-[saved=true]:border-background data-[saved=true]:bg-background data-[saved=true]:text-primary motion-reduce:transition-none sm:size-10 sm:shadow-lg sm:hover:shadow-xl",
        className,
      )}
      onClick={handleClick}
    >
      <Heart
        className={cn(
          "size-4 stroke-icon-strong transition-[fill,stroke,transform] duration-150 ease-out group-hover/button:scale-110 motion-reduce:transition-none sm:size-[18px]",
          isSaved ? "fill-current" : "fill-transparent",
        )}
        aria-hidden="true"
      />
    </Button>
  );
}
