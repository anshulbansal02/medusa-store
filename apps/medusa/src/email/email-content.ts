export const emailContent = {
  brand: {
    name: "Neonfold",
    adminName: "Neonfold",
  },
  userInvited: {
    heading: "You are invited to manage the Neonfold store",
    introPrefix: "You are invited to manage the",
    introSuffix: "store. Use this secure invite to set up your access and start working in store administration.",
    action: "Accept invite",
    expiry:
      "For security, this invite link may expire. Ask the store owner to send a new invite if this one no longer works.",
    support:
      "If you were not expecting this invite, you can ignore this email.",
    preview: "Set up your Neonfold store admin access.",
    subject: "You are invited to manage the Neonfold store",
    textFallback: "You are invited to manage the Neonfold store. Accept the invite here: {inviteUrl}",
  },
  orderPlaced: {
    customer: {
      heading: "Order confirmed",
      introPrefix: "We have received your order",
      introSuffix: "Here is your receipt and what happens next.",
      action: "View order",
      support:
        "For support, reply to this email with your order number.",
      previewPrefix: "confirmed. Total",
      subjectWithOrder: "Your Neonfold order {orderNumber} is confirmed",
      subjectFallback: "Your Neonfold order is confirmed",
      textFallback:
        "Thank you for your order{orderNumber}. Total: {orderTotal}.",
    },
    owner: {
      heading: "New order received",
      introPrefix: "Order",
      introSuffix: "was placed by",
      dashboardPrompt:
        "Open the order dashboard to capture payment, fulfill items, and add tracking updates.",
      guestCustomer: "guest customer",
      previewPrefix: "New order",
      previewFrom: "from",
      subjectWithOrder: "New Neonfold order {orderNumber}",
      subjectFallback: "New Neonfold order",
      textFallback:
        "New order{orderNumber} for {orderTotal} from {customerEmail}.",
    },
    summary: {
      order: "Order",
      total: "Total",
      payment: "Payment",
      paymentValue: "Prepaid",
    },
    items: {
      customerTitle: "Your pieces",
      ownerTitle: "Items",
      fallbackTitle: "Product",
      quantityPrefix: "Qty",
    },
    totals: {
      subtotal: "Subtotal",
      shipping: "Shipping",
      tax: "Tax",
      total: "Total",
    },
    nextSteps: {
      title: "What happens next",
      body: [
        "The store team will review your order, prepare your pieces, and email you again when dispatch is ready.",
        "Keep this email for your order number if you need help with sizing, shipping, or returns.",
      ],
    },
  },
} as const;
