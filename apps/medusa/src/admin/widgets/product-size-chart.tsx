import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type {
  AdminProduct,
  DetailWidgetProps,
} from "@medusajs/framework/types";
import {
  Button,
  Drawer,
  Heading,
  Input,
  Label,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui";
import { useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import * as z from "zod";

import { Container } from "../components/container";
import { Header } from "../components/header";

type SizeChartColumn = {
  key: string;
  label: string;
};

type SizeChartRow = {
  size: string;
  values: Record<string, string>;
};

type SizeChart = {
  unit: string;
  note: string;
  columns: SizeChartColumn[];
  rows: SizeChartRow[];
};

const fallbackColumns: SizeChartColumn[] = [
  { key: "bust", label: "Bust" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
];

const fallbackSizeChart: SizeChart = {
  unit: "in",
  note: "Garment measurements. Compare with a similar piece that fits you well.",
  columns: fallbackColumns,
  rows: ["XS", "S", "M", "L", "XL"].map((size) => ({
    size,
    values: {
      bust: "",
      waist: "",
      hip: "",
    },
  })),
};

const columnSchema = z.object({
  key: z.string().trim().min(1),
  label: z.string().trim().min(1),
});

const rowSchema = z.object({
  size: z.string().trim().min(1),
  values: z.record(z.string(), z.string()),
});

const sizeChartSchema = z.object({
  unit: z.string().trim(),
  note: z.string().trim(),
  columns: z.array(columnSchema).min(1),
  rows: z.array(rowSchema).min(1),
});

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

function toColumnKey(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "measurement"
  );
}

function normalizeChart(chart: SizeChart): SizeChart {
  const columns = chart.columns
    .map((column) => ({
      sourceKey: column.key,
      key: toColumnKey(column.key || column.label),
      label: column.label.trim(),
    }))
    .filter((column) => column.key && column.label);

  const usedKeys = new Set<string>();
  const uniqueColumns = columns.map((column) => {
    let key = column.key;
    let index = 2;

    while (usedKeys.has(key)) {
      key = `${column.key}_${index}`;
      index += 1;
    }

    usedKeys.add(key);

    return {
      ...column,
      key,
    };
  });

  const rows = chart.rows
    .map((row) => ({
      size: row.size.trim(),
      values: uniqueColumns.reduce<Record<string, string>>((result, column) => {
        result[column.key] = readText(
          row.values[column.sourceKey] ?? row.values[column.key],
        );

        return result;
      }, {}),
    }))
    .filter((row) => row.size);

  return {
    unit: chart.unit.trim(),
    note: chart.note.trim(),
    columns: uniqueColumns.map(({ sourceKey: _sourceKey, ...column }) => column),
    rows,
  };
}

function readSizeChart(metadata: unknown): SizeChart | null {
  if (!isRecord(metadata) || !isRecord(metadata.size_chart)) {
    return null;
  }

  const sizeChart = metadata.size_chart;
  const columns = Array.isArray(sizeChart.columns)
    ? sizeChart.columns
        .map((column) => {
          if (!isRecord(column)) {
            return null;
          }

          const key = readText(column.key);
          const label = readText(column.label);

          return key && label ? { key, label } : null;
        })
        .filter((column): column is SizeChartColumn => Boolean(column))
    : [];

  const rows = Array.isArray(sizeChart.rows)
    ? sizeChart.rows
        .map((row) => {
          if (!isRecord(row) || !isRecord(row.values)) {
            return null;
          }

          const size = readText(row.size);
          const values = row.values;

          if (!size) {
            return null;
          }

          return {
            size,
            values: columns.reduce<Record<string, string>>((result, column) => {
              result[column.key] = readText(values[column.key]);

              return result;
            }, {}),
          };
        })
        .filter((row): row is SizeChartRow => Boolean(row))
    : [];

  const parsed = sizeChartSchema.safeParse({
    unit: readText(sizeChart.unit),
    note: readText(sizeChart.note),
    columns,
    rows,
  });

  return parsed.success ? parsed.data : null;
}

function getProductSizeValues(product: AdminProduct) {
  const rawOptions = (product as AdminProduct & { options?: unknown }).options;

  if (!Array.isArray(rawOptions)) {
    return [];
  }

  const sizeOption = rawOptions.find((option) => {
    return isRecord(option) && readText(option.title).toLowerCase() === "size";
  });

  if (!isRecord(sizeOption) || !Array.isArray(sizeOption.values)) {
    return [];
  }

  return sizeOption.values
    .map((value) => {
      if (isRecord(value)) {
        return readText(value.value);
      }

      return readText(value);
    })
    .filter(Boolean);
}

function makeBlankValues(columns: SizeChartColumn[]) {
  return columns.reduce<Record<string, string>>((result, column) => {
    result[column.key] = "";

    return result;
  }, {});
}

function makeInitialChart(product: AdminProduct): SizeChart {
  const savedChart = readSizeChart(product.metadata);

  if (savedChart) {
    return savedChart;
  }

  const sizeValues = getProductSizeValues(product);

  if (sizeValues.length === 0) {
    return fallbackSizeChart;
  }

  return {
    ...fallbackSizeChart,
    columns: fallbackColumns.map((column) => ({ ...column })),
    rows: sizeValues.map((size) => ({
      size,
      values: makeBlankValues(fallbackColumns),
    })),
  };
}

function copyChart(chart: SizeChart): SizeChart {
  return {
    unit: chart.unit,
    note: chart.note,
    columns: chart.columns.map((column) => ({ ...column })),
    rows: chart.rows.map((row) => ({
      size: row.size,
      values: { ...row.values },
    })),
  };
}

async function updateProductSizeChart(productId: string, chart: SizeChart) {
  const response = await fetch(`/admin/products/${productId}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      metadata: {
        size_chart: chart,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<{ product: AdminProduct }>;
}

type SizeChartEditorProps = {
  chart: SizeChart;
  product: AdminProduct;
  onSaved: (chart: SizeChart) => void;
};

const SizeChartEditor = ({ chart, product, onSaved }: SizeChartEditorProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => copyChart(chart));
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const resetForm = () => {
    setDraft(copyChart(chart));
  };

  const updateColumnLabel = (index: number, value: string) => {
    setDraft((current) => ({
      ...current,
      columns: current.columns.map((column, columnIndex) =>
        columnIndex === index ? { ...column, label: value } : column,
      ),
    }));
  };

  const addColumn = () => {
    setDraft((current) => {
      let index = current.columns.length + 1;
      let key = `measurement_${index}`;

      while (current.columns.some((column) => column.key === key)) {
        index += 1;
        key = `measurement_${index}`;
      }

      return {
        ...current,
        columns: [...current.columns, { key, label: "Measurement" }],
        rows: current.rows.map((row) => ({
          ...row,
          values: {
            ...row.values,
            [key]: "",
          },
        })),
      };
    });
  };

  const removeColumn = (columnKey: string) => {
    setDraft((current) => {
      if (current.columns.length <= 1) {
        toast.error("A size chart needs at least one measurement column");
        return current;
      }

      return {
        ...current,
        columns: current.columns.filter((column) => column.key !== columnKey),
        rows: current.rows.map((row) => {
          const values = { ...row.values };

          delete values[columnKey];

          return {
            ...row,
            values,
          };
        }),
      };
    });
  };

  const addRow = () => {
    setDraft((current) => ({
      ...current,
      rows: [
        ...current.rows,
        {
          size: "",
          values: makeBlankValues(current.columns),
        },
      ],
    }));
  };

  const removeRow = (index: number) => {
    setDraft((current) => {
      if (current.rows.length <= 1) {
        toast.error("A size chart needs at least one size row");
        return current;
      }

      return {
        ...current,
        rows: current.rows.filter((_, rowIndex) => rowIndex !== index),
      };
    });
  };

  const updateRowSize = (index: number, value: string) => {
    setDraft((current) => ({
      ...current,
      rows: current.rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, size: value } : row,
      ),
    }));
  };

  const updateCell = (rowIndex: number, columnKey: string, value: string) => {
    setDraft((current) => ({
      ...current,
      rows: current.rows.map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              values: {
                ...row.values,
                [columnKey]: value,
              },
            }
          : row,
      ),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedChart = normalizeChart(draft);
    const parsedChart = sizeChartSchema.safeParse(normalizedChart);

    if (!parsedChart.success) {
      toast.error("Size chart is incomplete", {
        description: "Add at least one measurement column and one size row.",
      });
      return;
    }

    setIsSaving(true);

    try {
      await updateProductSizeChart(product.id, parsedChart.data);
      await queryClient.invalidateQueries({
        queryKey: [["product", product.id]],
      });
      onSaved(parsedChart.data);
      setDraft(copyChart(parsedChart.data));
      setOpen(false);
      toast.success("Size chart saved");
    } catch (error) {
      toast.error("Could not save size chart", {
        description:
          error instanceof Error ? error.message : "The update request failed.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(open) => {
        setOpen(open);

        if (open) {
          resetForm();
        }
      }}
    >
      <Drawer.Trigger asChild>
        <Button size="small" variant="secondary">
          Edit
        </Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <form
          className="flex flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <Drawer.Header>
            <Drawer.Title asChild>
              <Heading>Edit size chart</Heading>
            </Drawer.Title>
            <Drawer.Description>
              Manage the measurements shoppers see for this product.
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col space-y-2">
                <Label size="small" weight="plus">
                  Unit
                </Label>
                <Input
                  value={draft.unit}
                  placeholder="in"
                  onChange={(event) => {
                    setDraft((current) => ({
                      ...current,
                      unit: event.target.value,
                    }));
                  }}
                />
              </div>
              <div className="flex flex-col space-y-2 md:col-span-2">
                <Label size="small" weight="plus">
                  Note
                </Label>
                <Textarea
                  value={draft.note}
                  rows={3}
                  onChange={(event) => {
                    setDraft((current) => ({
                      ...current,
                      note: event.target.value,
                    }));
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-y-3">
              <div className="flex items-center justify-between gap-x-3">
                <Heading level="h3">Measurement columns</Heading>
                <Button
                  size="small"
                  type="button"
                  variant="secondary"
                  onClick={addColumn}
                >
                  Add column
                </Button>
              </div>
              <div className="flex flex-col gap-y-3">
                {draft.columns.map((column, index) => (
                  <div
                    className="grid grid-cols-[1fr_auto] items-end gap-3"
                    key={`${column.key}-${index}`}
                  >
                    <div className="flex flex-col space-y-2">
                      <Label size="small" weight="plus">
                        Measurement
                      </Label>
                      <Input
                        value={column.label}
                        onChange={(event) => {
                          updateColumnLabel(index, event.target.value);
                        }}
                      />
                    </div>
                    <Button
                      size="small"
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        removeColumn(column.key);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-y-3">
              <div className="flex items-center justify-between gap-x-3">
                <Heading level="h3">Size rows</Heading>
                <Button
                  size="small"
                  type="button"
                  variant="secondary"
                  onClick={addRow}
                >
                  Add row
                </Button>
              </div>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Size</Table.HeaderCell>
                      {draft.columns.map((column) => (
                        <Table.HeaderCell key={column.key}>
                          {column.label || column.key}
                        </Table.HeaderCell>
                      ))}
                      <Table.HeaderCell />
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {draft.rows.map((row, rowIndex) => (
                      <Table.Row key={`${row.size}-${rowIndex}`}>
                        <Table.Cell>
                          <Input
                            value={row.size}
                            onChange={(event) => {
                              updateRowSize(rowIndex, event.target.value);
                            }}
                          />
                        </Table.Cell>
                        {draft.columns.map((column) => (
                          <Table.Cell key={column.key}>
                            <Input
                              value={row.values[column.key] ?? ""}
                              onChange={(event) => {
                                updateCell(
                                  rowIndex,
                                  column.key,
                                  event.target.value,
                                );
                              }}
                            />
                          </Table.Cell>
                        ))}
                        <Table.Cell>
                          <Button
                            size="small"
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              removeRow(rowIndex);
                            }}
                          >
                            Remove
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </div>
            </Drawer.Body>
            <Drawer.Footer>
              <div className="flex items-center justify-end gap-x-2">
                <Drawer.Close asChild>
                  <Button size="small" type="button" variant="secondary">
                    Cancel
                  </Button>
                </Drawer.Close>
                <Button size="small" type="submit" isLoading={isSaving}>
                  Save
                </Button>
              </div>
            </Drawer.Footer>
          </form>
      </Drawer.Content>
    </Drawer>
  );
};

const SizeChartPreview = ({ chart }: { chart: SizeChart }) => {
  return (
    <div className="px-6 py-4">
      {chart.note ? (
        <Text className="mb-4 text-ui-fg-subtle" size="small">
          {chart.note}
        </Text>
      ) : null}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Size</Table.HeaderCell>
              {chart.columns.map((column) => (
                <Table.HeaderCell key={column.key}>
                  {column.label}
                  {chart.unit ? (
                    <span className="text-ui-fg-muted"> ({chart.unit})</span>
                  ) : null}
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {chart.rows.map((row) => (
              <Table.Row key={row.size}>
                <Table.Cell>{row.size}</Table.Cell>
                {chart.columns.map((column) => (
                  <Table.Cell key={column.key}>
                    {row.values[column.key] || "-"}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

const ProductSizeChartWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const [chart, setChart] = useState(() => makeInitialChart(product));

  return (
    <Container>
      <Header
        title="Size chart"
        subtitle="Product-specific measurements stored in product metadata."
        actions={
          <SizeChartEditor chart={chart} product={product} onSaved={setChart} />
        }
      />
      <SizeChartPreview chart={chart} />
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductSizeChartWidget;
