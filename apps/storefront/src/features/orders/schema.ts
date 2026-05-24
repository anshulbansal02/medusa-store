import { z } from "zod/v4";

import { siteContent } from "@/content/site-content";

const validation = siteContent.trackOrder.form;

export const orderLookupSchema = z.object({
  orderReference: z.string().trim().min(1, validation.invalidInput),
  email: z.email(validation.invalidEmail).trim().toLowerCase(),
});

export type OrderLookupInput = z.infer<typeof orderLookupSchema>;
