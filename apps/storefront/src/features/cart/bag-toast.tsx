"use client";

import { ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { useBagStore } from "@/features/cart/bag-store";

export function BagToast() {
  const addedItem = useBagStore((state) => state.addedItem);
  const dismissAddedItem = useBagStore((state) => state.dismissAddedItem);
  const openBag = useBagStore((state) => state.openBag);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!addedItem) {
      return;
    }

    const timeout = window.setTimeout(dismissAddedItem, 5200);

    return () => window.clearTimeout(timeout);
  }, [addedItem, dismissAddedItem]);

  if (!mounted || !addedItem) {
    return null;
  }

  return createPortal(
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
            <ShoppingBag className="size-3.5 stroke-[1.6]" aria-hidden="true" />
            Added to bag
          </p>
          <p className="mt-1 truncate font-medium text-sm">{addedItem.name}</p>
          <p className="mt-1 truncate text-muted-foreground text-xs">
            {addedItem.variant} · Qty {addedItem.quantity} · {addedItem.total}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Dismiss add to bag message"
          onClick={dismissAddedItem}
          className="size-8 rounded-none text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          <X className="size-4 stroke-[1.6]" aria-hidden="true" />
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={openBag}
          className="h-10 rounded-none hover:border-foreground"
        >
          View bag
        </Button>
        <Link
          href="/checkout"
          prefetch={false}
          onClick={dismissAddedItem}
          className="inline-flex h-10 items-center justify-center bg-primary px-4 text-primary-foreground text-sm transition hover:bg-primary/90"
        >
          Checkout
        </Link>
      </div>
    </div>,
    document.body,
  );
}
