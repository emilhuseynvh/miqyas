import Script from "next/script";
import { site } from "@/lib/site";

export function AdSense() {
  if (process.env.NODE_ENV !== "production" || !site.adsenseClient) return null;
  return (
    <Script
      id="adsense"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsenseClient}`}
    />
  );
}
