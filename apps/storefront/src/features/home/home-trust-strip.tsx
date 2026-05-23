import { Ruler, ShieldCheck, Truck } from "lucide-react";

import type { HomeSectionProps } from "@/features/home/home-section-types";

const trustIcons = {
  ruler: Ruler,
  shield: ShieldCheck,
  truck: Truck,
} as const;

type TrustIconKey = keyof typeof trustIcons;

function TrustIcon({ icon }: { icon: TrustIconKey }) {
  const Icon = trustIcons[icon];

  return <Icon className="mt-0.5 size-5 shrink-0 stroke-icon text-primary" />;
}

export function TrustStrip({ content }: HomeSectionProps) {
  return (
    <section className="border-border border-y px-4 py-9 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-6 md:grid-cols-3">
        {content.trustItems.map((item) => (
          <div key={item.title} className="flex gap-4">
            <TrustIcon icon={item.icon} />
            <div>
              <h2 className="text-sm font-medium">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
