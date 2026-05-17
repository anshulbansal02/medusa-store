import { getDefaultRegionId } from "@/lib/medusa/regions";

import { medusaFetch } from "./client";

type MedusaPaymentProvider = {
  id: string;
};

type MedusaPaymentProvidersResponse = {
  payment_providers?: MedusaPaymentProvider[];
};

type MedusaPaymentSession = {
  id: string;
  provider_id?: string | null;
  data?: Record<string, unknown> | null;
};

type MedusaPaymentCollection = {
  id: string;
  payment_sessions?: MedusaPaymentSession[];
};

type MedusaPaymentCollectionResponse = {
  payment_collection?: MedusaPaymentCollection;
};

type MedusaCompleteCartResponse =
  | {
      type: "order";
      order?: {
        id?: string;
      };
    }
  | {
      type: "cart";
      error?: {
        message?: string;
      };
    };

type RazorpayVerifyResponse = {
  verified?: boolean;
  message?: string;
};

export type RazorpayPaymentSession = {
  providerId: string;
  orderId: string;
  amount: number;
  currency: string;
};

export type RazorpayVerificationPayload = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

function getRazorpaySession(
  collection: MedusaPaymentCollection,
  providerId: string,
): RazorpayPaymentSession | null {
  const session = collection.payment_sessions?.find(
    (paymentSession) => paymentSession.provider_id === providerId,
  );
  const data = session?.data;
  const orderId = data?.order_id ?? data?.id;
  const amount = data?.amount;
  const currency = data?.currency;

  if (
    typeof orderId !== "string" ||
    typeof amount !== "number" ||
    typeof currency !== "string"
  ) {
    return null;
  }

  return {
    providerId,
    orderId,
    amount,
    currency,
  };
}

export async function getRazorpayProviderId() {
  const regionId = await getDefaultRegionId();

  if (!regionId) {
    return null;
  }

  const params = new URLSearchParams({ region_id: regionId });
  const data = await medusaFetch<MedusaPaymentProvidersResponse>(
    `/store/payment-providers?${params.toString()}`,
    {
      cache: "no-store",
    },
  );

  return (
    data?.payment_providers?.find((provider) =>
      provider.id.toLowerCase().includes("razorpay"),
    )?.id ?? null
  );
}

export async function createRazorpayPaymentSession(cartId: string) {
  const providerId = await getRazorpayProviderId();

  if (!providerId) {
    throw new Error("Razorpay is not available for this region.");
  }

  const collectionResponse = await medusaFetch<MedusaPaymentCollectionResponse>(
    "/store/payment-collections",
    {
      method: "POST",
      body: JSON.stringify({ cart_id: cartId }),
      cache: "no-store",
      headers: {
        "content-type": "application/json",
      },
    },
  );
  const collection = collectionResponse?.payment_collection;

  if (!collection?.id) {
    throw new Error("Payment collection could not be created.");
  }

  const sessionResponse = await medusaFetch<MedusaPaymentCollectionResponse>(
    `/store/payment-collections/${collection.id}/payment-sessions`,
    {
      method: "POST",
      body: JSON.stringify({
        provider_id: providerId,
        data: {
          cart_id: cartId,
        },
      }),
      cache: "no-store",
      headers: {
        "content-type": "application/json",
      },
    },
  );
  const paymentCollection = sessionResponse?.payment_collection;

  if (!paymentCollection) {
    throw new Error("Payment session could not be created.");
  }

  const paymentSession = getRazorpaySession(paymentCollection, providerId);

  if (!paymentSession) {
    throw new Error("Razorpay session data is incomplete.");
  }

  return paymentSession;
}

export async function verifyRazorpayPayment(
  payload: RazorpayVerificationPayload,
) {
  const data = await medusaFetch<RazorpayVerifyResponse>(
    "/store/razorpay/verify",
    {
      method: "POST",
      body: JSON.stringify(payload),
      cache: "no-store",
      headers: {
        "content-type": "application/json",
      },
    },
  );

  if (!data?.verified) {
    throw new Error(data?.message ?? "Payment verification failed.");
  }
}

export async function completeCartPayment(cartId: string) {
  const data = await medusaFetch<MedusaCompleteCartResponse>(
    `/store/carts/${cartId}/complete`,
    {
      method: "POST",
      cache: "no-store",
    },
  );

  if (data?.type === "order" && data.order?.id) {
    return data.order.id;
  }

  throw new Error(
    data?.type === "cart" && data.error?.message
      ? data.error.message
      : "Order could not be placed.",
  );
}
