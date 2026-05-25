type RouteLoadingProps = {
  label?: string;
  variant?: "page" | "catalog" | "product";
};

export function RouteLoading({
  label = "Loading",
  variant = "page",
}: RouteLoadingProps) {
  return (
    <main className="min-h-screen px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
      <section className="mx-auto max-w-[1440px]" aria-label={label}>
        <div className="grid gap-6 border-border border-b pb-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <div className="h-3 w-24 bg-muted" />
            <div className="mt-5 h-16 w-full max-w-xl bg-muted/70 sm:h-24" />
          </div>
          <div className="hidden gap-2 lg:grid lg:justify-self-end">
            <div className="h-3 w-[520px] max-w-full bg-muted/60" />
            <div className="h-3 w-[420px] max-w-full bg-muted/45" />
          </div>
        </div>

        {variant === "product" ? <ProductLoadingShape /> : null}
        {variant === "catalog" ? <CatalogLoadingShape /> : null}
        {variant === "page" ? <PageLoadingShape /> : null}
      </section>
    </main>
  );
}

function CatalogLoadingShape() {
  return (
    <>
      <div className="flex gap-2 overflow-hidden border-border border-b py-5">
        {["one", "two", "three", "four"].map((item) => (
          <div key={item} className="h-10 w-24 shrink-0 border border-border" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 pt-8 sm:gap-x-5 sm:gap-y-11 lg:grid-cols-4">
        {["one", "two", "three", "four"].map((item) => (
          <div key={item}>
            <div className="aspect-[4/5] bg-muted/70" />
            <div className="mt-3 h-3 w-3/4 bg-muted/60" />
          </div>
        ))}
      </div>
    </>
  );
}

function ProductLoadingShape() {
  return (
    <div className="grid min-w-0 gap-10 pt-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] xl:gap-14">
      <div>
        <div className="aspect-[4/5] bg-muted/70 lg:aspect-[1/1.08]" />
        <div className="mt-3 flex gap-2 overflow-hidden">
          {["one", "two", "three"].map((item) => (
            <div
              key={item}
              className="aspect-[4/5] w-20 shrink-0 bg-muted/50"
            />
          ))}
        </div>
      </div>
      <div className="grid content-start gap-4">
        <div className="h-3 w-40 bg-muted/60" />
        <div className="h-16 w-full max-w-lg bg-muted/70" />
        <div className="h-3 w-full max-w-xl bg-muted/50" />
        <div className="mt-4 h-12 w-full bg-muted/60" />
      </div>
    </div>
  );
}

function PageLoadingShape() {
  return (
    <div className="grid gap-4 pt-8">
      <div className="h-14 w-full bg-muted/55" />
      <div className="h-14 w-full bg-muted/45" />
      <div className="h-14 w-3/4 bg-muted/35" />
    </div>
  );
}
