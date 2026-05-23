import type { Metadata } from "next";

import { PolicyPage } from "@/components/content/policy-page";
import { policyPages } from "@/content/policies";
import { absoluteUrl } from "@/lib/config/site";

const page = policyPages.terms;

export const metadata: Metadata = {
  title: "Terms and Conditions | The Label",
  description: page.description,
  alternates: {
    canonical: absoluteUrl("/terms"),
  },
};

export default function TermsPage() {
  return <PolicyPage {...page} />;
}
