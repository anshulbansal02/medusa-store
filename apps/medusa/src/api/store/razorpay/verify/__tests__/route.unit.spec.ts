import crypto from "node:crypto";

const fetchOrderMock = jest.fn();
const fetchPaymentMock = jest.fn();

jest.mock("razorpay", () => {
  const mock = jest.fn().mockImplementation(() => ({
    orders: {
      fetch: fetchOrderMock,
    },
    payments: {
      fetch: fetchPaymentMock,
    },
  }));

  return Object.assign(mock, {
    default: mock,
    __esModule: true,
  });
});

process.env.RAZORPAY_KEY_ID = "rzp_test_key";
process.env.RAZORPAY_KEY_SECRET = "rzp_secret";

const { POST } = require("../route");

function sign(
  orderId: string,
  paymentId: string,
  secret = process.env.RAZORPAY_KEY_SECRET ?? "rzp_secret",
) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

function createResponse() {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return response;
}

async function callRoute(body: Record<string, unknown>) {
  const response = createResponse();

  await POST({ body } as never, response as never);

  return response;
}

describe("POST /store/razorpay/verify", () => {
  const previousKeyId = process.env.RAZORPAY_KEY_ID;
  const previousKeySecret = process.env.RAZORPAY_KEY_SECRET;

  beforeEach(() => {
    fetchOrderMock.mockReset();
    fetchPaymentMock.mockReset();
    process.env.RAZORPAY_KEY_ID = "rzp_test_key";
    process.env.RAZORPAY_KEY_SECRET = "rzp_secret";
  });

  afterAll(() => {
    process.env.RAZORPAY_KEY_ID = previousKeyId;
    process.env.RAZORPAY_KEY_SECRET = previousKeySecret;
  });

  it("verifies a signed Razorpay callback only when payment and order match", async () => {
    fetchPaymentMock.mockResolvedValue({
      id: "pay_test",
      order_id: "order_test",
      status: "captured",
      amount: 12345,
      currency: "INR",
    });
    fetchOrderMock.mockResolvedValue({
      id: "order_test",
      status: "paid",
      amount: 12345,
      amount_paid: 12345,
      currency: "INR",
    });

    const response = await callRoute({
      razorpay_order_id: "order_test",
      razorpay_payment_id: "pay_test",
      razorpay_signature: sign(
        "order_test",
        "pay_test",
        process.env.RAZORPAY_KEY_SECRET,
      ),
    });

    expect(response.status).toHaveBeenCalledWith(200);
    expect(fetchPaymentMock).toHaveBeenCalledWith("pay_test");
    expect(fetchOrderMock).toHaveBeenCalledWith("order_test");
    expect(response.json).toHaveBeenCalledWith({ verified: true });
  });

  it("rejects invalid signatures before fetching payment state", async () => {
    const response = await callRoute({
      razorpay_order_id: "order_test",
      razorpay_payment_id: "pay_test",
      razorpay_signature: "bad_signature",
    });

    expect(fetchPaymentMock).not.toHaveBeenCalled();
    expect(fetchOrderMock).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ verified: false });
  });

  it("rejects signed callbacks when the payment is for a different order", async () => {
    fetchPaymentMock.mockResolvedValue({
      id: "pay_test",
      order_id: "order_other",
      status: "captured",
      amount: 12345,
      currency: "INR",
    });
    fetchOrderMock.mockResolvedValue({
      id: "order_test",
      status: "paid",
      amount: 12345,
      amount_paid: 12345,
      currency: "INR",
    });

    const response = await callRoute({
      razorpay_order_id: "order_test",
      razorpay_payment_id: "pay_test",
      razorpay_signature: sign(
        "order_test",
        "pay_test",
        process.env.RAZORPAY_KEY_SECRET,
      ),
    });

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ verified: false });
  });

  it("rejects verification when Razorpay credentials are not configured", async () => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_replace_me";

    const response = await callRoute({
      razorpay_order_id: "order_test",
      razorpay_payment_id: "pay_test",
      razorpay_signature: sign(
        "order_test",
        "pay_test",
        process.env.RAZORPAY_KEY_SECRET,
      ),
    });

    expect(response.status).toHaveBeenCalledWith(503);
    expect(response.json).toHaveBeenCalledWith({
      verified: false,
      message: "Razorpay verification is not configured.",
    });
  });
});
