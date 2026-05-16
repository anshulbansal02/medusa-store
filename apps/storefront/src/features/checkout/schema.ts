import { z } from "zod/v4";

export const checkoutAddressSchema = z.object({
  email: z.email("Enter a valid email."),
  firstName: z.string().trim().min(1, "Enter a first name."),
  lastName: z.string().trim().min(1, "Enter a last name."),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a valid phone number.")
    .max(15, "Enter a valid phone number."),
  address1: z.string().trim().min(1, "Enter an address."),
  address2: z.string().trim().default(""),
  city: z.string().trim().min(1, "Enter a city."),
  province: z.string().trim().min(1, "Enter a state."),
  postalCode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid Indian PIN code."),
});

export type CheckoutAddressInput = z.infer<typeof checkoutAddressSchema>;
