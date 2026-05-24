import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 pt-24 pb-16 sm:px-6 sm:pt-28 lg:px-8">
      <section className="mx-auto grid max-w-[1440px] min-w-0 gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] xl:gap-14">
        <div className="grid min-w-0 gap-3 lg:grid-cols-[88px_minmax(0,1fr)]">
          <div className="order-2 flex gap-2 overflow-hidden lg:order-1 lg:grid">
            {["a", "b", "c"].map((item) => (
              <Skeleton
                key={item}
                className="aspect-[4/5] w-20 shrink-0 rounded-none lg:w-full"
              />
            ))}
          </div>
          <Skeleton className="order-1 aspect-[4/5] rounded-none lg:order-2 lg:aspect-[5/6]" />
        </div>
        <div className="min-w-0">
          <Skeleton className="h-4 w-40 rounded-none" />
          <div className="mt-6 border-border border-b pb-6">
            <Skeleton className="h-4 w-24 rounded-none" />
            <Skeleton className="mt-4 h-16 w-full max-w-lg rounded-none sm:h-20" />
            <Skeleton className="mt-5 h-4 w-full max-w-xl rounded-none" />
            <Skeleton className="mt-2 h-4 w-4/5 max-w-md rounded-none" />
          </div>
          <div className="grid gap-4 py-6">
            <Skeleton className="h-12 w-full rounded-none" />
            <Skeleton className="h-12 w-full rounded-none" />
            <Skeleton className="h-12 w-full rounded-none" />
          </div>
          <Skeleton className="h-16 w-full rounded-none" />
        </div>
      </section>
    </main>
  );
}
