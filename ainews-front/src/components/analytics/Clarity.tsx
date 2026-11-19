import Script from "next/script";
import { site } from "@/lib/site";

export function Clarity() {
  if (process.env.NODE_ENV !== "production" || !site.clarityId) return null;
  return (
    <Script id="clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(site.clarityId)});`}
    </Script>
  );
}
