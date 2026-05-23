import { z } from "zod/v4";

import { siteContent } from "@/content/site-content";

const validation = siteContent.checkout.addressForm.validation;

export const checkoutAddressSchema = z.object({
  email: z.email(validation.email),
  firstName: z.string().trim().min(1, validation.firstName),
  lastName: z.string().trim().min(1, validation.lastName),
  phone: z.string().trim().min(10, validation.phone).max(15, validation.phone),
  address1: z.string().trim().min(1, validation.address1),
  address2: z.string().trim().default(""),
  city: z.string().trim().min(1, validation.city),
  province: z.string().trim().min(1, validation.province),
  postalCode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, validation.postalCode),
});

export type CheckoutAddressInput = z.infer<typeof checkoutAddressSchema>;
