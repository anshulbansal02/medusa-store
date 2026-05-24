"use client";

import { ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { siteContent } from "@/content/site-content";
import { useBagStore } from "@/features/cart/bag-store";
import { cn } from "@/lib/utils";

export function BagToast() {
  const content = siteContent.bag;
  const addedItem = useBagStore((state) => state.addedItem);
  const placement = useBagStore((state) => state.addedItemToastPlacement);
  const dismissAddedItem = useBagStore((state) => state.dismissAddedItem);
  const openBag = useBagStore((state) => state.openBag);

  useEffect(() => {
    if (!addedItem) {
      return;
    }

    const timeout = window.setTimeout(dismissAddedItem, 5200);

    return () => window.clearTimeout(timeout);
  }, [addedItem, dismissAddedItem]);

  if (!addedItem) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={cn(
        "fade-in-0 fixed right-4 left-auto z-[70] w-[min(calc(100vw-2rem),360px)] animate-in border border-border bg-background p-2.5 shadow-md duration-200",
        placement === "top"
          ? "slide-in-from-top-3 top-[calc(env(safe-area-inset-top)+1rem)] bottom-auto"
          : "slide-in-from-bottom-3 top-auto bottom-[calc(env(safe-area-inset-bottom)+5rem)] sm:bottom-5",
      )}
    >
      <div className="grid grid-cols-[46px_1fr_auto] items-center gap-3">
        <Link
          href={addedItem.href}
          prefetch={false}
          onClick={dismissAddedItem}
          className="relative aspect-[4/5] overflow-hidden bg-muted"
        >
          {addedItem.image ? (
            <Image
              src={addedItem.image}
              alt={addedItem.name}
              fill
              sizes="46px"
              className="object-cover"
            />
          ) : null}
        </Link>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase">
            <ShoppingBag className="size-3.5 stroke-icon" aria-hidden="true" />
            {content.addedToastLabel}
          </p>
          <p className="mt-1 truncate font-medium text-sm">{addedItem.name}</p>
          <p className="truncate text-muted-foreground text-xs">
            {addedItem.variant} · {content.quantityPrefix} {addedItem.quantity}{" "}
            · {addedItem.total}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            onClick={openBag}
            className="h-8 rounded-none px-2.5 text-xs hover:border-foreground"
          >
            {content.viewBagAction}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={content.dismissAddedToastLabel}
            onClick={dismissAddedItem}
            className="size-8 rounded-none text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            <X className="size-4 stroke-icon" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
