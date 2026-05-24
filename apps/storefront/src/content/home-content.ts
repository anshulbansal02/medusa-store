export const homeContent = {
  metadata: {
    title: "Neonfold | Occasion wear for evenings out",
    description:
      "Limited-run occasion wear for dinners, celebrations, and after-hours plans across India.",
  },
  hero: {
    imageAltSuffix: "styled on a model",
    productEyebrow: "Featured style",
    eyebrow: "Launch collection",
    title: "Designed to be noticed.",
    description:
      "Limited-run western occasion pieces for dinners, wedding functions, launches, and dressed-up weekends.",
    primaryAction: "Shop new arrivals",
    emptyTitle: "The launch collection is being prepared.",
    emptyDescription:
      "The launch collection will appear here as soon as the first pieces are available.",
  },
  valueStrip: [
    {
      title: "A focused launch collection.",
      text: "About 20-25 styles, selected with intention.",
    },
    {
      title: "Fit notes before you buy.",
      text: "Measurements and fit details are shown before you add to bag.",
    },
    {
      title: "Prepaid delivery across India.",
      text: "Add your address, choose shipping, then pay securely.",
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
    title: "Occasionwear",
    description:
      "Styles for dinners, wedding functions, launches, and weekends that call for more polish.",
    action: "Shop occasionwear",
  },
  fitSupport: {
    eyebrow: "Size and fit first",
    title: "Dressy should still feel easy.",
    description:
      "Check measurements, fabric, care, and fit notes before choosing a size.",
    primaryAction: "Shop new arrivals",
  },
} as const;

export type HomeContent = typeof homeContent;
