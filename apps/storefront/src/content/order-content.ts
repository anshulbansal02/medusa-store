export const orderContent = {
  trackOrder: {
    metadata: {
      title: "Track Order | The Label",
      description:
        "Open your order details using the order ID or confirmation link from The Label.",
    },
    eyebrow: "Order support",
    title: "Track order.",
    description:
      "Use the order ID or confirmation link from your email to reopen the order details page.",
    formTitle: "Find your order",
    formDescription:
      "This page does not create an account or ask for a password. It only opens the order page for the reference you provide.",
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
        text: "The lookup opens the order page directly from the store system.",
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
      invalidReference:
        "Use the order reference or confirmation link from your email.",
      invalidInput: "Enter an order reference or order link.",
      pendingMessage: "Opening order details...",
      pendingButton: "Opening...",
      submitButton: "View order",
    },
  },
  orderConfirmation: {
    metadata: {
      title: "Order Confirmation | The Label",
      descriptionPrefix: "Order confirmation for",
    },
    title: "Order placed.",
    emailLead:
      "We have received the order. A confirmation email will be sent to",
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
