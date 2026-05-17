import Script from "next/script";

type CloudflareWebAnalyticsProps = {
  token?: string;
};

function isConfigured(value?: string) {
  return typeof value === "string" && !value.includes("replace_me");
}

export function CloudflareWebAnalytics({ token }: CloudflareWebAnalyticsProps) {
  if (!isConfigured(token)) {
    return null;
  }

  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
