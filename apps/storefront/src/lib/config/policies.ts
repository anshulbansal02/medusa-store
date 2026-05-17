export const policyPages = {
  about: {
    eyebrow: "About",
    title: "The store.",
    description: "About The Label and the launch collection.",
    intro:
      "The Label is a single-brand fashion storefront for premium western occasion wear in India.",
    sections: [
      {
        title: "Point of view",
        body: "The first edit is planned around visual appeal, newer silhouettes, and easy occasion dressing for dinners, wedding functions, launches, and dressed-up weekends.",
      },
      {
        title: "Catalog",
        body: "Launch inventory is intentionally small, about 20 to 25 styles, so product pages can stay focused on fit, fabric, images, and size support.",
      },
      {
        title: "Operations",
        body: "Orders, fulfillment, and customer support will be handled by the store team through the commerce admin and connected payment, email, and shipping workflows.",
      },
    ],
  },
  returns: {
    eyebrow: "Help",
    title: "Returns.",
    description: "Returns and exchanges policy for The Label.",
    intro:
      "This policy is a launch draft. Final return windows and eligibility rules must be confirmed before production checkout is enabled.",
    sections: [
      {
        title: "Eligibility",
        body: "Returns or exchanges should be requested with the order details, item name, size, and reason. Items are expected to be unused, unworn, and in original condition with tags and packaging where applicable.",
      },
      {
        title: "Size support",
        body: "Product pages include size guidance so customers can choose carefully before purchase. Size exchange rules will be finalized by the business team before launch.",
      },
      {
        title: "Inspection",
        body: "Returned items may need to be inspected before a refund, exchange, or store resolution is approved. Damaged, used, altered, or incomplete items may not be eligible.",
      },
    ],
  },
  refundCancellation: {
    eyebrow: "Policy",
    title: "Refunds.",
    description: "Refund and cancellation policy for The Label.",
    intro:
      "Refund and cancellation rules are kept explicit here so checkout support can stay clear once payments are enabled.",
    sections: [
      {
        title: "Cancellations",
        body: "Cancellation eligibility depends on fulfillment status. Orders that have already been packed, dispatched, or handed to a courier may not be cancellable through the standard flow.",
      },
      {
        title: "Refund mode",
        body: "Approved refunds should be returned to the original prepaid payment method through the payment provider. Processing timelines can depend on Razorpay, the bank, or the payment instrument.",
      },
      {
        title: "Failed payments",
        body: "If payment fails or remains incomplete, the order should not be treated as paid. Customers should retry checkout or contact support with payment and order details.",
      },
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms.",
    description: "Terms and conditions for using The Label storefront.",
    intro:
      "These terms describe expected use of the storefront. Final legal review should happen before production launch.",
    sections: [
      {
        title: "Store use",
        body: "Customers should use accurate contact, shipping, and payment information while placing an order. The store may contact the customer if order details need clarification.",
      },
      {
        title: "Product information",
        body: "Product imagery, colors, fabric notes, prices, and availability are managed through the commerce backend. Small differences can occur due to photography, screen settings, and fabric behavior.",
      },
      {
        title: "Orders",
        body: "An order is processed only after the required prepaid payment and order checks are complete. The store may cancel or contact the customer if an order cannot be fulfilled.",
      },
    ],
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy.",
    description: "Privacy policy for The Label storefront.",
    intro:
      "The storefront should collect only the information needed to browse, checkout, deliver orders, and support customers.",
    sections: [
      {
        title: "Information collected",
        body: "Checkout can require contact details, shipping address, order details, and payment status information. Payment credentials are handled by the payment provider and should not be stored in storefront code.",
      },
      {
        title: "Usage",
        body: "Customer information is used for order processing, delivery, transactional email, support, fraud prevention, and required operational records.",
      },
      {
        title: "Analytics",
        body: "V1 analytics should remain lightweight and privacy-conscious. The storefront uses basic website analytics and must not send customer payment or order data to analytics tools.",
      },
    ],
  },
  faq: {
    eyebrow: "Help",
    title: "FAQ.",
    description: "Common questions about shopping from The Label.",
    intro:
      "A compact help page for common pre-purchase questions. The store team can expand this after launch patterns are clear.",
    sections: [
      {
        title: "Where do you ship?",
        body: "The v1 storefront is India only. International shipping and currency are not part of the launch scope.",
      },
      {
        title: "Is cash on delivery available?",
        body: "No. The v1 checkout is planned as prepaid only through Razorpay-supported payment methods.",
      },
      {
        title: "How should I choose a size?",
        body: "Use the product size chart and fit notes before adding to bag. If a measurement is unclear, contact the store team with the product name and intended size.",
      },
    ],
  },
} as const;
