import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { siteContent } from "@/content/site-content";

export const metadata: Metadata = {
  title: siteContent.contact.metadata.title,
  description: siteContent.contact.metadata.description,
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[900px]">
          <div className="border-border border-b pb-7">
            <p className="text-muted-foreground text-sm">
              {siteContent.contact.eyebrow}
            </p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              {siteContent.contact.title}
            </h1>
          </div>

          <div className="grid gap-7 py-8 text-sm sm:grid-cols-2">
            {siteContent.contact.sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-medium">{section.title}</h2>
                <p className="mt-2 text-muted-foreground">{section.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
