"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Expand, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const activeImage = images[activeIndex] ?? images[0];

  if (!activeImage) {
    return null;
  }

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-[88px_1fr]">
        {images.length > 1 ? (
          <div className="-mx-4 order-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 lg:order-1 lg:block lg:space-y-3 lg:overflow-visible lg:pb-0">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                aria-label={`View ${productName} image ${index + 1}`}
                aria-pressed={activeIndex === index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative aspect-[4/5] w-20 shrink-0 overflow-hidden border bg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:w-full",
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
                  sizes="88px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setViewerOpen(true)}
          className="group relative order-1 aspect-[4/5] overflow-hidden bg-muted text-left lg:order-2 lg:aspect-[5/6]"
          aria-label={`Open ${productName} image viewer`}
        >
          <Image
            src={activeImage}
            alt={`${productName} view ${activeIndex + 1}`}
            fill
            loading="eager"
            sizes="(min-width: 1024px) 52vw, 100vw"
            className="object-cover transition duration-300 ease-out group-hover:scale-[1.015]"
          />
          <span className="absolute right-3 bottom-3 grid size-10 place-items-center bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition group-hover:bg-background">
            <Expand className="size-4 stroke-[1.6]" aria-hidden="true" />
          </span>
        </button>
      </div>

      <Dialog.Root open={viewerOpen} onOpenChange={setViewerOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/85 transition duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <Dialog.Viewport className="fixed inset-0 z-50 flex min-h-svh items-center justify-center p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)]">
            <Dialog.Popup className="relative flex h-full w-full max-w-5xl flex-col justify-center outline-none">
              <Dialog.Title className="sr-only">
                {productName} images
              </Dialog.Title>
              <Dialog.Close
                aria-label="Close image viewer"
                className="absolute top-2 right-2 z-10 grid size-11 place-items-center bg-background/92 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-background"
              >
                <X className="size-5 stroke-[1.6]" aria-hidden="true" />
              </Dialog.Close>

              <div className="flex snap-x snap-mandatory overflow-x-auto">
                {images.map((image, index) => (
                  <div
                    key={image}
                    className="flex h-[82svh] w-full shrink-0 snap-center items-center justify-center"
                  >
                    <div className="relative h-full w-full">
                      <Image
                        src={image}
                        alt={index === 0 ? `${productName} full image` : ""}
                        fill
                        loading="lazy"
                        sizes="100vw"
                        className="object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
