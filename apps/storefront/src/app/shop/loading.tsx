import { Skeleton } from "@/components/ui/skeleton";

const categorySkeletons = ["all", "dresses", "co-ords", "tops"];
const productSkeletons = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
];

export default function Loading() {
  return (
    <main className="min-h-screen px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
      <section className="mx-auto max-w-[1440px]">
        <div className="grid gap-7 border-border border-b pb-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <Skeleton className="h-4 w-24 rounded-none" />
            <Skeleton className="mt-4 h-20 w-full max-w-xl rounded-none sm:h-28" />
          </div>
          <div className="grid gap-2 lg:justify-self-end">
            <Skeleton className="h-4 w-full max-w-lg rounded-none lg:w-[520px]" />
            <Skeleton className="h-4 w-4/5 max-w-md rounded-none lg:w-[420px]" />
          </div>
        </div>
        <div className="flex min-w-0 gap-2 overflow-hidden border-border border-b py-5">
          {categorySkeletons.map((item) => (
            <Skeleton key={item} className="h-10 w-24 shrink-0 rounded-none" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 pt-8 sm:gap-x-5 sm:gap-y-11 lg:grid-cols-4">
          {productSkeletons.map((item) => (
            <div key={item}>
              <Skeleton className="aspect-[4/5] rounded-none" />
              <Skeleton className="mt-3 h-4 w-3/4 rounded-none" />
              <Skeleton className="mt-2 h-4 w-16 rounded-none" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
