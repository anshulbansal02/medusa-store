import { Minus, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DrawerClose,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { siteContent } from "@/content/site-content";
import type { CartItem, StorefrontCart } from "@/lib/medusa/cart";
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

type BagDrawerLineItemProps = {
  closeBag: () => void;
  isPending: boolean;
  item: CartItem;
  onRemoveItem: (lineItemId: string) => void;
  onUpdateQuantity: (lineItemId: string, quantity: number) => void;
};

const content = siteContent.bag;

export function BagDrawerHeader({
  cart,
  setCloseButton,
}: BagDrawerHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-5 border-border border-b px-4 py-4 sm:px-5 sm:py-5">
      <div>
        <DrawerTitle className="font-heading text-3xl leading-none sm:text-4xl">
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
        className="inline-flex size-10 cursor-pointer items-center justify-center text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-4 stroke-icon" aria-hidden="true" />
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
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
      <div className="grid gap-4">
        {cart.items.map((item) => (
          <BagDrawerLineItem
            key={item.id}
            closeBag={closeBag}
            isPending={isPending}
            item={item}
            onRemoveItem={onRemoveItem}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>
    </div>
  );
}

function BagDrawerLineItem({
  closeBag,
  isPending,
  item,
  onRemoveItem,
  onUpdateQuantity,
}: BagDrawerLineItemProps) {
  return (
    <article className="grid min-w-0 grid-cols-[104px_minmax(0,1fr)] gap-4 border-border border-b pb-4 last:border-b-0 sm:grid-cols-[112px_minmax(0,1fr)]">
      <Link
        href={item.href}
        onClick={closeBag}
        className="relative aspect-[4/5] overflow-hidden bg-muted"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : null}
      </Link>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={item.href}
              onClick={closeBag}
              className="line-clamp-2 text-sm font-medium leading-snug hover:underline hover:underline-offset-4"
            >
              {item.name}
            </Link>
            {item.variant ? (
              <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                {item.variant}
              </p>
            ) : null}
          </div>
        </div>

        <p className="mt-3 text-sm font-medium">{item.total}</p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <BagLineQuantityControl
            isPending={isPending}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isPending}
            onClick={() => onRemoveItem(item.id)}
            aria-label={`${content.removeAction} ${item.name}`}
            className="rounded-none text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="size-4 stroke-icon" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function BagLineQuantityControl({
  isPending,
  item,
  onUpdateQuantity,
}: {
  isPending: boolean;
  item: CartItem;
  onUpdateQuantity: (lineItemId: string, quantity: number) => void;
}) {
  return (
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
        <Minus className="size-4 stroke-icon" aria-hidden="true" />
      </Button>
      <span className="w-8 text-center text-sm">{item.quantity}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`${content.increaseQuantityPrefix} ${item.name} ${content.quantitySuffix}`}
        disabled={isPending || item.quantity >= 9}
        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        className="h-full w-9 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground disabled:text-muted-foreground/40"
      >
        <Plus className="size-4 stroke-icon" aria-hidden="true" />
      </Button>
    </div>
  );
}

export function BagDrawerFooter({
  cart,
  closeBag,
  message,
}: BagDrawerFooterProps) {
  return (
    <div className="border-border border-t bg-background px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-5 sm:pt-5 sm:pb-5">
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
    <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-12 text-center">
      <div>
        <p className="font-heading text-4xl leading-none">
          {content.emptyDrawerTitle}
        </p>
        <p className="mt-3 text-muted-foreground text-sm">
          {content.emptyDescription}
        </p>
        <Link
          href="/shop"
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
