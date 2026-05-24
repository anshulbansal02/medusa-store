export const policyPages = {
  about: {
    metadataTitle: "About | Neonfold",
    eyebrow: "About",
    title: "About Neonfold.",
    description: "Occasionwear for dressed-up plans across India.",
    intro:
      "Neonfold makes limited-run western occasionwear for dinners, celebrations, launches, and after-hours plans.",
    sections: [
      {
        title: "Point of view",
        body: "Each collection is built around pieces that feel dressed-up without being difficult to wear.",
      },
      {
        title: "Launch collection",
        body: "The first collection is intentionally focused, with about 20 to 25 styles across dresses, co-ords, tops, and occasionwear.",
      },
      {
        title: "Order care",
        body: "Orders are packed carefully, with updates from checkout through dispatch.",
      },
    ],
  },
  returns: {
    metadataTitle: "Returns | Neonfold",
    eyebrow: "Help",
    title: "Returns.",
    description: "Returns and exchanges policy for Neonfold.",
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
    metadataTitle: "Refunds and Cancellations | Neonfold",
    eyebrow: "Policy",
    title: "Refunds.",
    description: "Refund and cancellation policy for Neonfold.",
    intro:
      "Refunds and cancellations depend on payment status and how far the order has moved toward dispatch.",
    sections: [
      {
        title: "Cancellations",
        body: "Cancellation eligibility depends on order status. Orders that have already been packed, dispatched, or handed to a courier may not be cancellable.",
      },
      {
        title: "Refund mode",
        body: "Approved refunds are returned to the original prepaid payment method. Processing timelines can depend on Razorpay, the bank, or the payment app.",
      },
      {
        title: "Failed payments",
        body: "If payment fails or remains incomplete, the order is not treated as paid. Retry checkout or contact support with payment and order details.",
      },
    ],
  },
  terms: {
    metadataTitle: "Terms and Conditions | Neonfold",
    eyebrow: "Legal",
    title: "Terms.",
    description: "Terms and conditions for using Neonfold storefront.",
    intro:
      "These terms explain how orders, product information, and store use are handled.",
    sections: [
      {
        title: "Store use",
        body: "Use accurate contact, shipping, and payment information while placing an order. We may contact you if any order details need clarification.",
      },
      {
        title: "Product information",
        body: "Product images, colors, fabric notes, prices, and availability are kept as accurate as possible. Small differences can occur due to photography, screen settings, and fabric behavior.",
      },
      {
        title: "Orders",
        body: "An order is processed after prepaid payment and order checks are complete. We may cancel or contact you if an order cannot be fulfilled.",
      },
    ],
  },
  privacy: {
    metadataTitle: "Privacy Policy | Neonfold",
    eyebrow: "Legal",
    title: "Privacy.",
    description: "Privacy policy for Neonfold storefront.",
    intro:
      "Neonfold collects only the information needed to process orders, deliver purchases, and support customers.",
    sections: [
      {
        title: "Information collected",
        body: "Checkout can require contact details, shipping address, order details, and payment status information. Payment credentials are handled by the payment provider; Neonfold does not store card or UPI credentials.",
      },
      {
        title: "Usage",
        body: "Customer information is used for order processing, delivery, order emails, support, fraud prevention, and required records.",
      },
      {
        title: "Analytics",
        body: "The site uses basic website analytics to understand browsing behavior. Payment details and order contents are not used for analytics reports.",
      },
    ],
  },
  faq: {
    metadataTitle: "FAQ | Neonfold",
    eyebrow: "Help",
    title: "FAQ.",
    description: "Common questions about shopping from Neonfold.",
    intro: "Quick answers before you place an order.",
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
