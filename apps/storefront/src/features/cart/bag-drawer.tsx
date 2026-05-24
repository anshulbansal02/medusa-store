"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { siteContent } from "@/content/site-content";
import {
  removeBagLineAction,
  updateBagLineAction,
} from "@/features/cart/actions";
import {
  BagDrawerFooter,
  BagDrawerHeader,
  BagDrawerItems,
  EmptyBagDrawer,
} from "@/features/cart/bag-drawer-sections";
import { useBagStore } from "@/features/cart/bag-store";
import type { StorefrontCart } from "@/lib/medusa/cart";

type BagDrawerProps = {
  initialCart: StorefrontCart | null;
  initialItemCount: number;
};

export function BagDrawer({ initialCart, initialItemCount }: BagDrawerProps) {
  const content = siteContent.bag;
  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const cart = useBagStore((state) => state.cart) ?? initialCart;
  const setCart = useBagStore((state) => state.setCart);
  const isOpen = useBagStore((state) => state.isOpen);
  const setBagOpen = useBagStore((state) => state.setBagOpen);
  const closeBag = useBagStore((state) => state.closeBag);
  const items = cart?.items ?? [];
  const hasItems = items.length > 0;
  const itemCount = cart?.itemCount ?? initialItemCount;

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  function updateQuantity(lineItemId: string, quantity: number) {
    startTransition(async () => {
      try {
        setMessage("");
        const nextCart = await updateBagLineAction(lineItemId, quantity);
        setCart(nextCart);
        router.refresh();
      } catch {
        setMessage(content.updateError);
      }
    });
  }

  function removeItem(lineItemId: string) {
    startTransition(async () => {
      try {
        setMessage("");
        const nextCart = await removeBagLineAction(lineItemId);
        setCart(nextCart);
        router.refresh();
      } catch {
        setMessage(content.removeError);
      }
    });
  }

  return (
    <Drawer open={isOpen} onOpenChange={setBagOpen} direction="right" autoFocus>
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={content.openLabel}
          className="relative size-9 rounded-none text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          <ShoppingBag className="size-4 stroke-icon" aria-hidden="true" />
          {itemCount > 0 ? (
            <span className="-right-0.5 -top-0.5 absolute flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-tiny leading-none">
              {itemCount}
            </span>
          ) : null}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-dvh w-full rounded-none border-border bg-background text-foreground data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-[440px]">
        <BagDrawerHeader
          cart={cart}
          setCloseButton={(button) => {
            closeButtonRef.current = button;
          }}
        />

        {hasItems && cart ? (
          <>
            <BagDrawerItems
              cart={cart}
              closeBag={closeBag}
              isPending={isPending}
              onRemoveItem={removeItem}
              onUpdateQuantity={updateQuantity}
            />
            <BagDrawerFooter
              cart={cart}
              closeBag={closeBag}
              message={message}
            />
          </>
        ) : (
          <EmptyBagDrawer closeBag={closeBag} />
        )}
      </DrawerContent>
    </Drawer>
  );
}
