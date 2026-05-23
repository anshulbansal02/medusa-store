import type { Metadata } from "next";

import { PolicyPage } from "@/components/content/policy-page";
import { policyPages } from "@/content/policies";
import { absoluteUrl } from "@/lib/config/site";

const page = policyPages.faq;

export const metadata: Metadata = {
  title: "FAQ | The Label",
  description: page.description,
  alternates: {
    canonical: absoluteUrl("/faq"),
  },
};

export default function FaqPage() {
  return <PolicyPage {...page} />;
}
