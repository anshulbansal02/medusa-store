import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
      <section className="mx-auto max-w-[920px]">
        <div className="border-border border-b pb-7">
          <Skeleton className="h-4 w-24 rounded-none" />
          <Skeleton className="mt-4 h-20 w-full max-w-lg rounded-none sm:h-28" />
          <Skeleton className="mt-5 h-4 w-full max-w-xl rounded-none" />
        </div>
        <div className="divide-y divide-border">
          {["one", "two", "three", "four"].map((item) => (
            <div key={item} className="py-7">
              <Skeleton className="h-5 w-64 max-w-full rounded-none" />
              <Skeleton className="mt-3 h-4 w-full rounded-none" />
              <Skeleton className="mt-2 h-4 w-5/6 rounded-none" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
