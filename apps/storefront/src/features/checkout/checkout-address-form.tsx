"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveCheckoutAddressAction } from "@/features/checkout/actions";
import {
  type CheckoutAddressInput,
  checkoutAddressSchema,
} from "@/features/checkout/schema";

type CheckoutAddressFormProps = {
  defaultValues: CheckoutAddressInput;
};

const fieldClassName = "h-11 rounded-none border-border bg-background px-3";
const errorClassName = "mt-1 text-destructive text-xs";

export function CheckoutAddressForm({
  defaultValues,
}: CheckoutAddressFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const {
    formState: { errors },
    clearErrors,
    handleSubmit,
    register,
    setError,
  } = useForm<CheckoutAddressInput>({
    defaultValues,
  });

  function onSubmit(values: CheckoutAddressInput) {
    setMessage("");
    clearErrors();
    const result = checkoutAddressSchema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0];

        if (typeof fieldName === "string") {
          setError(fieldName as keyof CheckoutAddressInput, {
            message: issue.message,
          });
        }
      }

      return;
    }

    startTransition(async () => {
      const actionResult = await saveCheckoutAddressAction(result.data);
      setMessage(actionResult.message);

      if (actionResult.ok) {
        router.refresh();
      }
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          className={fieldClassName}
          {...register("email")}
        />
        {errors.email ? (
          <p className={errorClassName}>{errors.email.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            autoComplete="given-name"
            aria-invalid={Boolean(errors.firstName)}
            className={fieldClassName}
            {...register("firstName")}
          />
          {errors.firstName ? (
            <p className={errorClassName}>{errors.firstName.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            autoComplete="family-name"
            aria-invalid={Boolean(errors.lastName)}
            className={fieldClassName}
            {...register("lastName")}
          />
          {errors.lastName ? (
            <p className={errorClassName}>{errors.lastName.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={Boolean(errors.phone)}
          className={fieldClassName}
          {...register("phone")}
        />
        {errors.phone ? (
          <p className={errorClassName}>{errors.phone.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address1">Address</Label>
        <Input
          id="address1"
          autoComplete="address-line1"
          aria-invalid={Boolean(errors.address1)}
          className={fieldClassName}
          {...register("address1")}
        />
        {errors.address1 ? (
          <p className={errorClassName}>{errors.address1.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address2">Apartment, floor, landmark</Label>
        <Input
          id="address2"
          autoComplete="address-line2"
          className={fieldClassName}
          {...register("address2")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            autoComplete="address-level2"
            aria-invalid={Boolean(errors.city)}
            className={fieldClassName}
            {...register("city")}
          />
          {errors.city ? (
            <p className={errorClassName}>{errors.city.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="province">State</Label>
          <Input
            id="province"
            autoComplete="address-level1"
            aria-invalid={Boolean(errors.province)}
            className={fieldClassName}
            {...register("province")}
          />
          {errors.province ? (
            <p className={errorClassName}>{errors.province.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="postalCode">PIN code</Label>
          <Input
            id="postalCode"
            inputMode="numeric"
            autoComplete="postal-code"
            aria-invalid={Boolean(errors.postalCode)}
            className={fieldClassName}
            {...register("postalCode")}
          />
          {errors.postalCode ? (
            <p className={errorClassName}>{errors.postalCode.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="h-11 rounded-none px-6"
        >
          {isPending ? "Saving address" : "Save and show shipping"}
        </Button>
        {message ? (
          <output className="text-muted-foreground text-sm">{message}</output>
        ) : null}
      </div>
    </form>
  );
}
