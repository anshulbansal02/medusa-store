import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
      <section className="mx-auto max-w-[1440px]">
        <div className="grid gap-8 border-border border-b pb-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <Skeleton className="h-4 w-24 rounded-none" />
            <Skeleton className="mt-4 h-20 w-full max-w-md rounded-none sm:h-28" />
          </div>
          <Skeleton className="h-4 w-full max-w-lg rounded-none lg:justify-self-end" />
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 pt-8 sm:gap-x-5 sm:gap-y-11 lg:grid-cols-4">
          {["one", "two", "three", "four"].map((item) => (
            <div key={item}>
              <Skeleton className="aspect-[4/5] rounded-none" />
              <Skeleton className="mt-3 h-4 w-3/4 rounded-none" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
