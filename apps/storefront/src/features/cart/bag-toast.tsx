"use client";

import { ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { siteContent } from "@/content/site-content";
import { useBagStore } from "@/features/cart/bag-store";

export function BagToast() {
  const content = siteContent.bag;
  const addedItem = useBagStore((state) => state.addedItem);
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
      className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-4 z-50 border border-border bg-background p-3 shadow-sm sm:left-auto sm:w-[420px]"
    >
      <div className="grid grid-cols-[58px_1fr_auto] gap-3">
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
              sizes="58px"
              className="object-cover"
            />
          ) : null}
        </Link>
        <div className="min-w-0 py-0.5">
          <p className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase">
            <ShoppingBag className="size-3.5 stroke-icon" aria-hidden="true" />
            {content.addedToastLabel}
          </p>
          <p className="mt-1 truncate font-medium text-sm">{addedItem.name}</p>
          <p className="mt-1 truncate text-muted-foreground text-xs">
            {addedItem.variant} · {content.quantityPrefix} {addedItem.quantity}{" "}
            · {addedItem.total}
          </p>
        </div>
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
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={openBag}
          className="h-10 rounded-none hover:border-foreground"
        >
          {content.viewFullAction}
        </Button>
        <Link
          href="/checkout"
          prefetch={false}
          onClick={dismissAddedItem}
          className="inline-flex h-10 items-center justify-center bg-primary px-4 text-primary-foreground text-sm transition hover:bg-primary/90"
        >
          {content.checkoutAction}
        </Link>
      </div>
    </div>
  );
}
