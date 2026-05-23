"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { siteContent } from "@/content/site-content";
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
  const content = siteContent.checkout.shippingForm;
  const [state, formAction, isPending] = useActionState(
    selectShippingMethodAction,
    initialState,
  );

  const defaultValue = selectedShippingOptionId ?? options[0]?.id ?? "";

  return (
    <form action={formAction} className="grid gap-4">
      <RadioGroup
        name="option_id"
        defaultValue={defaultValue}
        className="gap-4"
      >
        {options.map((option) => (
          <Label
            key={option.id}
            className="grid cursor-pointer grid-cols-[auto_1fr_auto] items-start gap-3 border border-border p-4 transition hover:border-foreground"
          >
            <RadioGroupItem value={option.id} className="mt-0.5" />
            <span>
              <span className="block font-medium">{option.name}</span>
              {option.description ? (
                <span className="mt-1 block text-muted-foreground text-sm">
                  {option.description}
                </span>
              ) : null}
            </span>
            <span className="font-medium">{option.price}</span>
          </Label>
        ))}
      </RadioGroup>

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

      <Button
        type="submit"
        disabled={isPending}
        variant="outline"
        size="lg"
        className="h-11 rounded-none px-6 sm:justify-self-start"
      >
        {isPending ? content.savingLabel : content.submitLabel}
      </Button>
    </form>
  );
}
