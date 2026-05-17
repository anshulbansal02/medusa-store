import type { Metadata } from "next";

import { PolicyPage } from "@/components/content/policy-page";
import { policyPages } from "@/lib/config/policies";
import { absoluteUrl } from "@/lib/config/site";

const page = policyPages.refundCancellation;

export const metadata: Metadata = {
  title: "Refunds and Cancellations | The Label",
  description: page.description,
  alternates: {
    canonical: absoluteUrl("/refund-cancellation"),
  },
};

export default function RefundCancellationPage() {
  return <PolicyPage {...page} />;
}
