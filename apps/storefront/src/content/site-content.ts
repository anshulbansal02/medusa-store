export const siteContent = {
  brand: {
    name: "The Label",
    footerDescription:
      "Premium western occasion wear for India, built around newness, visual appeal, and a low-friction shopping flow.",
  },
  header: {
    announcementItems: ["India shipping", "Prepaid checkout", "Size support"],
    primaryShopLabel: "New Arrivals",
  },
  home: {
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
  },
  shop: {
    metadata: {
      title: "Shop New Arrivals | The Label",
      description:
        "Shop premium western occasion wear, dresses, co-ords, and statement tops for India.",
    },
    eyebrow: "New arrivals",
    title: "Shop the edit.",
    description:
      "Dresses, co-ords, and sharper tops for dinners, wedding functions, launches, and weekends that need more polish.",
    allCategoryLabel: "All",
    countLabel: "styles",
    emptyTitle: "The shop is being prepared.",
    emptyDescription:
      "The launch edit will appear here as soon as styles are available.",
    valueStrip: [
      {
        title: "Size notes close by.",
        text: "Product pages keep fit and measurements near size selection.",
      },
      {
        title: "Prepaid checkout.",
        text: "Payment is available after address and shipping are saved.",
      },
      {
        title: "India shipping.",
        text: "Dispatch and return details stay visible before purchase.",
      },
    ],
  },
  collection: {
    fallbackDescription:
      "A focused edit of available styles from the current collection.",
    emptyTitle: "This edit is being prepared.",
    emptyDescription:
      "Styles from this edit will appear here as soon as they are available.",
    allProductsAction: "View all",
    countLabel: "styles",
  },
  product: {
    statusLabel: "New arrival",
    deliveryTitle: "Delivery",
    deliveryText: "India shipping with prepaid checkout.",
    returnsTitle: "Returns",
    returnsText:
      "Eligible items can be requested for return or exchange according to the store policy.",
    relatedEyebrowFallback: "Keep browsing",
    relatedTitle: "More from this edit",
    relatedAction: "View edit",
  },
  checkout: {
    emptyTitle: "Your bag is empty.",
    emptyDescription: "Add a style before entering delivery details.",
    emptyAction: "Shop new arrivals",
    eyebrow: "Checkout",
    title: "Delivery details",
    addressTitle: "Address",
    addressDescription:
      "India-only delivery for this launch. Billing uses the same address.",
    shippingTitle: "Shipping",
    shippingDescription:
      "Save the address first, then choose a delivery method.",
    noShippingTitle: "No shipping options available.",
    noShippingDescription:
      "Please review the delivery address or contact the store team for help.",
    addressRequiredTitle: "Address needed first.",
    addressRequiredDescription:
      "Shipping options appear after the delivery address is saved.",
    summaryTitle: "Order summary",
    payment: {
      processingLabel: "Processing...",
      buttonLabel: "Pay securely",
      unavailable:
        "Payment is temporarily unavailable. Please contact support.",
      detailsRequired: "Add address and shipping before payment.",
      preparing: "Preparing secure payment.",
      ready: "Secure prepaid checkout powered by Razorpay.",
    },
  },
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
  search: {
    metadata: {
      title: "Search | The Label",
      description: "Search dresses, co-ords, tops, and occasion wear.",
    },
    eyebrow: "Search",
    title: "Find a style.",
    placeholder: "Search dresses, co-ords, tops",
    dialogPlaceholder: "Search dresses, co-ords, colors",
    action: "Search",
    clearAction: "Clear",
    browseAction: "Browse shop",
    emptyTitle: "No styles found.",
    emptyDescription: "Try a broader search, or browse the current edit.",
    dialogTitle: "Search products",
    dialogDescription:
      "Search product names, categories, colors, and product notes.",
    editsLabel: "Edits",
    matchingLabel: "Matching styles",
    latestLabel: "Latest styles",
    viewAllAction: "View all",
    resultSingular: "result",
    resultPlural: "results",
  },
} as const;

export type SiteContent = typeof siteContent;
