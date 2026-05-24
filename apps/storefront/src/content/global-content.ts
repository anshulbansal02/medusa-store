export const globalContent = {
  brand: {
    name: "The Label",
    footerDescription:
      "Premium western occasion wear for India, built around newness, visual appeal, and a low-friction shopping flow.",
  },
  header: {
    announcementItems: ["India shipping", "Prepaid checkout", "Size support"],
    primaryShopLabel: "New Arrivals",
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
        { href: "/size-guide", label: "Size Guide" },
        { href: "/shipping", label: "Shipping" },
        { href: "/returns", label: "Returns" },
        { href: "/track-order", label: "Track Order" },
        { href: "/contact", label: "Contact" },
      ],
    },
  },
  footer: {
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
          { href: "/size-guide", label: "Size Guide" },
          { href: "/shipping", label: "Shipping" },
          { href: "/returns", label: "Returns" },
          { href: "/faq", label: "FAQ" },
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
