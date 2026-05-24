import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
      <section className="mx-auto max-w-[900px]">
        <div className="border-border border-b pb-7">
          <Skeleton className="h-4 w-28 rounded-none" />
          <Skeleton className="mt-4 h-20 w-full max-w-lg rounded-none sm:h-28" />
          <Skeleton className="mt-5 h-4 w-full max-w-xl rounded-none" />
        </div>
        <div className="grid gap-4 py-8">
          <Skeleton className="h-16 w-full rounded-none" />
          <Skeleton className="h-16 w-full rounded-none" />
          <Skeleton className="h-12 w-40 rounded-none" />
        </div>
      </section>
    </main>
  );
}
