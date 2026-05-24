"use client";

import { Expand, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
  const [viewerApi, setViewerApi] = useState<CarouselApi>();
  const activeImage = images[activeIndex] ?? images[0];
  const hasThumbnails = images.length > 1;

  useEffect(() => {
    if (!viewerApi) {
      return;
    }

    const syncSelectedImage = () => {
      setActiveIndex(viewerApi.selectedScrollSnap());
    };

    syncSelectedImage();
    viewerApi.on("select", syncSelectedImage);

    return () => {
      viewerApi.off("select", syncSelectedImage);
    };
  }, [viewerApi]);

  useEffect(() => {
    if (!isViewerOpen || !viewerApi) {
      return;
    }

    viewerApi.scrollTo(activeIndex, true);
  }, [activeIndex, isViewerOpen, viewerApi]);

  if (!activeImage) {
    return null;
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
            className="h-[calc(100svh-1rem)] max-w-[calc(100vw-1rem)] rounded-none bg-transparent p-0 ring-0 sm:h-[calc(100svh-2rem)] sm:max-w-[calc(100vw-2rem)] sm:max-w-none"
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
                  className="absolute top-3 right-3 z-20 size-10 rounded-none bg-background/95 text-foreground shadow-sm hover:bg-background sm:top-4 sm:right-4"
                />
              }
            >
              <X className="size-5 stroke-icon" aria-hidden="true" />
            </DialogClose>

            <div className="flex h-full min-h-0 flex-col justify-center gap-3">
              <Carousel
                setApi={setViewerApi}
                opts={{
                  align: "center",
                  loop: hasThumbnails,
                  startIndex: activeIndex,
                }}
                className="min-h-0"
              >
                <CarouselContent className="ml-0">
                  {images.map((image, index) => (
                    <CarouselItem key={image} className="pl-0">
                      <div className="relative h-[calc(100svh-8rem)] max-h-[780px] min-h-[360px] w-full">
                        <Image
                          src={image}
                          alt={
                            index === activeIndex
                              ? `${productName} ${content.fullImageAltSuffix}`
                              : ""
                          }
                          fill
                          loading="lazy"
                          sizes="100vw"
                          className="object-contain"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {hasThumbnails ? (
                  <>
                    <CarouselPrevious
                      variant="ghost"
                      className="left-2 size-10 rounded-none bg-background/95 text-foreground shadow-sm hover:bg-background disabled:opacity-30 sm:left-4 sm:size-11"
                    />
                    <CarouselNext
                      variant="ghost"
                      className="right-2 size-10 rounded-none bg-background/95 text-foreground shadow-sm hover:bg-background disabled:opacity-30 sm:right-4 sm:size-11"
                    />
                  </>
                ) : null}
              </Carousel>

              {hasThumbnails ? (
                <div className="flex shrink-0 justify-center gap-2 overflow-x-auto px-4 pb-1">
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
                        "relative aspect-[4/5] h-14 w-11 shrink-0 overflow-hidden rounded-none border bg-muted p-0 transition hover:bg-muted sm:h-16 sm:w-13",
                        activeIndex === index
                          ? "border-background"
                          : "border-transparent opacity-65 hover:border-background/70 hover:opacity-100",
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
