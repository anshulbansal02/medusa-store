"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  type FieldErrors,
  type FieldPath,
  type UseFormRegister,
  useForm,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteContent } from "@/content/site-content";
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

type AddressFieldConfig = {
  autoComplete?: string;
  inputMode?: "numeric";
  label: string;
  name: FieldPath<CheckoutAddressInput>;
  type?: "email" | "tel" | "text";
};

type AddressFieldProps = AddressFieldConfig & {
  errors: FieldErrors<CheckoutAddressInput>;
  register: UseFormRegister<CheckoutAddressInput>;
};

function AddressField({
  autoComplete,
  errors,
  inputMode,
  label,
  name,
  register,
  type = "text",
}: AddressFieldProps) {
  const error = errors[name];

  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        className={fieldClassName}
        {...register(name)}
      />
      {error ? <p className={errorClassName}>{error.message}</p> : null}
    </div>
  );
}

export function CheckoutAddressForm({
  defaultValues,
}: CheckoutAddressFormProps) {
  const content = siteContent.checkout.addressForm;
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
  const contactFields = [
    {
      name: "email",
      label: content.emailLabel,
      type: "email",
      autoComplete: "email",
    },
    {
      name: "phone",
      label: content.phoneLabel,
      type: "tel",
      autoComplete: "tel",
    },
  ] satisfies AddressFieldConfig[];
  const nameFields = [
    {
      name: "firstName",
      label: content.firstNameLabel,
      autoComplete: "given-name",
    },
    {
      name: "lastName",
      label: content.lastNameLabel,
      autoComplete: "family-name",
    },
  ] satisfies AddressFieldConfig[];
  const addressFields = [
    {
      name: "address1",
      label: content.address1Label,
      autoComplete: "address-line1",
    },
    {
      name: "address2",
      label: content.address2Label,
      autoComplete: "address-line2",
    },
  ] satisfies AddressFieldConfig[];
  const localityFields = [
    {
      name: "city",
      label: content.cityLabel,
      autoComplete: "address-level2",
    },
    {
      name: "province",
      label: content.provinceLabel,
      autoComplete: "address-level1",
    },
    {
      name: "postalCode",
      label: content.postalCodeLabel,
      inputMode: "numeric",
      autoComplete: "postal-code",
    },
  ] satisfies AddressFieldConfig[];

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
      <AddressField {...contactFields[0]} errors={errors} register={register} />

      <div className="grid gap-4 sm:grid-cols-2">
        {nameFields.map((field) => (
          <AddressField
            key={field.name}
            {...field}
            errors={errors}
            register={register}
          />
        ))}
      </div>

      <AddressField {...contactFields[1]} errors={errors} register={register} />

      {addressFields.map((field) => (
        <AddressField
          key={field.name}
          {...field}
          errors={errors}
          register={register}
        />
      ))}

      <div className="grid gap-4 sm:grid-cols-3">
        {localityFields.map((field) => (
          <AddressField
            key={field.name}
            {...field}
            errors={errors}
            register={register}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="h-11 rounded-none px-6"
        >
          {isPending ? content.savingLabel : content.submitLabel}
        </Button>
        {message ? (
          <output className="text-muted-foreground text-sm">{message}</output>
        ) : null}
      </div>
    </form>
  );
}
