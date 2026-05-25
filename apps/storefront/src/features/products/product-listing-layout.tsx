"use client";

import { SlidersHorizontal, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { siteContent } from "@/content/site-content";
import { cn } from "@/lib/utils";

type ProductListingLayoutProps = {
  activeFilterCount: number;
  desktopFilters: ReactNode;
  mobileFilters: ReactNode;
  children: ReactNode;
};

export function ProductListingLayout({
  activeFilterCount,
  desktopFilters,
  mobileFilters,
  children,
}: ProductListingLayoutProps) {
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const content = siteContent.productListing;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTrigger
          activeFilterCount={activeFilterCount}
          className="lg:hidden"
          expanded={mobileFiltersOpen}
          onClick={() => setMobileFiltersOpen((open) => !open)}
        />
        <FilterTrigger
          activeFilterCount={activeFilterCount}
          className="hidden lg:inline-flex"
          expanded={desktopFiltersOpen}
          onClick={() => setDesktopFiltersOpen((open) => !open)}
        />

        <p className="hidden items-center gap-2 text-muted-foreground text-xs lg:flex">
          <SlidersHorizontal
            className="size-4 stroke-icon"
            aria-hidden="true"
          />
          {content.filtersUpdateLabel}
        </p>
      </div>

      <div
        className={cn(
          "grid min-w-0 gap-0",
          desktopFiltersOpen
            ? "lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6"
            : "lg:grid-cols-[0_minmax(0,1fr)]",
        )}
      >
        <aside
          aria-hidden={!desktopFiltersOpen}
          className={cn(
            "hidden min-w-0 overflow-hidden transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none lg:sticky lg:top-28 lg:block lg:h-[calc(100svh-8rem)] lg:self-start",
            desktopFiltersOpen
              ? "pointer-events-auto translate-x-0 opacity-100"
              : "pointer-events-none -translate-x-3 opacity-0",
          )}
        >
          <FilterPanelFrame onClose={() => setDesktopFiltersOpen(false)}>
            {desktopFilters}
          </FilterPanelFrame>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>

      <Drawer
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
        direction="left"
      >
        <DrawerContent className="h-dvh w-[88vw] max-w-sm rounded-none border-border bg-background text-foreground lg:hidden">
          <DrawerTitle className="sr-only">
            {content.filterPanelTitle}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            {content.filterPanelDescription}
          </DrawerDescription>
          <FilterPanelFrame onClose={() => setMobileFiltersOpen(false)}>
            {mobileFilters}
          </FilterPanelFrame>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function FilterTrigger({
  activeFilterCount,
  className,
  expanded,
  onClick,
}: {
  activeFilterCount: number;
  className?: string;
  expanded: boolean;
  onClick: () => void;
}) {
  const content = siteContent.productListing;

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      aria-expanded={expanded}
      className={cn("h-11 w-fit rounded-none px-4", className)}
    >
      <SlidersHorizontal className="size-4 stroke-icon" aria-hidden="true" />
      {content.filterPanelTitle}
      {activeFilterCount > 0 ? (
        <span className="ml-1 grid min-w-5 place-items-center bg-primary px-1.5 text-primary-foreground text-xs">
          {activeFilterCount}
        </span>
      ) : null}
    </Button>
  );
}

function FilterPanelFrame({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const content = siteContent.productListing;

  return (
    <div className="flex h-full min-h-0 flex-col border-border border-r bg-background">
      <div className="flex items-start justify-between gap-4 border-border border-b px-5 py-5">
        <div>
          <h2 className="font-heading text-3xl leading-none">
            {content.filterPanelTitle}
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {content.filterPanelDescription}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label={content.closeFiltersLabel}
          className="size-9 rounded-none text-muted-foreground hover:text-foreground"
        >
          <X className="size-4 stroke-icon" aria-hidden="true" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
    </div>
  );
}
