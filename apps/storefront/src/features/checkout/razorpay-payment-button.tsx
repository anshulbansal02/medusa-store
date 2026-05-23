"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { siteContent } from "@/content/site-content";
import {
  startRazorpayPaymentAction,
  verifyAndCompleteRazorpayPaymentAction,
} from "@/features/checkout/actions";

type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayConstructorOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: RazorpayCheckoutResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayCheckout = {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayConstructorOptions) => RazorpayCheckout;
  }
}

type RazorpayPaymentButtonProps = {
  publicKey: string | null;
  isReadyForPayment: boolean;
};

type PaymentStatusMessageInput = {
  content: typeof siteContent.checkout.payment;
  isPaymentConfigured: boolean;
  isReadyForPayment: boolean;
  scriptReady: boolean;
};

const razorpayCheckoutScriptSrc =
  "https://checkout.razorpay.com/v1/checkout.js";

function isConfigured(value: string | null) {
  return typeof value === "string" && !value.includes("replace_me");
}

function getPaymentStatusMessage({
  content,
  isPaymentConfigured,
  isReadyForPayment,
  scriptReady,
}: PaymentStatusMessageInput) {
  if (!isPaymentConfigured) {
    return content.unavailable;
  }

  if (!isReadyForPayment) {
    return content.detailsRequired;
  }

  return scriptReady ? content.ready : content.preparing;
}

export function RazorpayPaymentButton({
  publicKey,
  isReadyForPayment,
}: RazorpayPaymentButtonProps) {
  const content = siteContent.checkout.payment;
  const router = useRouter();
  const [scriptReady, setScriptReady] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const isPaymentConfigured = isConfigured(publicKey);
  const disabled =
    !isReadyForPayment || !isPaymentConfigured || !scriptReady || isPending;
  const statusMessage = getPaymentStatusMessage({
    content,
    isPaymentConfigured,
    isReadyForPayment,
    scriptReady,
  });

  function handlePayment() {
    if (!publicKey || !window.Razorpay) {
      setMessage(content.scriptNotReady);
      return;
    }

    const RazorpayCheckout = window.Razorpay;

    setMessage("");
    startTransition(async () => {
      const result = await startRazorpayPaymentAction();

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      const checkoutOptions: RazorpayConstructorOptions = {
        key: publicKey,
        amount: result.payment.amount,
        currency: result.payment.currency,
        name: content.storeName,
        order_id: result.payment.orderId,
        prefill: {
          name: result.customer.name,
          email: result.customer.email,
          contact: result.customer.phone,
        },
        handler: (response) => {
          startTransition(async () => {
            const completion = await verifyAndCompleteRazorpayPaymentAction({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!completion.ok) {
              setMessage(completion.message);
              return;
            }

            router.push(`/order-confirmation/${completion.orderId}`);
          });
        },
        modal: {
          ondismiss: () => setMessage(content.dismissed),
        },
      };
      const checkout = new RazorpayCheckout(checkoutOptions);

      checkout.open();
    });
  }

  return (
    <>
      {isPaymentConfigured ? (
        <Script
          src={razorpayCheckoutScriptSrc}
          strategy="afterInteractive"
          onLoad={() => setScriptReady(true)}
          onError={() => setMessage(content.loadError)}
        />
      ) : null}
      <Button
        type="button"
        disabled={disabled}
        size="lg"
        className="mt-6 h-12 w-full rounded-none"
        onClick={handlePayment}
      >
        {isPending ? content.processingLabel : content.buttonLabel}
      </Button>
      <p className="mt-4 text-muted-foreground text-sm">{statusMessage}</p>
      {message ? (
        <p className="mt-3 border border-destructive/30 px-3 py-2 text-destructive text-sm">
          {message}
        </p>
      ) : null}
    </>
  );
}
