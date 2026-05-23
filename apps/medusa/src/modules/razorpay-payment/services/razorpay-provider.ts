import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types";
import {
  AbstractPaymentProvider,
  MedusaError,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils";
import Razorpay from "razorpay";

import { toSmallestUnit } from "./money";
import {
  getOrderId,
  getPaymentSessionStatus,
  getSuccessfulPayments,
} from "./payment-state";
import type {
  RazorpayOrder,
  RazorpayPaymentList,
  RazorpayPaymentProviderOptions,
  RazorpayWebhookEvent,
} from "./types";
import {
  getHeader,
  getWebhookAmount,
  getWebhookOrderId,
  getWebhookSessionId,
  isWebhookSignatureValid,
} from "./webhook";

type InjectedDependencies = {
  logger?: {
    warn: (message: string) => void;
  };
};

const providerIdentifier = "razorpay";

export default class RazorpayPaymentProviderService extends AbstractPaymentProvider<RazorpayPaymentProviderOptions> {
  static identifier = providerIdentifier;

  protected readonly options_: RazorpayPaymentProviderOptions;
  protected readonly razorpay_: Razorpay;
  protected readonly logger_: InjectedDependencies["logger"];

  constructor(
    container: InjectedDependencies,
    options: RazorpayPaymentProviderOptions,
  ) {
    super(container, options);

    this.options_ = options;
    this.logger_ = container.logger;
    this.razorpay_ = new Razorpay({
      key_id: options.key_id,
      key_secret: options.key_secret,
    });
  }

  static validateOptions(options: Record<string, unknown>) {
    if (typeof options.key_id !== "string" || options.key_id.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Razorpay key_id is required.",
      );
    }

    if (
      typeof options.key_secret !== "string" ||
      options.key_secret.length === 0
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Razorpay key_secret is required.",
      );
    }
  }

  async initiatePayment(
    input: InitiatePaymentInput,
  ): Promise<InitiatePaymentOutput> {
    const currency = input.currency_code.toUpperCase();
    const amount = toSmallestUnit(input.amount, currency);
    const sessionId =
      typeof input.data?.session_id === "string" ? input.data.session_id : "";
    const cartId =
      typeof input.data?.cart_id === "string" ? input.data.cart_id : "";
    const order = (await this.razorpay_.orders.create({
      amount,
      currency,
      receipt: cartId ? cartId.slice(0, 40) : undefined,
      notes: {
        cart_id: cartId,
        session_id: sessionId,
      },
    })) as RazorpayOrder;

    return {
      id: order.id,
      status: PaymentSessionStatus.PENDING,
      data: {
        id: order.id,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        session_id: sessionId,
      },
    };
  }

  async authorizePayment(
    input: AuthorizePaymentInput,
  ): Promise<AuthorizePaymentOutput> {
    return this.getPaymentStatus(input);
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput,
  ): Promise<GetPaymentStatusOutput> {
    const orderId = getOrderId(input.data);

    if (!orderId) {
      return {
        status: PaymentSessionStatus.ERROR,
        data: input.data,
      };
    }

    const [order, payments] = await Promise.all([
      this.razorpay_.orders.fetch(orderId) as Promise<RazorpayOrder>,
      this.razorpay_.orders.fetchPayments(orderId) as Promise<RazorpayPaymentList>,
    ]);

    return {
      status: getPaymentSessionStatus({ order, payments }),
      data: {
        ...input.data,
        id: order.id,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    };
  }

  async updatePayment(
    input: UpdatePaymentInput,
  ): Promise<UpdatePaymentOutput> {
    const orderId = getOrderId(input.data);

    if (!orderId) {
      return this.initiatePayment(input);
    }

    const currency = input.currency_code.toUpperCase();
    const currentAmount = toSmallestUnit(input.amount, currency);
    const order = (await this.razorpay_.orders.fetch(orderId)) as RazorpayOrder;

    if (order.amount === currentAmount && order.currency === currency) {
      return this.getPaymentStatus(input);
    }

    this.logger_?.warn(
      "Razorpay order amount changed; creating a new Razorpay order for the payment session.",
    );

    return this.initiatePayment(input);
  }

  async retrievePayment(
    input: RetrievePaymentInput,
  ): Promise<RetrievePaymentOutput> {
    const orderId = getOrderId(input.data);

    if (!orderId) {
      return { data: input.data };
    }

    const order = (await this.razorpay_.orders.fetch(orderId)) as RazorpayOrder;

    return {
      data: {
        ...input.data,
        order,
      },
    };
  }

  async capturePayment(
    input: CapturePaymentInput,
  ): Promise<CapturePaymentOutput> {
    const orderId = getOrderId(input.data);

    if (!orderId) {
      return { data: input.data };
    }

    const payments = (await this.razorpay_.orders.fetchPayments(
      orderId,
    )) as RazorpayPaymentList;
    const capturedPayments: Record<string, unknown> = {};

    for (const payment of getSuccessfulPayments(payments)) {
      if (payment.status === "captured" || payment.captured) {
        capturedPayments[payment.id] = payment;
        continue;
      }

      capturedPayments[payment.id] = await this.razorpay_.payments.capture(
        payment.id,
        payment.amount,
        payment.currency,
      );
    }

    return {
      data: {
        ...input.data,
        payments: capturedPayments,
      },
    };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const orderId = getOrderId(input.data);

    if (!orderId) {
      return { data: input.data };
    }

    const payments = (await this.razorpay_.orders.fetchPayments(
      orderId,
    )) as RazorpayPaymentList;
    const refundablePayment = getSuccessfulPayments(payments).find(
      (payment) => payment.status === "captured" || payment.captured,
    );

    if (!refundablePayment) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No captured Razorpay payment is available to refund.",
      );
    }

    const refund = await this.razorpay_.payments.refund(refundablePayment.id, {
      amount: toSmallestUnit(
        input.amount,
        refundablePayment.currency.toUpperCase(),
      ),
    });

    return {
      data: {
        ...input.data,
        latest_refund: refund,
      },
    };
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data: input.data };
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data };
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"],
  ): Promise<WebhookActionResult> {
    if (!this.options_.webhook_secret) {
      this.logger_?.warn(
        "Razorpay webhook received, but webhook_secret is not configured.",
      );
      return { action: PaymentActions.NOT_SUPPORTED };
    }

    const signature = getHeader(payload.headers, "x-razorpay-signature");

    if (!signature) {
      return { action: PaymentActions.NOT_SUPPORTED };
    }

    if (
      !isWebhookSignatureValid({
        rawData: payload.rawData,
        secret: this.options_.webhook_secret,
        signature,
      })
    ) {
      return { action: PaymentActions.NOT_SUPPORTED };
    }

    const event = payload.data as RazorpayWebhookEvent;
    let sessionId = getWebhookSessionId(event);
    let amount = getWebhookAmount(event);

    if (!sessionId || amount === null) {
      const orderId = getWebhookOrderId(event);

      if (orderId) {
        try {
          const order = (await this.razorpay_.orders.fetch(
            orderId,
          )) as RazorpayOrder;

          event.payload = {
            ...event.payload,
            order: {
              entity: order,
            },
          };
          sessionId = getWebhookSessionId(event);
          amount = getWebhookAmount(event);
        } catch {
          return { action: PaymentActions.NOT_SUPPORTED };
        }
      }
    }

    if (!sessionId || amount === null) {
      return { action: PaymentActions.NOT_SUPPORTED };
    }

    const data = {
      session_id: sessionId,
      amount,
    };

    switch (event.event) {
      case "order.paid":
      case "payment.captured":
        return {
          action: PaymentActions.SUCCESSFUL,
          data,
        };
      case "payment.authorized":
        return {
          action: event.payload?.payment?.entity?.captured
            ? PaymentActions.SUCCESSFUL
            : PaymentActions.AUTHORIZED,
          data,
        };
      case "payment.failed":
        return {
          action: PaymentActions.FAILED,
          data,
        };
      default:
        return {
          action: PaymentActions.NOT_SUPPORTED,
        };
    }
  }
}
