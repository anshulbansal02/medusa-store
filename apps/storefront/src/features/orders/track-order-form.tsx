"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteContent } from "@/content/site-content";
import { verifyOrderLookupAction } from "@/features/orders/actions";
import {
  type OrderLookupInput,
  orderLookupSchema,
} from "@/features/orders/schema";

export function TrackOrderForm() {
  const content = siteContent.trackOrder.form;
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
      email: "",
    },
  });

  function onSubmit(values: OrderLookupInput) {
    setMessage("");
    clearErrors();
    const result = orderLookupSchema.safeParse(values);

    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue?.path[0] === "email" ? "email" : "orderReference";

      setError(field, {
        message: issue?.message ?? content.invalidInput,
      });
      return;
    }

    startTransition(() => {
      setMessage(content.pendingMessage);
      verifyOrderLookupAction(result.data)
        .then((lookupResult) => {
          if (!lookupResult.ok) {
            setMessage("");
            setError(lookupResult.field, {
              message: lookupResult.message,
            });
            return;
          }

          router.push(
            `/order-confirmation/${encodeURIComponent(lookupResult.orderId)}`,
          );
        })
        .catch(() => {
          setMessage("");
          setError("orderReference", {
            message: content.notFound,
          });
        });
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="orderReference">{content.label}</Label>
        <Input
          id="orderReference"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(errors.orderReference)}
          placeholder={content.placeholder}
          className="h-12 rounded-none border-border bg-background px-3"
          {...register("orderReference")}
        />
        {errors.orderReference ? (
          <p className="text-destructive text-sm">
            {errors.orderReference.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="orderEmail">{content.emailLabel}</Label>
        <Input
          id="orderEmail"
          type="email"
          autoComplete="email"
          spellCheck={false}
          aria-invalid={Boolean(errors.email)}
          placeholder={content.emailPlaceholder}
          className="h-12 rounded-none border-border bg-background px-3"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="h-12 rounded-none px-6"
        >
          {isPending ? content.pendingButton : content.submitButton}
          <ArrowRight className="size-4 stroke-icon" aria-hidden="true" />
        </Button>
        {message ? (
          <output className="text-muted-foreground text-sm">{message}</output>
        ) : null}
      </div>
    </form>
  );
}
