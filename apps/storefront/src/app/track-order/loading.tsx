import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
      <section className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="border-border border-b pb-7">
          <Skeleton className="h-4 w-24 rounded-none" />
          <Skeleton className="mt-4 h-20 w-full max-w-sm rounded-none sm:h-28" />
          <Skeleton className="mt-5 h-4 w-full max-w-lg rounded-none" />
        </div>
        <div className="grid gap-8">
          <div className="border border-border p-5 sm:p-6">
            <Skeleton className="h-6 w-44 rounded-none" />
            <Skeleton className="mt-3 h-4 w-full max-w-lg rounded-none" />
            <Skeleton className="mt-6 h-12 w-full rounded-none" />
            <Skeleton className="mt-4 h-12 w-full rounded-none" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {["one", "two", "three"].map((item) => (
              <Skeleton key={item} className="h-32 rounded-none" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
