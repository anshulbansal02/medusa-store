import type { Metadata } from "next";

import { PolicyPage } from "@/components/content/policy-page";
import { siteContent } from "@/content/site-content";
import { absoluteUrl } from "@/lib/config/site";

export const metadata: Metadata = {
  title: siteContent.shipping.metadata.title,
  description: siteContent.shipping.metadata.description,
  alternates: {
    canonical: absoluteUrl("/shipping"),
  },
};

export default function ShippingPage() {
  const content = siteContent.shipping;

  return (
    <PolicyPage
      eyebrow={content.eyebrow}
      intro={content.metadata.description}
      sections={content.sections.map((section) => ({
        title: section.title,
        body: section.text,
      }))}
      title={content.title}
    />
  );
}
