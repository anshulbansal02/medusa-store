import Link from "next/link";

import { siteContent } from "@/content/site-content";
import type { ProductSizeChart as ProductSizeChartData } from "@/lib/medusa/products";

type ProductSizeChartProps = {
  sizeChart: ProductSizeChartData | null;
};

export function ProductSizeChart({ sizeChart }: ProductSizeChartProps) {
  const content = siteContent.product.sizeChart;

  if (!sizeChart) {
    return null;
  }

  return (
    <section
      id="size-chart"
      aria-labelledby="size-chart-title"
      className="mt-5 border-border border-t pt-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="size-chart-title" className="text-sm font-medium">
            {content.title}
          </h2>
          {sizeChart.note ? (
            <p className="mt-1 text-muted-foreground text-sm">
              {sizeChart.note}
            </p>
          ) : null}
        </div>
        <Link
          href="/size-guide"
          prefetch={false}
          className="shrink-0 text-sm underline-offset-4 hover:underline"
        >
          {content.fullGuideAction}
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[360px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className="py-2 pr-3 font-medium">
                {content.sizeColumnLabel}
              </th>
              {sizeChart.columns.map((column) => (
                <th key={column.key} className="px-3 py-2 font-medium">
                  {column.label}
                  {sizeChart.unit ? (
                    <span className="text-muted-foreground">
                      {" "}
                      ({sizeChart.unit})
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizeChart.rows.map((row) => (
              <tr
                key={row.size}
                className="border-border border-b last:border-b-0"
              >
                <td className="py-3 pr-3 font-medium">{row.size}</td>
                {sizeChart.columns.map((column) => (
                  <td key={column.key} className="px-3 py-3">
                    {row.values[column.key] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
