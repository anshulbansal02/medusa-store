export const orderContent = {
  trackOrder: {
    metadata: {
      title: "Track Order | Neonfold",
      description:
        "View your Neonfold order using the order ID and checkout email.",
    },
    eyebrow: "Order support",
    title: "Track order.",
    description:
      "Use the order ID or confirmation link from your email to view your order.",
    formTitle: "Find your order",
    formDescription:
      "No account or password needed. Enter the order details from your confirmation email.",
    missingEmailLead: "Missing the order email?",
    contactAction: "Contact support",
    helpItems: [
      {
        icon: "mail",
        title: "Use the confirmation email",
        text: "Paste the order reference or the full confirmation link from your email.",
      },
      {
        icon: "packageSearch",
        title: "No account required",
        text: "Use the order email and reference to view the matching order.",
      },
      {
        icon: "badgeCheck",
        title: "Need help?",
        text: "Contact the store team with your order email if the link is missing.",
      },
    ],
    form: {
      label: "Order reference or confirmation link",
      placeholder: "Paste your order reference or link",
      emailLabel: "Order email",
      emailPlaceholder: "Enter the email used at checkout",
      invalidReference:
        "Use the order reference or confirmation link from your email.",
      invalidInput: "Enter an order reference or order link.",
      invalidEmail: "Enter the email used for this order.",
      notFound: "We could not match that order reference and email.",
      pendingMessage: "Opening order details...",
      pendingButton: "Opening...",
      submitButton: "View order",
    },
  },
  orderConfirmation: {
    metadata: {
      title: "Order Confirmation | Neonfold",
      descriptionPrefix: "Order confirmation for",
    },
    title: "Order placed.",
    emailLead: "We received your order. A confirmation email will be sent to",
    emailSuffix: "with the order details.",
    itemsTitle: "Items",
    quantityLabel: "Qty",
    unitPriceSuffix: "each",
    summaryTitle: "Summary",
    subtotalLabel: "Items",
    shippingLabel: "Shipping",
    taxLabel: "Tax",
    discountLabel: "Discount",
    totalLabel: "Total",
    deliveryAddressTitle: "Delivery address",
    continueShoppingAction: "Continue shopping",
    notFound: {
      eyebrow: "Order lookup",
      title: "Order not available.",
      description:
        "We could not find that order. Check the order ID or confirmation link, then try again.",
      retryAction: "Try again",
      contactAction: "Contact support",
    },
  },
} as const;
