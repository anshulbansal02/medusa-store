import Script from "next/script";

type BetterStackBrowserProps = {
  environment?: string;
  release?: string;
  token?: string;
};

function isConfigured(value?: string) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !value.includes("replace_me")
  );
}

export function BetterStackBrowser({
  environment,
  release,
  token,
}: BetterStackBrowserProps) {
  if (!isConfigured(token)) {
    return null;
  }

  return (
    <Script id="better-stack-browser" strategy="afterInteractive">
      {`
        !function(b,e,t,r){
          b[t]=b[t]||function(){(b[t].q=b[t].q||[]).push(arguments)};
          b[t].l=+new Date;
          var s=e.createElement('script'); s.async=1; s.crossOrigin='anonymous';
          s.src='https://betterstack.net/b.js?t='+r;
          (e.head||e.getElementsByTagName('head')[0]).appendChild(s);
        }(window,document,'betterstack',${JSON.stringify(token)});
        betterstack('init', ${JSON.stringify({
          environment: environment ?? "production",
          release,
        })});
      `}
    </Script>
  );
}
