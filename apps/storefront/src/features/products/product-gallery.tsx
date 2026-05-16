"use client";

import { Expand, X } from "lucide-react";
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
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];
  const hasThumbnails = images.length > 1;

  if (!activeImage) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid gap-3",
        hasThumbnails ? "lg:grid-cols-[88px_1fr]" : "lg:grid-cols-1",
      )}
    >
      {hasThumbnails ? (
        <div className="-mx-4 order-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 lg:order-1 lg:block lg:space-y-3 lg:overflow-visible lg:pb-0">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`View ${productName} image ${index + 1}`}
              aria-pressed={activeIndex === index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-[4/5] w-20 shrink-0 cursor-pointer overflow-hidden border bg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:w-full",
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

      <Dialog>
        <DialogTrigger
          render={
            <button
              type="button"
              className={cn(
                "group relative order-1 aspect-[4/5] cursor-pointer overflow-hidden bg-muted text-left",
                hasThumbnails
                  ? "lg:order-2 lg:aspect-[5/6]"
                  : "lg:aspect-[4/5]",
              )}
              aria-label={`Open ${productName} image viewer`}
            />
          }
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
        </DialogTrigger>

        <DialogContent
          showCloseButton={false}
          className="h-[calc(100svh-1.5rem)] max-w-5xl rounded-none bg-transparent p-0 ring-0 sm:max-w-5xl"
        >
          <DialogTitle className="sr-only">{productName} images</DialogTitle>
          <DialogClose
            aria-label="Close image viewer"
            render={
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 size-11 rounded-none bg-background/92 text-foreground shadow-sm hover:bg-background"
              />
            }
          >
            <X className="size-5 stroke-[1.6]" aria-hidden="true" />
          </DialogClose>

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
        </DialogContent>
      </Dialog>
    </div>
  );
}
