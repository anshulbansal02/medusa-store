export const globalContent = {
  brand: {
    name: "Neonfold",
    footerDescription:
      "Limited-run occasion wear for dinners, celebrations, and after-hours plans across India.",
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
      { href: "/shop/occasion-edit", label: "Occasionwear" },
      { href: "/about", label: "About" },
    ],
    primaryNavigationLabel: "Primary navigation",
    mobileMenu: {
      title: "Menu",
      description:
        "Shop new arrivals, track orders, or get help with fit and delivery.",
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
      title: "Get first look at new drops.",
      description:
        "New arrivals, restocks, styling notes, and private offers, sent only when there is something worth sharing.",
      emailLabel: "Email address",
      emailPlaceholder: "Email",
      submitLabel: "Subscribe",
    },
    trustItems: [
      {
        icon: "shield",
        title: "Secure prepaid checkout",
        text: "Pay safely with Razorpay after your address and delivery option are confirmed.",
      },
      {
        icon: "truck",
        title: "India-wide delivery",
        text: "Clear dispatch and tracking updates once your order is on its way.",
      },
      {
        icon: "ruler",
        title: "Fit and size support",
        text: "Measurements and fit notes are shown with each style so you can choose carefully.",
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
          { href: "/shop/occasion-edit", label: "Occasionwear" },
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
