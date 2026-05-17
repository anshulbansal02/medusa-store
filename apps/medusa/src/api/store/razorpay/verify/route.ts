import crypto from "node:crypto";

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";

const verifyRazorpayPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret || secret.includes("replace_me")) {
    res.status(503).json({
      verified: false,
      message: "Razorpay verification is not configured.",
    });
    return;
  }

  const parsed = verifyRazorpayPaymentSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      verified: false,
      message: "Payment verification payload is invalid.",
    });
    return;
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = parsed.data;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(razorpay_signature);

  res.status(200).json({
    verified:
      expectedBuffer.length === signatureBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, signatureBuffer),
  });
}
