export const homeContent = {
  metadata: {
    title: "The Label | Occasion wear for evenings out",
    description:
      "Premium western occasion wear for India, built around newness, visual appeal, and a low-friction shopping flow.",
  },
  hero: {
    productEyebrow: "Featured style",
    eyebrow: "The first edit",
    title: "Designed to be noticed.",
    description:
      "Limited-run western occasion pieces for dinners, wedding functions, launches, and dressed-up weekends.",
    primaryAction: "Shop new arrivals",
    secondaryAction: "Find your size",
    emptyTitle: "The first edit is being prepared.",
    emptyDescription:
      "The launch collection will appear here as soon as the first pieces are available.",
  },
  valueStrip: [
    {
      title: "Small catalog, sharper edit.",
      text: "About 20-25 pieces at launch.",
    },
    {
      title: "Premium price confidence.",
      text: "Fit notes and size support stay close to purchase decisions.",
    },
    {
      title: "India-first checkout.",
      text: "Prepaid flow with clear shipping details before payment.",
    },
  ],
  newArrivals: {
    title: "New arrivals",
    description:
      "Dresses, co-ords, and statement tops selected for dinners, wedding functions, and dressed-up weekends.",
    action: "View all products",
    emptyTitle: "New arrivals are being prepared.",
    emptyDescription:
      "The latest pieces will appear here as soon as they are available.",
  },
  occasionEdit: {
    title: "Occasion edit",
    description:
      "Shop by plan, not by trend. A tighter selection for dressed-up moments.",
    action: "View the edit",
  },
  fitSupport: {
    eyebrow: "Size and fit first",
    title: "Dressy should still feel easy.",
    description:
      "Measurements, fabric, care, and fit notes stay close to the add-to-bag flow, so customers can decide with confidence.",
    primaryAction: "Size guide",
    secondaryAction: "Shop new arrivals",
  },
  trustItems: [
    {
      icon: "shield",
      title: "Secure prepaid checkout",
      text: "Razorpay-powered payment after address and shipping.",
    },
    {
      icon: "truck",
      title: "India shipping",
      text: "Simple dispatch updates from the store team.",
    },
    {
      icon: "ruler",
      title: "Size support",
      text: "Fit notes and a clear size chart on every product.",
    },
  ],
} as const;

export type HomeContent = typeof homeContent;
