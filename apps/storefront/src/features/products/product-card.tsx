import Image from "next/image";
import Link from "next/link";

import type { StorefrontProduct } from "@/lib/medusa/products";

export function ProductCard({
  product,
  priority = false,
}: {
  product: StorefrontProduct;
  priority?: boolean;
}) {
  return (
    <article className="group">
      <Link
        href={product.href}
        prefetch={false}
        className="block"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={`${product.name} styled on a model`}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[0.95rem] font-medium leading-snug">
              {product.name}
            </h3>
            {product.note ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {product.note}
              </p>
            ) : null}
          </div>
          <p className="text-sm font-medium">{product.price}</p>
        </div>
      </Link>
    </article>
  );
}
