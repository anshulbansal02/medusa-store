"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  children,
  ...props
}: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group/checkbox flex size-4 shrink-0 items-center justify-center border border-input bg-background text-transparent outline-none transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground",
        className,
      )}
      {...props}
    >
      {children ?? (
        <CheckboxPrimitive.Indicator data-slot="checkbox-indicator">
          <Check className="size-3 stroke-icon" aria-hidden="true" />
        </CheckboxPrimitive.Indicator>
      )}
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
