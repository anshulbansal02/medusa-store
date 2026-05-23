export const catalogContent = {
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
    categoryNavigationLabel: "Shop categories",
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
    metadataDescriptionPrefix: "Shop",
    emptyTitle: "This edit is being prepared.",
    emptyDescription:
      "Styles from this edit will appear here as soon as they are available.",
    allProductsAction: "View all",
    countLabel: "styles",
  },
  product: {
    card: {
      viewAriaLabelPrefix: "View",
      viewDetailsLabel: "View details",
      imageAltSuffix: "styled on a model",
    },
    statusLabel: "New arrival",
    deliveryTitle: "Delivery",
    deliveryText: "India shipping with prepaid checkout.",
    returnsTitle: "Returns",
    returnsText:
      "Eligible items can be requested for return or exchange according to the store policy.",
    relatedEyebrowFallback: "Keep browsing",
    relatedTitle: "More from this edit",
    relatedAction: "View edit",
    breadcrumbLabel: "Breadcrumb",
    shopBreadcrumbLabel: "Shop",
    notFoundTitle: "Product not found | The Label",
    detailSectionLabels: {
      fabric: "Fabric",
      fit: "Fit",
      care: "Care",
      model: "Model",
      measurements: "Measurements",
    },
    gallery: {
      openViewerLabel: "Open image viewer",
      closeViewerLabel: "Close image viewer",
      dialogTitleSuffix: "images",
      imageAltSuffix: "view",
      fullImageAltSuffix: "full image",
      thumbnailLabel: "View image",
    },
    sizeChart: {
      title: "Size chart",
      fullGuideAction: "Full guide",
      sizeColumnLabel: "Size",
    },
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
    imageAltSuffix: "styled on a model",
  },
} as const;
