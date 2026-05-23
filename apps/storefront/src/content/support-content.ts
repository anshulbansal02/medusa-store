export const supportContent = {
  contact: {
    metadata: {
      title: "Contact | The Label",
      description: "Contact the store team for order and product help.",
    },
    eyebrow: "Contact",
    title: "Store help.",
    sections: [
      {
        title: "Orders and styling",
        text: "Share the product name, size, and your question. The store team can confirm availability, sizing, and order status.",
      },
      {
        title: "Response time",
        text: "The store team replies during business hours and prioritizes active orders first.",
      },
    ],
  },
  shipping: {
    metadata: {
      title: "Shipping | The Label",
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
        text: "Dispatch timelines and tracking details are shared after the order is packed and handed to the courier.",
      },
    ],
  },
  wishlist: {
    metadata: {
      title: "Wishlist | The Label",
      description: "Review the styles you saved while browsing The Label.",
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
  sizeGuide: {
    metadata: {
      title: "Size Guide | The Label",
      description: "Size notes for western occasion wear.",
    },
    eyebrow: "Fit",
    title: "Size guide.",
    description:
      "Measurements are in inches. Product pages may include more specific garment and fit notes where needed.",
    columns: ["Size", "Bust", "Waist", "Hip"],
    rows: [
      ["XS", "32", "26", "34"],
      ["S", "34", "28", "36"],
      ["M", "36", "30", "38"],
      ["L", "38", "32", "40"],
      ["XL", "40", "34", "42"],
    ],
  },
} as const;
