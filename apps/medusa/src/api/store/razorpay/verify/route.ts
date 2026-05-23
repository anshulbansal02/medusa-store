import crypto from "node:crypto";

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type { Logger } from "@medusajs/framework/types";
import Razorpay from "razorpay";
import { z } from "zod";

import { getRazorpayConfig } from "../../../../config/env";

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
  const config = getRazorpayConfig();

  if (!config.isConfigured) {
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

  if (
    !isValidSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      secret: config.keySecret,
    })
  ) {
    res.status(200).json({ verified: false });
    return;
  }

  const razorpay = new Razorpay({
    key_id: config.keyId,
    key_secret: config.keySecret,
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
  } catch (error) {
    const logger = req.scope.resolve("logger") as Logger;

    logger.error(
      `Razorpay verification fetch failed for order ${razorpay_order_id}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );

    res.status(200).json({
      verified: false,
    });
  }
}
