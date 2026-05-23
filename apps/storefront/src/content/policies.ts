export const policyPages = {
  about: {
    metadataTitle: "About | The Label",
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
        body: "Orders, fulfillment, and customer support are handled by the store team, with clear updates from checkout through dispatch.",
      },
    ],
  },
  returns: {
    metadataTitle: "Returns | The Label",
    eyebrow: "Help",
    title: "Returns.",
    description: "Returns and exchanges policy for The Label.",
    intro:
      "Return and exchange requests are reviewed with the order details, item condition, and delivery status in mind.",
    sections: [
      {
        title: "Eligibility",
        body: "Returns or exchanges should be requested with the order details, item name, size, and reason. Items are expected to be unused, unworn, and in original condition with tags and packaging where applicable.",
      },
      {
        title: "Size support",
        body: "Product pages include size guidance so customers can choose carefully before purchase. If a size exchange is needed, contact the store team with the order details and preferred size.",
      },
      {
        title: "Inspection",
        body: "Returned items may need to be inspected before a refund, exchange, or store resolution is approved. Damaged, used, altered, or incomplete items may not be eligible.",
      },
    ],
  },
  refundCancellation: {
    metadataTitle: "Refunds and Cancellations | The Label",
    eyebrow: "Policy",
    title: "Refunds.",
    description: "Refund and cancellation policy for The Label.",
    intro:
      "Refund and cancellation rules are kept explicit so order support stays clear after payment.",
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
    metadataTitle: "Terms and Conditions | The Label",
    eyebrow: "Legal",
    title: "Terms.",
    description: "Terms and conditions for using The Label storefront.",
    intro:
      "These terms describe expected use of the storefront and how orders are handled.",
    sections: [
      {
        title: "Store use",
        body: "Customers should use accurate contact, shipping, and payment information while placing an order. The store may contact the customer if order details need clarification.",
      },
      {
        title: "Product information",
        body: "Product imagery, colors, fabric notes, prices, and availability are maintained by the store team. Small differences can occur due to photography, screen settings, and fabric behavior.",
      },
      {
        title: "Orders",
        body: "An order is processed only after the required prepaid payment and order checks are complete. The store may cancel or contact the customer if an order cannot be fulfilled.",
      },
    ],
  },
  privacy: {
    metadataTitle: "Privacy Policy | The Label",
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
        body: "The storefront uses basic website analytics to understand browsing behavior. Payment details and order contents are not used for analytics reporting.",
      },
    ],
  },
  faq: {
    metadataTitle: "FAQ | The Label",
    eyebrow: "Help",
    title: "FAQ.",
    description: "Common questions about shopping from The Label.",
    intro: "A compact help page for common pre-purchase questions.",
    sections: [
      {
        title: "Where do you ship?",
        body: "The store currently ships prepaid orders within India.",
      },
      {
        title: "Is cash on delivery available?",
        body: "No. Checkout is prepaid through supported Razorpay payment methods.",
      },
      {
        title: "How should I choose a size?",
        body: "Use the product size chart and fit notes before adding to bag. If a measurement is unclear, contact the store team with the product name and intended size.",
      },
    ],
  },
} as const;
