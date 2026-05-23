"use client";

import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { siteContent } from "@/content/site-content";
import { addToCartAction } from "@/features/cart/actions";
import { useBagStore } from "@/features/cart/bag-store";
import type { ProductDetailVariant } from "@/lib/medusa/products";
import { cn } from "@/lib/utils";

type AddToCartFormProps = {
  productName: string;
  productPrice: string;
  color: string;
  variants: ProductDetailVariant[];
  hasSizeChart: boolean;
};

type AddToBagContent = typeof siteContent.addToBag;

export function AddToCartForm({
  productName,
  productPrice,
  color,
  variants,
  hasSizeChart,
}: AddToCartFormProps) {
  const content = siteContent.addToBag;
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const setCart = useBagStore((state) => state.setCart);
  const showAddedItem = useBagStore((state) => state.showAddedItem);
  const availableVariants = variants.filter((variant) => variant.id);
  const [selectedVariantId, setSelectedVariantId] = useState(
    availableVariants[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const selectedVariant = availableVariants.find(
    (variant) => variant.id === selectedVariantId,
  );
  const canSubmit = Boolean(selectedVariantId) && !isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await addToCartAction(formData);

      if (result.status === "success") {
        setMessage("");
        setCart(result.cart);
        showAddedItem(result.addedItem);
        router.refresh();
        return;
      }

      setMessage(result.message);
    });
  }

  return (
    <>
      <form id="add-to-cart-form" onSubmit={handleSubmit} className="py-6">
        <input
          type="hidden"
          name="variant_title"
          value={selectedVariant?.title ?? ""}
        />
        <input type="hidden" name="quantity" value={quantity} />

        {color ? (
          <div>
            <p className="text-sm font-medium">{content.colorLabel}</p>
            <p className="mt-2 text-muted-foreground text-sm">{color}</p>
          </div>
        ) : null}

        <SizeSelector
          content={content}
          hasSizeChart={hasSizeChart}
          productName={productName}
          selectedVariantId={selectedVariantId}
          variants={availableVariants}
          onSelect={setSelectedVariantId}
        />

        <QuantitySelector
          content={content}
          quantity={quantity}
          onChange={setQuantity}
        />

        {message ? (
          <p className="mt-4 border border-destructive/30 px-3 py-2 text-destructive text-sm">
            {message}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={!canSubmit}
          size="lg"
          className="mt-6 h-12 w-full rounded-none px-6 hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          {isPending ? content.pendingLabel : content.submitLabel}
        </Button>
      </form>

      <StickyAddToBagBar
        canSubmit={canSubmit}
        content={content}
        isPending={isPending}
        productName={productName}
        productPrice={productPrice}
        selectedVariant={selectedVariant}
      />
    </>
  );
}

function SizeSelector({
  content,
  hasSizeChart,
  onSelect,
  productName,
  selectedVariantId,
  variants,
}: {
  content: AddToBagContent;
  hasSizeChart: boolean;
  onSelect: (value: string) => void;
  productName: string;
  selectedVariantId: string;
  variants: ProductDetailVariant[];
}) {
  return (
    <fieldset className="mt-6" aria-describedby="size-help">
      <legend className="sr-only">{content.sizeLabel}</legend>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium">{content.sizeLabel}</p>
        {hasSizeChart ? (
          <a
            href="#size-chart"
            className="text-sm underline-offset-4 hover:underline"
          >
            {content.sizeChartAction}
          </a>
        ) : null}
      </div>
      <p id="size-help" className="sr-only">
        {content.sizeHelpPrefix} {productName}.
      </p>
      <RadioGroup
        name="variant_id"
        value={selectedVariantId}
        onValueChange={onSelect}
        className="mt-3 grid grid-cols-5 gap-2"
      >
        {variants.map((variant) => (
          <RadioGroupItem
            key={variant.id}
            value={variant.id}
            className={cn(
              "flex aspect-auto h-11 w-full cursor-pointer items-center justify-center rounded-none border-border bg-background text-sm font-medium transition hover:border-foreground focus-visible:ring-2 focus-visible:ring-ring",
              selectedVariantId === variant.id &&
                "border-foreground bg-foreground text-background hover:bg-foreground hover:text-background",
            )}
          >
            {variant.size}
          </RadioGroupItem>
        ))}
      </RadioGroup>
    </fieldset>
  );
}

function QuantitySelector({
  content,
  onChange,
  quantity,
}: {
  content: AddToBagContent;
  onChange: (updater: (value: number) => number) => void;
  quantity: number;
}) {
  return (
    <div className="mt-6">
      <p className="text-sm font-medium">{content.quantityLabel}</p>
      <div className="mt-3 inline-flex h-11 items-center border border-border">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={content.decreaseQuantityLabel}
          disabled={quantity <= 1}
          onClick={() => onChange((value) => Math.max(1, value - 1))}
          className="h-full w-11 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground disabled:text-muted-foreground/40"
        >
          <Minus className="size-4 stroke-[1.6]" aria-hidden="true" />
        </Button>
        <span className="w-10 text-center text-sm font-medium">{quantity}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={content.increaseQuantityLabel}
          disabled={quantity >= 9}
          onClick={() => onChange((value) => Math.min(9, value + 1))}
          className="h-full w-11 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground disabled:text-muted-foreground/40"
        >
          <Plus className="size-4 stroke-[1.6]" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function StickyAddToBagBar({
  canSubmit,
  content,
  isPending,
  productName,
  productPrice,
  selectedVariant,
}: {
  canSubmit: boolean;
  content: AddToBagContent;
  isPending: boolean;
  productName: string;
  productPrice: string;
  selectedVariant: ProductDetailVariant | undefined;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-border border-t bg-background/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-sm sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-[1fr_auto] items-center gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {selectedVariant
              ? `${productName} · ${selectedVariant.size}`
              : productName}
          </p>
          <p className="mt-0.5 text-muted-foreground text-sm">{productPrice}</p>
        </div>
        <Button
          type="submit"
          form="add-to-cart-form"
          disabled={!canSubmit}
          size="lg"
          className="h-11 rounded-none px-5 hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          {isPending ? content.stickyPendingLabel : content.stickySubmitLabel}
        </Button>
      </div>
    </div>
  );
}
