import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { getProductByHandle } from "@/lib/medusa/products";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return {
      title: "Product not found | The Label",
    };
  }

  return {
    title: `${product.name} | The Label`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const productNameWords: Array<{ key: string; word: string }> = [];
  let productNameCursor = 0;

  for (const word of product.name.split(" ")) {
    const wordStart = product.name.indexOf(word, productNameCursor);
    productNameWords.push({ key: `${wordStart}-${word}`, word });
    productNameCursor = wordStart + word.length + 1;
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-24 pb-14 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.08fr_0.92fr] xl:gap-14">
          <div className="grid gap-4 sm:grid-cols-2">
            {product.images.map((image, index) => (
              <div
                key={image}
                className={cn(
                  "relative overflow-hidden bg-muted",
                  index === 0 ? "aspect-[4/5] sm:col-span-2" : "aspect-[4/5]",
                )}
              >
                <Image
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes={
                    index === 0
                      ? "(min-width: 1024px) 56vw, 100vw"
                      : "(min-width: 1024px) 28vw, 50vw"
                  }
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex items-center gap-2 text-muted-foreground text-sm"
            >
              <Link
                href="/shop"
                prefetch={false}
                className="hover:text-foreground"
              >
                Shop
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-foreground">{product.name}</span>
            </nav>

            <div className="border-border border-b pb-6">
              <p className="text-muted-foreground text-sm">New arrival</p>
              <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-6">
                <h1 className="font-heading text-5xl leading-[0.95] sm:text-6xl">
                  {productNameWords.map((part, index) => (
                    <span key={part.key} className="whitespace-nowrap">
                      {part.word}
                      {index < productNameWords.length - 1 ? " " : ""}
                    </span>
                  ))}
                </h1>
                <p className="shrink-0 pt-1 font-medium">{product.price}</p>
              </div>
              {product.description ? (
                <p className="mt-5 max-w-xl text-muted-foreground">
                  {product.description}
                </p>
              ) : null}
            </div>

            <form className="py-6">
              {product.color ? (
                <div>
                  <p className="text-sm font-medium">Color</p>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {product.color}
                  </p>
                </div>
              ) : null}

              <fieldset className="mt-6" aria-describedby="size-help">
                <legend className="sr-only">Size</legend>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium">Size</p>
                  <Link
                    href="/size-guide"
                    prefetch={false}
                    className="text-sm underline-offset-4 hover:underline"
                  >
                    Size guide
                  </Link>
                </div>
                <p id="size-help" className="sr-only">
                  Choose one available size for {product.name}.
                </p>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {product.variants.map((variant, index) => (
                    <div key={variant.id}>
                      <input
                        id={variant.id}
                        type="radio"
                        name="variant_id"
                        value={variant.id}
                        defaultChecked={index === 0}
                        aria-label={`Size ${variant.size}`}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor={variant.id}
                        className="flex h-11 cursor-pointer items-center justify-center border border-border text-sm transition peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background"
                      >
                        {variant.size}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>

              <button
                type="button"
                disabled
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-6 h-12 w-full rounded-none",
                )}
              >
                Add to bag
              </button>
            </form>

            <div className="grid gap-4 border-border border-t pt-6 text-sm">
              <div>
                <h2 className="font-medium">Fit and fabric</h2>
                <p className="mt-1 text-muted-foreground">
                  Use the size guide before checkout. Measurements and fabric
                  notes will become more detailed as real catalog content is
                  added in Medusa.
                </p>
              </div>
              <div>
                <h2 className="font-medium">Delivery</h2>
                <p className="mt-1 text-muted-foreground">
                  India shipping with prepaid checkout planned for launch.
                </p>
              </div>
              <div>
                <h2 className="font-medium">Returns</h2>
                <p className="mt-1 text-muted-foreground">
                  Return policy will be finalized before production checkout is
                  enabled.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
