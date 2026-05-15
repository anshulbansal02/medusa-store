import {
  Heart,
  Ruler,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getHomeProducts, type HomeProduct } from "@/lib/medusa/products";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const heroImage =
  "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1800&q=82";

const edits = [
  {
    title: "Dinner plans",
    text: "Clean lines, soft shine, and enough structure for a long evening.",
    image:
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Wedding guest",
    text: "Dressy without feeling heavy, made for photographs and movement.",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "After-hours",
    text: "Sharper separates for launches, birthdays, and late reservations.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  },
];

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Secure prepaid checkout",
    text: "Razorpay payments planned for launch.",
  },
  {
    icon: Truck,
    title: "India shipping",
    text: "Simple dispatch updates from the store team.",
  },
  {
    icon: Ruler,
    title: "Size support",
    text: "Fit notes and a clear size chart on every product.",
  },
];

function ProductCard({ product }: { product: HomeProduct }) {
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
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
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

export default async function Home() {
  const products = await getHomeProducts();

  return (
    <main className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-30 border-border/70 border-b bg-background/92 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="font-heading text-2xl leading-none tracking-normal"
          >
            The Label
          </Link>

          <nav
            className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex"
            aria-label="Primary navigation"
          >
            <Link
              href="/shop"
              prefetch={false}
              className="transition hover:text-foreground"
            >
              New Arrivals
            </Link>
            <Link
              href="/shop/dresses"
              prefetch={false}
              className="transition hover:text-foreground"
            >
              Dresses
            </Link>
            <Link
              href="/shop/sets"
              prefetch={false}
              className="transition hover:text-foreground"
            >
              Sets
            </Link>
            <Link
              href="/shop/tops"
              prefetch={false}
              className="transition hover:text-foreground"
            >
              Tops
            </Link>
            <Link
              href="/shop/occasion-edit"
              prefetch={false}
              className="transition hover:text-foreground"
            >
              Occasion Edit
            </Link>
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href="/search"
              prefetch={false}
              aria-label="Search"
              className="inline-flex size-9 items-center justify-center text-muted-foreground transition hover:text-foreground"
            >
              <Search className="size-4 stroke-[1.6]" />
            </Link>
            <Link
              href="/account"
              prefetch={false}
              aria-label="Account"
              className="hidden size-9 items-center justify-center text-muted-foreground transition hover:text-foreground sm:inline-flex"
            >
              <UserRound className="size-4 stroke-[1.6]" />
            </Link>
            <Link
              href="/cart"
              prefetch={false}
              aria-label="Cart"
              className="inline-flex size-9 items-center justify-center text-muted-foreground transition hover:text-foreground"
            >
              <ShoppingBag className="size-4 stroke-[1.6]" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-[88svh] overflow-hidden pt-16">
        <Image
          src={heroImage}
          alt="Model in a structured evening dress photographed outdoors"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="relative mx-auto flex min-h-[calc(88svh-4rem)] max-w-[1440px] items-end px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="max-w-3xl pb-8 text-primary-foreground">
            <p className="mb-4 text-sm font-medium">
              New occasion pieces, ready for evenings out
            </p>
            <h1 className="font-heading text-[clamp(3.75rem,10vw,9.5rem)] leading-[0.86] tracking-normal">
              Shape, ease, and a little ceremony.
            </h1>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                prefetch={false}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 rounded-none bg-background px-6 text-foreground hover:bg-background/90",
                )}
              >
                Shop new arrivals
              </Link>
              <Link
                href="/size-guide"
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 rounded-none border-primary-foreground/70 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
                )}
              >
                Find your size
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 flex flex-col justify-between gap-5 border-border border-b pb-6 md:flex-row md:items-end">
            <div>
              <h2 className="font-heading text-5xl leading-none sm:text-6xl">
                New arrivals
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Dresses, co-ords, and statement tops selected for dinners,
                wedding functions, and dressed-up weekends.
              </p>
            </div>
            <Link
              href="/shop"
              prefetch={false}
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              View all products
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="border border-border px-5 py-8 sm:px-8">
              <h3 className="text-base font-medium">
                New arrivals are not connected yet.
              </h3>
              <p className="mt-2 max-w-xl text-muted-foreground text-sm">
                Start Medusa with a publishable key and published products to
                populate this section.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-secondary px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <h2 className="font-heading text-5xl leading-none sm:text-7xl">
              Occasion edit
            </h2>
            <p className="mt-5 max-w-md text-secondary-foreground/75">
              Shop by plan, not by trend. Each edit keeps the silhouette,
              fabric, and repeat wear in view.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {edits.map((edit) => (
              <Link
                href="/shop/occasion-edit"
                prefetch={false}
                key={edit.title}
                className="group block"
              >
                <article>
                  <div className="relative aspect-[3/4] overflow-hidden bg-background">
                    <Image
                      src={edit.image}
                      alt={`${edit.title} fashion edit`}
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 100vw"
                      className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <h3 className="mt-4 text-base font-medium">{edit.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {edit.text}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative aspect-[5/4] overflow-hidden bg-muted">
            <Image
              src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1400&q=82"
              alt="Editorial fashion styling with layered eveningwear"
              fill
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="lg:pl-10">
            <p className="text-sm font-medium text-muted-foreground">
              Size and fit first
            </p>
            <h2 className="mt-3 font-heading text-5xl leading-none sm:text-7xl">
              Dressy should still feel easy.
            </h2>
            <p className="mt-5 max-w-xl text-muted-foreground">
              Product pages will keep measurements, fabric, care, and fit notes
              close to the add-to-cart flow, so customers can decide without
              searching through policy text.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/size-guide"
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 rounded-none px-6",
                )}
              >
                Size guide
              </Link>
              <Link
                href="/shop/bestsellers"
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "h-11 rounded-none px-6",
                )}
              >
                Shop bestsellers
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-border border-y px-4 py-9 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-6 md:grid-cols-3">
          {trustItems.map((item) => (
            <div key={item.title} className="flex gap-4">
              <item.icon className="mt-0.5 size-5 shrink-0 stroke-[1.6] text-primary" />
              <div>
                <h2 className="text-sm font-medium">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 text-sm text-muted-foreground md:flex-row">
          <div>
            <Link href="/" className="font-heading text-3xl text-foreground">
              The Label
            </Link>
            <p className="mt-3 max-w-sm">
              Premium western occasion wear for India, built around newness,
              visual appeal, and a low-friction shopping flow.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h2 className="mb-3 text-foreground text-sm font-medium">Shop</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/shop" prefetch={false}>
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/shop/dresses" prefetch={false}>
                    Dresses
                  </Link>
                </li>
                <li>
                  <Link href="/shop/sets" prefetch={false}>
                    Sets
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-3 text-foreground text-sm font-medium">Help</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" prefetch={false}>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/size-guide" prefetch={false}>
                    Size Guide
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" prefetch={false}>
                    Shipping
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-3 text-foreground text-sm font-medium">
                Social
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/instagram"
                    prefetch={false}
                    className="inline-flex items-center gap-2"
                  >
                    <Heart className="size-3.5 stroke-[1.6]" />
                    Instagram
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
