import type { Metadata } from "next";

import { PolicyPage } from "@/components/content/policy-page";
import { policyPages } from "@/content/policies";
import { absoluteUrl } from "@/lib/config/site";

const page = policyPages.refundCancellation;

export const metadata: Metadata = {
  title: page.metadataTitle,
  description: page.description,
  alternates: {
    canonical: absoluteUrl("/refund-cancellation"),
  },
};

export default function RefundCancellationPage() {
  return <PolicyPage {...page} />;
}
