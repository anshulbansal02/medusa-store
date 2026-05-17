import { z } from "zod";

export const orderLookupSchema = z.object({
  orderReference: z.string().trim().min(1, "Enter an order ID or order link."),
});

export type OrderLookupInput = z.infer<typeof orderLookupSchema>;
