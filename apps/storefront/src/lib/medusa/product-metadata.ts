import { siteContent } from "@/content/site-content";
import type {
  MedusaMetadata,
  ProductDetailSection,
  ProductSizeChartColumn,
  ProductSizeChartRow,
} from "@/lib/medusa/product-types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readText(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

function slugifyDetailTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toSizeChart(metadata: MedusaMetadata | null | undefined) {
  if (!isRecord(metadata?.size_chart)) {
    return null;
  }

  const sizeChart = metadata.size_chart;
  const columnsValue = sizeChart.columns;
  const rowsValue = sizeChart.rows;

  if (!Array.isArray(columnsValue) || !Array.isArray(rowsValue)) {
    return null;
  }

  const columns = columnsValue
    .map((column) => {
      if (!isRecord(column)) {
        return null;
      }

      const key = readText(column.key);
      const label = readText(column.label);

      if (!key || !label) {
        return null;
      }

      return { key, label };
    })
    .filter((column): column is ProductSizeChartColumn => Boolean(column));

  if (columns.length === 0) {
    return null;
  }

  const rows = rowsValue
    .map((row) => {
      if (!isRecord(row) || !isRecord(row.values)) {
        return null;
      }

      const rowValues = row.values;
      const size = readText(row.size);

      if (!size) {
        return null;
      }

      const values = columns.reduce<Record<string, string>>(
        (result, column) => {
          result[column.key] = readText(rowValues[column.key]);

          return result;
        },
        {},
      );

      if (!Object.values(values).some(Boolean)) {
        return null;
      }

      return { size, values };
    })
    .filter((row): row is ProductSizeChartRow => Boolean(row));

  if (rows.length === 0) {
    return null;
  }

  return {
    unit: readText(sizeChart.unit),
    note: readText(sizeChart.note),
    columns,
    rows,
  };
}

export function toProductDetailSections(
  metadata: MedusaMetadata | null | undefined,
): ProductDetailSection[] {
  const details =
    isRecord(metadata?.product_details) || isRecord(metadata?.details)
      ? (metadata.product_details ?? metadata.details)
      : null;

  if (!isRecord(details)) {
    return [];
  }

  const customSections = Array.isArray(details.sections)
    ? details.sections
        .map((section) => {
          if (!isRecord(section)) {
            return null;
          }

          const title = readText(section.title);
          const text = readText(section.text);
          const key = readText(section.key) || slugifyDetailTitle(title);

          if (!key || !title || !text) {
            return null;
          }

          return { key, title, text };
        })
        .filter((section): section is ProductDetailSection => Boolean(section))
    : [];

  if (customSections.length > 0) {
    return customSections;
  }

  const labels = siteContent.product.detailSectionLabels;

  return [
    { key: "fabric", title: labels.fabric, text: readText(details.fabric) },
    { key: "fit", title: labels.fit, text: readText(details.fit) },
    { key: "care", title: labels.care, text: readText(details.care) },
    { key: "model", title: labels.model, text: readText(details.model) },
    {
      key: "measurements",
      title: labels.measurements,
      text: readText(details.measurements),
    },
  ].filter((section) => section.text);
}
