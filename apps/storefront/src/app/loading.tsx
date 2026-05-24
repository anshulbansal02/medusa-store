import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <Skeleton className="h-4 w-28 rounded-none" />
          <Skeleton className="mt-5 h-20 w-full max-w-[520px] rounded-none sm:h-28" />
          <Skeleton className="mt-6 h-5 w-full max-w-md rounded-none" />
          <Skeleton className="mt-2 h-5 w-4/5 max-w-sm rounded-none" />
        </div>
        <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
          <Skeleton className="aspect-[4/5] rounded-none" />
          <Skeleton className="hidden aspect-[4/5] rounded-none sm:block" />
        </div>
      </section>
    </main>
  );
}
