"use client";

import { Ruler, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { siteContent } from "@/content/site-content";
import type { ProductSizeChart } from "@/lib/medusa/products";

type ProductSizeFinderProps = {
  sizeChart: ProductSizeChart | null;
  availableSizes: string[];
  onSelectSize: (size: string) => void;
};

type SizeRecommendation = {
  size: string;
  bust: number;
  difference: number;
};

const storedBustKey = "neonfold-fit-bust";

export function ProductSizeFinder({
  availableSizes,
  onSelectSize,
  sizeChart,
}: ProductSizeFinderProps) {
  const content = siteContent.sizeFinder;
  const [open, setOpen] = useState(false);
  const [bustValue, setBustValue] = useState("");
  const bust = Number(bustValue);
  const recommendation = useMemo(
    () => getSizeRecommendation(sizeChart, availableSizes, bust),
    [availableSizes, bust, sizeChart],
  );
  const canCompare = Number.isFinite(bust) && bust > 0;

  useEffect(() => {
    setBustValue(window.localStorage.getItem(storedBustKey) ?? "");
  }, []);

  if (!hasBustMeasurements(sizeChart, availableSizes)) {
    return null;
  }

  function handleUseSize() {
    if (!recommendation) {
      return;
    }

    window.localStorage.setItem(storedBustKey, bustValue);
    onSelectSize(recommendation.size);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className="h-auto rounded-none px-0 text-sm underline-offset-4 hover:bg-transparent hover:text-primary hover:underline"
          />
        }
      >
        <Ruler className="size-4 stroke-icon" aria-hidden="true" />
        {content.triggerLabel}
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="max-w-lg rounded-none border-border bg-background p-0 sm:max-w-lg"
      >
        <div className="flex items-start justify-between gap-5 border-border border-b px-5 py-4 sm:px-6">
          <div>
            <DialogTitle className="font-heading text-3xl leading-none">
              {content.title}
            </DialogTitle>
            <DialogDescription className="mt-2 text-muted-foreground text-sm leading-6">
              {content.description}
            </DialogDescription>
          </div>
          <DialogClose
            aria-label={content.closeLabel}
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 shrink-0 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground"
              />
            }
          >
            <X className="size-5 stroke-icon" aria-hidden="true" />
          </DialogClose>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div>
            <label htmlFor="size-finder-bust" className="text-sm font-medium">
              {content.measurementLabel}
            </label>
            <span className="mt-1 block text-muted-foreground text-xs leading-5">
              {content.measurementHelp}
            </span>
            <div className="mt-3 flex h-12 items-center border border-input bg-background px-3 transition focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40">
              <Ruler
                className="size-4 shrink-0 stroke-icon text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="size-finder-bust"
                type="number"
                min="24"
                max="60"
                step="0.5"
                value={bustValue}
                onChange={(event) => setBustValue(event.currentTarget.value)}
                placeholder={content.placeholder}
                className="h-full border-0 px-3 py-0 focus-visible:ring-0"
              />
              <span className="text-muted-foreground text-sm">
                {content.unitLabel}
              </span>
            </div>
          </div>

          <div className="mt-5 border border-border p-4">
            {canCompare && recommendation ? (
              <>
                <p className="font-medium text-primary text-xs uppercase tracking-label">
                  {content.bestMatchLabel}
                </p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-heading text-5xl leading-none">
                      {recommendation.size}
                    </p>
                    <p className="mt-2 text-muted-foreground text-sm leading-6">
                      {getRecommendationMessage(recommendation, bust)}
                    </p>
                  </div>
                  <p className="shrink-0 text-muted-foreground text-sm">
                    Bust {recommendation.bust} {content.unitLabel}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm leading-6">
                {content.emptyResult}
              </p>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              disabled={!recommendation}
              onClick={handleUseSize}
              className="h-11 rounded-none"
            >
              {content.useSizeAction}
            </Button>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-none"
                />
              }
            >
              {content.keepBrowsingAction}
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function hasBustMeasurements(
  sizeChart: ProductSizeChart | null,
  availableSizes: string[],
) {
  return Boolean(
    sizeChart?.rows.some(
      (row) => availableSizes.includes(row.size) && parseBust(row.values),
    ),
  );
}

function getSizeRecommendation(
  sizeChart: ProductSizeChart | null,
  availableSizes: string[],
  bust: number,
): SizeRecommendation | null {
  if (!sizeChart || !Number.isFinite(bust) || bust <= 0) {
    return null;
  }

  const recommendations = sizeChart.rows
    .filter((row) => availableSizes.includes(row.size))
    .map((row) => {
      const rowBust = parseBust(row.values);

      if (!rowBust) {
        return null;
      }

      return {
        size: row.size,
        bust: rowBust,
        difference: Math.abs(rowBust - bust),
      };
    })
    .filter((recommendation): recommendation is SizeRecommendation =>
      Boolean(recommendation),
    )
    .sort(
      (first, second) =>
        first.difference - second.difference || first.bust - second.bust,
    );

  return recommendations[0] ?? null;
}

function parseBust(values: Record<string, string>) {
  const bustEntry = Object.entries(values).find(([key]) =>
    key.toLowerCase().includes("bust"),
  );
  const bustValue = bustEntry?.[1].match(/\d+(?:\.\d+)?/)?.[0];

  return bustValue ? Number(bustValue) : null;
}

function getRecommendationMessage(
  recommendation: SizeRecommendation,
  bust: number,
) {
  if (recommendation.difference <= 0.5) {
    return "This is the closest match to the garment measurement you entered.";
  }

  if (recommendation.bust > bust) {
    return "This gives a little more room than your reference garment.";
  }

  return "This is slightly closer through the bust than your reference garment.";
}
