import { PaymentSessionStatus } from "@medusajs/framework/utils";

import type {
  RazorpayOrder,
  RazorpayPaymentData,
  RazorpayPaymentList,
} from "./types";

export function getOrderId(data?: Record<string, unknown>) {
  const paymentData = data as RazorpayPaymentData | undefined;

  return paymentData?.id ?? paymentData?.order_id ?? "";
}

export function getSuccessfulPayments(payments: RazorpayPaymentList) {
  return (
    payments.items?.filter(
      (payment) =>
        payment.status === "authorized" || payment.status === "captured",
    ) ?? []
  );
}

export function getPaymentSessionStatus({
  order,
  payments,
}: {
  order: RazorpayOrder;
  payments: RazorpayPaymentList;
}) {
  if (order.status === "paid") {
    return PaymentSessionStatus.CAPTURED;
  }

  const authorizedAmount = getSuccessfulPayments(payments).reduce(
    (total, payment) => total + payment.amount,
    0,
  );

  if (authorizedAmount >= order.amount) {
    return PaymentSessionStatus.AUTHORIZED;
  }

  if (order.status === "attempted") {
    return PaymentSessionStatus.REQUIRES_MORE;
  }

  return PaymentSessionStatus.PENDING;
}
