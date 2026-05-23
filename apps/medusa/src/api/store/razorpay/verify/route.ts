import crypto from "node:crypto";

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import Razorpay from "razorpay";
import { z } from "zod";

const verifyRazorpayPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

type RazorpayPayment = {
  id: string;
  order_id?: string;
  status?: string;
  amount?: number;
  currency?: string;
};

type RazorpayOrder = {
  id: string;
  status?: string;
  amount?: number;
  amount_paid?: number;
  currency?: string;
};

function isConfigured(value?: string): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !value.includes("replace_me")
  );
}

function isValidSignature({
  orderId,
  paymentId,
  signature,
  secret,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret: string;
}) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (!/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

function isPaymentStateAccepted(payment: RazorpayPayment) {
  return payment.status === "authorized" || payment.status === "captured";
}

function isOrderStateAccepted(order: RazorpayOrder) {
  return order.status === "attempted" || order.status === "paid";
}

function paymentMatchesOrder({
  payment,
  order,
  orderId,
  paymentId,
}: {
  payment: RazorpayPayment;
  order: RazorpayOrder;
  orderId: string;
  paymentId: string;
}) {
  return (
    payment.id === paymentId &&
    order.id === orderId &&
    payment.order_id === orderId &&
    typeof payment.amount === "number" &&
    typeof order.amount === "number" &&
    payment.amount === order.amount &&
    payment.currency === order.currency &&
    isPaymentStateAccepted(payment) &&
    isOrderStateAccepted(order)
  );
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!isConfigured(keyId) || !isConfigured(secret)) {
    res.status(503).json({
      verified: false,
      message: "Razorpay verification is not configured.",
    });
    return;
  }
  const razorpayKeyId = keyId;
  const razorpaySecret = secret;

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

  if (
    !isValidSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      secret: razorpaySecret,
    })
  ) {
    res.status(200).json({ verified: false });
    return;
  }

  const razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpaySecret,
  });

  try {
    const [payment, order] = await Promise.all([
      razorpay.payments.fetch(razorpay_payment_id) as Promise<RazorpayPayment>,
      razorpay.orders.fetch(razorpay_order_id) as Promise<RazorpayOrder>,
    ]);

    res.status(200).json({
      verified: paymentMatchesOrder({
        payment,
        order,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      }),
    });
  } catch {
    res.status(200).json({
      verified: false,
    });
  }
}
