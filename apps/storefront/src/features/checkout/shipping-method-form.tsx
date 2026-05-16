"use client";

import { useActionState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { selectShippingMethodAction } from "@/features/checkout/actions";
import type { StorefrontShippingOption } from "@/lib/medusa/cart";
import { cn } from "@/lib/utils";

type ShippingMethodFormProps = {
  options: StorefrontShippingOption[];
  selectedShippingOptionId: string | null;
};

const initialState = {
  ok: false,
  message: "",
};

export function ShippingMethodForm({
  options,
  selectedShippingOptionId,
}: ShippingMethodFormProps) {
  const [state, formAction, isPending] = useActionState(
    selectShippingMethodAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      {options.map((option, index) => (
        <label
          key={option.id}
          className="grid cursor-pointer grid-cols-[auto_1fr_auto] gap-3 border border-border p-4 transition hover:border-foreground"
        >
          <input
            type="radio"
            name="option_id"
            value={option.id}
            defaultChecked={
              selectedShippingOptionId
                ? selectedShippingOptionId === option.id
                : index === 0
            }
            className="mt-1 accent-foreground"
          />
          <span>
            <span className="block font-medium">{option.name}</span>
            {option.description ? (
              <span className="mt-1 block text-muted-foreground text-sm">
                {option.description}
              </span>
            ) : null}
          </span>
          <span className="font-medium">{option.price}</span>
        </label>
      ))}

      {state.message ? (
        <p
          className={cn(
            "border px-3 py-2 text-sm",
            state.ok
              ? "border-border text-muted-foreground"
              : "border-destructive/30 text-destructive",
          )}
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "h-11 rounded-none px-6 sm:justify-self-start",
        )}
      >
        {isPending ? "Saving..." : "Save shipping method"}
      </button>
    </form>
  );
}
