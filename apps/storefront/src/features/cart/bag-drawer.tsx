"use client";

import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  removeBagLineAction,
  updateBagLineAction,
} from "@/features/cart/actions";
import { useBagStore } from "@/features/cart/bag-store";
import type { StorefrontCart } from "@/lib/medusa/cart";
import { cn } from "@/lib/utils";

type BagDrawerProps = {
  initialCart: StorefrontCart | null;
  initialItemCount: number;
};

export function BagDrawer({ initialCart, initialItemCount }: BagDrawerProps) {
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
        setMessage("Bag could not be updated. Try again.");
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
        setMessage("Bag item could not be removed. Try again.");
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
          aria-label="Open bag"
          className="relative size-9 rounded-none text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          <ShoppingBag className="size-4 stroke-[1.6]" aria-hidden="true" />
          {itemCount > 0 ? (
            <span className="-right-0.5 -top-0.5 absolute flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground leading-none">
              {itemCount}
            </span>
          ) : null}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-dvh w-full max-w-md rounded-none border-border bg-background text-foreground data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md">
        <div className="flex items-start justify-between gap-5 border-border border-b px-5 py-5">
          <div>
            <DrawerTitle className="font-heading text-3xl leading-none">
              Bag
            </DrawerTitle>
            <DrawerDescription className="mt-1 text-muted-foreground text-sm">
              {cart?.itemCount ?? 0}{" "}
              {(cart?.itemCount ?? 0) === 1 ? "item" : "items"}
            </DrawerDescription>
          </div>
          <DrawerClose
            ref={closeButtonRef}
            aria-label="Close bag"
            className="inline-flex size-9 cursor-pointer items-center justify-center text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4 stroke-[1.6]" aria-hidden="true" />
          </DrawerClose>
        </div>

        {hasItems ? (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="grid gap-5">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="grid grid-cols-[88px_1fr] gap-4"
                  >
                    <Link
                      href={item.href}
                      prefetch={false}
                      onClick={closeBag}
                      className="relative aspect-[4/5] overflow-hidden bg-muted"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="88px"
                          className="object-cover"
                        />
                      ) : null}
                    </Link>

                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={item.href}
                            prefetch={false}
                            onClick={closeBag}
                            className="block truncate text-sm font-medium hover:underline hover:underline-offset-4"
                          >
                            {item.name}
                          </Link>
                          {item.variant ? (
                            <p className="mt-1 text-muted-foreground text-xs">
                              {item.variant}
                            </p>
                          ) : null}
                        </div>
                        <p className="shrink-0 text-sm font-medium">
                          {item.total}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="inline-flex h-9 items-center border border-border">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Decrease ${item.name} quantity`}
                            disabled={isPending || item.quantity <= 1}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="h-full w-9 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground disabled:text-muted-foreground/40"
                          >
                            <Minus
                              className="size-4 stroke-[1.6]"
                              aria-hidden="true"
                            />
                          </Button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Increase ${item.name} quantity`}
                            disabled={isPending || item.quantity >= 9}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="h-full w-9 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground disabled:text-muted-foreground/40"
                          >
                            <Plus
                              className="size-4 stroke-[1.6]"
                              aria-hidden="true"
                            />
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="link"
                          size="xs"
                          disabled={isPending}
                          onClick={() => removeItem(item.id)}
                          className="h-auto rounded-none px-0 text-muted-foreground text-xs hover:text-foreground"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="border-border border-t px-5 py-5">
              <div className="grid gap-2 border-border border-b pb-4 text-sm">
                <div className="flex justify-between gap-4 text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">{cart?.subtotal}</span>
                </div>
                <div className="flex justify-between gap-4 text-muted-foreground">
                  <span>Shipping</span>
                  <span>
                    {cart?.selectedShippingOptionId
                      ? cart.shippingTotal
                      : "Calculated later"}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-between gap-4 font-medium">
                <span>Total</span>
                <span>{cart?.total}</span>
              </div>
              {message ? (
                <p className="mt-4 border border-destructive/30 px-3 py-2 text-destructive text-sm">
                  {message}
                </p>
              ) : null}
              <Link
                href="/checkout"
                prefetch={false}
                onClick={closeBag}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-5 h-12 w-full rounded-none px-5 hover:bg-primary/90",
                )}
              >
                Checkout
              </Link>
              <Link
                href="/bag"
                prefetch={false}
                onClick={closeBag}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-3 h-10 w-full rounded-none hover:border-foreground",
                )}
              >
                View full bag
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 py-12 text-center">
            <div>
              <p className="font-heading text-4xl leading-none">
                Your bag is empty
              </p>
              <p className="mt-3 text-muted-foreground text-sm">
                Choose a style and size to begin your order.
              </p>
              <Link
                href="/shop"
                prefetch={false}
                onClick={closeBag}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-7 h-11 rounded-none px-6 hover:bg-primary/90",
                )}
              >
                Shop new arrivals
              </Link>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
