"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddToCartForm } from "@/features/cart/add-to-cart-form";
import { ProductGallery } from "@/features/products/product-gallery";
import type { StorefrontProduct } from "@/lib/medusa/products";

type ProductQuickLookProps = {
  open: boolean;
  product: StorefrontProduct;
  onOpenChange: (open: boolean) => void;
};

export function ProductQuickLook({
  onOpenChange,
  open,
  product,
}: ProductQuickLookProps) {
  const categoryName = product.categories[0]?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[100svh] max-w-none overflow-y-auto rounded-none border-border bg-background p-0 sm:max-h-[90svh] sm:max-w-6xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-border border-b bg-background/95 px-5 py-4 backdrop-blur sm:px-6">
          <div className="min-w-0">
            <DialogTitle className="truncate font-heading text-3xl leading-none sm:text-4xl">
              {product.name}
            </DialogTitle>
            <DialogDescription className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-sm">
              {categoryName ? <span>{categoryName}</span> : null}
              {categoryName ? <span aria-hidden="true">/</span> : null}
              <span className="font-medium text-foreground">
                {product.price}
              </span>
            </DialogDescription>
          </div>
          <DialogClose
            aria-label="Close quick look"
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 shrink-0 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground"
              />
            }
          >
            <X className="size-5 stroke-icon" aria-hidden="true" />
          </DialogClose>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          <ProductGallery images={product.images} productName={product.name} />

          <section className="border border-border p-4 lg:sticky lg:top-24 lg:self-start lg:p-5">
            <AddToCartForm
              key={product.id}
              productName={product.name}
              productPrice={product.price}
              color={product.color}
              variants={product.variants}
              sizeChart={product.sizeChart}
              showStickyBar={false}
              formId={`quick-look-add-to-cart-${product.id}`}
              toastPlacement="top"
            />
            {product.description ? (
              <p className="border-border border-t pt-4 text-muted-foreground text-sm leading-6">
                {product.description}
              </p>
            ) : null}
            <Link
              href={product.href}
              prefetch={false}
              onClick={() => onOpenChange(false)}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 border border-border px-4 text-sm font-medium transition hover:border-foreground"
            >
              More about this piece
              <ArrowRight className="size-4 stroke-icon" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
