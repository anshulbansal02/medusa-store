export const globalContent = {
  brand: {
    name: "Neonfold",
    footerDescription:
      "Premium western occasion wear for India, built around newness, visual appeal, and a low-friction shopping flow.",
  },
  header: {
    announcement: {
      enabled: true,
      label: "New drops ship across India",
      href: "/shipping",
      linkLabel: "Shipping details",
    },
    primaryNavigationItems: [
      { href: "/shop", label: "Shop" },
      { href: "/shop?sort=newest", label: "New Arrivals" },
      { href: "/shop/occasion-edit", label: "Occasion Edit" },
      { href: "/about", label: "About" },
    ],
    primaryNavigationLabel: "Primary navigation",
    mobileMenu: {
      title: "Menu",
      description: "Shop the current edit and store support.",
      searchLabel: "Search",
      openLabel: "Open menu",
      closeLabel: "Close menu",
      primaryNavigationLabel: "Mobile primary navigation",
      supportNavigationLabel: "Mobile support navigation",
      supportItems: [
        { href: "/shipping", label: "Shipping" },
        { href: "/returns", label: "Returns" },
        { href: "/track-order", label: "Track Order" },
        { href: "/contact", label: "Contact" },
      ],
    },
  },
  footer: {
    newsletter: {
      eyebrow: "Newsletter",
      title: "Subscribe for new drops and private offers.",
      description:
        "Be first to know when limited occasion pieces, styling notes, and store updates go live.",
      emailLabel: "Email address",
      emailPlaceholder: "Email",
      submitLabel: "Subscribe",
    },
    trustItems: [
      {
        icon: "shield",
        title: "Secure prepaid checkout",
        text: "Pay safely with Razorpay after your address and shipping details are confirmed.",
      },
      {
        icon: "truck",
        title: "India-wide delivery",
        text: "Trackable dispatch updates from our store team once your order is on its way.",
      },
      {
        icon: "ruler",
        title: "Fit and size support",
        text: "Measurements and fit notes stay close to each style so you can choose with confidence.",
      },
    ],
    sections: [
      {
        title: "Shop",
        links: [
          { href: "/shop", label: "New Arrivals" },
          { href: "/shop/dresses", label: "Dresses" },
          { href: "/shop/co-ords", label: "Co-ords" },
          { href: "/shop/tops", label: "Tops" },
          { href: "/shop/occasion-edit", label: "Occasion Edit" },
        ],
      },
      {
        title: "Help",
        links: [
          { href: "/contact", label: "Contact" },
          { href: "/shipping", label: "Shipping" },
          { href: "/returns", label: "Returns" },
          { href: "/track-order", label: "Track Order" },
        ],
      },
      {
        title: "Legal",
        links: [
          { href: "/terms", label: "Terms" },
          { href: "/privacy", label: "Privacy" },
          { href: "/refund-cancellation", label: "Refunds" },
        ],
      },
    ],
  },
} as const;
