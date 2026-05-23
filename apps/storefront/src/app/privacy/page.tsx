import type { Metadata } from "next";

import { PolicyPage } from "@/components/content/policy-page";
import { policyPages } from "@/content/policies";
import { absoluteUrl } from "@/lib/config/site";

const page = policyPages.privacy;

export const metadata: Metadata = {
  title: "Privacy Policy | The Label",
  description: page.description,
  alternates: {
    canonical: absoluteUrl("/privacy"),
  },
};

export default function PrivacyPage() {
  return <PolicyPage {...page} />;
}
