import type { Metadata } from "next";

import { PolicyPage } from "@/components/content/policy-page";
import { policyPages } from "@/lib/config/policies";
import { absoluteUrl } from "@/lib/config/site";

const page = policyPages.about;

export const metadata: Metadata = {
  title: "About | The Label",
  description: page.description,
  alternates: {
    canonical: absoluteUrl("/about"),
  },
};

export default function AboutPage() {
  return <PolicyPage {...page} />;
}
