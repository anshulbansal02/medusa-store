import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Size Guide | The Label",
  description: "Size notes for western occasion wear.",
};

const sizeRows = [
  ["XS", "32", "26", "34"],
  ["S", "34", "28", "36"],
  ["M", "36", "30", "38"],
  ["L", "38", "32", "40"],
  ["XL", "40", "34", "42"],
];

export default function SizeGuidePage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[1000px]">
          <div className="border-border border-b pb-7">
            <p className="text-muted-foreground text-sm">Fit</p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              Size guide.
            </h1>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              Measurements are in inches. Final product-specific measurements
              should come from the Medusa catalog when real inventory is added.
            </p>
          </div>

          <div className="overflow-x-auto py-8">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="py-3 pr-4 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Bust</th>
                  <th className="px-4 py-3 font-medium">Waist</th>
                  <th className="px-4 py-3 font-medium">Hip</th>
                </tr>
              </thead>
              <tbody>
                {sizeRows.map((row) => (
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
