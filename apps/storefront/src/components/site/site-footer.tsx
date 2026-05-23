import Link from "next/link";

import { siteContent } from "@/content/site-content";

export function SiteFooter() {
  const content = siteContent.footer;

  return (
    <footer className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 text-sm text-muted-foreground md:flex-row">
        <div>
          <Link href="/" className="font-heading text-3xl text-foreground">
            {siteContent.brand.name}
          </Link>
          <p className="mt-3 max-w-sm">{siteContent.brand.footerDescription}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {content.sections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-3 text-foreground text-sm font-medium">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} prefetch={false}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
