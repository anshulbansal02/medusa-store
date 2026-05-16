"use client";

import { Minus, Plus } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";

import {
  type AddToCartActionState,
  addToCartAction,
} from "@/features/cart/actions";
import type { ProductDetailVariant } from "@/lib/medusa/products";
import { cn } from "@/lib/utils";

type AddToCartFormProps = {
  productName: string;
  productPrice: string;
  color: string;
  variants: ProductDetailVariant[];
};

const initialState = {
  message: "",
} satisfies AddToCartActionState;

export function AddToCartForm({
  productName,
  productPrice,
  color,
  variants,
}: AddToCartFormProps) {
  const availableVariants = useMemo(
    () => variants.filter((variant) => variant.id),
    [variants],
  );
  const [selectedVariantId, setSelectedVariantId] = useState(
    availableVariants[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const [state, formAction, isPending] = useActionState(
    addToCartAction,
    initialState,
  );
  const selectedVariant = availableVariants.find(
    (variant) => variant.id === selectedVariantId,
  );
  const canSubmit = Boolean(selectedVariantId) && !isPending;

  useEffect(() => {
    if (
      !availableVariants.some((variant) => variant.id === selectedVariantId)
    ) {
      setSelectedVariantId(availableVariants[0]?.id ?? "");
      setQuantity(1);
    }
  }, [availableVariants, selectedVariantId]);

  return (
    <>
      <form id="add-to-cart-form" action={formAction} className="py-6">
        <input type="hidden" name="variant_id" value={selectedVariantId} />
        <input type="hidden" name="quantity" value={quantity} />

        {color ? (
          <div>
            <p className="text-sm font-medium">Color</p>
            <p className="mt-2 text-muted-foreground text-sm">{color}</p>
          </div>
        ) : null}

        <fieldset className="mt-6" aria-describedby="size-help">
          <legend className="sr-only">Size</legend>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium">Size</p>
            <a
              href="/size-guide"
              className="text-sm underline-offset-4 hover:underline"
            >
              Size guide
            </a>
          </div>
          <p id="size-help" className="sr-only">
            Choose one available size for {productName}.
          </p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {availableVariants.map((variant) => {
              const isSelected = selectedVariantId === variant.id;

              return (
                <button
                  key={variant.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={cn(
                    "flex h-11 items-center justify-center border border-border text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "hover:border-foreground",
                  )}
                >
                  {variant.size}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-6">
          <p className="text-sm font-medium">Quantity</p>
          <div className="mt-3 inline-flex h-11 items-center border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="grid h-full w-11 place-items-center text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:text-muted-foreground/40"
            >
              <Minus className="size-4 stroke-[1.6]" aria-hidden="true" />
            </button>
            <span className="w-10 text-center text-sm font-medium">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={quantity >= 9}
              onClick={() => setQuantity((value) => Math.min(9, value + 1))}
              className="grid h-full w-11 place-items-center text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:text-muted-foreground/40"
            >
              <Plus className="size-4 stroke-[1.6]" aria-hidden="true" />
            </button>
          </div>
        </div>

        {state.message ? (
          <p className="mt-4 border border-destructive/30 px-3 py-2 text-destructive text-sm">
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-6 flex h-12 w-full items-center justify-center bg-foreground px-6 text-background text-sm transition hover:bg-foreground/90 disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground"
        >
          {isPending ? "Adding..." : "Add to bag"}
        </button>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 border-border border-t bg-background/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-sm sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-[1fr_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {selectedVariant
                ? `${productName} · ${selectedVariant.size}`
                : productName}
            </p>
            <p className="mt-0.5 text-muted-foreground text-sm">
              {productPrice}
            </p>
          </div>
          <button
            type="submit"
            form="add-to-cart-form"
            disabled={!canSubmit}
            className="h-11 bg-foreground px-5 text-background text-sm transition hover:bg-foreground/90 disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground"
          >
            {isPending ? "Adding" : "Add"}
          </button>
        </div>
      </div>
    </>
  );
}
