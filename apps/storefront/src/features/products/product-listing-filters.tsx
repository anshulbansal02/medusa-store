"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { siteContent } from "@/content/site-content";
import {
  buildProductListingHref,
  type ProductListingSearchParams,
} from "@/features/products/product-listing-utils";
import { cn } from "@/lib/utils";

type ProductListingOption = {
  label: string;
  value: string;
};

type ProductListingFiltersProps = {
  actionPath: string;
  clearHref: string;
  colors: string[];
  priceOptions: ProductListingOption[];
  searchParams?: ProductListingSearchParams;
  sizes: string[];
  sortOptions: ProductListingOption[];
};

const content = siteContent.productListing;
const allSelectValue = "__all";
const colorSwatchClasses = new Map(
  [
    ["black", "bg-swatch-black"],
    ["blush", "bg-swatch-blush"],
    ["champagne", "bg-swatch-champagne"],
    ["cocoa", "bg-swatch-cocoa"],
    ["emerald", "bg-swatch-emerald"],
    ["ivory", "bg-swatch-ivory"],
    ["midnight", "bg-swatch-midnight"],
    ["pearl", "bg-swatch-pearl"],
    ["sage", "bg-swatch-sage"],
    ["sand", "bg-swatch-sand"],
    ["wine", "bg-swatch-wine"],
  ].map(([name, value]) => [name, value]),
);

export function ProductListingFilters({
  actionPath,
  clearHref,
  colors,
  priceOptions,
  searchParams,
  sizes,
  sortOptions,
}: ProductListingFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(href: string) {
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  function updateFilter(
    updates: Partial<Record<keyof ProductListingSearchParams, string | null>>,
  ) {
    navigate(buildProductListingHref(actionPath, searchParams, updates));
  }

  return (
    <div
      className={cn("grid gap-7", isPending && "opacity-70")}
      aria-busy={isPending}
    >
      {sizes.length > 0 ? (
        <FilterSection title={content.filters.sizeLabel}>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <FilterCheckbox
                key={size}
                checked={searchParams?.size === size}
                label={size}
                onCheckedChange={(checked) =>
                  updateFilter({ size: checked ? size : null })
                }
                variant="tile"
              />
            ))}
          </div>
        </FilterSection>
      ) : null}

      {colors.length > 0 ? (
        <FilterSection title={content.filters.colorLabel}>
          <div className="grid grid-cols-2 gap-2">
            {colors.map((color) => (
              <FilterColor
                key={color}
                checked={searchParams?.color === color}
                label={color}
                onCheckedChange={(checked) =>
                  updateFilter({ color: checked ? color : null })
                }
              />
            ))}
          </div>
        </FilterSection>
      ) : null}

      <FilterSection title={content.filters.priceLabel}>
        <FilterSelect
          value={searchParams?.price ?? allSelectValue}
          onValueChange={(price) =>
            updateFilter({
              price: price === allSelectValue ? null : price,
            })
          }
          options={[
            {
              label: content.filters.allPricesLabel,
              value: allSelectValue,
            },
            ...priceOptions,
          ]}
        />
      </FilterSection>

      <FilterSection title={content.filters.sortLabel}>
        <FilterSelect
          value={searchParams?.sort ?? "newest"}
          onValueChange={(sort) => updateFilter({ sort })}
          options={sortOptions}
        />
      </FilterSection>

      <div className="border-border border-t pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(clearHref)}
          className="h-10 rounded-none px-0 hover:bg-transparent"
        >
          <X className="size-3.5 stroke-icon" aria-hidden="true" />
          {content.clearFiltersLabel}
        </Button>
      </div>
    </div>
  );
}

function FilterSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="grid gap-3">
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
    </section>
  );
}

function FilterSelect({
  onValueChange,
  options,
  value,
}: {
  onValueChange: (value: string) => void;
  options: ProductListingOption[];
  value: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onValueChange(nextValue);
        }
      }}
    >
      <SelectTrigger>
        <SelectValue>
          {(selectedValue) =>
            options.find((option) => option.value === selectedValue)?.label
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function FilterCheckbox({
  checked,
  label,
  onCheckedChange,
  variant,
}: {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
  variant: "row" | "tile";
}) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "size-auto w-full cursor-pointer border border-border text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground has-data-[checked]:border-foreground has-data-[checked]:bg-foreground has-data-[checked]:text-background",
        variant === "tile"
          ? "grid min-h-10 place-items-center px-3"
          : "flex min-h-10 items-center gap-3 px-3",
      )}
    >
      {variant === "row" ? (
        <span
          className={cn(
            "size-4 shrink-0 border border-current",
            checked && "bg-background",
          )}
          aria-hidden="true"
        />
      ) : null}
      <span>{label}</span>
    </Checkbox>
  );
}

function FilterColor({
  checked,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "flex size-auto min-h-10 w-full cursor-pointer items-center justify-start gap-2 border border-border px-3 text-left text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground has-data-[checked]:border-foreground has-data-[checked]:bg-muted has-data-[checked]:text-foreground",
      )}
    >
      <span
        className={cn(
          "size-4 shrink-0 border border-border",
          getColorSwatchClass(label),
        )}
        aria-hidden="true"
      />
      <span className="min-w-0 truncate">{label}</span>
    </Checkbox>
  );
}

function getColorSwatchClass(color: string) {
  return (
    colorSwatchClasses.get(color.trim().toLowerCase()) ?? "bg-swatch-default"
  );
}
