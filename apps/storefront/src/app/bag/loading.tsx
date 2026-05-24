import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
      <section className="mx-auto max-w-[1200px]">
        <div className="border-border border-b pb-7">
          <Skeleton className="h-4 w-20 rounded-none" />
          <Skeleton className="mt-4 h-20 w-full max-w-sm rounded-none sm:h-28" />
        </div>
        <div className="grid gap-10 py-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="grid gap-6">
            {["first", "second", "third"].map((item) => (
              <div
                key={item}
                className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 border-border border-b pb-6 sm:grid-cols-[132px_minmax(0,1fr)]"
              >
                <Skeleton className="aspect-[4/5] rounded-none" />
                <div>
                  <Skeleton className="h-5 w-48 max-w-full rounded-none" />
                  <Skeleton className="mt-2 h-4 w-32 rounded-none" />
                  <Skeleton className="mt-4 h-4 w-24 rounded-none" />
                </div>
              </div>
            ))}
          </div>
          <aside className="border border-border p-5 sm:p-6">
            <Skeleton className="h-5 w-32 rounded-none" />
            <Skeleton className="mt-6 h-4 w-full rounded-none" />
            <Skeleton className="mt-3 h-4 w-full rounded-none" />
            <Skeleton className="mt-6 h-12 w-full rounded-none" />
          </aside>
        </div>
      </section>
    </main>
  );
}
