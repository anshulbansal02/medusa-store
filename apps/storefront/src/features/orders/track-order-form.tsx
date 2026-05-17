"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type OrderLookupInput,
  orderLookupSchema,
} from "@/features/orders/schema";

function getOrderIdFromReference(reference: string) {
  const trimmedReference = reference.trim();

  if (trimmedReference.startsWith("order_")) {
    return trimmedReference;
  }

  try {
    const url = new URL(trimmedReference);
    const orderConfirmationIndex = url.pathname
      .split("/")
      .indexOf("order-confirmation");
    const orderId =
      orderConfirmationIndex >= 0
        ? url.pathname.split("/")[orderConfirmationIndex + 1]
        : "";

    return orderId?.startsWith("order_") ? orderId : "";
  } catch {
    return "";
  }
}

export function TrackOrderForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const {
    formState: { errors },
    clearErrors,
    handleSubmit,
    register,
    setError,
  } = useForm<OrderLookupInput>({
    defaultValues: {
      orderReference: "",
    },
  });

  function onSubmit(values: OrderLookupInput) {
    setMessage("");
    clearErrors();
    const result = orderLookupSchema.safeParse(values);

    if (!result.success) {
      const issue = result.error.issues[0];

      setError("orderReference", {
        message: issue?.message ?? "Enter an order ID or order link.",
      });
      return;
    }

    const orderId = getOrderIdFromReference(result.data.orderReference);

    if (!orderId) {
      setError("orderReference", {
        message:
          "Use the order ID that starts with order_ or paste the confirmation link.",
      });
      return;
    }

    startTransition(() => {
      setMessage("Opening order details...");
      router.push(`/order-confirmation/${encodeURIComponent(orderId)}`);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="orderReference">Order ID or confirmation link</Label>
        <Input
          id="orderReference"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(errors.orderReference)}
          placeholder="order_..."
          className="h-12 rounded-none border-border bg-background px-3"
          {...register("orderReference")}
        />
        {errors.orderReference ? (
          <p className="text-destructive text-sm">
            {errors.orderReference.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="h-12 rounded-none px-6"
        >
          {isPending ? "Opening..." : "View order"}
          <ArrowRight className="size-4 stroke-[1.6]" aria-hidden="true" />
        </Button>
        {message ? (
          <output className="text-muted-foreground text-sm">{message}</output>
        ) : null}
      </div>
    </form>
  );
}
