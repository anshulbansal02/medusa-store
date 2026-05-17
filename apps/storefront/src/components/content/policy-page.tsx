import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

type PolicySection = {
  title: string;
  body: string;
};

type PolicyPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: ReadonlyArray<PolicySection>;
};

export function PolicyPage({
  eyebrow,
  title,
  intro,
  sections,
}: PolicyPageProps) {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="px-4 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-[920px]">
          <div className="border-border border-b pb-7">
            <p className="text-muted-foreground text-sm">{eyebrow}</p>
            <h1 className="mt-3 font-heading text-6xl leading-none sm:text-8xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-muted-foreground">{intro}</p>
          </div>

          <div className="divide-y divide-border">
            {sections.map((section) => (
              <section
                key={section.title}
                className="grid gap-3 py-7 text-sm sm:grid-cols-[220px_1fr] sm:gap-8"
              >
                <h2 className="font-medium">{section.title}</h2>
                <p className="leading-6 text-muted-foreground">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
