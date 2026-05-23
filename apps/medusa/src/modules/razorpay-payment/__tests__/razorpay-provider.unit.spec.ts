import crypto from "node:crypto";

import { PaymentActions, PaymentSessionStatus } from "@medusajs/framework/utils";

import RazorpayPaymentProviderService from "../services/razorpay-provider";

const createMock = jest.fn();
const fetchOrderMock = jest.fn();

jest.mock("razorpay", () =>
  jest.fn().mockImplementation(() => ({
    orders: {
      create: createMock,
      fetch: fetchOrderMock,
      fetchPayments: jest.fn(),
    },
    payments: {
      capture: jest.fn(),
      refund: jest.fn(),
    },
  })),
);

function createProvider(webhookSecret = "whsec_test") {
  return new RazorpayPaymentProviderService(
    {
      logger: {
        warn: jest.fn(),
      },
    },
    {
      key_id: "rzp_test_key",
      key_secret: "rzp_test_secret",
      webhook_secret: webhookSecret,
    },
  );
}

function createSignedWebhookPayload({
  body,
  secret = "whsec_test",
}: {
  body: Record<string, unknown>;
  secret?: string;
}) {
  const rawData = Buffer.from(JSON.stringify(body));
  const signature = crypto
    .createHmac("sha256", secret)
    .update(rawData)
    .digest("hex");

  return {
    data: body,
    rawData,
    headers: {
      "x-razorpay-signature": signature,
    },
  };
}

describe("RazorpayPaymentProviderService", () => {
  beforeEach(() => {
    createMock.mockReset();
    fetchOrderMock.mockReset();
  });

  it("creates Razorpay orders with server-owned amount, currency, receipt, and notes", async () => {
    createMock.mockResolvedValue({
      id: "order_test",
      amount: 12345,
      currency: "INR",
      status: "created",
    });

    const provider = createProvider();
    const result = await provider.initiatePayment({
      amount: 123.45,
      currency_code: "inr",
      data: {
        cart_id: "cart_1234567890",
        session_id: "payses_123",
      },
    });

    expect(createMock).toHaveBeenCalledWith({
      amount: 12345,
      currency: "INR",
      receipt: "cart_1234567890",
      notes: {
        cart_id: "cart_1234567890",
        session_id: "payses_123",
      },
    });
    expect(result).toEqual({
      id: "order_test",
      status: PaymentSessionStatus.PENDING,
      data: {
        id: "order_test",
        order_id: "order_test",
        amount: 12345,
        currency: "INR",
        session_id: "payses_123",
      },
    });
  });

  it("maps signed captured webhooks to Medusa captured actions", async () => {
    const provider = createProvider();
    const body = {
      event: "order.paid",
      payload: {
        payment: {
          entity: {
            id: "pay_test",
            amount: 12345,
            currency: "INR",
            status: "captured",
            captured: true,
            notes: {
              session_id: "payses_123",
            },
          },
        },
        order: {
          entity: {
            id: "order_test",
            amount: 12345,
            amount_paid: 12345,
            currency: "INR",
            status: "paid",
            notes: {
              session_id: "payses_123",
            },
          },
        },
      },
    };

    const result = await provider.getWebhookActionAndData(
      createSignedWebhookPayload({ body }),
    );

    expect(result).toEqual({
      action: PaymentActions.SUCCESSFUL,
      data: {
        session_id: "payses_123",
        amount: 123.45,
      },
    });
  });

  it("maps signed authorized webhooks to Medusa authorized actions", async () => {
    const provider = createProvider();
    const result = await provider.getWebhookActionAndData(
      createSignedWebhookPayload({
        body: {
          event: "payment.authorized",
          payload: {
            payment: {
              entity: {
                id: "pay_test",
                amount: 50000,
                currency: "INR",
                status: "authorized",
                captured: false,
                notes: {
                  session_id: "payses_123",
                },
              },
            },
          },
        },
      }),
    );

    expect(result).toEqual({
      action: PaymentActions.AUTHORIZED,
      data: {
        session_id: "payses_123",
        amount: 500,
      },
    });
  });

  it("resolves payment webhooks through the Razorpay order when webhook notes are missing", async () => {
    fetchOrderMock.mockResolvedValue({
      id: "order_test",
      amount: 50000,
      amount_paid: 50000,
      currency: "INR",
      status: "paid",
      notes: {
        session_id: "payses_from_order",
      },
    });

    const provider = createProvider();
    const result = await provider.getWebhookActionAndData(
      createSignedWebhookPayload({
        body: {
          event: "payment.captured",
          payload: {
            payment: {
              entity: {
                id: "pay_test",
                order_id: "order_test",
                amount: 50000,
                currency: "INR",
                status: "captured",
                captured: true,
              },
            },
          },
        },
      }),
    );

    expect(fetchOrderMock).toHaveBeenCalledWith("order_test");
    expect(result).toEqual({
      action: PaymentActions.SUCCESSFUL,
      data: {
        session_id: "payses_from_order",
        amount: 500,
      },
    });
  });

  it("rejects webhooks with invalid signatures", async () => {
    const provider = createProvider();
    const body = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_test",
            amount: 50000,
            currency: "INR",
            status: "captured",
            notes: {
              session_id: "payses_123",
            },
          },
        },
      },
    };

    const result = await provider.getWebhookActionAndData(
      createSignedWebhookPayload({ body, secret: "wrong_secret" }),
    );

    expect(result).toEqual({
      action: PaymentActions.NOT_SUPPORTED,
    });
  });
});
