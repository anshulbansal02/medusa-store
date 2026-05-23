import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DrawerClose,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { siteContent } from "@/content/site-content";
import type { StorefrontCart } from "@/lib/medusa/cart";
import { cn } from "@/lib/utils";

type BagDrawerHeaderProps = {
  cart: StorefrontCart | null;
  setCloseButton: (button: HTMLButtonElement | null) => void;
};

type BagDrawerItemsProps = {
  cart: StorefrontCart;
  closeBag: () => void;
  isPending: boolean;
  onRemoveItem: (lineItemId: string) => void;
  onUpdateQuantity: (lineItemId: string, quantity: number) => void;
};

type BagDrawerFooterProps = {
  cart: StorefrontCart;
  closeBag: () => void;
  message: string;
};

type EmptyBagDrawerProps = {
  closeBag: () => void;
};

const content = siteContent.bag;

export function BagDrawerHeader({
  cart,
  setCloseButton,
}: BagDrawerHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-5 border-border border-b px-5 py-5">
      <div>
        <DrawerTitle className="font-heading text-3xl leading-none">
          {content.title}
        </DrawerTitle>
        <DrawerDescription className="mt-1 text-muted-foreground text-sm">
          {cart?.itemCount ?? 0}{" "}
          {(cart?.itemCount ?? 0) === 1
            ? content.itemSingular
            : content.itemPlural}
        </DrawerDescription>
      </div>
      <DrawerClose
        ref={setCloseButton}
        aria-label={content.closeLabel}
        className="inline-flex size-9 cursor-pointer items-center justify-center text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-4 stroke-[1.6]" aria-hidden="true" />
      </DrawerClose>
    </div>
  );
}

export function BagDrawerItems({
  cart,
  closeBag,
  isPending,
  onRemoveItem,
  onUpdateQuantity,
}: BagDrawerItemsProps) {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-5">
      <div className="grid gap-5">
        {cart.items.map((item) => (
          <article key={item.id} className="grid grid-cols-[88px_1fr] gap-4">
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
                <p className="shrink-0 text-sm font-medium">{item.total}</p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="inline-flex h-9 items-center border border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`${content.decreaseQuantityPrefix} ${item.name} ${content.quantitySuffix}`}
                    disabled={isPending || item.quantity <= 1}
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="h-full w-9 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground disabled:text-muted-foreground/40"
                  >
                    <Minus className="size-4 stroke-[1.6]" aria-hidden="true" />
                  </Button>
                  <span className="w-8 text-center text-sm">
                    {item.quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`${content.increaseQuantityPrefix} ${item.name} ${content.quantitySuffix}`}
                    disabled={isPending || item.quantity >= 9}
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="h-full w-9 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground disabled:text-muted-foreground/40"
                  >
                    <Plus className="size-4 stroke-[1.6]" aria-hidden="true" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="xs"
                  disabled={isPending}
                  onClick={() => onRemoveItem(item.id)}
                  className="h-auto rounded-none px-0 text-muted-foreground text-xs hover:text-foreground"
                >
                  {content.removeAction}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function BagDrawerFooter({
  cart,
  closeBag,
  message,
}: BagDrawerFooterProps) {
  return (
    <div className="border-border border-t px-5 py-5">
      <div className="grid gap-2 border-border border-b pb-4 text-sm">
        <div className="flex justify-between gap-4 text-muted-foreground">
          <span>{content.subtotalLabel}</span>
          <span className="text-foreground">{cart.subtotal}</span>
        </div>
        <div className="flex justify-between gap-4 text-muted-foreground">
          <span>{content.shippingLabel}</span>
          <span>
            {cart.selectedShippingOptionId
              ? cart.shippingTotal
              : content.shippingPendingLabel}
          </span>
        </div>
      </div>
      <div className="mt-4 flex justify-between gap-4 font-medium">
        <span>{content.totalLabel}</span>
        <span>{cart.total}</span>
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
        {content.checkoutAction}
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
        {content.viewFullAction}
      </Link>
    </div>
  );
}

export function EmptyBagDrawer({ closeBag }: EmptyBagDrawerProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12 text-center">
      <div>
        <p className="font-heading text-4xl leading-none">
          {content.emptyDrawerTitle}
        </p>
        <p className="mt-3 text-muted-foreground text-sm">
          {content.emptyDescription}
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
          {content.emptyAction}
        </Link>
      </div>
    </div>
  );
}
