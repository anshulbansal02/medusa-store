export type RazorpayPaymentProviderOptions = {
  key_id: string;
  key_secret: string;
  webhook_secret?: string;
};

export type RazorpayPaymentData = {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  payments?: Record<string, unknown>;
  session_id?: string;
};

export type RazorpayOrder = {
  id: string;
  amount: number;
  amount_paid?: number;
  currency: string;
  status: "created" | "attempted" | "paid";
  notes?: Record<string, unknown>;
};

export type RazorpayPayment = {
  id: string;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  captured?: boolean;
  order_id?: string;
  notes?: Record<string, unknown>;
};

export type RazorpayPaymentList = {
  items?: RazorpayPayment[];
};

export type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: {
      entity?: RazorpayPayment;
    };
    order?: {
      entity?: RazorpayOrder;
    };
  };
};
