import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist, Instrument_Serif } from "next/font/google";
import { CloudflareWebAnalytics } from "@/components/analytics/cloudflare-web-analytics";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: `${siteConfig.name} | Occasion wear for evenings out`,
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} | Occasion wear for evenings out`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fbf8f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable, instrumentSerif.variable)}
    >
      <body>
        {children}
        <CloudflareWebAnalytics
          token={process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN}
        />
      </body>
    </html>
  );
}
