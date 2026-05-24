"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { siteContent } from "@/content/site-content";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const content = siteContent.product.gallery;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const activeImage = images[activeIndex] ?? images[0];
  const hasThumbnails = images.length > 1;

  if (!activeImage) {
    return null;
  }

  function goToPreviousImage() {
    setActiveIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  }

  function goToNextImage() {
    setActiveIndex((index) => (index === images.length - 1 ? 0 : index + 1));
  }

  return (
    <div
      className={cn(
        "grid min-w-0 max-w-full gap-3 overflow-hidden",
        hasThumbnails ? "lg:grid-cols-[88px_1fr]" : "lg:grid-cols-1",
      )}
    >
      {hasThumbnails ? (
        <div className="order-2 flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-1 lg:order-1 lg:block lg:space-y-3 lg:overflow-visible lg:pb-0">
          {images.map((image, index) => (
            <Button
              key={image}
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`${content.thumbnailLabel} ${index + 1}`}
              aria-pressed={activeIndex === index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-[4/5] h-auto w-20 shrink-0 cursor-pointer overflow-hidden rounded-none border bg-muted p-0 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:w-full",
                activeIndex === index
                  ? "border-foreground"
                  : "border-transparent hover:border-border",
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                loading={index === 0 ? "eager" : "lazy"}
                sizes="88px"
                className="object-cover"
              />
            </Button>
          ))}
        </div>
      ) : null}

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "group relative order-1 aspect-[4/5] h-auto w-full cursor-pointer overflow-hidden rounded-none bg-muted p-0 text-left hover:bg-muted",
                hasThumbnails
                  ? "lg:order-2 lg:aspect-[5/6]"
                  : "lg:aspect-[4/5]",
              )}
              aria-label={`${content.openViewerLabel}: ${productName}`}
            />
          }
        >
          <Image
            src={activeImage}
            alt={`${productName} ${content.imageAltSuffix} ${activeIndex + 1}`}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1024px) 52vw, 100vw"
            className="object-cover transition duration-300 ease-out group-hover:scale-[1.015]"
          />
          <span className="absolute right-3 bottom-3 grid size-10 place-items-center bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition group-hover:bg-background">
            <Expand className="size-4 stroke-icon" aria-hidden="true" />
          </span>
        </DialogTrigger>

        {isViewerOpen ? (
          <DialogContent
            showCloseButton={false}
            className="h-svh max-w-none rounded-none bg-background p-0 ring-0 sm:max-w-none"
          >
            <DialogTitle className="sr-only">
              {productName} {content.dialogTitleSuffix}
            </DialogTitle>
            <DialogClose
              aria-label={content.closeViewerLabel}
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-20 size-11 rounded-none border border-border bg-background/95 text-foreground shadow-sm hover:bg-muted"
                />
              }
            >
              <X className="size-5 stroke-icon" aria-hidden="true" />
            </DialogClose>

            <div className="flex h-full min-h-0 flex-col">
              <div className="flex h-14 shrink-0 items-center border-border border-b px-4 pr-20">
                <p className="truncate text-sm font-medium">{productName}</p>
              </div>

              <div className="relative flex min-h-0 flex-1 items-center justify-center bg-muted/35 px-4 py-5 sm:px-16 sm:py-8">
                {hasThumbnails ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Previous image"
                      onClick={goToPreviousImage}
                      className="absolute left-3 z-10 size-10 rounded-none border border-border bg-background/95 shadow-sm hover:bg-muted sm:left-5 sm:size-11"
                    >
                      <ChevronLeft
                        className="size-5 stroke-icon"
                        aria-hidden="true"
                      />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Next image"
                      onClick={goToNextImage}
                      className="absolute right-3 z-10 size-10 rounded-none border border-border bg-background/95 shadow-sm hover:bg-muted sm:right-5 sm:size-11"
                    >
                      <ChevronRight
                        className="size-5 stroke-icon"
                        aria-hidden="true"
                      />
                    </Button>
                  </>
                ) : null}

                <div className="relative h-full max-h-[calc(100svh-9.5rem)] w-full max-w-5xl">
                  <Image
                    key={activeImage}
                    src={activeImage}
                    alt={`${productName} ${content.fullImageAltSuffix}`}
                    fill
                    loading="lazy"
                    sizes="100vw"
                    className="object-contain"
                  />
                </div>
              </div>

              {hasThumbnails ? (
                <div className="flex shrink-0 gap-2 overflow-x-auto border-border border-t bg-background px-4 py-3 sm:justify-center">
                  {images.map((image, index) => (
                    <Button
                      key={image}
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`${content.thumbnailLabel} ${index + 1}`}
                      aria-pressed={activeIndex === index}
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "relative aspect-[4/5] h-16 w-13 shrink-0 overflow-hidden rounded-none border bg-muted p-0 transition hover:bg-muted sm:h-20 sm:w-16",
                        activeIndex === index
                          ? "border-foreground"
                          : "border-transparent hover:border-border",
                      )}
                    >
                      <Image
                        src={image}
                        alt=""
                        fill
                        loading="lazy"
                        sizes="64px"
                        className="object-cover"
                      />
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
