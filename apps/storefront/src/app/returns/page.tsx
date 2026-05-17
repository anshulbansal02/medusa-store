import type { Metadata } from "next";

import { PolicyPage } from "@/components/content/policy-page";
import { policyPages } from "@/lib/config/policies";
import { absoluteUrl } from "@/lib/config/site";

const page = policyPages.returns;

export const metadata: Metadata = {
  title: "Returns | The Label",
  description: page.description,
  alternates: {
    canonical: absoluteUrl("/returns"),
  },
};

export default function ReturnsPage() {
  return <PolicyPage {...page} />;
}
