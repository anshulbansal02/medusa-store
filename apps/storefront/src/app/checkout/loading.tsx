import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
      <section className="mx-auto max-w-[1200px]">
        <div className="border-border border-b pb-7">
          <Skeleton className="h-4 w-24 rounded-none" />
          <Skeleton className="mt-4 h-20 w-full max-w-md rounded-none sm:h-28" />
        </div>
        <div className="grid gap-10 py-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="grid gap-10">
            {["address", "shipping"].map((section) => (
              <div key={section}>
                <Skeleton className="h-6 w-44 rounded-none" />
                <Skeleton className="mt-2 h-4 w-full max-w-lg rounded-none" />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {["one", "two", "three", "four"].map((row) => (
                    <Skeleton
                      key={`${section}-${row}`}
                      className="h-12 rounded-none"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <aside className="border border-border p-5 sm:p-6">
            <Skeleton className="h-5 w-32 rounded-none" />
            <Skeleton className="mt-6 h-16 w-full rounded-none" />
            <Skeleton className="mt-6 h-12 w-full rounded-none" />
          </aside>
        </div>
      </section>
    </main>
  );
}
