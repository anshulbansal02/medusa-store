export const supportContent = {
  contact: {
    metadata: {
      title: "Contact | Neonfold",
      description:
        "Get help with orders, sizing, delivery, or product details.",
    },
    eyebrow: "Contact",
    title: "How can we help?",
    sections: [
      {
        title: "Orders and styling",
        text: "Share the product name, size, and your question. We can help with availability, fit, and order status.",
      },
      {
        title: "Response time",
        text: "We reply during business hours and prioritize active orders first.",
      },
    ],
  },
  shipping: {
    metadata: {
      title: "Shipping | Neonfold",
      description: "Shipping and delivery notes for India orders.",
    },
    eyebrow: "Delivery",
    title: "Shipping.",
    sections: [
      {
        title: "India only",
        text: "The store currently ships prepaid orders within India.",
      },
      {
        title: "Courier details",
        text: "Dispatch timelines and tracking details are shared after your order is packed and handed to the courier.",
      },
    ],
  },
  wishlist: {
    metadata: {
      title: "Wishlist | Neonfold",
      description: "Review the styles you saved while browsing Neonfold.",
    },
    eyebrow: "Saved styles",
    title: "Wishlist",
    description:
      "A private shortlist on this device only. Save pieces while browsing, then compare them before adding to bag.",
    openLabel: "Open wishlist",
    emptyTitle: "No saved styles yet.",
    emptyDescription:
      "Save styles from product cards and return here when comparing your shortlist.",
    browseAction: "Browse shop",
  },
} as const;
