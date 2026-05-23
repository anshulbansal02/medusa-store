import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { siteContent } from "@/content/site-content";

export const metadata: Metadata = {
  title: siteContent.sizeGuide.metadata.title,
  description: siteContent.sizeGuide.metadata.description,
};

export default function SizeGuidePage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[1000px]">
          <div className="border-border border-b pb-7">
            <p className="text-muted-foreground text-sm">
              {siteContent.sizeGuide.eyebrow}
            </p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              {siteContent.sizeGuide.title}
            </h1>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              {siteContent.sizeGuide.description}
            </p>
          </div>

          <div className="overflow-x-auto py-8">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-border border-b">
                  {siteContent.sizeGuide.columns.map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 font-medium first:pl-0"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {siteContent.sizeGuide.rows.map((row) => (
                  <tr key={row[0]} className="border-border border-b">
                    {row.map((cell) => (
                      <td key={cell} className="px-4 py-4 first:pl-0">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
